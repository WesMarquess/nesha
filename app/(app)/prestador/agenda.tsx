import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Href, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar } from '../../../src/components/Avatar';
import { BottomNav } from '../../../src/components/BottomNav';
import { Button } from '../../../src/components/Button';
import { Card } from '../../../src/components/Card';
import { FilterChips } from '../../../src/components/FilterChips';
import { IconLine } from '../../../src/components/InfoRow';
import { StatusBadge } from '../../../src/components/StatusBadge';
import { formatarValor, StatusAgendamento } from '../../../src/data/agendamentos';
import { useAgendamentos } from '../../../src/data/useAgendamentos';
import { colors } from '../../../src/theme/colors';

const ABAS: readonly { key: StatusAgendamento; label: string }[] = [
  { key: 'CONFIRMADO', label: 'Confirmados' },
  { key: 'PENDENTE', label: 'Solicitados' },
  { key: 'CONCLUIDO', label: 'Concluídos' },
];

// Semana mostrada no calendário (mockada). Trocar por cálculo real com datas depois.
const MES = 'Maio 2026';
const HOJE = 15;
const SEMANA = [
  { dia: 13, sigla: 'S' },
  { dia: 14, sigla: 'T' },
  { dia: 15, sigla: 'Q' },
  { dia: 16, sigla: 'Q' },
  { dia: 17, sigla: 'S' },
];

export default function AgendaPrestador() {
  const router = useRouter();
  const agendamentos = useAgendamentos();
  const [aba, setAba] = useState<StatusAgendamento>('CONFIRMADO');
  const [diaSelecionado, setDiaSelecionado] = useState(HOJE);

  const abrir = (id: string) =>
    router.push(`/prestador/agendamento/${id}` as Href);

  const doDia = agendamentos.filter(
    (a) => a.status === 'CONFIRMADO' && a.dia === diaSelecionado
  );
  const outros = agendamentos.filter((a) => a.status === aba);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Text style={styles.title}>Painel de Agendamentos</Text>

      <FilterChips options={ABAS} value={aba} onChange={setAba} />

      <ScrollView contentContainerStyle={styles.content}>
        <Button
          title="Ver novas solicitações"
          variant="outline"
          icon="notifications-outline"
          onPress={() => router.push('/prestador/solicitacoes' as Href)}
        />

        {aba === 'CONFIRMADO' ? (
          <>
            <Card>
              <View style={styles.monthRow}>
                <Text style={styles.month}>{MES}</Text>
                <TouchableOpacity
                  onPress={() => setDiaSelecionado(HOJE)}
                  accessibilityRole="button"
                  accessibilityLabel="Ir para hoje"
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                  <Text style={styles.today}>Hoje</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.week}>
                {SEMANA.map(({ dia, sigla }) => {
                  const selecionado = dia === diaSelecionado;
                  return (
                    <TouchableOpacity
                      key={dia}
                      style={styles.dayWrap}
                      onPress={() => setDiaSelecionado(dia)}
                      accessibilityRole="button"
                      accessibilityLabel={`${sigla}, dia ${dia}`}
                      accessibilityState={{ selected: selecionado }}
                    >
                      <Text style={styles.dayLabel}>{sigla}</Text>
                      <View style={[styles.day, selecionado && styles.daySelected]}>
                        <Text
                          style={[styles.dayText, selecionado && styles.dayTextSelected]}
                        >
                          {dia}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Card>

            <Text style={styles.section}>Compromissos do Dia</Text>

            {doDia.length === 0 && (
              <Text style={styles.empty}>Nenhum compromisso neste dia.</Text>
            )}

            {doDia.map((item) => (
              <Card key={item.id} style={styles.cardHighlight}>
                <View style={styles.cardTop}>
                  <Text style={styles.time}>
                    {item.horarioInicio} - Período da {item.periodo}
                  </Text>
                  <StatusBadge status={item.status} />
                </View>

                <View style={styles.person}>
                  <Avatar nome={item.cliente.nome} size={36} />
                  <View style={styles.flex}>
                    <Text style={styles.name}>{item.cliente.nome}</Text>
                    <Text style={styles.service}>
                      {item.servico} • {formatarValor(item.valor)}
                    </Text>
                  </View>
                </View>

                <IconLine
                  icon="location-outline"
                  text={`${item.regiao} • ${item.cidade} • ${item.endereco.split(' - ')[0]}`}
                />

                <View style={styles.actions}>
                  <Button
                    compact
                    title="Ver rota no mapa"
                    style={styles.flex}
                    onPress={() => {}}
                  />
                  <Button
                    compact
                    variant="outline"
                    title="Ver informações"
                    style={styles.flex}
                    onPress={() => abrir(item.id)}
                  />
                </View>
              </Card>
            ))}
          </>
        ) : (
          <>
            {outros.length === 0 && (
              <Text style={styles.empty}>Nada por aqui ainda.</Text>
            )}

            {outros.map((item) => (
              <Card key={item.id}>
                <View style={styles.cardTop}>
                  <StatusBadge status={item.status} />
                  <Text style={styles.price}>{formatarValor(item.valor)}</Text>
                </View>

                <View style={styles.person}>
                  <Avatar nome={item.cliente.nome} size={36} />
                  <View style={styles.flex}>
                    <Text style={styles.name}>{item.cliente.nome}</Text>
                    <Text style={styles.service}>{item.servico}</Text>
                  </View>
                </View>

                <IconLine
                  icon="calendar-outline"
                  text={`${item.dataCurta} • ${item.horario}`}
                />

                <Button
                  compact
                  variant="outline"
                  title="Ver informações"
                  style={styles.single}
                  onPress={() => abrir(item.id)}
                />
              </Card>
            ))}
          </>
        )}
      </ScrollView>

      <BottomNav active="agenda" agendaHref="/prestador/agenda" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  content: {
    padding: 16,
    gap: 14,
  },
  empty: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 13,
    marginVertical: 12,
  },
  monthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  month: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  today: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  week: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  dayWrap: {
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  dayLabel: {
    fontSize: 11,
    color: colors.textMuted,
  },
  day: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  daySelected: {
    backgroundColor: colors.primary,
  },
  dayText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  dayTextSelected: {
    color: colors.primaryText,
  },
  section: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
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
  time: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
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
    marginBottom: 2,
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
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  single: {
    marginTop: 14,
  },
});
