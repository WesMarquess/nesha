package com.nesha.backend.pagamento;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class PagamentoConfig {

    private static final Logger log = LoggerFactory.getLogger(PagamentoConfig.class);

    // Access Token de TESTE da aplicação no Mercado Pago (variável MERCADOPAGO_ACCESS_TOKEN).
    // Vazio = pagamento simulado.
    @Bean
    public GatewayPagamento gatewayPagamento(
            @Value("${nesha.mercadopago.access-token:}") String accessToken) {
        if (accessToken.isBlank()) {
            log.warn("MERCADOPAGO_ACCESS_TOKEN não definido: os pagamentos serão simulados (aprovados sem checkout).");
            return new PagamentoSimulado();
        }
        log.info("Pagamentos pelo Mercado Pago (Checkout Pro).");
        return new MercadoPagoGateway(RestClient.builder(), accessToken);
    }
}
