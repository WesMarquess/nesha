package com.nesha.backend.dto;

import jakarta.validation.constraints.Size;

// O motivo da recusa é opcional.
public record RecusarAgendamentoRequest(@Size(max = 255) String motivo) {}
