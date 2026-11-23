import { useState } from 'react';
import { ActivityIndicator, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Href, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar } from '../../../src/components/Avatar';
import { BottomNav } from '../../../src/components/BottomNav';
import { Button } from '../../../src/components/Button';
import { Card } from '../../../src/components/Card';
import { FilterChips } from '../../../src/components/FilterChips';
import { IconLine } from '../../../src/components/InfoRow';
import { Notice } from '../../../src/components/Notice';
import { SeletorDeDias } from '../../../src/components/SeletorDeDias';
import { StatusBadge } from '../../../src/components/StatusBadge';
import { formatarValor, StatusAgendamento, textoPeriodo } from '../../../src/data/agendamentos';
import {
  useAgendamentos,
  useRecarregarAoFocar,
  useSituacaoAgendamentos,
} from '../../../src/data/useAgendamentos';
import { colors } from '../../../src/theme/colors';
import { chaveDoDia, inicioDoDia } from '../../../src/utils/datas';

// Abre o endereço no app de mapas do aparelho (ou no navegador).
function abrirNoMapa(endereco: string) {
  Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(endereco)}`);
}

const ABAS: readonly { key: StatusAgendamento; label: string }[] = [
  { key: 'CONFIRMADO', label: 'Confirmados' },
  { key: 'PENDENTE', label: 'Solicitados' },
  { key: 'CONCLUIDO', label: 'Concluídos' },
];

export default function AgendaPrestador() {
  const router = useRouter();
  const agendamentos = useAgendamentos();
  const { carregando, carregado, erro } = useSituacaoAgendamentos();
  useRecarregarAoFocar();

  const hoje = inicioDoDia(new Date());
  const [aba, setAba] = useState<StatusAgendamento>('CONFIRMADO');
  const [primeiroDia, setPrimeiroDia] = useState(hoje);
  const [diaSelecionado, setDiaSelecionado] = useState(chaveDoDia(hoje));

  const abrir = (id: string) =>
    router.push(`/prestador/agendamento/${id}` as Href);

  const confirmados = agendamentos.filter((a) => a.status === 'CONFIRMADO');
  const doDia = confirmados.filter((a) => a.data === diaSelecionado);
  const outros = agendamentos.filter((a) => a.status === aba);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Text style={styles.title}>Painel de Agendamentos</Text>

      <FilterChips options={ABAS} value={aba} onChange={setAba} />

      <ScrollView contentContainerStyle={styles.content}>
        {!!erro && <Notice tone="error" icon="alert-circle-outline" text={erro} />}
        {carregando && !carregado && (
          <ActivityIndicator color={colors.primary} accessibilityLabel="Carregando agenda" />
        )}

        <Button
          title="Ver novas solicitações"
          variant="outline"
          icon="notifications-outline"
          onPress={() => router.push('/prestador/solicitacoes' as Href)}
        />

        {aba === 'CONFIRMADO' ? (
          <>
            <Card>
              <SeletorDeDias
                primeiroDia={primeiroDia}
                selecionado={diaSelecionado}
                onSelecionar={setDiaSelecionado}
                onMudarPagina={(dia) => {
                  setPrimeiroDia(dia);
                  setDiaSelecionado(chaveDoDia(dia));
                }}
                comCompromisso={(chave) => confirmados.some((a) => a.data === chave)}
                acao={{
                  titulo: 'Hoje',
                  onPress: () => {
                    setPrimeiroDia(hoje);
                    setDiaSelecionado(chaveDoDia(hoje));
                  },
                }}
              />
            </Card>

            <Text style={styles.section}>Compromissos do Dia</Text>

            {doDia.length === 0 && (
              <Text style={styles.empty}>Nenhum compromisso neste dia.</Text>
            )}

            {doDia.map((item) => (
              <Card key={item.id} style={styles.cardHighlight}>
                <View style={styles.cardTop}>
                  <Text style={styles.time}>
                    {item.horarioInicio} - {textoPeriodo(item.periodo)}
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
                    onPress={() => abrirNoMapa(`${item.endereco}, ${item.regiao}, ${item.cidade}`)}
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

      <BottomNav active="agenda" area="prestador" />
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
