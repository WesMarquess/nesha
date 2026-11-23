package com.nesha.backend.controller;

import com.nesha.backend.dto.AtualizarPrestadorRequest;
import com.nesha.backend.dto.CadastroPrestadorRequest;
import com.nesha.backend.dto.CadastroPrestadorResponse;
import com.nesha.backend.dto.PrestadorResponse;
import com.nesha.backend.entity.PrestadorFoto;
import com.nesha.backend.entity.Usuario;
import com.nesha.backend.service.PrestadorService;
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
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/prestadores")
public class PrestadorController {

    private final PrestadorService prestadorService;

    public PrestadorController(PrestadorService prestadorService) {
        this.prestadorService = prestadorService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CadastroPrestadorResponse cadastrar(@Valid @RequestBody CadastroPrestadorRequest request) {
        return prestadorService.cadastrar(request);
    }

    @GetMapping("/me")
    public PrestadorResponse me(@AuthenticationPrincipal Usuario usuario) {
        return prestadorService.buscarPerfil(usuario.getId());
    }

    @PutMapping("/me")
    public PrestadorResponse atualizar(
            @AuthenticationPrincipal Usuario usuario, @Valid @RequestBody AtualizarPrestadorRequest request) {
        return prestadorService.atualizar(usuario.getId(), request);
    }

    @PutMapping(path = "/me/foto", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public PrestadorResponse atualizarFoto(
            @AuthenticationPrincipal Usuario usuario, @RequestPart("foto") MultipartFile foto) {
        return prestadorService.salvarFoto(usuario.getId(), foto);
    }

    // Público: a foto aparece também para o cliente (perfil e lista de profissionais).
    @GetMapping("/{usuarioId}/foto")
    public ResponseEntity<byte[]> foto(@PathVariable UUID usuarioId) {
        PrestadorFoto foto = prestadorService.buscarFoto(usuarioId);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(foto.getTipo()))
                .cacheControl(CacheControl.maxAge(Duration.ofDays(30)).cachePublic())
                .body(foto.getConteudo());
    }
}
