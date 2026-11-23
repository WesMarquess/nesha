import { useCallback, useSyncExternalStore } from 'react';
import { useFocusEffect } from 'expo-router';
import {
  Agendamento,
  assinarAgendamentos,
  buscarAgendamento,
  carregarAgendamentos,
  listarAgendamentos,
  Situacao,
  situacaoAgendamentos,
} from './agendamentos';

// Assina a lista de agendamentos (padrão Observer): a tela é redesenhada
// sempre que um agendamento muda, inclusive quando a mudança vem de outra tela.
export function useAgendamentos(): Agendamento[] {
  return useSyncExternalStore(assinarAgendamentos, listarAgendamentos);
}

export function useAgendamento(id?: string): Agendamento | undefined {
  return useSyncExternalStore(assinarAgendamentos, () => buscarAgendamento(id));
}

// Carregando/erro da última busca no backend.
export function useSituacaoAgendamentos(): Situacao {
  return useSyncExternalStore(assinarAgendamentos, situacaoAgendamentos);
}

// Busca a lista no backend toda vez que a tela ganha foco (ex.: ao voltar de outra tela
// ou trocar de aba), para mostrar mudanças feitas pela outra parte.
export function useRecarregarAoFocar() {
  useFocusEffect(
    useCallback(() => {
      carregarAgendamentos();
    }, [])
  );
}
