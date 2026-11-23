import { API_URL, USE_MOCK } from '../config/env';
import type {
  AtualizarPrestadorRequest,
  CadastroPrestadorRequest,
  LoginRequest,
  LoginResponse,
  PrestadorPerfil,
  RegisterRequest,
  RegisterResponse,
  Usuario,
} from '../types/auth';
import { ApiError, request } from './api';

// ---------------------------------------------------------------------------
// Endpoints reais (contrato em docs/API.md)
// ---------------------------------------------------------------------------

export async function login(data: LoginRequest): Promise<LoginResponse> {
  if (USE_MOCK) {
    return mockLogin(data);
  }
  return request<LoginResponse>('/auth/login', {
    method: 'POST',
    body: data,
    auth: false,
  });
}

export async function register(data: RegisterRequest): Promise<RegisterResponse> {
  if (USE_MOCK) {
    return mockRegister(data);
  }
  return request<RegisterResponse>('/clientes', {
    method: 'POST',
    body: data,
    auth: false,
  });
}

export async function registerPrestador(
  data: CadastroPrestadorRequest
): Promise<RegisterResponse> {
  if (USE_MOCK) {
    return mockRegisterPrestador(data);
  }
  return request<RegisterResponse>('/prestadores', {
    method: 'POST',
    body: data,
    auth: false,
  });
}

export async function getMe(): Promise<Usuario> {
  if (USE_MOCK) {
    return mockGetMe();
  }
  return request<Usuario>('/usuarios/me');
}

export async function getPrestadorMe(): Promise<PrestadorPerfil> {
  if (USE_MOCK) {
    return mockGetPrestadorMe();
  }
  return request<PrestadorPerfil>('/prestadores/me');
}

// Dados editáveis atuais do perfil, no formato do PUT /prestadores/me.
export function dadosEditaveis(perfil: PrestadorPerfil): AtualizarPrestadorRequest {
  return {
    nome: perfil.usuario.nome,
    telefone: perfil.telefone,
    servicoPrincipal: perfil.servicoPrincipal,
    areaAtendimento: perfil.areaAtendimento,
    sobreMim: perfil.sobreMim ?? '',
    preco: perfil.preco,
    unidadePreco: perfil.unidadePreco,
    online: perfil.online,
  };
}

export async function atualizarPrestador(
  data: AtualizarPrestadorRequest
): Promise<PrestadorPerfil> {
  if (USE_MOCK) {
    return mockAtualizarPrestador(data);
  }
  return request<PrestadorPerfil>('/prestadores/me', { method: 'PUT', body: data });
}

// Foto escolhida no aparelho. Na web vem o File do navegador; no celular, o arquivo local.
export type FotoEscolhida = {
  uri: string;
  nome: string;
  tipo: string;
  file?: Blob;
};

export async function enviarFotoPrestador(foto: FotoEscolhida): Promise<PrestadorPerfil> {
  if (USE_MOCK) {
    return mockEnviarFoto(foto);
  }

  const form = new FormData();
  if (foto.file) {
    form.append('foto', foto.file, foto.nome);
  } else {
    // Formato que o fetch do React Native entende para enviar um arquivo local.
    form.append('foto', { uri: foto.uri, name: foto.nome, type: foto.tipo } as unknown as Blob);
  }

  return request<PrestadorPerfil>('/prestadores/me/foto', { method: 'PUT', body: form });
}

// O backend devolve o caminho relativo à base da API; o modo simulado guarda o arquivo local.
export function urlFoto(fotoUrl: string | null): string | undefined {
  if (!fotoUrl) {
    return undefined;
  }
  return fotoUrl.startsWith('/') ? `${API_URL}${fotoUrl}` : fotoUrl;
}

// ---------------------------------------------------------------------------
// Modo simulado (EXPO_PUBLIC_USE_MOCK=true): permite desenvolver sem o backend.
// Login válido: teste@nesha.com / Senha@123
// Prestador (mesma senha): ver MOCK_PRESTADOR abaixo.
// ---------------------------------------------------------------------------

const MOCK_SENHA = 'Senha@123';

const MOCK_USER: Usuario = {
  id: 'mock-1',
  nome: 'Usuário de Teste',
  email: 'teste@nesha.com',
  perfil: 'CLIENTE',
};

let MOCK_PRESTADOR: PrestadorPerfil = {
  usuario: {
    id: 'mock-3',
    nome: 'Francisco Oliveira',
    email: 'prestador@example.com',
    perfil: 'PRESTADOR',
  },
  telefone: '11987654321',
  servicoPrincipal: 'Jardineiro',
  areaAtendimento: 'São Paulo • Zona Sul e Oeste',
  sobreMim:
    'Trabalho com manutenção de jardins, poda e plantio há mais de 8 anos. Foco em pontualidade e organização.',
  preco: 130,
  unidadePreco: 'DIA',
  tempoResposta: 'Menos de 1 hora',
  online: true,
  fotoUrl: null,
  especialidades: ['Poda de árvores', 'Manutenção de gramado'],
  diasAtendimento: [1, 2, 3, 4, 5, 6],
  disponibilidade: 'Seg a Sáb',
};

const MOCK_TOKEN = 'mock-token';

// Usuário "logado" no modo simulado, para o getMe devolver o perfil certo.
let mockLogado: Usuario = MOCK_USER;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function mockLogin({ email, senha }: LoginRequest): Promise<LoginResponse> {
  await delay(800);

  const usuario = [MOCK_USER, MOCK_PRESTADOR.usuario].find(
    (u) => u.email === email.toLowerCase()
  );

  if (!usuario || senha !== MOCK_SENHA) {
    throw new ApiError(401, 'CREDENCIAIS_INVALIDAS', 'E-mail ou senha incorretos.');
  }

  mockLogado = usuario;

  return {
    accessToken: MOCK_TOKEN,
    tokenType: 'Bearer',
    expiresIn: 3600,
    usuario,
  };
}

function mockEmailJaCadastrado(email: string) {
  const usado = [MOCK_USER.email, MOCK_PRESTADOR.usuario.email];
  if (usado.includes(email.toLowerCase())) {
    throw new ApiError(
      409,
      'EMAIL_JA_CADASTRADO',
      'Este e-mail já está cadastrado.',
      { email: 'Este e-mail já está cadastrado.' }
    );
  }
}

async function mockRegister(data: RegisterRequest): Promise<RegisterResponse> {
  await delay(800);
  mockEmailJaCadastrado(data.email);

  return {
    usuario: {
      id: 'mock-2',
      nome: data.nome,
      email: data.email,
      perfil: 'CLIENTE',
    },
  };
}

async function mockRegisterPrestador(
  data: CadastroPrestadorRequest
): Promise<RegisterResponse> {
  await delay(800);
  mockEmailJaCadastrado(data.email);

  return {
    usuario: {
      id: 'mock-4',
      nome: data.nome,
      email: data.email,
      perfil: 'PRESTADOR',
    },
  };
}

async function mockGetMe(): Promise<Usuario> {
  await delay(300);
  return mockLogado;
}

async function mockGetPrestadorMe(): Promise<PrestadorPerfil> {
  await delay(300);
  return MOCK_PRESTADOR;
}

async function mockAtualizarPrestador(
  data: AtualizarPrestadorRequest
): Promise<PrestadorPerfil> {
  await delay(500);
  const { nome, ...resto } = data;
  MOCK_PRESTADOR = {
    ...MOCK_PRESTADOR,
    ...resto,
    sobreMim: data.sobreMim.trim() || null,
    usuario: { ...MOCK_PRESTADOR.usuario, nome },
  };
  return MOCK_PRESTADOR;
}

async function mockEnviarFoto(foto: FotoEscolhida): Promise<PrestadorPerfil> {
  await delay(500);
  MOCK_PRESTADOR = { ...MOCK_PRESTADOR, fotoUrl: foto.uri };
  return MOCK_PRESTADOR;
}
