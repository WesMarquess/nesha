import type { PrestadorCatalogo } from '../types/agendamento';

// Filtros do botão "Filtros" da lista de profissionais. Somam-se à ordenação
// (ordenacaoProfissionais.ts): primeiro filtra, depois ordena.

export type NotaMinima = 'qualquer' | '4' | '4.5';
export type PrecoMaximo = 'qualquer' | '100' | '150' | '200';

export type FiltrosProfissionais = {
  notaMinima: NotaMinima;
  precoMaximo: PrecoMaximo;
  servico: string; // '' = todos os serviços selecionados
};

export const FILTROS_INICIAIS: FiltrosProfissionais = {
  notaMinima: 'qualquer',
  precoMaximo: 'qualquer',
  servico: '',
};

export const OPCOES_NOTA: readonly { key: NotaMinima; label: string }[] = [
  { key: 'qualquer', label: 'Qualquer' },
  { key: '4', label: '4,0 ou mais' },
  { key: '4.5', label: '4,5 ou mais' },
];

export const OPCOES_PRECO: readonly { key: PrecoMaximo; label: string }[] = [
  { key: 'qualquer', label: 'Qualquer' },
  { key: '100', label: 'Até R$ 100' },
  { key: '150', label: 'Até R$ 150' },
  { key: '200', label: 'Até R$ 200' },
];

export function contarFiltrosAtivos(filtros: FiltrosProfissionais) {
  return (
    Number(filtros.notaMinima !== 'qualquer') +
    Number(filtros.precoMaximo !== 'qualquer') +
    Number(filtros.servico !== '')
  );
}

// Profissional novo (sem nota) não passa por nota mínima; "a combinar" não passa por preço máximo.
export function filtrarProfissionais(lista: PrestadorCatalogo[], filtros: FiltrosProfissionais) {
  const nota = filtros.notaMinima === 'qualquer' ? null : Number(filtros.notaMinima);
  const preco = filtros.precoMaximo === 'qualquer' ? null : Number(filtros.precoMaximo);
  return lista.filter(
    (p) =>
      (nota === null || (p.nota !== null && p.nota >= nota)) &&
      (preco === null || (p.preco !== null && p.preco <= preco)) &&
      (filtros.servico === '' || p.servicoPrincipal === filtros.servico)
  );
}
