package com.nesha.backend.controller;

import com.nesha.backend.dto.AlterarSenhaRequest;
import com.nesha.backend.dto.FotoResponse;
import com.nesha.backend.dto.UsuarioResponse;
import com.nesha.backend.entity.Usuario;
import com.nesha.backend.entity.UsuarioFoto;
import com.nesha.backend.service.FotoService;
import com.nesha.backend.service.UsuarioService;
import jakarta.validation.Valid;
import java.time.Duration;
import java.util.UUID;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;
    private final FotoService fotoService;

    public UsuarioController(UsuarioService usuarioService, FotoService fotoService) {
        this.usuarioService = usuarioService;
        this.fotoService = fotoService;
    }

    @GetMapping("/me")
    public UsuarioResponse me(@AuthenticationPrincipal Usuario usuario) {
        return UsuarioResponse.from(usuario);
    }

    @PutMapping("/me/senha")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void alterarSenha(
            @AuthenticationPrincipal Usuario usuario, @Valid @RequestBody AlterarSenhaRequest request) {
        usuarioService.alterarSenha(usuario.getId(), request);
    }

    @PutMapping(path = "/me/foto", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public FotoResponse alterarFoto(
            @AuthenticationPrincipal Usuario usuario, @RequestPart("foto") MultipartFile foto) {
        return new FotoResponse(fotoService.salvar(usuario.getId(), foto));
    }

    // Público: a foto aparece para a outra parte (cliente vê o prestador e vice-versa).
    @GetMapping("/{usuarioId}/foto")
    public ResponseEntity<byte[]> foto(@PathVariable UUID usuarioId) {
        UsuarioFoto foto = fotoService.buscar(usuarioId);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(foto.getTipo()))
                .cacheControl(CacheControl.maxAge(Duration.ofDays(30)).cachePublic())
                .body(foto.getConteudo());
    }
}
