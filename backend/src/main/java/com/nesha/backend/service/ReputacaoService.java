package com.nesha.backend.service;

import com.nesha.backend.repository.AgendamentoRepository;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

// Nota do prestador calculada a partir das avaliações dos agendamentos concluídos.
@Service
public class ReputacaoService {

    public record Reputacao(Double nota, long avaliacoes, Map<Integer, Long> porNota) {}

    private final AgendamentoRepository agendamentoRepository;

    public ReputacaoService(AgendamentoRepository agendamentoRepository) {
        this.agendamentoRepository = agendamentoRepository;
    }

    // nota é null enquanto o prestador não tiver nenhuma avaliação.
    @Transactional(readOnly = true)
    public Reputacao de(UUID prestadorId) {
        Map<Integer, Long> porNota = new LinkedHashMap<>();
        for (int nota = 5; nota >= 1; nota--) {
            porNota.put(nota, 0L);
        }

        long total = 0;
        long soma = 0;
        for (Object[] linha : agendamentoRepository.contagemPorNota(prestadorId)) {
            int nota = ((Number) linha[0]).intValue();
            long quantidade = ((Number) linha[1]).longValue();
            porNota.put(nota, quantidade);
            total += quantidade;
            soma += nota * quantidade;
        }

        Double media = total == 0 ? null : Math.round(soma * 10.0 / total) / 10.0;
        return new Reputacao(media, total, porNota);
    }
}
