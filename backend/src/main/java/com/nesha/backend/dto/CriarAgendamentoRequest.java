package com.nesha.backend.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.OffsetDateTime;
import java.util.UUID;

// Serviço, valor e endereço vêm do perfil do prestador e do cadastro do cliente.
public record CriarAgendamentoRequest(
        @NotNull(message = "Informe o prestador.") UUID prestadorId,
        @NotNull(message = "Informe o início.") OffsetDateTime inicio,
        @NotNull(message = "Informe o fim.") OffsetDateTime fim,
        @Size(max = 500) String observacoes) {}
