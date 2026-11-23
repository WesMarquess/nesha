package com.nesha.backend.entity;

// Situação do pagamento no formato do Nesha (o MercadoPagoGateway converte os status do provedor).
public enum StatusPagamento {
    AGUARDANDO,
    APROVADO,
    RECUSADO,
    ESTORNADO
}
