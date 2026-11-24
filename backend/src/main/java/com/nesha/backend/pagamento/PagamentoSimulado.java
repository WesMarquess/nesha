package com.nesha.backend.pagamento;

import com.nesha.backend.entity.Agendamento;
import com.nesha.backend.entity.StatusPagamento;

// Usado quando não há Access Token do Mercado Pago configurado (desenvolvimento e testes):
// não abre checkout e considera o pagamento aprovado na primeira consulta.
public class PagamentoSimulado implements GatewayPagamento {

    @Override
    public Checkout iniciar(Agendamento agendamento, String retornoUrl) {
        return new Checkout(null, "simulado-" + agendamento.getId());
    }

    @Override
    public Resultado consultar(Agendamento agendamento) {
        return new Resultado(StatusPagamento.APROVADO, "simulado-" + agendamento.getId());
    }

    @Override
    public void estornar(String pagamentoId) {
        // Nada a devolver: nenhum dinheiro foi cobrado.
    }

    @Override
    public boolean simulado() {
        return true;
    }
}
