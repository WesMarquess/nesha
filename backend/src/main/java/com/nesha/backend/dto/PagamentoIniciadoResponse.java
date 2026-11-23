package com.nesha.backend.dto;

// urlCheckout: página do Checkout Pro onde o cliente paga. null quando o pagamento é simulado
// (backend sem Access Token do Mercado Pago): nesse caso o app já pode verificar o pagamento.
public record PagamentoIniciadoResponse(String urlCheckout, boolean simulado) {}
