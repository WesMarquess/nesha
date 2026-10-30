import { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Href, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar } from '../../../src/components/Avatar';
import { Button } from '../../../src/components/Button';
import { Card } from '../../../src/components/Card';
import { Notice } from '../../../src/components/Notice';
import { ScreenHeader } from '../../../src/components/ScreenHeader';
import {
  cancelarAgendamento,
  formatarValor,
  MOTIVOS_CANCELAMENTO,
} from '../../../src/data/agendamentos';
import { useAgendamento } from '../../../src/data/useAgendamentos';
import { colors } from '../../../src/theme/colors';

export default function CancelarServico() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const item = useAgendamento(id);

  const [motivo, setMotivo] = useState<string | null>(null);
  const [aberto, setAberto] = useState(false);

  if (!item) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScreenHeader title="Cancelar Serviço" />
        <Text style={styles.empty}>Agendamento não encontrado.</Text>
      </SafeAreaView>
    );
  }

  function confirmar() {
    if (!motivo) {
      Alert.alert('Selecione um motivo', 'Informe o motivo do cancelamento.');
      return;
    }

    Alert.alert('Cancelar serviço?', 'Essa ação não pode ser desfeita.', [
      { text: 'Voltar', style: 'cancel' },
      {
        text: 'Confirmar',
        style: 'destructive',
        onPress: () => {
          cancelarAgendamento(item!.id, motivo);
          router.replace('/agenda' as Href);
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Cancelar Serviço" />

      <ScrollView contentContainerStyle={styles.content}>
        <Notice text="Caso opte por cancelar, nos informe o motivo para que possamos melhorar nossos serviços." />

        <Card style={styles.service}>
          <Avatar nome={item.prestador.nome} size={36} />
          <View>
            <Text style={styles.serviceName}>{item.servico}</Text>
            <Text style={styles.serviceSub}>
              {item.prestador.nome} • {formatarValor(item.valor)}
            </Text>
          </View>
        </Card>

        <Card>
          <Text style={styles.question}>1. Deseja cancelar o serviço?</Text>

          <TouchableOpacity
            style={styles.select}
            activeOpacity={0.8}
            onPress={() => setAberto((prev) => !prev)}
            accessibilityRole="button"
            accessibilityLabel={`Motivo do cancelamento: ${motivo ?? 'nenhum selecionado'}`}
            accessibilityState={{ expanded: aberto }}
          >
            <Text style={[styles.selectText, !motivo && styles.selectPlaceholder]}>
              {motivo ?? 'Selecione o motivo do cancelamento...'}
            </Text>
            <Ionicons
              name={aberto ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={colors.textMuted}
            />
          </TouchableOpacity>

          {aberto && (
            <View style={styles.options}>
              {MOTIVOS_CANCELAMENTO.map((opcao) => (
                <TouchableOpacity
                  key={opcao}
                  style={styles.option}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: opcao === motivo }}
                  onPress={() => {
                    setMotivo(opcao);
                    setAberto(false);
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      opcao === motivo && styles.optionTextSelected,
                    ]}
                  >
                    {opcao}
                  </Text>
                  {opcao === motivo && (
                    <Ionicons name="checkmark" size={16} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={styles.refund}>
            <Notice
              tone="error"
              text="O reembolso do serviço pode ocorrer em até 30 dias, dependendo do método de pagamento."
            />
          </View>

          <Button
            title="Confirmar Cancelamento"
            variant="danger"
            style={styles.confirm}
            onPress={confirmar}
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingTop: 4,
    gap: 12,
  },
  empty: {
    textAlign: 'center',
    color: colors.textMuted,
    marginTop: 32,
  },
  service: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  serviceName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  serviceSub: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 1,
  },
  question: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 10,
  },
  select: {
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    backgroundColor: colors.surface,
  },
  selectText: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
  },
  selectPlaceholder: {
    color: colors.placeholder,
  },
  options: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    overflow: 'hidden',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  optionText: {
    fontSize: 13,
    color: colors.text,
  },
  optionTextSelected: {
    fontWeight: '700',
    color: colors.primary,
  },
  refund: {
    marginTop: 12,
  },
  confirm: {
    marginTop: 12,
  },
});
