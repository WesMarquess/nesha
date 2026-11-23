import { Redirect, Stack } from 'expo-router';
import { useAuth } from '../../../src/contexts/AuthContext';
import { colors } from '../../../src/theme/colors';
import { rotaInicial } from '../../../src/utils/rotas';

// Área do Prestador. Quem é cliente volta para a sua própria área.
export default function PrestadorLayout() {
  const { usuario } = useAuth();

  if (usuario && usuario.perfil !== 'PRESTADOR') {
    return <Redirect href={rotaInicial(usuario.perfil)} />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    />
  );
}
