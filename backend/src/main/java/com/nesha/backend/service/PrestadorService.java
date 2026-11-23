package com.nesha.backend.service;

import com.nesha.backend.dto.AtualizarPrestadorRequest;
import com.nesha.backend.dto.CadastroPrestadorRequest;
import com.nesha.backend.dto.CadastroPrestadorResponse;
import com.nesha.backend.dto.PrestadorResponse;
import com.nesha.backend.dto.UsuarioResponse;
import com.nesha.backend.entity.Endereco;
import com.nesha.backend.entity.Perfil;
import com.nesha.backend.entity.PrestadorPerfil;
import com.nesha.backend.entity.UnidadePreco;
import com.nesha.backend.entity.Usuario;
import com.nesha.backend.exception.ApiException;
import com.nesha.backend.repository.PrestadorPerfilRepository;
import com.nesha.backend.repository.UsuarioRepository;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PrestadorService {

    private final UsuarioRepository usuarioRepository;
    private final PrestadorPerfilRepository prestadorPerfilRepository;
    private final PasswordEncoder passwordEncoder;

    public PrestadorService(
            UsuarioRepository usuarioRepository,
            PrestadorPerfilRepository prestadorPerfilRepository,
            PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.prestadorPerfilRepository = prestadorPerfilRepository;
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

    private PrestadorPerfil perfilDoUsuario(UUID usuarioId) {
        return prestadorPerfilRepository
                .findByUsuarioId(usuarioId)
                .orElseThrow(() -> new ApiException(
                        HttpStatus.NOT_FOUND, "PRESTADOR_NAO_ENCONTRADO", "Perfil de prestador não encontrado."));
    }
}
