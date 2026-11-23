package com.nesha.backend.dto;

import java.time.OffsetDateTime;
import java.util.List;

// Avaliação exibida no perfil público do prestador: só o primeiro nome de quem avaliou.
public record AvaliacaoPublicaResponse(
        String cliente, String servico, int nota, List<String> destaques, String comentario, OffsetDateTime data) {}
