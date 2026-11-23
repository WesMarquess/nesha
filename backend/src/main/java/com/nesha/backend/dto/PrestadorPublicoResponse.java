package com.nesha.backend.dto;

import com.nesha.backend.entity.UnidadePreco;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

// Perfil do prestador visto pelo cliente no catálogo: sem e-mail, telefone ou endereço.
public record PrestadorPublicoResponse(
        String id,
        String nome,
        String fotoUrl,
        String servicoPrincipal,
        String areaAtendimento,
        String sobreMim,
        BigDecimal preco,
        UnidadePreco unidadePreco,
        String tempoResposta,
        List<String> especialidades,
        List<Integer> diasAtendimento,
        String disponibilidade,
        Double nota,
        long avaliacoes,
        Map<Integer, Long> avaliacoesPorNota,
        long servicosRealizados,
        int desde) {}
