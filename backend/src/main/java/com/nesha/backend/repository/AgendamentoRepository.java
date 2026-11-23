package com.nesha.backend.repository;

import com.nesha.backend.entity.Agendamento;
import com.nesha.backend.entity.StatusAgendamento;
import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AgendamentoRepository extends JpaRepository<Agendamento, UUID> {

    List<Agendamento> findByClienteIdOrderByInicioAsc(UUID clienteId);

    List<Agendamento> findByPrestadorIdOrderByInicioAsc(UUID prestadorId);

    // Agendamentos do prestador que se sobrepõem ao período [inicio, fim).
    @Query("""
            select a from Agendamento a
            where a.prestador.id = :prestadorId
              and a.status in :status
              and a.inicio < :fim and a.fim > :inicio
            order by a.inicio
            """)
    List<Agendamento> sobrepostos(
            @Param("prestadorId") UUID prestadorId,
            @Param("status") Collection<StatusAgendamento> status,
            @Param("inicio") Instant inicio,
            @Param("fim") Instant fim);

    // [nota, quantidade] das avaliações recebidas pelo prestador.
    @Query("""
            select a.avaliacaoNota, count(a) from Agendamento a
            where a.prestador.id = :prestadorId and a.avaliacaoNota is not null
            group by a.avaliacaoNota
            """)
    List<Object[]> contagemPorNota(@Param("prestadorId") UUID prestadorId);

    List<Agendamento> findByPrestadorIdAndAvaliacaoNotaIsNotNullOrderByAvaliadoEmDesc(UUID prestadorId);

    long countByPrestadorIdAndStatus(UUID prestadorId, StatusAgendamento status);
}
