package com.nesha.backend.pagamento;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.nesha.backend.entity.Agendamento;
import com.nesha.backend.entity.StatusPagamento;
import com.nesha.backend.exception.ApiException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Supplier;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

// Padrão Adapter (GoF): fala com a API REST do Mercado Pago (Checkout Pro) e converte as
// respostas para os tipos do Nesha. Documentação: mercadopago.com.br/developers (Checkout Pro,
// "Criar preferência", "Pesquisar pagamentos" e "Reembolsos").
public class MercadoPagoGateway implements GatewayPagamento {

    public static final String API = "https://api.mercadopago.com";

    record Preferencia(String id, @JsonProperty("init_point") String initPoint) {}

    record Pagamento(Long id, String status) {}

    record Busca(List<Pagamento> results) {}

    private final RestClient http;

    public MercadoPagoGateway(RestClient.Builder builder, String accessToken) {
        this.http = builder
                .baseUrl(API)
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                .build();
    }

    @Override
    public Checkout iniciar(Agendamento agendamento, String retornoUrl) {
        String id = agendamento.getId().toString();

        Map<String, Object> item = new LinkedHashMap<>();
        item.put("id", id);
        item.put("title", "%s com %s".formatted(agendamento.getServico(), agendamento.getPrestador().getNome()));
        item.put("quantity", 1);
        item.put("currency_id", "BRL");
        item.put("unit_price", agendamento.getValor());

        Map<String, Object> corpo = new LinkedHashMap<>();
        corpo.put("items", List.of(item));
        // Liga o pagamento ao agendamento: é por ela que consultar() encontra o pagamento.
        corpo.put("external_reference", id);
        corpo.put("statement_descriptor", "NESHA");
        // O Mercado Pago não aceita localhost nas back_urls; sem elas, o cliente fecha o checkout
        // e o app consulta o pagamento do mesmo jeito.
        if (retornoValido(retornoUrl)) {
            corpo.put("back_urls", Map.of("success", retornoUrl, "pending", retornoUrl, "failure", retornoUrl));
            corpo.put("auto_return", "approved");
        }

        Preferencia preferencia = chamar(() -> http.post()
                .uri("/checkout/preferences")
                .contentType(MediaType.APPLICATION_JSON)
                .body(corpo)
                .retrieve()
                .body(Preferencia.class));

        if (preferencia == null || preferencia.initPoint() == null) {
            throw indisponivel();
        }
        return new Checkout(preferencia.initPoint(), preferencia.id());
    }

    @Override
    public Resultado consultar(Agendamento agendamento) {
        Busca busca = chamar(() -> http.get()
                .uri(uri -> uri.path("/v1/payments/search")
                        .queryParam("external_reference", agendamento.getId().toString())
                        .queryParam("sort", "date_created")
                        .queryParam("criteria", "desc")
                        .build())
                .retrieve()
                .body(Busca.class));

        List<Pagamento> pagamentos = busca == null || busca.results() == null ? List.of() : busca.results();
        // Se alguma tentativa foi aprovada, vale ela; senão, a mais recente.
        Pagamento escolhido = pagamentos.stream()
                .filter(p -> "approved".equals(p.status()))
                .findFirst()
                .orElse(pagamentos.isEmpty() ? null : pagamentos.getFirst());

        if (escolhido == null) {
            return new Resultado(StatusPagamento.AGUARDANDO, null);
        }
        return new Resultado(converter(escolhido.status()), String.valueOf(escolhido.id()));
    }

    @Override
    public void estornar(String pagamentoId) {
        chamar(() -> http.post()
                .uri("/v1/payments/{id}/refunds", pagamentoId)
                .header("X-Idempotency-Key", UUID.randomUUID().toString())
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of())
                .retrieve()
                .toBodilessEntity());
    }

    @Override
    public boolean simulado() {
        return false;
    }

    // Status do Mercado Pago -> status do Nesha.
    static StatusPagamento converter(String status) {
        return switch (status == null ? "" : status) {
            case "approved" -> StatusPagamento.APROVADO;
            case "rejected", "cancelled" -> StatusPagamento.RECUSADO;
            case "refunded", "charged_back" -> StatusPagamento.ESTORNADO;
            default -> StatusPagamento.AGUARDANDO; // pending, in_process, authorized, in_mediation
        };
    }

    private static boolean retornoValido(String url) {
        return url != null
                && !url.isBlank()
                && !url.contains("localhost")
                && !url.contains("127.0.0.1")
                && url.length() <= 500;
    }

    private static <T> T chamar(Supplier<T> chamada) {
        try {
            return chamada.get();
        } catch (RestClientException e) {
            throw indisponivel();
        }
    }

    private static ApiException indisponivel() {
        return new ApiException(
                HttpStatus.BAD_GATEWAY,
                "PAGAMENTO_INDISPONIVEL",
                "Não foi possível falar com o Mercado Pago agora. Tente novamente.");
    }
}
