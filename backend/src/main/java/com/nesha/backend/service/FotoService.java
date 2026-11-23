package com.nesha.backend.service;

import com.nesha.backend.entity.Usuario;
import com.nesha.backend.entity.UsuarioFoto;
import com.nesha.backend.exception.ApiException;
import com.nesha.backend.repository.UsuarioFotoRepository;
import com.nesha.backend.repository.UsuarioRepository;
import java.io.IOException;
import java.time.Instant;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

// Foto de perfil de qualquer usuário (cliente ou prestador).
@Service
public class FotoService {

    // Mesmo limite de spring.servlet.multipart.max-file-size.
    private static final long TAMANHO_MAXIMO = 5L * 1024 * 1024;

    private final UsuarioRepository usuarioRepository;
    private final UsuarioFotoRepository usuarioFotoRepository;

    public FotoService(UsuarioRepository usuarioRepository, UsuarioFotoRepository usuarioFotoRepository) {
        this.usuarioRepository = usuarioRepository;
        this.usuarioFotoRepository = usuarioFotoRepository;
    }

    // Devolve o caminho da nova foto (relativo à base da API).
    @Transactional
    public String salvar(UUID usuarioId, MultipartFile arquivo) {
        byte[] conteudo = ler(arquivo);
        String tipo = tipoDaImagem(conteudo);

        Usuario usuario = usuarioRepository
                .findById(usuarioId)
                .orElseThrow(() -> new ApiException(
                        HttpStatus.NOT_FOUND, "USUARIO_NAO_ENCONTRADO", "Usuário não encontrado."));

        usuarioFotoRepository.save(new UsuarioFoto(usuarioId, conteudo, tipo));
        usuario.setFotoAtualizadaEm(Instant.now());

        return usuario.urlDaFoto();
    }

    @Transactional(readOnly = true)
    public UsuarioFoto buscar(UUID usuarioId) {
        return usuarioFotoRepository
                .findById(usuarioId)
                .orElseThrow(() -> new ApiException(
                        HttpStatus.NOT_FOUND, "FOTO_NAO_ENCONTRADA", "Este usuário não tem foto."));
    }

    private static byte[] ler(MultipartFile arquivo) {
        if (arquivo == null || arquivo.isEmpty()) {
            throw fotoInvalida("Envie uma imagem.");
        }
        if (arquivo.getSize() > TAMANHO_MAXIMO) {
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
