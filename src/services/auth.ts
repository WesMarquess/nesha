import { API_URL, USE_MOCK } from '../config/env';
import type {
  AlterarSenhaRequest,
  AtualizarClienteRequest,
  AtualizarPrestadorRequest,
  ClientePerfil,
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

// Serve para os dois perfis: a foto é do usuário logado.
export async function enviarFoto(foto: FotoEscolhida): Promise<{ fotoUrl: string }> {
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

  return request<{ fotoUrl: string }>('/usuarios/me/foto', { method: 'PUT', body: form });
}

export async function getClienteMe(): Promise<ClientePerfil> {
  if (USE_MOCK) {
    return mockGetClienteMe();
  }
  return request<ClientePerfil>('/clientes/me');
}

export async function atualizarCliente(data: AtualizarClienteRequest): Promise<ClientePerfil> {
  if (USE_MOCK) {
    return mockAtualizarCliente(data);
  }
  return request<ClientePerfil>('/clientes/me', { method: 'PUT', body: data });
}

export async function alterarSenha(data: AlterarSenhaRequest): Promise<void> {
  if (USE_MOCK) {
    return mockAlterarSenha(data);
  }
  return request<void>('/usuarios/me/senha', { method: 'PUT', body: data });
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

let MOCK_SENHA = 'Senha@123';

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

let MOCK_CLIENTE: ClientePerfil = {
  usuario: MOCK_USER,
  telefone: '11987654321',
  endereco: {
    cep: '01310100',
    logradouro: 'Avenida Paulista',
    numero: '1000',
    complemento: null,
    bairro: 'Bela Vista',
    cidade: 'São Paulo',
    uf: 'SP',
  },
  fotoUrl: null,
  desde: 2023,
};

async function mockEnviarFoto(foto: FotoEscolhida): Promise<{ fotoUrl: string }> {
  await delay(500);
  if (mockLogado.perfil === 'PRESTADOR') {
    MOCK_PRESTADOR = { ...MOCK_PRESTADOR, fotoUrl: foto.uri };
  } else {
    MOCK_CLIENTE = { ...MOCK_CLIENTE, fotoUrl: foto.uri };
  }
  return { fotoUrl: foto.uri };
}

async function mockGetClienteMe(): Promise<ClientePerfil> {
  await delay(300);
  return MOCK_CLIENTE;
}

async function mockAtualizarCliente(data: AtualizarClienteRequest): Promise<ClientePerfil> {
  await delay(500);
  MOCK_CLIENTE = {
    ...MOCK_CLIENTE,
    usuario: { ...MOCK_CLIENTE.usuario, nome: data.nome },
    telefone: data.telefone,
    endereco: { ...data.endereco, complemento: data.endereco.complemento ?? null },
  };
  return MOCK_CLIENTE;
}

async function mockAlterarSenha({ senhaAtual, novaSenha }: AlterarSenhaRequest): Promise<void> {
  await delay(500);
  if (senhaAtual !== MOCK_SENHA) {
    throw new ApiError(400, 'SENHA_ATUAL_INCORRETA', 'A senha atual está incorreta.', {
      senhaAtual: 'A senha atual está incorreta.',
    });
  }
  MOCK_SENHA = novaSenha;
}
