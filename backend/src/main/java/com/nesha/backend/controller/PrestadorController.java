package com.nesha.backend.controller;

import com.nesha.backend.dto.AtualizarPrestadorRequest;
import com.nesha.backend.dto.AvaliacaoPublicaResponse;
import com.nesha.backend.dto.CadastroPrestadorRequest;
import com.nesha.backend.dto.CadastroPrestadorResponse;
import com.nesha.backend.dto.HorarioOcupadoResponse;
import com.nesha.backend.dto.PrestadorPublicoResponse;
import com.nesha.backend.dto.PrestadorResponse;
import com.nesha.backend.entity.Usuario;
import com.nesha.backend.service.CatalogoPrestadoresService;
import com.nesha.backend.service.PrestadorService;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/prestadores")
public class PrestadorController {

    private final PrestadorService prestadorService;
    private final CatalogoPrestadoresService catalogoService;

    public PrestadorController(PrestadorService prestadorService, CatalogoPrestadoresService catalogoService) {
        this.prestadorService = prestadorService;
        this.catalogoService = catalogoService;
    }

    // Catálogo do cliente: ?servico=Jardineiro&servico=Eletricista Residencial
    @GetMapping
    public List<PrestadorPublicoResponse> listar(@RequestParam(required = false) List<String> servico) {
        return catalogoService.listar(servico);
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

    @GetMapping("/{usuarioId}")
    public PrestadorPublicoResponse perfilPublico(@PathVariable UUID usuarioId) {
        return catalogoService.buscar(usuarioId);
    }

    @GetMapping("/{usuarioId}/horarios-ocupados")
    public List<HorarioOcupadoResponse> horariosOcupados(
            @PathVariable UUID usuarioId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate de,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate ate) {
        return catalogoService.horariosOcupados(usuarioId, de, ate);
    }

    @GetMapping("/{usuarioId}/avaliacoes")
    public List<AvaliacaoPublicaResponse> avaliacoes(@PathVariable UUID usuarioId) {
        return catalogoService.avaliacoes(usuarioId);
    }
}
