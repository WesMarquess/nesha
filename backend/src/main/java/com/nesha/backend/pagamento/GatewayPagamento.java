package com.nesha.backend.pagamento;

import com.nesha.backend.entity.Agendamento;
import com.nesha.backend.entity.StatusPagamento;

// Provedor de pagamento visto pelo Nesha. O resto do backend só conhece estes tipos,
// nunca o formato do Mercado Pago (padrão Adapter, docs/DESIGN_PATTERNS.md).
public interface GatewayPagamento {

    // urlCheckout é a página onde o cliente paga; null quando o pagamento é simulado.
    record Checkout(String urlCheckout, String referencia) {}

    // pagamentoId identifica o pagamento no provedor (usado no estorno); null se ainda não houver.
    record Resultado(StatusPagamento status, String pagamentoId) {}

    Checkout iniciar(Agendamento agendamento, String retornoUrl);

    Resultado consultar(Agendamento agendamento);

    void estornar(String pagamentoId);

    boolean simulado();
}
