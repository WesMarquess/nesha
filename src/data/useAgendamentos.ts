import { useSyncExternalStore } from 'react';
import {
  Agendamento,
  assinarAgendamentos,
  buscarAgendamento,
  listarAgendamentos,
} from './agendamentos';

// Assina a lista de agendamentos (padrão Observer): a tela é redesenhada
// sempre que um agendamento muda, inclusive quando a mudança vem de outra tela.
export function useAgendamentos(): Agendamento[] {
  return useSyncExternalStore(assinarAgendamentos, listarAgendamentos);
}

export function useAgendamento(id?: string): Agendamento | undefined {
  return useSyncExternalStore(assinarAgendamentos, () => buscarAgendamento(id));
}
