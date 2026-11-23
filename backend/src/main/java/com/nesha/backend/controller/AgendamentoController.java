package com.nesha.backend.controller;

import com.nesha.backend.dto.AgendamentoResponse;
import com.nesha.backend.dto.AvaliarAgendamentoRequest;
import com.nesha.backend.dto.CancelarAgendamentoRequest;
import com.nesha.backend.dto.CriarAgendamentoRequest;
import com.nesha.backend.dto.RecusarAgendamentoRequest;
import com.nesha.backend.entity.StatusAgendamento;
import com.nesha.backend.entity.Usuario;
import com.nesha.backend.service.AgendamentoService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/agendamentos")
public class AgendamentoController {

    private final AgendamentoService agendamentoService;

    public AgendamentoController(AgendamentoService agendamentoService) {
        this.agendamentoService = agendamentoService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AgendamentoResponse criar(
            @AuthenticationPrincipal Usuario usuario, @Valid @RequestBody CriarAgendamentoRequest request) {
        return agendamentoService.criar(usuario, request);
    }

    @GetMapping
    public List<AgendamentoResponse> listar(
            @AuthenticationPrincipal Usuario usuario, @RequestParam(required = false) StatusAgendamento status) {
        return agendamentoService.listar(usuario, status);
    }

    @GetMapping("/{id}")
    public AgendamentoResponse buscar(@AuthenticationPrincipal Usuario usuario, @PathVariable UUID id) {
        return agendamentoService.buscar(usuario, id);
    }

    @PostMapping("/{id}/cancelar")
    public AgendamentoResponse cancelar(
            @AuthenticationPrincipal Usuario usuario,
            @PathVariable UUID id,
            @Valid @RequestBody CancelarAgendamentoRequest request) {
        return agendamentoService.cancelar(usuario, id, request.motivo());
    }

    @PostMapping("/{id}/aceitar")
    public AgendamentoResponse aceitar(@AuthenticationPrincipal Usuario usuario, @PathVariable UUID id) {
        return agendamentoService.aceitar(usuario, id);
    }

    @PostMapping("/{id}/recusar")
    public AgendamentoResponse recusar(
            @AuthenticationPrincipal Usuario usuario,
            @PathVariable UUID id,
            @Valid @RequestBody(required = false) RecusarAgendamentoRequest request) {
        return agendamentoService.recusar(usuario, id, request == null ? null : request.motivo());
    }

    @PostMapping("/{id}/concluir")
    public AgendamentoResponse concluir(@AuthenticationPrincipal Usuario usuario, @PathVariable UUID id) {
        return agendamentoService.concluir(usuario, id);
    }

    @PostMapping("/{id}/avaliacao")
    public AgendamentoResponse avaliar(
            @AuthenticationPrincipal Usuario usuario,
            @PathVariable UUID id,
            @Valid @RequestBody AvaliarAgendamentoRequest request) {
        return agendamentoService.avaliar(usuario, id, request);
    }
}
