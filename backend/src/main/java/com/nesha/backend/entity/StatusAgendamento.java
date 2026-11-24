package com.nesha.backend.entity;

import com.nesha.backend.exception.ApiException;
import org.springframework.http.HttpStatus;

// Padrão State (GoF): cada status decide quais transições aceita, espelhando
// src/data/estadosAgendamento.ts no app. Ver docs/DESIGN_PATTERNS.md.
public enum StatusAgendamento {
    // Criado pelo cliente, ainda sem pagamento aprovado: o prestador ainda não vê.
    AGUARDANDO_PAGAMENTO {
        @Override
        public StatusAgendamento pagar() {
            return PENDENTE;
        }

        @Override
        public StatusAgendamento cancelar() {
            return CANCELADO;
        }
    },
    PENDENTE {
        @Override
        public StatusAgendamento aceitar() {
            return CONFIRMADO;
        }

        @Override
        public StatusAgendamento recusar() {
            return CANCELADO;
        }

        @Override
        public StatusAgendamento cancelar() {
            return CANCELADO;
        }
    },
    CONFIRMADO {
        @Override
        public StatusAgendamento cancelar() {
            return CANCELADO;
        }

        @Override
        public StatusAgendamento concluir() {
            return CONCLUIDO;
        }
    },
    CONCLUIDO {
        @Override
        public void avaliar(boolean jaAvaliado) {
            if (jaAvaliado) {
                throw new ApiException(
                        HttpStatus.CONFLICT, "AVALIACAO_JA_ENVIADA", "Este serviço já foi avaliado.");
            }
        }
    },
    CANCELADO;

    // Por padrão nenhuma transição é permitida; cada status libera as suas.
    public StatusAgendamento pagar() {
        throw invalida("pagar");
    }

    public StatusAgendamento aceitar() {
        throw invalida("aceitar");
    }

    public StatusAgendamento recusar() {
        throw invalida("recusar");
    }

    public StatusAgendamento cancelar() {
        throw invalida("cancelar");
    }

    public StatusAgendamento concluir() {
        throw invalida("concluir");
    }

    public void avaliar(boolean jaAvaliado) {
        throw invalida("avaliar");
    }

    // Status que ocupam a agenda do prestador (bloqueiam o horário).
    public boolean ocupaHorario() {
        return this == PENDENTE || this == CONFIRMADO;
    }

    private ApiException invalida(String acao) {
        return new ApiException(
                HttpStatus.CONFLICT,
                "TRANSICAO_INVALIDA",
                "Não é possível %s um agendamento %s.".formatted(acao, name().toLowerCase().replace("_", " ")));
    }
}
