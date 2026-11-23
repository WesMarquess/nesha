package com.nesha.backend;

import static org.assertj.core.api.Assertions.assertThat;

import com.jayway.jsonpath.JsonPath;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.temporal.TemporalAdjusters;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.assertj.MockMvcTester;
import org.springframework.test.web.servlet.assertj.MvcTestResult;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@AutoConfigureMockMvc
class AgendamentoIntegrationTest {

    private static final ZoneId FUSO = ZoneId.of("America/Sao_Paulo");

    private static final String ENDERECO = """
            {"cep":"01310100","logradouro":"Avenida Paulista","numero":"1000","complemento":"Apto 12",
             "bairro":"Bela Vista","cidade":"São Paulo","uf":"SP"}
            """;

    @Autowired
    private MockMvc mockMvc;

    private MockMvcTester mvc() {
        return MockMvcTester.create(mockMvc);
    }

    private record Conta(String id, String token) {}

    private String cpfUnico() {
        return "996" + String.format("%08d", Math.abs(UUID.randomUUID().hashCode()) % 100000000);
    }

    private Conta cadastrar(String rota, String extras) throws Exception {
        String email = "agenda-" + UUID.randomUUID() + "@example.com";
        MvcTestResult cadastro = mvc().perform(MockMvcRequestBuilders.post(rota)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"nome":"Pessoa Teste","cpf":"%s","telefone":"11987654321","email":"%s",
                         "senha":"Senha@123","endereco":%s%s}
                        """
                        .formatted(cpfUnico(), email, ENDERECO, extras)));
        assertThat(cadastro).hasStatus(201);
        String id = JsonPath.read(cadastro.getResponse().getContentAsString(), "$.usuario.id");

        MvcTestResult login = mvc().perform(MockMvcRequestBuilders.post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"%s\",\"senha\":\"Senha@123\"}".formatted(email)));
        return new Conta(id, JsonPath.read(login.getResponse().getContentAsString(), "$.accessToken"));
    }

    private Conta cliente() throws Exception {
        return cadastrar("/api/v1/clientes", "");
    }

    private Conta prestador(String preco, String unidade, String dias) throws Exception {
        return cadastrar("/api/v1/prestadores", """
                ,"servicoPrincipal":"Jardineiro","areaAtendimento":"São Paulo","preco":%s,
                 "unidadePreco":"%s","diasAtendimento":%s
                """
                .formatted(preco, unidade, dias));
    }

    private Conta prestador() throws Exception {
        return prestador("130.00", "DIA", "[0,1,2,3,4,5,6]");
    }

    // Uma data futura (a próxima ocorrência do dia da semana, pelo menos 2 dias à frente).
    private static LocalDate proxima(DayOfWeek dia) {
        return LocalDate.now(FUSO).plusDays(2).with(TemporalAdjusters.nextOrSame(dia));
    }

    private static String periodo(LocalDate dia, int horaInicio, int horaFim) {
        return "\"inicio\":\"%s\",\"fim\":\"%s\""
                .formatted(
                        OffsetDateTime.of(dia, LocalTime.of(horaInicio, 0), FUSO.getRules().getOffset(dia.atStartOfDay())),
                        OffsetDateTime.of(dia, LocalTime.of(horaFim, 0), FUSO.getRules().getOffset(dia.atStartOfDay())));
    }

    private MvcTestResult chamar(MockHttpServletRequestBuilder req, Conta conta, String corpo) {
        req.header("Authorization", "Bearer " + conta.token());
        if (corpo != null) {
            req.contentType(MediaType.APPLICATION_JSON).content(corpo);
        }
        return mvc().perform(req);
    }

    private MvcTestResult solicitar(Conta cliente, Conta prestador, LocalDate dia, int de, int ate) {
        return chamar(
                MockMvcRequestBuilders.post("/api/v1/agendamentos"),
                cliente,
                "{\"prestadorId\":\"%s\",%s,\"observacoes\":\"Portão azul.\"}".formatted(prestador.id(), periodo(dia, de, ate)));
    }

    // Cria e paga (os testes rodam sem Access Token: o pagamento é simulado e aprova na hora).
    private String criar(Conta cliente, Conta prestador, LocalDate dia, int de, int ate) throws Exception {
        MvcTestResult resposta = solicitar(cliente, prestador, dia, de, ate);
        assertThat(resposta).hasStatus(201);
        String id = JsonPath.read(resposta.getResponse().getContentAsString(), "$.id");
        assertThat(acao(cliente, id, "pagamento", null)).hasStatus(200);
        assertThat(acao(cliente, id, "pagamento/verificar", null))
                .bodyJson()
                .extractingPath("$.status")
                .isEqualTo("PENDENTE");
        return id;
    }

    private MvcTestResult acao(Conta conta, String id, String acao, String corpo) {
        return chamar(MockMvcRequestBuilders.post("/api/v1/agendamentos/%s/%s".formatted(id, acao)), conta, corpo);
    }

    @Test
    void criar_comoCliente_aguardaPagamentoComDadosDoPrestadorEEnderecoDoCliente() throws Exception {
        Conta cliente = cliente();
        Conta prestador = prestador();

        MvcTestResult resposta = solicitar(cliente, prestador, proxima(DayOfWeek.WEDNESDAY), 13, 17);

        assertThat(resposta).hasStatus(201);
        assertThat(resposta).bodyJson().extractingPath("$.status").isEqualTo("AGUARDANDO_PAGAMENTO");
        assertThat(resposta).bodyJson().extractingPath("$.pagamentoStatus").isEqualTo("AGUARDANDO");
        assertThat(resposta).bodyJson().extractingPath("$.servico").isEqualTo("Jardineiro");
        assertThat(resposta).bodyJson().extractingPath("$.valor").isEqualTo(130.0);
        assertThat(resposta).bodyJson().extractingPath("$.endereco.complemento").isEqualTo("Apto 12");
        assertThat(resposta).bodyJson().extractingPath("$.observacoes").isEqualTo("Portão azul.");
        assertThat(resposta).bodyJson().extractingPath("$.prestador.id").isEqualTo(prestador.id());
    }

    @Test
    void pagamento_soDepoisDeAprovadoChegaAoPrestador() throws Exception {
        Conta cliente = cliente();
        Conta prestador = prestador();
        MvcTestResult criado = solicitar(cliente, prestador, proxima(DayOfWeek.WEDNESDAY), 8, 12);
        String id = JsonPath.read(criado.getResponse().getContentAsString(), "$.id");

        // Antes de pagar, o prestador não vê nem consegue agir.
        assertThat(chamar(MockMvcRequestBuilders.get("/api/v1/agendamentos"), prestador, null))
                .bodyJson()
                .extractingPath("$.length()")
                .isEqualTo(0);
        assertThat(chamar(MockMvcRequestBuilders.get("/api/v1/agendamentos/" + id), prestador, null)).hasStatus(404);
        assertThat(acao(prestador, id, "aceitar", null)).hasStatus(404);

        MvcTestResult iniciado = acao(cliente, id, "pagamento", "{\"retornoUrl\":\"nesha://pagamento\"}");
        assertThat(iniciado).hasStatus(200);
        assertThat(iniciado).bodyJson().extractingPath("$.simulado").isEqualTo(true);
        assertThat(iniciado).bodyJson().extractingPath("$.urlCheckout").isNull();

        MvcTestResult verificado = acao(cliente, id, "pagamento/verificar", null);
        assertThat(verificado).bodyJson().extractingPath("$.status").isEqualTo("PENDENTE");
        assertThat(verificado).bodyJson().extractingPath("$.pagamentoStatus").isEqualTo("APROVADO");

        assertThat(chamar(MockMvcRequestBuilders.get("/api/v1/agendamentos"), prestador, null))
                .bodyJson()
                .extractingPath("$.length()")
                .isEqualTo(1);

        // Pagar de novo um agendamento já pago não é permitido.
        assertThat(acao(cliente, id, "pagamento", null))
                .hasStatus(409)
                .bodyJson()
                .extractingPath("$.codigo")
                .isEqualTo("TRANSICAO_INVALIDA");
    }

    @Test
    void semPreco_vaiDiretoParaOPrestadorSemPagamento() throws Exception {
        Conta cliente = cliente();
        Conta prestador = cadastrar("/api/v1/prestadores", """
                ,"servicoPrincipal":"Jardineiro","areaAtendimento":"São Paulo"
                """);

        MvcTestResult resposta = solicitar(cliente, prestador, proxima(DayOfWeek.FRIDAY), 8, 12);
        assertThat(resposta).bodyJson().extractingPath("$.status").isEqualTo("PENDENTE");
        assertThat(resposta).bodyJson().extractingPath("$.valor").isNull();
        assertThat(resposta).bodyJson().extractingPath("$.pagamentoStatus").isNull();
    }

    @Test
    void recusarOuCancelarDepoisDePago_estornaOPagamento() throws Exception {
        Conta cliente = cliente();
        Conta prestador = prestador();
        String recusado = criar(cliente, prestador, proxima(DayOfWeek.THURSDAY), 8, 12);
        String cancelado = criar(cliente, prestador, proxima(DayOfWeek.THURSDAY), 13, 17);

        assertThat(acao(prestador, recusado, "recusar", null))
                .bodyJson()
                .extractingPath("$.pagamentoStatus")
                .isEqualTo("ESTORNADO");

        acao(prestador, cancelado, "aceitar", null);
        assertThat(acao(cliente, cancelado, "cancelar", "{\"motivo\":\"Problema de agenda\"}"))
                .bodyJson()
                .extractingPath("$.pagamentoStatus")
                .isEqualTo("ESTORNADO");
    }

    @Test
    void cancelarAntesDePagar_naoEstorna() throws Exception {
        Conta cliente = cliente();
        MvcTestResult criado = solicitar(cliente, prestador(), proxima(DayOfWeek.TUESDAY), 8, 12);
        String id = JsonPath.read(criado.getResponse().getContentAsString(), "$.id");

        MvcTestResult cancelado = acao(cliente, id, "cancelar", "{\"motivo\":\"Mudança de planos\"}");
        assertThat(cancelado).bodyJson().extractingPath("$.status").isEqualTo("CANCELADO");
        assertThat(cancelado).bodyJson().extractingPath("$.pagamentoStatus").isEqualTo("AGUARDANDO");
    }

    @Test
    void valorPorHora_multiplicaPelaDuracao() throws Exception {
        Conta cliente = cliente();
        Conta prestador = prestador("50.00", "HORA", "[]");

        assertThat(solicitar(cliente, prestador, proxima(DayOfWeek.MONDAY), 8, 12))
                .bodyJson()
                .extractingPath("$.valor")
                .isEqualTo(200.0);
    }

    @Test
    void cicloCompleto_aceitarConcluirAvaliar_atualizaReputacaoDoPrestador() throws Exception {
        Conta cliente = cliente();
        Conta prestador = prestador();
        String id = criar(cliente, prestador, proxima(DayOfWeek.THURSDAY), 8, 12);

        assertThat(acao(prestador, id, "aceitar", null)).bodyJson().extractingPath("$.status").isEqualTo("CONFIRMADO");
        assertThat(acao(prestador, id, "concluir", null)).bodyJson().extractingPath("$.status").isEqualTo("CONCLUIDO");

        String avaliacao = "{\"nota\":5,\"destaques\":[\"Pontualidade\",\"Gentileza\"],\"comentario\":\" Ótimo! \"}";
        MvcTestResult avaliado = acao(cliente, id, "avaliacao", avaliacao);
        assertThat(avaliado).hasStatus(200);
        assertThat(avaliado).bodyJson().extractingPath("$.avaliacao.comentario").isEqualTo("Ótimo!");
        assertThat(avaliado).bodyJson().extractingPath("$.prestador.nota").isEqualTo(5.0);

        assertThat(acao(cliente, id, "avaliacao", avaliacao))
                .hasStatus(409)
                .bodyJson()
                .extractingPath("$.codigo")
                .isEqualTo("AVALIACAO_JA_ENVIADA");

        MvcTestResult perfil = chamar(MockMvcRequestBuilders.get("/api/v1/prestadores/" + prestador.id()), cliente, null);
        assertThat(perfil).bodyJson().extractingPath("$.avaliacoes").isEqualTo(1);
        assertThat(perfil).bodyJson().extractingPath("$.servicosRealizados").isEqualTo(1);
        assertThat(perfil).bodyJson().extractingPath("$.avaliacoesPorNota.5").isEqualTo(1);

        assertThat(chamar(MockMvcRequestBuilders.get("/api/v1/prestadores/%s/avaliacoes".formatted(prestador.id())), cliente, null))
                .bodyJson()
                .extractingPath("$[0].cliente")
                .isEqualTo("Pessoa");
    }

    @Test
    void cancelar_comMotivoDaLista_registraMotivo() throws Exception {
        Conta cliente = cliente();
        Conta prestador = prestador();
        String id = criar(cliente, prestador, proxima(DayOfWeek.FRIDAY), 13, 17);
        acao(prestador, id, "aceitar", null);

        assertThat(acao(cliente, id, "cancelar", "{\"motivo\":\"Qualquer coisa\"}"))
                .hasStatus(400)
                .bodyJson()
                .extractingPath("$.codigo")
                .isEqualTo("MOTIVO_INVALIDO");

        MvcTestResult cancelado = acao(cliente, id, "cancelar", "{\"motivo\":\"Mudança de planos\"}");
        assertThat(cancelado).bodyJson().extractingPath("$.status").isEqualTo("CANCELADO");
        assertThat(cancelado).bodyJson().extractingPath("$.motivoCancelamento").isEqualTo("Mudança de planos");
    }

    @Test
    void transicaoInvalida_devolve409() throws Exception {
        Conta cliente = cliente();
        Conta prestador = prestador();
        String id = criar(cliente, prestador, proxima(DayOfWeek.TUESDAY), 13, 17);

        assertThat(acao(cliente, id, "avaliacao", "{\"nota\":4}"))
                .hasStatus(409)
                .bodyJson()
                .extractingPath("$.codigo")
                .isEqualTo("TRANSICAO_INVALIDA");
        assertThat(acao(prestador, id, "concluir", null)).hasStatus(409);

        acao(prestador, id, "recusar", "{\"motivo\":\"Agenda cheia\"}");
        assertThat(acao(prestador, id, "aceitar", null)).hasStatus(409);
    }

    @Test
    void permissoes_soOsParticipantesComSeusPapeis() throws Exception {
        Conta cliente = cliente();
        Conta prestador = prestador();
        String id = criar(cliente, prestador, proxima(DayOfWeek.SATURDAY), 8, 12);

        assertThat(acao(prestador, id, "cancelar", "{\"motivo\":\"Mudança de planos\"}"))
                .hasStatus(403)
                .bodyJson()
                .extractingPath("$.codigo")
                .isEqualTo("ACESSO_NEGADO");
        assertThat(acao(cliente, id, "aceitar", null)).hasStatus(403);

        Conta outroCliente = cliente();
        assertThat(chamar(MockMvcRequestBuilders.get("/api/v1/agendamentos/" + id), outroCliente, null))
                .hasStatus(404)
                .bodyJson()
                .extractingPath("$.codigo")
                .isEqualTo("AGENDAMENTO_NAO_ENCONTRADO");
        assertThat(acao(outroCliente, id, "cancelar", "{\"motivo\":\"Mudança de planos\"}")).hasStatus(404);

        // Prestador não agenda serviços.
        assertThat(solicitar(prestador, prestador(), proxima(DayOfWeek.SATURDAY), 13, 17)).hasStatus(403);
    }

    @Test
    void conflitoDeHorario_naoDeixaConfirmarDoisNoMesmoPeriodo() throws Exception {
        Conta prestador = prestador();
        LocalDate dia = proxima(DayOfWeek.MONDAY);
        String primeiro = criar(cliente(), prestador, dia, 13, 17);
        String segundo = criar(cliente(), prestador, dia, 14, 18);

        assertThat(acao(prestador, primeiro, "aceitar", null)).hasStatus(200);
        assertThat(acao(prestador, segundo, "aceitar", null))
                .hasStatus(409)
                .bodyJson()
                .extractingPath("$.codigo")
                .isEqualTo("CONFLITO_DE_HORARIO");

        // Com o horário já confirmado, nem dá para solicitar.
        assertThat(solicitar(cliente(), prestador, dia, 15, 16)).hasStatus(409);
        // Horário seguido, sem sobreposição, pode.
        assertThat(solicitar(cliente(), prestador, dia, 17, 20)).hasStatus(201);
    }

    @Test
    void validacoesDoPeriodo() throws Exception {
        Conta cliente = cliente();
        Conta soSegunda = prestador("130.00", "DIA", "[1]");

        assertThat(solicitar(cliente, soSegunda, LocalDate.now(FUSO).minusDays(1), 8, 12))
                .bodyJson()
                .extractingPath("$.codigo")
                .isEqualTo("DATA_NO_PASSADO");
        assertThat(solicitar(cliente, soSegunda, proxima(DayOfWeek.TUESDAY), 8, 12))
                .hasStatus(400)
                .bodyJson()
                .extractingPath("$.codigo")
                .isEqualTo("DIA_INDISPONIVEL");
        assertThat(solicitar(cliente, soSegunda, proxima(DayOfWeek.MONDAY), 12, 8))
                .bodyJson()
                .extractingPath("$.codigo")
                .isEqualTo("PERIODO_INVALIDO");
    }

    @Test
    void prestadorOffline_naoAparecaNoCatalogoNemRecebeSolicitacao() throws Exception {
        Conta cliente = cliente();
        Conta prestador = prestador();

        assertThat(chamar(MockMvcRequestBuilders.get("/api/v1/prestadores?servico=Jardineiro"), cliente, null)
                        .getResponse()
                        .getContentAsString())
                .contains(prestador.id());

        chamar(MockMvcRequestBuilders.put("/api/v1/prestadores/me"), prestador, """
                {"nome":"Pessoa Teste","telefone":"11987654321","servicoPrincipal":"Jardineiro",
                 "areaAtendimento":"São Paulo","sobreMim":"","preco":130.00,"unidadePreco":"DIA","online":false}
                """);

        assertThat(chamar(MockMvcRequestBuilders.get("/api/v1/prestadores?servico=Jardineiro"), cliente, null)
                        .getResponse()
                        .getContentAsString())
                .doesNotContain(prestador.id());
        assertThat(solicitar(cliente, prestador, proxima(DayOfWeek.MONDAY), 8, 12))
                .hasStatus(409)
                .bodyJson()
                .extractingPath("$.codigo")
                .isEqualTo("PRESTADOR_INDISPONIVEL");
    }

    @Test
    void horariosOcupados_mostraPendentesSemDadosDoCliente() throws Exception {
        Conta cliente = cliente();
        Conta prestador = prestador();
        LocalDate dia = proxima(DayOfWeek.WEDNESDAY);
        criar(cliente, prestador, dia, 8, 12);

        MvcTestResult ocupados = chamar(
                MockMvcRequestBuilders.get("/api/v1/prestadores/%s/horarios-ocupados?de=%s&ate=%s"
                        .formatted(prestador.id(), dia, dia.plusDays(6))),
                cliente,
                null);

        assertThat(ocupados).bodyJson().extractingPath("$.length()").isEqualTo(1);
        Map<String, Object> primeiro = JsonPath.read(ocupados.getResponse().getContentAsString(), "$[0]");
        assertThat(primeiro.keySet()).containsExactlyInAnyOrder("inicio", "fim");
    }

    @Test
    void catalogo_exigeLogin() {
        assertThat(mvc().perform(MockMvcRequestBuilders.get("/api/v1/prestadores"))).hasStatus(401);
    }

    @Test
    void statusInvalidoNaConsulta_devolve400() throws Exception {
        assertThat(chamar(MockMvcRequestBuilders.get("/api/v1/agendamentos?status=XYZ"), cliente(), null))
                .hasStatus(400);
    }
}
