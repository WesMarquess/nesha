import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Href, Redirect } from 'expo-router';
import { PULAR_LOGIN } from '../src/config/dev';
import { useAuth } from '../src/contexts/AuthContext';
import { colors } from '../src/theme/colors';
import { rotaInicial } from '../src/utils/rotas';

// Porta de entrada: decide para onde ir conforme a sessão salva.
// Com PULAR_LOGIN = true (src/config/dev.ts), abre direto a agenda do cliente.
// Para ver a agenda do prestador, troque '/agenda' por '/prestador/agenda'.
export default function Index() {
  const { usuario, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const destino = usuario
    ? rotaInicial(usuario.perfil)
    : ((PULAR_LOGIN ? '/agenda' : '/login') as Href);

  return <Redirect href={destino} />;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
