// Tipos do contrato com o backend. Mantenha em sincronia com docs/API.md.

export type Perfil = 'CLIENTE' | 'PRESTADOR';

export type Usuario = {
  id: string;
  nome: string;
  email: string;
  perfil: Perfil;
};

// POST /auth/login
export type LoginRequest = {
  email: string;
  senha: string;
};

export type LoginResponse = {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number; // segundos
  usuario: Usuario;
};

// POST /clientes
export type EnderecoRequest = {
  cep: string; // só dígitos
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  uf: string;
};

export type RegisterRequest = {
  nome: string;
  cpf: string; // só dígitos
  telefone: string; // só dígitos
  email: string;
  senha: string;
  endereco: EnderecoRequest;
};

export type RegisterResponse = {
  usuario: Usuario;
};

// POST /prestadores — mesmos dados do cliente, mais os do perfil profissional.
// Preço, especialidades e dias são definidos depois, nas configurações de serviço.
export type CadastroPrestadorRequest = RegisterRequest & {
  servicoPrincipal: string;
  areaAtendimento: string;
  sobreMim?: string;
};

export type UnidadePreco = 'DIA' | 'HORA' | 'SERVICO';

// GET /prestadores/me
export type PrestadorPerfil = {
  usuario: Usuario;
  telefone: string; // só dígitos
  servicoPrincipal: string;
  areaAtendimento: string;
  sobreMim: string | null;
  preco: number | null;
  unidadePreco: UnidadePreco;
  tempoResposta: string | null;
  online: boolean;
  fotoUrl: string | null; // relativo à base da API, ex.: "/usuarios/{id}/foto?v=..."
  especialidades: string[];
  diasAtendimento: number[]; // 0 = domingo ... 6 = sábado
  disponibilidade: string; // ex.: "Seg a Sáb"; vazio se não houver dias
};

// GET /clientes/me
export type ClientePerfil = {
  usuario: Usuario;
  telefone: string; // só dígitos
  endereco: Omit<EnderecoRequest, 'complemento'> & { complemento: string | null };
  fotoUrl: string | null; // relativo à base da API, ex.: "/usuarios/{id}/foto?v=..."
};

// PUT /clientes/me — e-mail e CPF não são editáveis.
export type AtualizarClienteRequest = {
  nome: string;
  telefone: string; // só dígitos
  endereco: EnderecoRequest;
};

// PUT /usuarios/me/senha
export type AlterarSenhaRequest = {
  senhaAtual: string;
  novaSenha: string;
};

// PUT /prestadores/me — o app envia todos os campos editáveis.
export type AtualizarPrestadorRequest = {
  nome: string;
  telefone: string; // só dígitos
  servicoPrincipal: string;
  areaAtendimento: string;
  sobreMim: string;
  preco: number | null;
  unidadePreco: UnidadePreco;
  online: boolean;
};

// Corpo padrão de erro devolvido pelo backend.
export type ApiErrorBody = {
  codigo: string;
  mensagem: string;
  campos?: Record<string, string>; // chave = caminho do campo, ex.: "endereco.cep"
};
