import { StyleSheet, Text, View } from 'react-native';
import { STATUS_LABEL, StatusAgendamento } from '../data/agendamentos';
import { colors } from '../theme/colors';

const tons: Record<StatusAgendamento, { bg: string; fg: string }> = {
  AGUARDANDO_PAGAMENTO: { bg: colors.warningSoft, fg: colors.warningText },
  CONFIRMADO: { bg: colors.primarySoft, fg: colors.primary },
  PENDENTE: { bg: colors.warningSoft, fg: colors.warningText },
  CONCLUIDO: { bg: colors.primarySoft, fg: colors.primary },
  CANCELADO: { bg: colors.errorSoft, fg: colors.error },
};

type StatusBadgeProps = {
  status: StatusAgendamento;
  label?: string; // sobrescreve o texto padrão (ex.: "Nova solicitação")
};

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const tom = tons[status];
  return (
    <View style={[styles.badge, { backgroundColor: tom.bg }]}>
      <Text style={[styles.text, { color: tom.fg }]}>
        {label ?? STATUS_LABEL[status]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
  },
});
