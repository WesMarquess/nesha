import { USE_MOCK } from '../config/env';
import type {
  AgendamentoApi,
  AvaliacaoPublica,
  AvaliarAgendamentoRequest,
  CriarAgendamentoRequest,
  HorarioOcupado,
  PrestadorCatalogo,
  StatusAgendamento,
} from '../types/agendamento';
import { isoComFuso, somarDias } from '../utils/datas';
import { ApiError, request } from './api';

// ---------------------------------------------------------------------------
// Endpoints reais (contrato em docs/AGENDA.md, seção 11, e docs/API.md)
// ---------------------------------------------------------------------------

export function listarAgendamentosApi(): Promise<AgendamentoApi[]> {
  if (USE_MOCK) return mock.listar();
  return request<AgendamentoApi[]>('/agendamentos');
}

export function buscarAgendamentoApi(id: string): Promise<AgendamentoApi> {
  if (USE_MOCK) return mock.buscar(id);
  return request<AgendamentoApi>(`/agendamentos/${encodeURIComponent(id)}`);
}

export function criarAgendamentoApi(dados: CriarAgendamentoRequest): Promise<AgendamentoApi> {
  if (USE_MOCK) return mock.criar(dados);
  return request<AgendamentoApi>('/agendamentos', { method: 'POST', body: dados });
}

type Acao = 'cancelar' | 'aceitar' | 'recusar' | 'concluir' | 'avaliacao';

function acao(id: string, nome: Acao, body?: unknown): Promise<AgendamentoApi> {
  if (USE_MOCK) return mock.acao(id, nome, body);
  return request<AgendamentoApi>(`/agendamentos/${encodeURIComponent(id)}/${nome}`, {
    method: 'POST',
    body,
  });
}

export const cancelarApi = (id: string, motivo: string) => acao(id, 'cancelar', { motivo });
export const aceitarApi = (id: string) => acao(id, 'aceitar');
export const recusarApi = (id: string) => acao(id, 'recusar', {});
export const concluirApi = (id: string) => acao(id, 'concluir');
export const avaliarApi = (id: string, dados: AvaliarAgendamentoRequest) =>
  acao(id, 'avaliacao', dados);

export function listarPrestadores(servicos: string[]): Promise<PrestadorCatalogo[]> {
  if (USE_MOCK) return mock.prestadores(servicos);
  const query = servicos.map((s) => `servico=${encodeURIComponent(s)}`).join('&');
  return request<PrestadorCatalogo[]>(`/prestadores${query ? `?${query}` : ''}`);
}

export function buscarPrestador(id: string): Promise<PrestadorCatalogo> {
  if (USE_MOCK) return mock.prestador(id);
  return request<PrestadorCatalogo>(`/prestadores/${encodeURIComponent(id)}`);
}

// de/ate no formato "YYYY-MM-DD".
export function horariosOcupados(id: string, de: string, ate: string): Promise<HorarioOcupado[]> {
  if (USE_MOCK) return mock.ocupados(id);
  return request<HorarioOcupado[]>(
    `/prestadores/${encodeURIComponent(id)}/horarios-ocupados?de=${de}&ate=${ate}`
  );
}

export function avaliacoesDoPrestador(id: string): Promise<AvaliacaoPublica[]> {
  if (USE_MOCK) return mock.avaliacoes(id);
  return request<AvaliacaoPublica[]>(`/prestadores/${encodeURIComponent(id)}/avaliacoes`);
}

// ---------------------------------------------------------------------------
// Modo simulado (EXPO_PUBLIC_USE_MOCK=true): mesmos usuários de src/services/auth.ts
// (cliente mock-1 e prestador mock-3), com datas relativas a hoje.
// ---------------------------------------------------------------------------

const mock = (() => {
  const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

  const prestador: PrestadorCatalogo = {
    id: 'mock-3',
    nome: 'Francisco Oliveira',
    fotoUrl: null,
    servicoPrincipal: 'Jardineiro',
    areaAtendimento: 'São Paulo • Zona Sul e Oeste',
    sobreMim:
      'Trabalho com manutenção de jardins, poda e plantio há mais de 8 anos. Foco em pontualidade e organização.',
    preco: 130,
    unidadePreco: 'DIA',
    tempoResposta: 'Menos de 1 hora',
    especialidades: ['Poda de árvores', 'Manutenção de gramado'],
    diasAtendimento: [1, 2, 3, 4, 5, 6],
    disponibilidade: 'Seg a Sáb',
    nota: 5,
    avaliacoes: 1,
    avaliacoesPorNota: { '5': 1, '4': 0, '3': 0, '2': 0, '1': 0 },
    servicosRealizados: 1,
    desde: 2021,
  };

  const hoje = new Date();
  const em = (dias: number, horaInicio: number, horas: number) => {
    const inicio = somarDias(hoje, dias);
    inicio.setHours(horaInicio, 0, 0, 0);
    const fim = new Date(inicio);
    fim.setHours(horaInicio + horas);
    return { inicio: isoComFuso(inicio), fim: isoComFuso(fim) };
  };

  const base = {
    servico: 'Jardineiro',
    valor: 130,
    prestador: {
      id: 'mock-3',
      nome: 'Francisco Oliveira',
      telefone: '11987654321',
      fotoUrl: null,
      nota: 5,
      avaliacoes: 1,
    },
    cliente: { id: 'mock-1', nome: 'Usuário de Teste', telefone: '11976543210', fotoUrl: null, desde: 2023 },
    endereco: {
      cep: '01310100',
      logradouro: 'Avenida Paulista',
      numero: '1000',
      complemento: 'Apto 12',
      bairro: 'Bela Vista',
      cidade: 'São Paulo',
      uf: 'SP',
    },
    observacoes: null,
    motivoCancelamento: null,
    avaliacao: null,
    criadoEm: isoComFuso(hoje),
  };

  let lista: AgendamentoApi[] = [
    { ...base, id: 'ag-1', status: 'CONFIRMADO', ...em(1, 13, 4), observacoes: 'Portão azul.' },
    { ...base, id: 'ag-2', status: 'PENDENTE', ...em(2, 8, 4) },
    {
      ...base,
      id: 'ag-3',
      status: 'CONCLUIDO',
      ...em(-10, 8, 4),
      avaliacao: { nota: 5, destaques: ['Pontualidade'], comentario: 'Ótimo trabalho!' },
    },
  ];

  const encontrar = (id: string) => {
    const item = lista.find((a) => a.id === id);
    if (!item) {
      throw new ApiError(404, 'AGENDAMENTO_NAO_ENCONTRADO', 'Agendamento não encontrado.');
    }
    return item;
  };

  const proximoStatus: Partial<Record<Acao, StatusAgendamento>> = {
    cancelar: 'CANCELADO',
    aceitar: 'CONFIRMADO',
    recusar: 'CANCELADO',
    concluir: 'CONCLUIDO',
  };

  return {
    async listar() {
      await delay();
      return lista;
    },
    async buscar(id: string) {
      await delay();
      return encontrar(id);
    },
    async criar(dados: CriarAgendamentoRequest) {
      await delay();
      const novo: AgendamentoApi = {
        ...base,
        id: `ag-${Date.now()}`,
        status: 'PENDENTE',
        inicio: dados.inicio,
        fim: dados.fim,
        observacoes: dados.observacoes ?? null,
      };
      lista = [...lista, novo];
      return novo;
    },
    async acao(id: string, nome: Acao, body?: unknown) {
      await delay();
      const atual = encontrar(id);
      const dados = (body ?? {}) as { motivo?: string } & Partial<AvaliarAgendamentoRequest>;
      const atualizado: AgendamentoApi =
        nome === 'avaliacao'
          ? {
              ...atual,
              avaliacao: {
                nota: dados.nota ?? 5,
                destaques: dados.destaques ?? [],
                comentario: dados.comentario || null,
              },
            }
          : {
              ...atual,
              status: proximoStatus[nome]!,
              motivoCancelamento: dados.motivo ?? atual.motivoCancelamento,
            };
      lista = lista.map((a) => (a.id === id ? atualizado : a));
      return atualizado;
    },
    async prestadores(servicos: string[]) {
      await delay();
      return servicos.length === 0 || servicos.includes(prestador.servicoPrincipal) ? [prestador] : [];
    },
    async prestador(id: string) {
      await delay();
      if (id !== prestador.id) {
        throw new ApiError(404, 'PRESTADOR_NAO_ENCONTRADO', 'Prestador não encontrado.');
      }
      return prestador;
    },
    async ocupados(id: string) {
      await delay();
      return lista
        .filter((a) => a.prestador.id === id && (a.status === 'PENDENTE' || a.status === 'CONFIRMADO'))
        .map(({ inicio, fim }) => ({ inicio, fim }));
    },
    async avaliacoes(id: string) {
      await delay();
      return lista
        .filter((a) => a.prestador.id === id && a.avaliacao)
        .map((a) => ({
          cliente: a.cliente.nome.split(' ')[0],
          servico: a.servico,
          nota: a.avaliacao!.nota,
          destaques: a.avaliacao!.destaques,
          comentario: a.avaliacao!.comentario,
          data: a.fim,
        }));
    },
  };
})();
