import { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Href, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar } from '../../src/components/Avatar';
import { BottomNav } from '../../src/components/BottomNav';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { FilterChips } from '../../src/components/FilterChips';
import { IconLine } from '../../src/components/InfoRow';
import { Notice } from '../../src/components/Notice';
import { StatusBadge } from '../../src/components/StatusBadge';
import {
  formatarValor,
  primeiroNome,
  StatusAgendamento,
  textoPeriodo,
} from '../../src/data/agendamentos';
import { estadoDe } from '../../src/data/estadosAgendamento';
import {
  useAgendamentos,
  useRecarregarAoFocar,
  useSituacaoAgendamentos,
} from '../../src/data/useAgendamentos';
import { colors } from '../../src/theme/colors';
import { pegarAviso } from '../../src/utils/avisoPendente';

const ABAS: readonly { key: StatusAgendamento; label: string }[] = [
  { key: 'CONFIRMADO', label: 'Próximos' },
  { key: 'PENDENTE', label: 'Pendentes' },
  { key: 'CONCLUIDO', label: 'Concluídos' },
  { key: 'CANCELADO', label: 'Cancelados' },
];

export default function AgendaCliente() {
  const router = useRouter();
  const agendamentos = useAgendamentos();
  const { carregando, carregado, erro } = useSituacaoAgendamentos();
  useRecarregarAoFocar();

  // ?aba=PENDENTE abre direto numa aba (ex.: depois de solicitar um agendamento).
  const params = useLocalSearchParams<{ aba?: StatusAgendamento }>();
  const [aba, setAba] = useState<StatusAgendamento>(params.aba ?? 'CONFIRMADO');
  const [aviso, setAviso] = useState<string | null>(null);

  // A tela continua montada entre as abas: aplica a aba pedida e o aviso ao voltar ao foco.
  useFocusEffect(
    useCallback(() => {
      if (params.aba) setAba(params.aba);
      setAviso(pegarAviso());
    }, [params.aba])
  );

  // "Pendentes" inclui os que ainda aguardam pagamento.
  const lista = agendamentos.filter(
    (a) => a.status === aba || (aba === 'PENDENTE' && a.status === 'AGUARDANDO_PAGAMENTO')
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Text style={styles.title}>Minha Agenda</Text>

      <FilterChips options={ABAS} value={aba} onChange={setAba} />

      <ScrollView contentContainerStyle={styles.content}>
        {!!aviso && <Notice tone="success" icon="checkmark-circle-outline" text={aviso} />}
        {!!erro && <Notice tone="error" icon="alert-circle-outline" text={erro} />}

        {carregando && !carregado ? (
          <ActivityIndicator color={colors.primary} accessibilityLabel="Carregando agenda" />
        ) : (
          lista.length === 0 && <Text style={styles.empty}>Nenhum agendamento por aqui.</Text>
        )}

        {lista.map((item) => (
          <View key={item.id} style={styles.group}>
            <Card
              style={item.status === 'CONFIRMADO' ? styles.cardHighlight : undefined}
            >
              <View style={styles.cardTop}>
                <StatusBadge status={item.status} />
                <Text style={styles.price}>{formatarValor(item.valor)}</Text>
              </View>

              <View style={styles.person}>
                <Avatar nome={item.prestador.nome} size={40} uri={item.prestador.fotoUrl} />
                <View style={styles.personText}>
                  <Text style={styles.name}>{item.prestador.nome}</Text>
                  <Text style={styles.service}>{item.servico}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <IconLine
                icon="calendar-outline"
                text={`${item.dataCurta} às ${item.horarioInicio} • ${textoPeriodo(item.periodo)}`}
              />
              <IconLine
                icon="location-outline"
                text={`${item.regiao}, ${item.cidade} • ${item.endereco.split(' - ')[0]}`}
              />

              {estadoDe(item).podePagar ? (
                <Button
                  title="Pagar agora"
                  icon="card-outline"
                  style={styles.cardButton}
                  onPress={() => router.push(`/pagamento/${item.id}` as Href)}
                />
              ) : (
                <Button
                  title="Ver detalhes"
                  style={styles.cardButton}
                  onPress={() => router.push(`/agendamento/${item.id}` as Href)}
                />
              )}
            </Card>

            {item.status === 'CONFIRMADO' && (
              <Notice
                icon="information-circle-outline"
                text={`Lembre-se de deixar as ferramentas no local antes da chegada de ${primeiroNome(item.prestador.nome)}.`}
              />
            )}
          </View>
        ))}
      </ScrollView>

      <BottomNav active="agenda" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  group: {
    gap: 12,
  },
  empty: {
    textAlign: 'center',
    color: colors.textMuted,
    marginTop: 32,
    fontSize: 14,
  },
  cardHighlight: {
    borderColor: colors.primary,
    borderWidth: 1.5,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary,
  },
  person: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
  },
  personText: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  service: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginTop: 12,
    marginBottom: 6,
  },
  cardButton: {
    marginTop: 14,
  },
});
