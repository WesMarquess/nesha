import { onlyDigits } from './masks';

// Cada validador retorna a mensagem de erro, ou '' quando o valor é válido.

export function validateNome(value: string): string {
  const nome = value.trim();

  if (!nome) {
    return 'Informe seu nome completo.';
  }
  if (nome.split(/\s+/).length < 2) {
    return 'Digite nome e sobrenome.';
  }
  return '';
}

// Projeto acadêmico: só confere o formato (11 dígitos), sem checar dígito
// verificador — não é necessário que o CPF digitado seja um documento real.
export function validateCPF(value: string): string {
  const digits = onlyDigits(value);

  if (!digits) {
    return 'Informe seu CPF.';
  }
  if (digits.length !== 11) {
    return 'CPF incompleto.';
  }
  return '';
}

export function validateTelefone(value: string): string {
  const digits = onlyDigits(value);

  if (!digits) {
    return 'Informe seu telefone.';
  }
  if (digits.length < 10 || digits.length > 11) {
    return 'Telefone incompleto. Use DDD + número.';
  }
  if (Number(digits.slice(0, 2)) < 11) {
    return 'DDD inválido.';
  }
  if (digits.length === 11 && digits[2] !== '9') {
    return 'Celular deve começar com 9 após o DDD.';
  }
  return '';
}

export function validateCEP(value: string): string {
  const digits = onlyDigits(value);

  if (!digits) {
    return 'Informe seu CEP.';
  }
  if (digits.length !== 8) {
    return 'CEP incompleto.';
  }
  return '';
}

export function validateLogradouro(value: string): string {
  return value.trim() ? '' : 'Informe a rua.';
}

export function validateNumero(value: string): string {
  const numero = value.trim();

  if (!numero) {
    return 'Informe o número.';
  }
  if (numero.length > 10) {
    return 'Número muito longo.';
  }
  return '';
}

export function validateBairro(value: string): string {
  return value.trim() ? '' : 'Informe o bairro.';
}

export function validateCidade(value: string): string {
  return value.trim() ? '' : 'Informe a cidade.';
}

const UFS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS',
  'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC',
  'SP', 'SE', 'TO',
];

export function validateUF(value: string): string {
  const uf = value.trim().toUpperCase();

  if (!uf) {
    return 'Informe o estado.';
  }
  if (!UFS.includes(uf)) {
    return 'UF inválida.';
  }
  return '';
}

export function validateEmail(value: string): string {
  const email = value.trim();

  if (!email) {
    return 'Informe seu e-mail.';
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return 'E-mail inválido.';
  }
  return '';
}

export function validateSenha(value: string): string {
  if (!value) {
    return 'Crie uma senha.';
  }
  if (value.length < 8) {
    return 'A senha precisa ter pelo menos 8 caracteres.';
  }
  if (!/[a-z]/.test(value) || !/[A-Z]/.test(value)) {
    return 'Use letras maiúsculas e minúsculas.';
  }
  if (!/\d/.test(value)) {
    return 'Inclua pelo menos um número.';
  }
  if (!/[^A-Za-z0-9]/.test(value)) {
    return 'Inclua pelo menos um caractere especial (!@#$...).';
  }
  return '';
}

export function validateRepetirSenha(senha: string, repetir: string): string {
  if (!repetir) {
    return 'Repita sua senha.';
  }
  if (senha !== repetir) {
    return 'As senhas não coincidem.';
  }
  return '';
}

// No login não se exige força de senha: quem valida a senha é o backend.
export function validateSenhaLogin(value: string): string {
  return value ? '' : 'Informe sua senha.';
}
