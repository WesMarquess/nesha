package com.nesha.backend.controller;

import com.nesha.backend.dto.AtualizarClienteRequest;
import com.nesha.backend.dto.CadastroClienteRequest;
import com.nesha.backend.dto.CadastroClienteResponse;
import com.nesha.backend.dto.ClienteResponse;
import com.nesha.backend.entity.Usuario;
import com.nesha.backend.service.ClienteService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/clientes")
public class ClienteController {

    private final ClienteService clienteService;

    public ClienteController(ClienteService clienteService) {
        this.clienteService = clienteService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CadastroClienteResponse cadastrar(@Valid @RequestBody CadastroClienteRequest request) {
        return clienteService.cadastrar(request);
    }

    @GetMapping("/me")
    public ClienteResponse me(@AuthenticationPrincipal Usuario usuario) {
        return clienteService.buscarPerfil(usuario.getId());
    }

    @PutMapping("/me")
    public ClienteResponse atualizar(
            @AuthenticationPrincipal Usuario usuario, @Valid @RequestBody AtualizarClienteRequest request) {
        return clienteService.atualizar(usuario.getId(), request);
    }
}
