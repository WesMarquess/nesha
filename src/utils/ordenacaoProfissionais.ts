import type { Professional } from './mocks';

// Padrão Strategy (GoF): cada critério da lista de profissionais é uma
// estratégia intercambiável com a mesma assinatura. A tela só escolhe qual
// aplicar; novos critérios (ex.: "Mais próximos") entram aqui sem mudar a tela.
// Ver docs/DESIGN_PATTERNS.md.

export type CriterioProfissionais = 'recomendados' | 'disponiveisHoje' | 'menorPreco';

type EstrategiaProfissionais = {
  key: CriterioProfissionais;
  label: string;
  aplicar(lista: Professional[], hoje: Date): Professional[];
};

const maisRecomendados: EstrategiaProfissionais = {
  key: 'recomendados',
  label: 'Mais recomendados',
  aplicar: (lista) =>
    [...lista].sort((a, b) => b.rating - a.rating || b.reviewsCount - a.reviewsCount),
};

const disponiveisHoje: EstrategiaProfissionais = {
  key: 'disponiveisHoje',
  label: 'Disponíveis hoje',
  aplicar: (lista, hoje) => lista.filter((p) => p.workDays.includes(hoje.getDay())),
};

const menorPreco: EstrategiaProfissionais = {
  key: 'menorPreco',
  label: 'Menor preço',
  aplicar: (lista) => [...lista].sort((a, b) => a.price - b.price),
};

export const ESTRATEGIAS_PROFISSIONAIS = [maisRecomendados, disponiveisHoje, menorPreco] as const;

export function ordenarProfissionais(
  lista: Professional[],
  criterio: CriterioProfissionais,
  hoje = new Date()
): Professional[] {
  const estrategia = ESTRATEGIAS_PROFISSIONAIS.find((e) => e.key === criterio) ?? maisRecomendados;
  return estrategia.aplicar(lista, hoje);
}
