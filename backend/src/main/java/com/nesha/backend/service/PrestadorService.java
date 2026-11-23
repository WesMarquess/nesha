package com.nesha.backend.service;

import com.nesha.backend.dto.AtualizarPrestadorRequest;
import com.nesha.backend.dto.CadastroPrestadorRequest;
import com.nesha.backend.dto.CadastroPrestadorResponse;
import com.nesha.backend.dto.PrestadorResponse;
import com.nesha.backend.dto.UsuarioResponse;
import com.nesha.backend.entity.Endereco;
import com.nesha.backend.entity.Perfil;
import com.nesha.backend.entity.PrestadorFoto;
import com.nesha.backend.entity.PrestadorPerfil;
import com.nesha.backend.entity.UnidadePreco;
import com.nesha.backend.entity.Usuario;
import com.nesha.backend.exception.ApiException;
import com.nesha.backend.repository.PrestadorFotoRepository;
import com.nesha.backend.repository.PrestadorPerfilRepository;
import com.nesha.backend.repository.UsuarioRepository;
import java.io.IOException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class PrestadorService {

    // Mesmo limite de spring.servlet.multipart.max-file-size.
    private static final long TAMANHO_MAXIMO_FOTO = 5L * 1024 * 1024;

    private final UsuarioRepository usuarioRepository;
    private final PrestadorPerfilRepository prestadorPerfilRepository;
    private final PrestadorFotoRepository prestadorFotoRepository;
    private final PasswordEncoder passwordEncoder;

    public PrestadorService(
            UsuarioRepository usuarioRepository,
            PrestadorPerfilRepository prestadorPerfilRepository,
            PrestadorFotoRepository prestadorFotoRepository,
            PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.prestadorPerfilRepository = prestadorPerfilRepository;
        this.prestadorFotoRepository = prestadorFotoRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public CadastroPrestadorResponse cadastrar(CadastroPrestadorRequest request) {
        if (usuarioRepository.existsByEmailIgnoreCase(request.email())) {
            throw new ApiException(
                    HttpStatus.CONFLICT,
                    "EMAIL_JA_CADASTRADO",
                    "Este e-mail já está cadastrado.",
                    Map.of("email", "Este e-mail já está cadastrado."));
        }

        if (usuarioRepository.existsByCpf(request.cpf())) {
            throw new ApiException(
                    HttpStatus.CONFLICT,
                    "CPF_JA_CADASTRADO",
                    "Este CPF já está cadastrado.",
                    Map.of("cpf", "Este CPF já está cadastrado."));
        }

        var enderecoRequest = request.endereco();
        Endereco endereco = new Endereco(
                enderecoRequest.cep(),
                enderecoRequest.logradouro(),
                enderecoRequest.numero(),
                enderecoRequest.complemento(),
                enderecoRequest.bairro(),
                enderecoRequest.cidade(),
                enderecoRequest.uf());

        Usuario usuario = Usuario.builder()
                .nome(request.nome())
                .cpf(request.cpf())
                .telefone(request.telefone())
                .email(request.email().toLowerCase())
                .senhaHash(passwordEncoder.encode(request.senha()))
                .perfil(Perfil.PRESTADOR)
                .endereco(endereco)
                .build();

        usuario = usuarioRepository.save(usuario);

        PrestadorPerfil perfil = PrestadorPerfil.builder()
                .usuario(usuario)
                .servicoPrincipal(request.servicoPrincipal())
                .areaAtendimento(request.areaAtendimento())
                .sobreMim(request.sobreMim())
                .preco(request.preco())
                .unidadePreco(request.unidadePreco() != null ? request.unidadePreco() : UnidadePreco.DIA)
                .tempoResposta(request.tempoResposta())
                .especialidades(copiaOuVazia(request.especialidades()))
                .diasAtendimento(copiaOuVazia(request.diasAtendimento()))
                .build();

        prestadorPerfilRepository.save(perfil);

        return new CadastroPrestadorResponse(UsuarioResponse.from(usuario));
    }

    private static <T> List<T> copiaOuVazia(List<T> lista) {
        return lista == null ? new ArrayList<>() : new ArrayList<>(lista);
    }

    @Transactional(readOnly = true)
    public PrestadorResponse buscarPerfil(UUID usuarioId) {
        return PrestadorResponse.from(perfilDoUsuario(usuarioId));
    }

    @Transactional
    public PrestadorResponse atualizar(UUID usuarioId, AtualizarPrestadorRequest request) {
        PrestadorPerfil perfil = perfilDoUsuario(usuarioId);

        Usuario usuario = perfil.getUsuario();
        usuario.setNome(request.nome().trim());
        usuario.setTelefone(request.telefone());

        String sobreMim = request.sobreMim() == null ? "" : request.sobreMim().trim();
        perfil.setServicoPrincipal(request.servicoPrincipal().trim());
        perfil.setAreaAtendimento(request.areaAtendimento().trim());
        perfil.setSobreMim(sobreMim.isEmpty() ? null : sobreMim);
        perfil.setPreco(request.preco());
        perfil.setUnidadePreco(request.unidadePreco() != null ? request.unidadePreco() : UnidadePreco.DIA);
        perfil.setOnline(request.online());

        return PrestadorResponse.from(perfil);
    }

    @Transactional
    public PrestadorResponse salvarFoto(UUID usuarioId, MultipartFile arquivo) {
        PrestadorPerfil perfil = perfilDoUsuario(usuarioId);

        byte[] conteudo = lerFoto(arquivo);
        String tipo = tipoDaImagem(conteudo);

        prestadorFotoRepository.save(new PrestadorFoto(perfil.getId(), conteudo, tipo));
        perfil.setFotoAtualizadaEm(Instant.now());

        return PrestadorResponse.from(perfil);
    }

    @Transactional(readOnly = true)
    public PrestadorFoto buscarFoto(UUID usuarioId) {
        return prestadorPerfilRepository
                .findByUsuarioId(usuarioId)
                .flatMap(perfil -> prestadorFotoRepository.findById(perfil.getId()))
                .orElseThrow(() -> new ApiException(
                        HttpStatus.NOT_FOUND, "FOTO_NAO_ENCONTRADA", "Este prestador não tem foto."));
    }

    private PrestadorPerfil perfilDoUsuario(UUID usuarioId) {
        return prestadorPerfilRepository
                .findByUsuarioId(usuarioId)
                .orElseThrow(() -> new ApiException(
                        HttpStatus.NOT_FOUND, "PRESTADOR_NAO_ENCONTRADO", "Perfil de prestador não encontrado."));
    }

    private static byte[] lerFoto(MultipartFile arquivo) {
        if (arquivo == null || arquivo.isEmpty()) {
            throw fotoInvalida("Envie uma imagem.");
        }
        if (arquivo.getSize() > TAMANHO_MAXIMO_FOTO) {
            throw new ApiException(
                    HttpStatus.CONTENT_TOO_LARGE, "FOTO_MUITO_GRANDE", "A foto deve ter no máximo 5 MB.");
        }
        try {
            return arquivo.getBytes();
        } catch (IOException e) {
            throw fotoInvalida("Não foi possível ler a imagem enviada.");
        }
    }

    // Decide o tipo pelos primeiros bytes do arquivo, não pelo Content-Type informado
    // pelo cliente, para não servir depois algo que não é imagem.
    private static String tipoDaImagem(byte[] b) {
        if (b.length > 3 && (b[0] & 0xFF) == 0xFF && (b[1] & 0xFF) == 0xD8 && (b[2] & 0xFF) == 0xFF) {
            return "image/jpeg";
        }
        if (b.length > 8 && (b[0] & 0xFF) == 0x89 && b[1] == 'P' && b[2] == 'N' && b[3] == 'G') {
            return "image/png";
        }
        if (b.length > 12
                && b[0] == 'R' && b[1] == 'I' && b[2] == 'F' && b[3] == 'F'
                && b[8] == 'W' && b[9] == 'E' && b[10] == 'B' && b[11] == 'P') {
            return "image/webp";
        }
        throw fotoInvalida("Formato não suportado. Envie uma imagem JPG, PNG ou WebP.");
    }

    private static ApiException fotoInvalida(String mensagem) {
        return new ApiException(HttpStatus.BAD_REQUEST, "FOTO_INVALIDA", mensagem);
    }
}
