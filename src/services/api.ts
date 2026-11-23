import { API_TIMEOUT_MS, API_URL } from '../config/env';
import type { ApiErrorBody } from '../types/auth';

export class ApiError extends Error {
  status: number; // 0 = erro de rede/timeout/configuração
  codigo: string;
  campos?: Record<string, string>;

  constructor(
    status: number,
    codigo: string,
    mensagem: string,
    campos?: Record<string, string>
  ) {
    super(mensagem);
    this.name = 'ApiError';
    this.status = status;
    this.codigo = codigo;
    this.campos = campos;
  }
}

let authToken: string | null = null;
let onUnauthorized: (() => void) | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

// Chamado quando uma rota protegida responde 401 (token expirado/inválido).
export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  auth?: boolean; // envia o token Bearer (padrão: true)
};

export async function request<T>(
  path: string,
  { method = 'GET', body, auth = true }: RequestOptions = {}
): Promise<T> {
  if (!API_URL) {
    throw new ApiError(
      0,
      'API_NAO_CONFIGURADA',
      'URL da API não configurada. Defina EXPO_PUBLIC_API_URL no .env.local.'
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  // Upload (FormData): o fetch define o Content-Type com o boundary do multipart.
  const multipart = body instanceof FormData;

  try {
    const response = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        ...(multipart ? {} : { 'Content-Type': 'application/json' }),
        Accept: 'application/json',
        ...(auth && authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
      body: body === undefined ? undefined : multipart ? body : JSON.stringify(body),
      signal: controller.signal,
    });

    if (response.status === 204) {
      return undefined as T;
    }

    const text = await response.text();
    let data: unknown = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = null;
    }

    if (!response.ok) {
      const erro = data as Partial<ApiErrorBody> | null;

      if (response.status === 401 && auth && authToken) {
        onUnauthorized?.();
      }

      throw new ApiError(
        response.status,
        erro?.codigo ?? 'ERRO_DESCONHECIDO',
        erro?.mensagem ?? 'Ocorreu um erro inesperado. Tente novamente.',
        erro?.campos
      );
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError(
        0,
        'TIMEOUT',
        'O servidor demorou para responder. Tente novamente.'
      );
    }
    throw new ApiError(
      0,
      'SEM_CONEXAO',
      'Não foi possível conectar ao servidor. Verifique sua internet.'
    );
  } finally {
    clearTimeout(timeout);
  }
}
