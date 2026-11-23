package com.nesha.backend.dto;

import com.nesha.backend.entity.Agendamento;
import java.util.List;

public record AvaliacaoResponse(int nota, List<String> destaques, String comentario) {

    public static AvaliacaoResponse from(Agendamento a) {
        if (!a.avaliado()) {
            return null;
        }
        return new AvaliacaoResponse(a.getAvaliacaoNota(), List.copyOf(a.getDestaques()), a.getAvaliacaoComentario());
    }
}
