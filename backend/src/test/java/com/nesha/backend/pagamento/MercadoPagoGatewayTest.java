package com.nesha.backend.pagamento;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.jsonPath;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withServerError;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import com.nesha.backend.entity.Agendamento;
import com.nesha.backend.entity.StatusPagamento;
import com.nesha.backend.entity.Usuario;
import com.nesha.backend.exception.ApiException;
import java.math.BigDecimal;
import java.util.UUID;
import org.hamcrest.Matchers;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

// Confere o formato das chamadas à API do Mercado Pago sem acessar a internet.
class MercadoPagoGatewayTest {

    private static final UUID ID = UUID.fromString("11111111-2222-3333-4444-555555555555");

    private MockRestServiceServer servidor;
    private MercadoPagoGateway gateway;
    private Agendamento agendamento;

    @BeforeEach
    void preparar() {
        RestClient.Builder builder = RestClient.builder();
        servidor = MockRestServiceServer.bindTo(builder).build();
        gateway = new MercadoPagoGateway(builder, "TEST-token");

        Usuario prestador = Usuario.builder().id(UUID.randomUUID()).nome("Francisco Oliveira").build();
        agendamento = Agendamento.builder()
                .id(ID)
                .servico("Jardineiro")
                .valor(new BigDecimal("130.00"))
                .prestador(prestador)
                .build();
    }

    @Test
    void iniciar_criaPreferenciaComReferenciaDoAgendamento() {
        servidor.expect(requestTo(MercadoPagoGateway.API + "/checkout/preferences"))
                .andExpect(method(HttpMethod.POST))
                .andExpect(header("Authorization", "Bearer TEST-token"))
                .andExpect(jsonPath("$.external_reference").value(ID.toString()))
                .andExpect(jsonPath("$.items[0].title").value("Jardineiro com Francisco Oliveira"))
                .andExpect(jsonPath("$.items[0].unit_price").value(130.0))
                .andExpect(jsonPath("$.items[0].currency_id").value("BRL"))
                .andExpect(jsonPath("$.back_urls.success").value("nesha://pagamento"))
                .andExpect(jsonPath("$.auto_return").value("approved"))
                .andRespond(withSuccess(
                        "{\"id\":\"pref-1\",\"init_point\":\"https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=pref-1\"}",
                        MediaType.APPLICATION_JSON));

        GatewayPagamento.Checkout checkout = gateway.iniciar(agendamento, "nesha://pagamento");

        assertThat(checkout.urlCheckout()).endsWith("pref_id=pref-1");
        assertThat(checkout.referencia()).isEqualTo("pref-1");
        servidor.verify();
    }

    @Test
    void iniciar_semRetornoValido_naoEnviaBackUrls() {
        servidor.expect(requestTo(MercadoPagoGateway.API + "/checkout/preferences"))
                .andExpect(jsonPath("$.back_urls").doesNotExist())
                .andExpect(jsonPath("$.auto_return").doesNotExist())
                .andRespond(withSuccess("{\"id\":\"pref-2\",\"init_point\":\"https://exemplo\"}", MediaType.APPLICATION_JSON));

        gateway.iniciar(agendamento, "http://localhost:8081/pagamento");
        servidor.verify();
    }

    @Test
    void consultar_preferePagamentoAprovado() {
        servidor.expect(requestTo(Matchers.startsWith(
                        MercadoPagoGateway.API + "/v1/payments/search?external_reference=" + ID)))
                .andExpect(method(HttpMethod.GET))
                .andRespond(withSuccess(
                        "{\"results\":[{\"id\":99,\"status\":\"rejected\"},{\"id\":42,\"status\":\"approved\"}]}",
                        MediaType.APPLICATION_JSON));

        GatewayPagamento.Resultado resultado = gateway.consultar(agendamento);

        assertThat(resultado.status()).isEqualTo(StatusPagamento.APROVADO);
        assertThat(resultado.pagamentoId()).isEqualTo("42");
    }

    @Test
    void consultar_semPagamentos_continuaAguardando() {
        servidor.expect(requestTo(Matchers.startsWith(MercadoPagoGateway.API + "/v1/payments/search")))
                .andRespond(withSuccess("{\"results\":[]}", MediaType.APPLICATION_JSON));

        assertThat(gateway.consultar(agendamento).status()).isEqualTo(StatusPagamento.AGUARDANDO);
    }

    @Test
    void converter_statusDoMercadoPago() {
        assertThat(MercadoPagoGateway.converter("approved")).isEqualTo(StatusPagamento.APROVADO);
        assertThat(MercadoPagoGateway.converter("in_process")).isEqualTo(StatusPagamento.AGUARDANDO);
        assertThat(MercadoPagoGateway.converter("pending")).isEqualTo(StatusPagamento.AGUARDANDO);
        assertThat(MercadoPagoGateway.converter("rejected")).isEqualTo(StatusPagamento.RECUSADO);
        assertThat(MercadoPagoGateway.converter("refunded")).isEqualTo(StatusPagamento.ESTORNADO);
    }

    @Test
    void estornar_chamaRefundsComIdempotencia() {
        servidor.expect(requestTo(MercadoPagoGateway.API + "/v1/payments/42/refunds"))
                .andExpect(method(HttpMethod.POST))
                .andExpect(header("X-Idempotency-Key", Matchers.matchesPattern("[0-9a-f-]{36}")))
                .andRespond(withSuccess("{\"id\":1,\"status\":\"approved\"}", MediaType.APPLICATION_JSON));

        gateway.estornar("42");
        servidor.verify();
    }

    @Test
    void erroNoMercadoPago_viraPagamentoIndisponivel() {
        servidor.expect(requestTo(MercadoPagoGateway.API + "/checkout/preferences")).andRespond(withServerError());

        assertThatThrownBy(() -> gateway.iniciar(agendamento, null))
                .isInstanceOf(ApiException.class)
                .extracting("codigo")
                .isEqualTo("PAGAMENTO_INDISPONIVEL");
    }
}
