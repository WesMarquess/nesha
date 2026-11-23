package com.nesha.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record CancelarAgendamentoRequest(@NotBlank(message = "Informe o motivo do cancelamento.") String motivo) {}
