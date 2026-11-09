package com.nesha.backend.controller;

import com.nesha.backend.dto.CadastroPrestadorRequest;
import com.nesha.backend.dto.CadastroPrestadorResponse;
import com.nesha.backend.dto.PrestadorResponse;
import com.nesha.backend.entity.Usuario;
import com.nesha.backend.service.PrestadorService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

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
}
