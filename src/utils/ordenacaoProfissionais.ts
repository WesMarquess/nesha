import type { PrestadorCatalogo } from '../types/agendamento';

// Padrão Strategy (GoF): cada critério da lista de profissionais é uma
// estratégia intercambiável com a mesma assinatura. A tela só escolhe qual
// aplicar; novos critérios (ex.: "Mais próximos") entram aqui sem mudar a tela.
// Ver docs/DESIGN_PATTERNS.md.

export type CriterioProfissionais = 'recomendados' | 'disponiveisHoje' | 'menorPreco';

type EstrategiaProfissionais = {
  key: CriterioProfissionais;
  label: string;
  aplicar(lista: PrestadorCatalogo[], hoje: Date): PrestadorCatalogo[];
};

const maisRecomendados: EstrategiaProfissionais = {
  key: 'recomendados',
  label: 'Mais recomendados',
  aplicar: (lista) =>
    [...lista].sort((a, b) => (b.nota ?? 0) - (a.nota ?? 0) || b.avaliacoes - a.avaliacoes),
};

// Sem dias cadastrados, o prestador atende todos os dias.
const disponiveisHoje: EstrategiaProfissionais = {
  key: 'disponiveisHoje',
  label: 'Disponíveis hoje',
  aplicar: (lista, hoje) =>
    lista.filter((p) => p.diasAtendimento.length === 0 || p.diasAtendimento.includes(hoje.getDay())),
};

// Quem ainda não definiu preço ("a combinar") vai para o fim.
const menorPreco: EstrategiaProfissionais = {
  key: 'menorPreco',
  label: 'Menor preço',
  aplicar: (lista) =>
    [...lista].sort((a, b) => (a.preco ?? Infinity) - (b.preco ?? Infinity)),
};

export const ESTRATEGIAS_PROFISSIONAIS = [maisRecomendados, disponiveisHoje, menorPreco] as const;

export function ordenarProfissionais(
  lista: PrestadorCatalogo[],
  criterio: CriterioProfissionais,
  hoje = new Date()
): PrestadorCatalogo[] {
  const estrategia = ESTRATEGIAS_PROFISSIONAIS.find((e) => e.key === criterio) ?? maisRecomendados;
  return estrategia.aplicar(lista, hoje);
}
