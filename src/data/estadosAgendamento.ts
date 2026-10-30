import type { Agendamento, Avaliacao, StatusAgendamento } from './agendamentos';

// Padrão State (GoF): cada status do agendamento é um objeto que decide quais
// ações são permitidas e qual é o próximo status. As telas perguntam ao estado
// (ex.: `estadoDe(item).podeCancelar`) em vez de comparar strings de status.
// Ver docs/DESIGN_PATTERNS.md.

export class TransicaoInvalidaError extends Error {
  constructor(acao: string, status: StatusAgendamento) {
    super(`Não é possível ${acao} um agendamento com status ${status}.`);
    this.name = 'TransicaoInvalidaError';
  }
}

export type EstadoAgendamento = {
  status: StatusAgendamento;
  podeResponder: boolean; // prestador aceita ou recusa
  podeCancelar: boolean;
  podeAvaliar: boolean;
  aceitar(ag: Agendamento): Agendamento;
  recusar(ag: Agendamento): Agendamento;
  cancelar(ag: Agendamento, motivo: string): Agendamento;
  concluir(ag: Agendamento): Agendamento;
  avaliar(ag: Agendamento, avaliacao: Avaliacao): Agendamento;
};

// Comportamento padrão: nenhuma transição é permitida.
function estadoBase(status: StatusAgendamento): EstadoAgendamento {
  const invalida = (acao: string) => (): never => {
    throw new TransicaoInvalidaError(acao, status);
  };
  return {
    status,
    podeResponder: false,
    podeCancelar: false,
    podeAvaliar: false,
    aceitar: invalida('aceitar'),
    recusar: invalida('recusar'),
    cancelar: invalida('cancelar'),
    concluir: invalida('concluir'),
    avaliar: invalida('avaliar'),
  };
}

const Pendente: EstadoAgendamento = {
  ...estadoBase('PENDENTE'),
  podeResponder: true,
  podeCancelar: true,
  aceitar: (ag) => ({ ...ag, status: 'CONFIRMADO' }),
  recusar: (ag) => ({ ...ag, status: 'CANCELADO' }),
  cancelar: (ag, motivo) => ({ ...ag, status: 'CANCELADO', motivoCancelamento: motivo }),
};

const Confirmado: EstadoAgendamento = {
  ...estadoBase('CONFIRMADO'),
  podeCancelar: true,
  cancelar: (ag, motivo) => ({ ...ag, status: 'CANCELADO', motivoCancelamento: motivo }),
  concluir: (ag) => ({ ...ag, status: 'CONCLUIDO' }),
};

const Concluido: EstadoAgendamento = {
  ...estadoBase('CONCLUIDO'),
  podeAvaliar: true,
  avaliar: (ag, avaliacao) => {
    if (ag.avaliacao) {
      throw new TransicaoInvalidaError('avaliar novamente', 'CONCLUIDO');
    }
    return { ...ag, avaliacao };
  },
};

const Cancelado: EstadoAgendamento = estadoBase('CANCELADO');

const ESTADOS: Record<StatusAgendamento, EstadoAgendamento> = {
  PENDENTE: Pendente,
  CONFIRMADO: Confirmado,
  CONCLUIDO: Concluido,
  CANCELADO: Cancelado,
};

export function estadoDe(ag: Agendamento): EstadoAgendamento {
  return ESTADOS[ag.status];
}
