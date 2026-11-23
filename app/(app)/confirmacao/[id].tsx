import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Href, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../../src/components/Button';
import { Card } from '../../../src/components/Card';
import { SummaryRow } from '../../../src/components/InfoRow';
import { Notice } from '../../../src/components/Notice';
import { formatarValor, primeiroNome } from '../../../src/data/agendamentos';
import { useAgendamento } from '../../../src/data/useAgendamentos';
import { colors } from '../../../src/theme/colors';

// Tela "confirmacao" do Figma, depois do pagamento aprovado.
export default function Confirmacao() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const item = useAgendamento(id);

  if (!item) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator style={styles.loading} color={colors.primary} />
      </SafeAreaView>
    );
  }

  const nome = primeiroNome(item.prestador.nome);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.icone} accessibilityElementsHidden importantForAccessibility="no">
          <Ionicons name="checkmark" size={48} color={colors.primaryText} />
        </View>

        <Text style={styles.titulo} accessibilityRole="header">
          Pagamento confirmado!
        </Text>
        {/* No Figma o prestador já aparece confirmado; aqui ele ainda aceita a solicitação. */}
        <Text style={styles.subtitulo}>
          Seu pagamento foi confirmado pelo Mercado Pago. Agora é só aguardar {nome} confirmar o
          horário; você acompanha pela sua agenda.
        </Text>

        <Card>
          <Text style={styles.cardTitulo}>Resumo do Agendamento</Text>
          <SummaryRow label="Profissional" value={item.prestador.nome} bold />
          <SummaryRow label="Serviço" value={item.servico} bold />
          <SummaryRow label="Data e Horário" value={`${item.dataCurta} às ${item.horarioInicio}`} bold />
          <View style={styles.divider} />
          <View style={styles.totalLinha}>
            <Text style={styles.totalRotulo}>Total Pago</Text>
            <Text style={styles.totalValor}>{formatarValor(item.valor)}</Text>
          </View>
        </Card>

        <Notice
          icon="information-circle-outline"
          text={`Deixe as ferramentas e os materiais necessários no local antes da chegada de ${nome}.`}
        />

        <Button title="Ir para a Tela Inicial" onPress={() => router.navigate('/home' as Href)} />
        <Button
          title="Ver minha agenda"
          variant="outline"
          onPress={() =>
            router.navigate({ pathname: '/agenda', params: { aba: 'PENDENTE' } } as Href)
          }
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loading: {
    marginTop: 48,
  },
  content: {
    padding: 16,
    paddingTop: 40,
    paddingBottom: 32,
    gap: 16,
  },
  icone: {
    alignSelf: 'center',
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  titulo: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  subtitulo: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
    textAlign: 'center',
  },
  cardTitulo: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 8,
  },
  totalLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalRotulo: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
  },
  totalValor: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary,
  },
});
