import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { ApiError, setAuthToken, setUnauthorizedHandler } from '../services/api';
import { getMe, login } from '../services/auth';
import { clearToken, loadToken, saveToken } from '../services/session';
import type { Usuario } from '../types/auth';

type AuthContextValue = {
  usuario: Usuario | null;
  loading: boolean; // true enquanto restaura a sessão salva ao abrir o app
  signIn: (email: string, senha: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  const signOut = useCallback(async () => {
    setAuthToken(null);
    await clearToken();
    setUsuario(null);
  }, []);

  // Se qualquer rota protegida responder 401, encerra a sessão.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      signOut();
    });
    return () => setUnauthorizedHandler(null);
  }, [signOut]);

  // Ao abrir o app, restaura a sessão a partir do token salvo.
  useEffect(() => {
    let active = true;

    async function restoreSession() {
      try {
        const token = await loadToken();
        if (!token) {
          return;
        }

        setAuthToken(token);
        const me = await getMe();
        if (active) {
          setUsuario(me);
        }
      } catch (error) {
        // 401: token inválido/expirado. Outros erros (ex.: sem internet) mantêm o token salvo.
        if (error instanceof ApiError && error.status === 401) {
          setAuthToken(null);
          await clearToken();
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    restoreSession();

    return () => {
      active = false;
    };
  }, []);

  const signIn = useCallback(async (email: string, senha: string) => {
    const resposta = await login({ email, senha });

    // Este app é só da Área do Cliente.
    if (resposta.usuario.perfil !== 'CLIENTE') {
      throw new ApiError(
        403,
        'PERFIL_INVALIDO',
        'Esta conta não é de cliente. Use a Área do Prestador.'
      );
    }

    setAuthToken(resposta.accessToken);
    await saveToken(resposta.accessToken);
    setUsuario(resposta.usuario);
  }, []);

  const value = useMemo(
    () => ({ usuario, loading, signIn, signOut }),
    [usuario, loading, signIn, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth precisa estar dentro de <AuthProvider>.');
  }
  return context;
}
