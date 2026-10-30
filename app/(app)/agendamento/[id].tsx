import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Href, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar } from '../../../src/components/Avatar';
import { Button } from '../../../src/components/Button';
import { Card } from '../../../src/components/Card';
import { SummaryRow } from '../../../src/components/InfoRow';
import { ScreenHeader } from '../../../src/components/ScreenHeader';
import {
  formatarValor,
  primeiroNome,
  StatusAgendamento,
} from '../../../src/data/agendamentos';
import { estadoDe } from '../../../src/data/estadosAgendamento';
import { useAgendamento } from '../../../src/data/useAgendamentos';
import { colors } from '../../../src/theme/colors';

const DOT: Record<StatusAgendamento, string> = {
  CONFIRMADO: colors.primary,
  PENDENTE: colors.warningIcon,
  CONCLUIDO: colors.primary,
  CANCELADO: colors.error,
};

export default function DetalhesAgendamentoCliente() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const item = useAgendamento(id);
  const [copiado, setCopiado] = useState(false);

  if (!item) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScreenHeader title="Detalhes do Agendamento" />
        <Text style={styles.empty}>Agendamento não encontrado.</Text>
      </SafeAreaView>
    );
  }

  const nome = primeiroNome(item.prestador.nome);

  const titulo: Record<StatusAgendamento, [string, string]> = {
    CONFIRMADO: ['Agendamento Confirmado', `O jardineiro ${nome} confirmou o horário.`],
    PENDENTE: ['Aguardando confirmação', `Esperando ${nome} confirmar o horário.`],
    CONCLUIDO: ['Serviço Concluído', `${nome} finalizou o serviço.`],
    CANCELADO: ['Agendamento Cancelado', item.motivoCancelamento ?? 'Este serviço foi cancelado.'],
  };
  const [statusTitulo, statusSub] = titulo[item.status];
  const estado = estadoDe(item);

  async function copiarTelefone() {
    await Clipboard.setStringAsync(item!.prestador.telefone);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Detalhes do Agendamento" />

      <ScrollView contentContainerStyle={styles.content}>
        <Card>
          <View style={styles.statusRow}>
            <View style={[styles.dot, { backgroundColor: DOT[item.status] }]} />
            <Text style={styles.statusTitle}>{statusTitulo}</Text>
          </View>
          <Text style={styles.statusSub}>{statusSub}</Text>
        </Card>

        <Card style={styles.person}>
          <Avatar nome={item.prestador.nome} size={44} />
          <View>
            <Text style={styles.name}>{item.prestador.nome}</Text>
            <View style={styles.rating}>
              <Ionicons name="star" size={13} color={colors.star} />
              <Text style={styles.ratingText}>
                {item.prestador.nota.toFixed(1).replace('.', ',')} (
                {item.prestador.avaliacoes} avaliações)
              </Text>
            </View>
          </View>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Resumo do Serviço</Text>
          <SummaryRow label="Serviço" value={item.servico} />
          <SummaryRow label="Data" value={item.dataLonga} />
          <SummaryRow
            label="Horário"
            value={`${item.horario} (${item.periodo})`}
          />
          <SummaryRow label="Região" value={`${item.cidade}, ${item.regiao}`} />
          <SummaryRow
            label="Endereço Completo"
            value={item.endereco}
            stacked
            bold
          />
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Valor Total</Text>
            <Text style={styles.totalValue}>{formatarValor(item.valor)}</Text>
          </View>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Contato do Profissional</Text>
          <SummaryRow label="Telefone" value={item.prestador.telefone} bold />
          <Button
            title={copiado ? 'Telefone copiado!' : 'Copiar telefone'}
            icon={copiado ? 'checkmark' : 'copy-outline'}
            style={styles.copyButton}
            onPress={copiarTelefone}
          />
        </Card>

        {estado.podeCancelar && (
          <Button
            title="Cancelar Agendamento"
            variant="danger"
            onPress={() => router.push(`/cancelar/${item.id}` as Href)}
          />
        )}

        {estado.podeAvaliar && (
          <Button
            title={item.avaliacao ? 'Serviço já avaliado' : 'Avaliar Serviço'}
            disabled={!!item.avaliacao}
            onPress={() => router.push(`/avaliar/${item.id}` as Href)}
          />
        )}
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
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  statusSub: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
    marginLeft: 16,
  },
  person: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  ratingText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  totalValue: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary,
  },
  copyButton: {
    marginTop: 10,
  },
});
