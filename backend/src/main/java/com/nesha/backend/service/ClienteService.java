package com.nesha.backend.service;

import com.nesha.backend.dto.AtualizarClienteRequest;
import com.nesha.backend.dto.CadastroClienteRequest;
import com.nesha.backend.dto.CadastroClienteResponse;
import com.nesha.backend.dto.ClienteResponse;
import com.nesha.backend.dto.UsuarioResponse;
import com.nesha.backend.entity.Endereco;
import com.nesha.backend.entity.Perfil;
import com.nesha.backend.entity.Usuario;
import com.nesha.backend.exception.ApiException;
import com.nesha.backend.repository.UsuarioRepository;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ClienteService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public ClienteService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public CadastroClienteResponse cadastrar(CadastroClienteRequest request) {
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
                .perfil(Perfil.CLIENTE)
                .endereco(endereco)
                .build();

        usuario = usuarioRepository.save(usuario);

        return new CadastroClienteResponse(UsuarioResponse.from(usuario));
    }

    @Transactional(readOnly = true)
    public ClienteResponse buscarPerfil(UUID usuarioId) {
        return ClienteResponse.from(clienteDoUsuario(usuarioId));
    }

    @Transactional
    public ClienteResponse atualizar(UUID usuarioId, AtualizarClienteRequest request) {
        Usuario usuario = clienteDoUsuario(usuarioId);

        var e = request.endereco();
        String complemento = e.complemento() == null ? "" : e.complemento().trim();

        usuario.setNome(request.nome().trim());
        usuario.setTelefone(request.telefone());
        usuario.setEndereco(new Endereco(
                e.cep(),
                e.logradouro().trim(),
                e.numero().trim(),
                complemento.isEmpty() ? null : complemento,
                e.bairro().trim(),
                e.cidade().trim(),
                e.uf()));

        return ClienteResponse.from(usuario);
    }

    private Usuario clienteDoUsuario(UUID usuarioId) {
        return usuarioRepository
                .findById(usuarioId)
                .filter(usuario -> usuario.getPerfil() == Perfil.CLIENTE)
                .orElseThrow(() -> new ApiException(
                        HttpStatus.NOT_FOUND, "CLIENTE_NAO_ENCONTRADO", "Perfil de cliente não encontrado."));
    }
}
