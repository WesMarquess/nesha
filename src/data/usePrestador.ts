import { useEffect, useState } from 'react';
import { buscarPrestador } from '../services/agendamentos';
import type { PrestadorCatalogo } from '../types/agendamento';
import { mensagemDeErro } from './agendamentos';

// Perfil público de um prestador do catálogo (telas profissional, avaliações e agendar).
export function usePrestador(id?: string) {
  const [prestador, setPrestador] = useState<PrestadorCatalogo | null>(null);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (!id) return;
    let ativo = true;

    buscarPrestador(id)
      .then((dados) => {
        if (ativo) setPrestador(dados);
      })
      .catch((error: unknown) => {
        if (ativo) setErro(mensagemDeErro(error, 'Não foi possível carregar o profissional.'));
      });

    return () => {
      ativo = false;
    };
  }, [id]);

  return { prestador, erro, carregando: !prestador && !erro };
}

// "R$ 130,00 / dia", ou "A combinar" sem preço definido.
export function precoDoPrestador(p: Pick<PrestadorCatalogo, 'preco' | 'unidadePreco'>): string {
  if (p.preco == null) return 'A combinar';
  const unidade = { DIA: 'dia', HORA: 'hora', SERVICO: 'serviço' }[p.unidadePreco];
  return `R$ ${p.preco.toFixed(2).replace('.', ',')} / ${unidade}`;
}

// "1 avaliação", "82 avaliações".
export function textoAvaliacoes(n: number): string {
  return `${n} ${n === 1 ? 'avaliação' : 'avaliações'}`;
}
