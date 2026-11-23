package com.nesha.backend.dto;

import java.time.OffsetDateTime;

// Período em que o prestador já tem compromisso (sem dados do cliente).
public record HorarioOcupadoResponse(OffsetDateTime inicio, OffsetDateTime fim) {}
