package com.nesha.backend.dto;

import com.nesha.backend.entity.Agendamento;
import com.nesha.backend.entity.StatusAgendamento;
import com.nesha.backend.entity.StatusPagamento;
import com.nesha.backend.entity.Usuario;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.ZoneId;

public record AgendamentoResponse(
        String id,
        StatusAgendamento status,
        String servico,
        BigDecimal valor,
        OffsetDateTime inicio,
        OffsetDateTime fim,
        PrestadorResumo prestador,
        ClienteResumo cliente,
        EnderecoResponse endereco,
        String observacoes,
        String motivoCancelamento,
        AvaliacaoResponse avaliacao,
        StatusPagamento pagamentoStatus,
        OffsetDateTime criadoEm) {

    public record PrestadorResumo(String id, String nome, String telefone, String fotoUrl, Double nota, long avaliacoes) {}

    public record ClienteResumo(String id, String nome, String telefone, String fotoUrl, int desde) {}

    // nota e avaliacoes do prestador são calculadas pelo serviço (média das avaliações recebidas).
    public static AgendamentoResponse from(Agendamento a, ZoneId fuso, Double nota, long avaliacoes) {
        Usuario p = a.getPrestador();
        Usuario c = a.getCliente();
        return new AgendamentoResponse(
                a.getId().toString(),
                a.getStatus(),
                a.getServico(),
                a.getValor(),
                a.getInicio().atZone(fuso).toOffsetDateTime(),
                a.getFim().atZone(fuso).toOffsetDateTime(),
                new PrestadorResumo(p.getId().toString(), p.getNome(), p.getTelefone(), p.urlDaFoto(), nota, avaliacoes),
                new ClienteResumo(
                        c.getId().toString(), c.getNome(), c.getTelefone(), c.urlDaFoto(), c.getCriadoEm().atZone(fuso).getYear()),
                EnderecoResponse.from(a.getEndereco()),
                a.getObservacoes(),
                a.getMotivoCancelamento(),
                AvaliacaoResponse.from(a),
                a.getPagamentoStatus(),
                a.getCriadoEm().atZone(fuso).toOffsetDateTime());
    }
}
