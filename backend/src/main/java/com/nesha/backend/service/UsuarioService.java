package com.nesha.backend.service;

import com.nesha.backend.dto.AlterarSenhaRequest;
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
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public void alterarSenha(UUID usuarioId, AlterarSenhaRequest request) {
        Usuario usuario = usuarioRepository
                .findById(usuarioId)
                .orElseThrow(() -> new ApiException(
                        HttpStatus.NOT_FOUND, "USUARIO_NAO_ENCONTRADO", "Usuário não encontrado."));

        if (!passwordEncoder.matches(request.senhaAtual(), usuario.getSenhaHash())) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "SENHA_ATUAL_INCORRETA",
                    "A senha atual está incorreta.",
                    Map.of("senhaAtual", "A senha atual está incorreta."));
        }

        if (passwordEncoder.matches(request.novaSenha(), usuario.getSenhaHash())) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "SENHA_IGUAL_A_ATUAL",
                    "A nova senha precisa ser diferente da atual.",
                    Map.of("novaSenha", "A nova senha precisa ser diferente da atual."));
        }

        usuario.setSenhaHash(passwordEncoder.encode(request.novaSenha()));
    }
}
