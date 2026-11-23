package com.nesha.backend.dto;

import jakarta.validation.constraints.Size;

// retornoUrl: deep link do app para onde o Mercado Pago volta depois do pagamento (opcional).
public record IniciarPagamentoRequest(@Size(max = 500) String retornoUrl) {}
