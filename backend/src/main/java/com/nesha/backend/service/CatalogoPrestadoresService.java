package com.nesha.backend.service;

import com.nesha.backend.dto.AvaliacaoPublicaResponse;
import com.nesha.backend.dto.HorarioOcupadoResponse;
import com.nesha.backend.dto.PrestadorPublicoResponse;
import com.nesha.backend.dto.PrestadorResponse;
import com.nesha.backend.entity.PrestadorPerfil;
import com.nesha.backend.entity.StatusAgendamento;
import com.nesha.backend.entity.Usuario;
import com.nesha.backend.exception.ApiException;
import com.nesha.backend.repository.AgendamentoRepository;
import com.nesha.backend.repository.PrestadorPerfilRepository;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

// Prestadores vistos pelo cliente: lista por serviço, perfil, horários ocupados e avaliações.
@Service
public class CatalogoPrestadoresService {

    private static final ZoneId FUSO = AgendamentoService.FUSO;
    private static final long JANELA_MAXIMA_DIAS = 62;

    private final PrestadorPerfilRepository prestadorPerfilRepository;
    private final AgendamentoRepository agendamentoRepository;
    private final ReputacaoService reputacaoService;

    public CatalogoPrestadoresService(
            PrestadorPerfilRepository prestadorPerfilRepository,
            AgendamentoRepository agendamentoRepository,
            ReputacaoService reputacaoService) {
        this.prestadorPerfilRepository = prestadorPerfilRepository;
        this.agendamentoRepository = agendamentoRepository;
        this.reputacaoService = reputacaoService;
    }

    // Só prestadores online; sem filtro, todos. Os mais bem avaliados primeiro.
    @Transactional(readOnly = true)
    public List<PrestadorPublicoResponse> listar(List<String> servicos) {
        List<PrestadorPerfil> perfis = servicos == null || servicos.isEmpty()
                ? prestadorPerfilRepository.findByOnlineTrue()
                : prestadorPerfilRepository.findByOnlineTrueAndServicoPrincipalIn(servicos);

        return perfis.stream()
                .map(this::publico)
                .sorted(Comparator.comparing(
                                (PrestadorPublicoResponse p) -> p.nota() == null ? 0 : p.nota())
                        .reversed()
                        .thenComparing(PrestadorPublicoResponse::avaliacoes, Comparator.reverseOrder()))
                .toList();
    }

    @Transactional(readOnly = true)
    public PrestadorPublicoResponse buscar(UUID usuarioId) {
        return publico(perfil(usuarioId));
    }

    // Períodos já ocupados (pendentes ou confirmados) entre as datas, inclusive. Sem dados do cliente.
    @Transactional(readOnly = true)
    public List<HorarioOcupadoResponse> horariosOcupados(UUID usuarioId, LocalDate de, LocalDate ate) {
        perfil(usuarioId);
        if (ate.isBefore(de) || ChronoUnit.DAYS.between(de, ate) > JANELA_MAXIMA_DIAS) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST, "PERIODO_INVALIDO", "Consulte no máximo 62 dias por vez.");
        }

        Instant inicio = de.atStartOfDay(FUSO).toInstant();
        Instant fim = ate.plusDays(1).atStartOfDay(FUSO).toInstant();

        return agendamentoRepository
                .sobrepostos(usuarioId, List.of(StatusAgendamento.PENDENTE, StatusAgendamento.CONFIRMADO), inicio, fim)
                .stream()
                .map(a -> new HorarioOcupadoResponse(
                        a.getInicio().atZone(FUSO).toOffsetDateTime(), a.getFim().atZone(FUSO).toOffsetDateTime()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AvaliacaoPublicaResponse> avaliacoes(UUID usuarioId) {
        perfil(usuarioId);
        return agendamentoRepository.findByPrestadorIdAndAvaliacaoNotaIsNotNullOrderByAvaliadoEmDesc(usuarioId).stream()
                .map(a -> new AvaliacaoPublicaResponse(
                        a.getCliente().getNome().split("\\s+")[0],
                        a.getServico(),
                        a.getAvaliacaoNota(),
                        List.copyOf(a.getDestaques()),
                        a.getAvaliacaoComentario(),
                        a.getAvaliadoEm().atZone(FUSO).toOffsetDateTime()))
                .toList();
    }

    private PrestadorPerfil perfil(UUID usuarioId) {
        return prestadorPerfilRepository
                .findByUsuarioId(usuarioId)
                .orElseThrow(() -> new ApiException(
                        HttpStatus.NOT_FOUND, "PRESTADOR_NAO_ENCONTRADO", "Prestador não encontrado."));
    }

    private PrestadorPublicoResponse publico(PrestadorPerfil perfil) {
        Usuario usuario = perfil.getUsuario();
        var reputacao = reputacaoService.de(usuario.getId());
        return new PrestadorPublicoResponse(
                usuario.getId().toString(),
                usuario.getNome(),
                usuario.urlDaFoto(),
                perfil.getServicoPrincipal(),
                perfil.getAreaAtendimento(),
                perfil.getSobreMim(),
                perfil.getPreco(),
                perfil.getUnidadePreco(),
                perfil.getTempoResposta(),
                List.copyOf(perfil.getEspecialidades()),
                List.copyOf(perfil.getDiasAtendimento()),
                PrestadorResponse.descreverDisponibilidade(perfil.getDiasAtendimento()),
                reputacao.nota(),
                reputacao.avaliacoes(),
                reputacao.porNota(),
                agendamentoRepository.countByPrestadorIdAndStatus(usuario.getId(), StatusAgendamento.CONCLUIDO),
                usuario.getCriadoEm().atZone(FUSO).getYear());
    }
}
