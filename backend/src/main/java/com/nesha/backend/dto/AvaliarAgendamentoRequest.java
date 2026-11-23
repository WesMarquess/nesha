package com.nesha.backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;

public record AvaliarAgendamentoRequest(
        @NotNull(message = "Informe a nota.") @Min(1) @Max(5) Integer nota,
        List<@NotBlank String> destaques,
        @Size(max = 300, message = "O comentário pode ter até 300 caracteres.") String comentario) {}
