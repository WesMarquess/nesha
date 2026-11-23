// Agendamentos do usuário logado (cliente ou prestador), vindos de src/services/agendamentos.ts.
// As telas leem pelos hooks de useAgendamentos.ts e mudam o status pelas funções abaixo.
import { ApiError } from '../services/api';
import {
  aceitarApi,
  avaliarApi,
  cancelarApi,
  concluirApi,
  criarAgendamentoApi,
  iniciarPagamentoApi,
  listarAgendamentosApi,
  recusarApi,
  verificarPagamentoApi,
} from '../services/agendamentos';
import { urlFoto } from '../services/auth';
import type {
  AgendamentoApi,
  CriarAgendamentoRequest,
  StatusAgendamento,
  StatusPagamento,
} from '../types/agendamento';
import { chaveDoDia, dataCurta, dataLonga, hora } from '../utils/datas';
import { maskPhone } from '../utils/masks';
import { EstadoAgendamento, estadoDe, TransicaoInvalidaError } from './estadosAgendamento';

export type { StatusAgendamento };

export type Avaliacao = {
  nota: number;
  destaques: string[];
  comentario: string;
};

export type Periodo = 'Manhã' | 'Tarde' | 'Fim de tarde';

export type Agendamento = {
  id: string;
  status: StatusAgendamento;
  servico: string;
  valor: number | null; // null = a combinar
  prestador: {
    id: string;
    nome: string;
    nota: number | null; // null enquanto não tiver avaliações
    avaliacoes: number;
    telefone: string;
    fotoUrl?: string;
  };
  cliente: {
    id: string;
    nome: string;
    desde: string;
    telefone: string;
    fotoUrl?: string;
  };
  inicio: Date;
  fim: Date;
  data: string; // "2026-05-15", usado no calendário do prestador
  dataCurta: string; // "15 Mai"
  dataLonga: string; // "15 de Maio, Quarta-feira"
  periodo: Periodo;
  horarioInicio: string; // "13:00"
  horario: string; // "13:00 às 17:00"
  cidade: string;
  regiao: string; // bairro, ex.: "Bela Vista"
  endereco: string; // "Rua das Flores, 123 - Apt 42"
  observacoes?: string;
  motivoCancelamento?: string;
  avaliacao?: Avaliacao;
  pagamentoStatus: StatusPagamento | null; // null = sem cobrança ("a combinar")
};

export const MOTIVOS_CANCELAMENTO = [
  'Mudança de planos',
  'Encontrei outro profissional',
  'Problema de agenda',
  'Valor acima do esperado',
  'Outro motivo',
];

export const DESTAQUES_AVALIACAO = [
  'Pontualidade',
  'Qualidade do Trabalho',
  'Gentileza',
  'Organização',
];

function periodoDe(inicio: Date): Periodo {
  const h = inicio.getHours();
  return h < 12 ? 'Manhã' : h < 17 ? 'Tarde' : 'Fim de tarde';
}

// "Período da Tarde" ou "Fim de tarde".
export function textoPeriodo(periodo: Periodo): string {
  return periodo === 'Fim de tarde' ? periodo : `Período da ${periodo}`;
}

// Padrão Adapter (GoF): converte o formato da API (datas ISO, endereço em partes) no
// modelo que as telas exibem, para uma mudança no backend não se espalhar pelas telas.
// Ver docs/DESIGN_PATTERNS.md.
export function deApi(a: AgendamentoApi): Agendamento {
  const inicio = new Date(a.inicio);
  const fim = new Date(a.fim);
  const e = a.endereco;

  return {
    id: a.id,
    status: a.status,
    servico: a.servico,
    valor: a.valor,
    prestador: {
      id: a.prestador.id,
      nome: a.prestador.nome,
      nota: a.prestador.nota,
      avaliacoes: a.prestador.avaliacoes,
      telefone: maskPhone(a.prestador.telefone),
      fotoUrl: urlFoto(a.prestador.fotoUrl),
    },
    cliente: {
      id: a.cliente.id,
      nome: a.cliente.nome,
      desde: String(a.cliente.desde),
      telefone: maskPhone(a.cliente.telefone),
      fotoUrl: urlFoto(a.cliente.fotoUrl),
    },
    inicio,
    fim,
    data: chaveDoDia(inicio),
    dataCurta: dataCurta(inicio),
    dataLonga: dataLonga(inicio),
    periodo: periodoDe(inicio),
    horarioInicio: hora(inicio),
    horario: `${hora(inicio)} às ${hora(fim)}`,
    cidade: e.cidade,
    regiao: e.bairro,
    endereco: `${e.logradouro}, ${e.numero}${e.complemento ? ` - ${e.complemento}` : ''}`,
    observacoes: a.observacoes ?? undefined,
    motivoCancelamento: a.motivoCancelamento ?? undefined,
    avaliacao: a.avaliacao
      ? { ...a.avaliacao, comentario: a.avaliacao.comentario ?? '' }
      : undefined,
    pagamentoStatus: a.pagamentoStatus,
  };
}

// Padrão Observer (GoF): as telas assinam a lista e são avisadas a cada mudança
// (ex.: o prestador aceita uma solicitação e a lista se atualiza). Ver docs/DESIGN_PATTERNS.md.
type Observador = () => void;
const observadores = new Set<Observador>();

export type Situacao = { carregando: boolean; carregado: boolean; erro: string };

let agendamentos: Agendamento[] = [];
let situacao: Situacao = { carregando: false, carregado: false, erro: '' };
let carregamento: Promise<void> | null = null;

export function assinarAgendamentos(observador: Observador): () => void {
  observadores.add(observador);
  return () => {
    observadores.delete(observador);
  };
}

function notificar() {
  observadores.forEach((observador) => observador());
}

// Retornam sempre a mesma referência até a próxima mudança (exigido pelo
// useSyncExternalStore em useAgendamentos.ts).
export function listarAgendamentos(): Agendamento[] {
  return agendamentos;
}

export function situacaoAgendamentos(): Situacao {
  return situacao;
}

export function buscarAgendamento(id?: string): Agendamento | undefined {
  return agendamentos.find((a) => a.id === id);
}

export function mensagemDeErro(error: unknown, padrao = 'Ocorreu um erro inesperado. Tente novamente.') {
  if (error instanceof ApiError || error instanceof TransicaoInvalidaError) {
    return error.message;
  }
  return padrao;
}

// Busca a lista no backend. Chamadas simultâneas compartilham a mesma requisição.
export function carregarAgendamentos(): Promise<void> {
  if (carregamento) return carregamento;

  situacao = { ...situacao, carregando: true, erro: '' };
  notificar();

  carregamento = listarAgendamentosApi()
    .then((lista) => {
      agendamentos = lista.map(deApi).sort((a, b) => a.inicio.getTime() - b.inicio.getTime());
      situacao = { carregando: false, carregado: true, erro: '' };
    })
    .catch((error: unknown) => {
      situacao = {
        ...situacao,
        carregando: false,
        erro: mensagemDeErro(error, 'Não foi possível carregar seus agendamentos.'),
      };
    })
    .finally(() => {
      carregamento = null;
      notificar();
    });

  return carregamento;
}

// Ao sair da conta: a próxima pessoa não pode ver os agendamentos da anterior.
export function limparAgendamentos() {
  agendamentos = [];
  situacao = { carregando: false, carregado: false, erro: '' };
  notificar();
}

function substituir(atualizado: Agendamento) {
  const existe = agendamentos.some((a) => a.id === atualizado.id);
  agendamentos = existe
    ? agendamentos.map((a) => (a.id === atualizado.id ? atualizado : a))
    : [...agendamentos, atualizado].sort((a, b) => a.inicio.getTime() - b.inicio.getTime());
  notificar();
}

// Toda mudança de status passa primeiro pelo estado atual (padrão State), que lança
// TransicaoInvalidaError se a ação não for permitida; o backend confirma e devolve o novo status.
async function transicionar(
  id: string,
  validar: (estado: EstadoAgendamento, ag: Agendamento) => void,
  chamar: () => Promise<AgendamentoApi>
): Promise<Agendamento> {
  const atual = buscarAgendamento(id);
  if (!atual) {
    throw new ApiError(404, 'AGENDAMENTO_NAO_ENCONTRADO', 'Agendamento não encontrado.');
  }
  validar(estadoDe(atual), atual);
  const atualizado = deApi(await chamar());
  substituir(atualizado);
  return atualizado;
}

export function aceitarSolicitacao(id: string) {
  return transicionar(id, (estado, ag) => estado.aceitar(ag), () => aceitarApi(id));
}

export function recusarSolicitacao(id: string) {
  return transicionar(id, (estado, ag) => estado.recusar(ag), () => recusarApi(id));
}

export function cancelarAgendamento(id: string, motivo: string) {
  return transicionar(id, (estado, ag) => estado.cancelar(ag, motivo), () => cancelarApi(id, motivo));
}

export function concluirAgendamento(id: string) {
  return transicionar(id, (estado, ag) => estado.concluir(ag), () => concluirApi(id));
}

export function avaliarAgendamento(id: string, avaliacao: Avaliacao) {
  return transicionar(
    id,
    (estado, ag) => estado.avaliar(ag, avaliacao),
    () => avaliarApi(id, avaliacao)
  );
}

// Cria o checkout do Mercado Pago. Só para quem ainda precisa pagar (padrão State).
export async function iniciarPagamento(id: string, retornoUrl?: string) {
  const atual = buscarAgendamento(id);
  if (atual && !estadoDe(atual).podePagar) {
    throw new TransicaoInvalidaError('pagar', atual.status);
  }
  return iniciarPagamentoApi(id, retornoUrl);
}

// Pergunta ao backend se o pagamento foi aprovado; aprovado, o agendamento vira PENDENTE.
export async function verificarPagamento(id: string): Promise<Agendamento> {
  const atualizado = deApi(await verificarPagamentoApi(id));
  substituir(atualizado);
  return atualizado;
}

export async function criarAgendamento(dados: CriarAgendamentoRequest): Promise<Agendamento> {
  const novo = deApi(await criarAgendamentoApi(dados));
  substituir(novo);
  return novo;
}

export function formatarValor(valor: number | null): string {
  return valor == null ? 'A combinar' : `R$ ${valor.toFixed(2).replace('.', ',')}`;
}

export function primeiroNome(nome: string): string {
  return nome.split(' ')[0];
}

export const STATUS_LABEL: Record<StatusAgendamento, string> = {
  AGUARDANDO_PAGAMENTO: 'Aguardando pagamento',
  PENDENTE: 'Pendente',
  CONFIRMADO: 'Confirmado',
  CONCLUIDO: 'Concluído',
  CANCELADO: 'Cancelado',
};
