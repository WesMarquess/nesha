import { Redirect, Stack } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { colors } from '../../src/theme/colors';
import { rotaInicial } from '../../src/utils/rotas';

// Telas públicas (login/cadastro). Quem já está logado vai direto para a sua área.
export default function AuthLayout() {
  const { usuario, loading } = useAuth();

  if (!loading && usuario) {
    return <Redirect href={rotaInicial(usuario.perfil)} />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    />
  );
}
