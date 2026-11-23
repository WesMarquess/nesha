package com.nesha.backend.service;

import com.nesha.backend.dto.AgendamentoResponse;
import com.nesha.backend.dto.AvaliarAgendamentoRequest;
import com.nesha.backend.dto.CriarAgendamentoRequest;
import com.nesha.backend.entity.Agendamento;
import com.nesha.backend.entity.Endereco;
import com.nesha.backend.entity.Perfil;
import com.nesha.backend.entity.PrestadorPerfil;
import com.nesha.backend.entity.StatusAgendamento;
import com.nesha.backend.entity.UnidadePreco;
import com.nesha.backend.entity.Usuario;
import com.nesha.backend.exception.ApiException;
import com.nesha.backend.repository.AgendamentoRepository;
import com.nesha.backend.repository.PrestadorPerfilRepository;
import com.nesha.backend.repository.UsuarioRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AgendamentoService {

    // Os dias de atendimento e os horários do app são de São Paulo.
    public static final ZoneId FUSO = ZoneId.of("America/Sao_Paulo");

    // Mesmas listas de src/data/agendamentos.ts no app.
    public static final List<String> MOTIVOS_CANCELAMENTO = List.of(
            "Mudança de planos",
            "Encontrei outro profissional",
            "Problema de agenda",
            "Valor acima do esperado",
            "Outro motivo");

    public static final List<String> DESTAQUES = List.of("Pontualidade", "Qualidade do Trabalho", "Gentileza", "Organização");

    private static final Duration DURACAO_MAXIMA = Duration.ofHours(12);

    private final AgendamentoRepository agendamentoRepository;
    private final UsuarioRepository usuarioRepository;
    private final PrestadorPerfilRepository prestadorPerfilRepository;
    private final ReputacaoService reputacaoService;

    public AgendamentoService(
            AgendamentoRepository agendamentoRepository,
            UsuarioRepository usuarioRepository,
            PrestadorPerfilRepository prestadorPerfilRepository,
            ReputacaoService reputacaoService) {
        this.agendamentoRepository = agendamentoRepository;
        this.usuarioRepository = usuarioRepository;
        this.prestadorPerfilRepository = prestadorPerfilRepository;
        this.reputacaoService = reputacaoService;
    }

    @Transactional
    public AgendamentoResponse criar(Usuario logado, CriarAgendamentoRequest request) {
        if (logado.getPerfil() != Perfil.CLIENTE) {
            throw acessoNegado("Só clientes podem agendar serviços.");
        }

        Usuario cliente = usuarioRepository.findById(logado.getId()).orElseThrow(this::naoEncontrado);
        PrestadorPerfil prestador = prestadorPerfilRepository
                .findByUsuarioId(request.prestadorId())
                .orElseThrow(() -> new ApiException(
                        HttpStatus.NOT_FOUND, "PRESTADOR_NAO_ENCONTRADO", "Prestador não encontrado."));

        if (!prestador.isOnline()) {
            throw new ApiException(
                    HttpStatus.CONFLICT,
                    "PRESTADOR_INDISPONIVEL",
                    "Este profissional não está recebendo novas solicitações no momento.");
        }

        Instant inicio = request.inicio().toInstant();
        Instant fim = request.fim().toInstant();
        validarPeriodo(inicio, fim, prestador.getDiasAtendimento());

        if (!agendamentoRepository
                .sobrepostos(prestador.getUsuario().getId(), List.of(StatusAgendamento.CONFIRMADO), inicio, fim)
                .isEmpty()) {
            throw conflitoDeHorario();
        }

        Endereco e = cliente.getEndereco();
        String observacoes = request.observacoes() == null ? "" : request.observacoes().trim();

        Agendamento agendamento = Agendamento.builder()
                .cliente(cliente)
                .prestador(prestador.getUsuario())
                .servico(prestador.getServicoPrincipal())
                .valor(calcularValor(prestador, inicio, fim))
                .inicio(inicio)
                .fim(fim)
                .status(StatusAgendamento.PENDENTE)
                .endereco(new Endereco(
                        e.getCep(), e.getLogradouro(), e.getNumero(), e.getComplemento(), e.getBairro(), e.getCidade(), e.getUf()))
                .observacoes(observacoes.isEmpty() ? null : observacoes)
                .build();

        return resposta(agendamentoRepository.save(agendamento));
    }

    // Cliente vê os que solicitou; prestador, os atribuídos a ele.
    @Transactional(readOnly = true)
    public List<AgendamentoResponse> listar(Usuario logado, StatusAgendamento status) {
        List<Agendamento> todos = logado.getPerfil() == Perfil.CLIENTE
                ? agendamentoRepository.findByClienteIdOrderByInicioAsc(logado.getId())
                : agendamentoRepository.findByPrestadorIdOrderByInicioAsc(logado.getId());

        return todos.stream()
                .filter(a -> status == null || a.getStatus() == status)
                .map(this::resposta)
                .toList();
    }

    @Transactional(readOnly = true)
    public AgendamentoResponse buscar(Usuario logado, UUID id) {
        Agendamento agendamento = carregar(id);
        if (!participa(agendamento, logado)) {
            throw naoEncontrado();
        }
        return resposta(agendamento);
    }

    @Transactional
    public AgendamentoResponse cancelar(Usuario logado, UUID id, String motivo) {
        Agendamento agendamento = doCliente(id, logado);

        if (!MOTIVOS_CANCELAMENTO.contains(motivo)) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "MOTIVO_INVALIDO",
                    "Escolha um dos motivos da lista.",
                    Map.of("motivo", "Escolha um dos motivos da lista."));
        }

        agendamento.setStatus(agendamento.getStatus().cancelar());
        agendamento.setMotivoCancelamento(motivo);
        return resposta(agendamento);
    }

    @Transactional
    public AgendamentoResponse aceitar(Usuario logado, UUID id) {
        Agendamento agendamento = doPrestador(id, logado);
        StatusAgendamento proximo = agendamento.getStatus().aceitar();

        if (!agendamentoRepository
                .sobrepostos(
                        logado.getId(), List.of(StatusAgendamento.CONFIRMADO), agendamento.getInicio(), agendamento.getFim())
                .isEmpty()) {
            throw conflitoDeHorario();
        }

        agendamento.setStatus(proximo);
        return resposta(agendamento);
    }

    @Transactional
    public AgendamentoResponse recusar(Usuario logado, UUID id, String motivo) {
        Agendamento agendamento = doPrestador(id, logado);
        agendamento.setStatus(agendamento.getStatus().recusar());

        String texto = motivo == null ? "" : motivo.trim();
        agendamento.setMotivoCancelamento(texto.isEmpty() ? null : texto);
        return resposta(agendamento);
    }

    @Transactional
    public AgendamentoResponse concluir(Usuario logado, UUID id) {
        Agendamento agendamento = doPrestador(id, logado);
        agendamento.setStatus(agendamento.getStatus().concluir());
        return resposta(agendamento);
    }

    @Transactional
    public AgendamentoResponse avaliar(Usuario logado, UUID id, AvaliarAgendamentoRequest request) {
        Agendamento agendamento = doCliente(id, logado);
        agendamento.getStatus().avaliar(agendamento.avaliado());

        List<String> destaques = request.destaques() == null ? List.of() : request.destaques();
        if (!DESTAQUES.containsAll(destaques)) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "DESTAQUE_INVALIDO",
                    "Escolha os destaques da lista.",
                    Map.of("destaques", "Escolha os destaques da lista."));
        }

        String comentario = request.comentario() == null ? "" : request.comentario().trim();
        agendamento.setAvaliacaoNota(request.nota());
        agendamento.setAvaliacaoComentario(comentario.isEmpty() ? null : comentario);
        agendamento.setDestaques(new ArrayList<>(new LinkedHashSet<>(destaques)));
        agendamento.setAvaliadoEm(Instant.now());
        return resposta(agendamento);
    }

    private void validarPeriodo(Instant inicio, Instant fim, List<Integer> diasAtendimento) {
        if (!fim.isAfter(inicio) || Duration.between(inicio, fim).compareTo(DURACAO_MAXIMA) > 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "PERIODO_INVALIDO", "Escolha um horário válido.");
        }
        if (!inicio.isAfter(Instant.now())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "DATA_NO_PASSADO", "Escolha uma data a partir de agora.");
        }
        // DayOfWeek vai de 1 (segunda) a 7 (domingo); no app, 0 é domingo.
        int dia = inicio.atZone(FUSO).getDayOfWeek().getValue() % 7;
        if (!diasAtendimento.isEmpty() && !diasAtendimento.contains(dia)) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST, "DIA_INDISPONIVEL", "O profissional não atende neste dia da semana.");
        }
    }

    // Sem preço definido o valor fica "a combinar" (null). Por hora, multiplica pela duração.
    private static BigDecimal calcularValor(PrestadorPerfil prestador, Instant inicio, Instant fim) {
        BigDecimal preco = prestador.getPreco();
        if (preco == null) {
            return null;
        }
        if (prestador.getUnidadePreco() == UnidadePreco.HORA) {
            BigDecimal horas = BigDecimal.valueOf(Duration.between(inicio, fim).toMinutes())
                    .divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP);
            return preco.multiply(horas).setScale(2, RoundingMode.HALF_UP);
        }
        return preco;
    }

    private AgendamentoResponse resposta(Agendamento agendamento) {
        var reputacao = reputacaoService.de(agendamento.getPrestador().getId());
        return AgendamentoResponse.from(agendamento, FUSO, reputacao.nota(), reputacao.avaliacoes());
    }

    private Agendamento carregar(UUID id) {
        return agendamentoRepository.findById(id).orElseThrow(this::naoEncontrado);
    }

    private static boolean participa(Agendamento a, Usuario usuario) {
        return a.getCliente().getId().equals(usuario.getId()) || a.getPrestador().getId().equals(usuario.getId());
    }

    // Quem não participa recebe 404 (não revela que o agendamento existe); a outra parte, 403.
    private Agendamento doCliente(UUID id, Usuario logado) {
        Agendamento a = carregar(id);
        if (a.getCliente().getId().equals(logado.getId())) {
            return a;
        }
        throw participa(a, logado) ? acessoNegado("Só o cliente pode fazer isso.") : naoEncontrado();
    }

    private Agendamento doPrestador(UUID id, Usuario logado) {
        Agendamento a = carregar(id);
        if (a.getPrestador().getId().equals(logado.getId())) {
            return a;
        }
        throw participa(a, logado) ? acessoNegado("Só o prestador pode fazer isso.") : naoEncontrado();
    }

    private ApiException naoEncontrado() {
        return new ApiException(HttpStatus.NOT_FOUND, "AGENDAMENTO_NAO_ENCONTRADO", "Agendamento não encontrado.");
    }

    private static ApiException acessoNegado(String mensagem) {
        return new ApiException(HttpStatus.FORBIDDEN, "ACESSO_NEGADO", mensagem);
    }

    private static ApiException conflitoDeHorario() {
        return new ApiException(
                HttpStatus.CONFLICT,
                "CONFLITO_DE_HORARIO",
                "O profissional já tem um compromisso confirmado neste horário.");
    }
}
