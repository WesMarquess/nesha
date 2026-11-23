// Tipos do contrato de agendamentos e do catálogo de prestadores. Ver docs/AGENDA.md e docs/API.md.
import type { UnidadePreco } from './auth';

export type StatusAgendamento = 'PENDENTE' | 'CONFIRMADO' | 'CONCLUIDO' | 'CANCELADO';

export type EnderecoApi = {
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string | null;
  bairro: string;
  cidade: string;
  uf: string;
};

// Formato devolvido pelo backend. As telas usam o modelo de src/data/agendamentos.ts.
export type AgendamentoApi = {
  id: string;
  status: StatusAgendamento;
  servico: string;
  valor: number | null; // null = a combinar
  inicio: string; // ISO 8601 com fuso, ex.: "2026-05-15T13:00:00-03:00"
  fim: string;
  prestador: {
    id: string;
    nome: string;
    telefone: string;
    fotoUrl: string | null;
    nota: number | null; // null enquanto não tiver avaliações
    avaliacoes: number;
  };
  cliente: { id: string; nome: string; telefone: string; fotoUrl: string | null; desde: number };
  endereco: EnderecoApi;
  observacoes: string | null;
  motivoCancelamento: string | null;
  avaliacao: { nota: number; destaques: string[]; comentario: string | null } | null;
  criadoEm: string;
};

export type CriarAgendamentoRequest = {
  prestadorId: string;
  inicio: string;
  fim: string;
  observacoes?: string;
};

export type AvaliarAgendamentoRequest = {
  nota: number;
  destaques: string[];
  comentario: string;
};

// GET /prestadores e /prestadores/{id}: perfil público, sem contato nem endereço.
export type PrestadorCatalogo = {
  id: string;
  nome: string;
  fotoUrl: string | null;
  servicoPrincipal: string;
  areaAtendimento: string;
  sobreMim: string | null;
  preco: number | null;
  unidadePreco: UnidadePreco;
  tempoResposta: string | null;
  especialidades: string[];
  diasAtendimento: number[]; // 0 = domingo ... 6 = sábado; vazio = todos os dias
  disponibilidade: string;
  nota: number | null;
  avaliacoes: number;
  avaliacoesPorNota: Record<string, number>; // chave "1" a "5"
  servicosRealizados: number;
  desde: number;
};

export type HorarioOcupado = { inicio: string; fim: string };

export type AvaliacaoPublica = {
  cliente: string; // primeiro nome
  servico: string;
  nota: number;
  destaques: string[];
  comentario: string | null;
  data: string;
};
