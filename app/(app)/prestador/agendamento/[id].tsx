import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar } from '../../../../src/components/Avatar';
import { Button } from '../../../../src/components/Button';
import { Card } from '../../../../src/components/Card';
import { SummaryRow } from '../../../../src/components/InfoRow';
import { Notice } from '../../../../src/components/Notice';
import { ScreenHeader } from '../../../../src/components/ScreenHeader';
import {
  aceitarSolicitacao,
  concluirAgendamento,
  formatarValor,
  mensagemDeErro,
  recusarSolicitacao,
  StatusAgendamento,
} from '../../../../src/data/agendamentos';
import { estadoDe } from '../../../../src/data/estadosAgendamento';
import {
  useAgendamento,
  useRecarregarAoFocar,
  useSituacaoAgendamentos,
} from '../../../../src/data/useAgendamentos';
import { colors } from '../../../../src/theme/colors';

const STATUS_TEXTO: Record<StatusAgendamento, [string, string]> = {
  // O prestador não chega a ver agendamentos não pagos; mantido para o tipo ficar completo.
  AGUARDANDO_PAGAMENTO: ['Aguardando pagamento', 'O cliente ainda não concluiu o pagamento.'],
  CONFIRMADO: [
    'Agendamento Confirmado',
    'Serviço confirmado para atendimento no endereço do cliente.',
  ],
  PENDENTE: ['Solicitação pendente', 'Aceite ou recuse a solicitação do cliente.'],
  CONCLUIDO: ['Serviço Concluído', 'Este atendimento já foi realizado.'],
  CANCELADO: ['Agendamento Cancelado', 'Este atendimento foi cancelado.'],
};

const DOT: Record<StatusAgendamento, string> = {
  AGUARDANDO_PAGAMENTO: colors.warningIcon,
  CONFIRMADO: colors.primary,
  PENDENTE: colors.warningIcon,
  CONCLUIDO: colors.primary,
  CANCELADO: colors.error,
};

export default function DetalhesAgendamentoPrestador() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const item = useAgendamento(id);
  const { carregado } = useSituacaoAgendamentos();
  useRecarregarAoFocar();
  const [copiado, setCopiado] = useState(false);
  const [enviando, setEnviando] = useState<'aceitar' | 'recusar' | 'concluir' | null>(null);
  const [erro, setErro] = useState('');

  if (!item) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScreenHeader title="Detalhes do Agendamento" />
        {carregado ? (
          <Text style={styles.empty}>Agendamento não encontrado.</Text>
        ) : (
          <ActivityIndicator style={styles.loading} color={colors.primary} />
        )}
      </SafeAreaView>
    );
  }

  const [titulo, padrao] = STATUS_TEXTO[item.status];
  const subtitulo = item.status === 'CANCELADO' && item.motivoCancelamento ? item.motivoCancelamento : padrao;
  const estado = estadoDe(item);

  async function executar(acao: 'aceitar' | 'recusar' | 'concluir') {
    setEnviando(acao);
    setErro('');
    try {
      const funcoes = { aceitar: aceitarSolicitacao, recusar: recusarSolicitacao, concluir: concluirAgendamento };
      await funcoes[acao](item!.id);
    } catch (error) {
      setErro(mensagemDeErro(error));
    } finally {
      setEnviando(null);
    }
  }

  async function copiarTelefone() {
    await Clipboard.setStringAsync(item!.cliente.telefone);
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
            <Text style={styles.statusTitle}>{titulo}</Text>
          </View>
          <Text style={styles.statusSub}>{subtitulo}</Text>
        </Card>

        <Card style={styles.person}>
          <Avatar nome={item.cliente.nome} size={44} uri={item.cliente.fotoUrl} />
          <View>
            <Text style={styles.name}>{item.cliente.nome}</Text>
            <Text style={styles.since}>Cliente Nesha desde {item.cliente.desde}</Text>
          </View>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Resumo do Serviço</Text>
          <SummaryRow label="Serviço" value={item.servico} bold />
          <SummaryRow label="Cidade" value={item.cidade} bold />
          <SummaryRow label="Região" value={item.regiao} bold />
          <SummaryRow label="Endereço" value={item.endereco} stacked bold />
          <SummaryRow label="Data" value={item.dataLonga.replace(', ', ', ')} bold />
          <SummaryRow label="Horário" value={`${item.horario} (${item.periodo})`} bold />

          {!!item.observacoes && (
            <View style={styles.notes}>
              <Text style={styles.notesLabel}>Observações do Cliente</Text>
              <Text style={styles.notesText}>“{item.observacoes}”</Text>
            </View>
          )}

          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Valor Total</Text>
            <Text style={styles.totalValue}>{formatarValor(item.valor)}</Text>
          </View>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Contato da Cliente</Text>
          <SummaryRow label="Telefone" value={item.cliente.telefone} bold />
          <Button
            title={copiado ? 'Telefone copiado!' : 'Copiar telefone'}
            icon={copiado ? 'checkmark' : 'copy-outline'}
            style={styles.copyButton}
            onPress={copiarTelefone}
          />
        </Card>

        {!!erro && <Notice tone="error" icon="alert-circle-outline" text={erro} />}

        {estado.podeResponder && (
          <View style={styles.acoes}>
            <Button
              title="Recusar"
              variant="danger"
              style={styles.flex}
              loading={enviando === 'recusar'}
              disabled={enviando !== null}
              onPress={() => executar('recusar')}
            />
            <Button
              title="Aceitar"
              style={styles.flex}
              loading={enviando === 'aceitar'}
              disabled={enviando !== null}
              onPress={() => executar('aceitar')}
            />
          </View>
        )}

        {estado.podeConcluir && (
          <Button
            title="Marcar como concluído"
            icon="checkmark-done-outline"
            loading={enviando === 'concluir'}
            onPress={() => executar('concluir')}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  loading: {
    marginTop: 32,
  },
  acoes: {
    flexDirection: 'row',
    gap: 12,
  },
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
  since: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  notes: {
    marginTop: 6,
    paddingTop: 8,
  },
  notesLabel: {
    fontSize: 12,
    color: colors.textMuted,
  },
  notesText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: colors.text,
    lineHeight: 17,
    marginTop: 3,
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
