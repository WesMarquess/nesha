import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Href, useRouter } from 'expo-router';
import { Avatar } from '../../../src/components/Avatar';
import { BottomNav } from '../../../src/components/BottomNav';
import { Button } from '../../../src/components/Button';
import { Card } from '../../../src/components/Card';
import { IconLine } from '../../../src/components/InfoRow';
import { StatusBadge } from '../../../src/components/StatusBadge';
import {
  aceitarSolicitacao,
  formatarValor,
  recusarSolicitacao,
} from '../../../src/data/agendamentos';
import { estadoDe } from '../../../src/data/estadosAgendamento';
import { useAgendamentos } from '../../../src/data/useAgendamentos';
import { colors } from '../../../src/theme/colors';

export default function NovasSolicitacoes() {
  const router = useRouter();
  const agendamentos = useAgendamentos();
  const pendentes = agendamentos.filter((a) => estadoDe(a).podeResponder);

  // A lista se atualiza sozinha (useAgendamentos assina as mudanças).
  function responder(id: string, aceitar: boolean) {
    if (aceitar) {
      aceitarSolicitacao(id);
    } else {
      recusarSolicitacao(id);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Text style={styles.title}>Novas Solicitações</Text>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.summary}>
          <Text style={styles.count}>
            {pendentes.length === 0
              ? 'Nenhuma proposta pendente'
              : pendentes.length === 1
                ? '1 nova proposta pendente'
                : `${pendentes.length} novas propostas pendentes`}
          </Text>
          <TouchableOpacity
            onPress={() => router.replace('/prestador/solicitacoes' as Href)}
            accessibilityRole="button"
          >
            <Text style={styles.reload}>Recarregar</Text>
          </TouchableOpacity>
        </View>

        {pendentes.map((item) => (
          <Card key={item.id} style={styles.card}>
            <View style={styles.cardTop}>
              <StatusBadge status="CONFIRMADO" label="Nova solicitação" />
              <Text style={styles.price}>{formatarValor(item.valor)}</Text>
            </View>

            <View style={styles.person}>
              <Avatar nome={item.cliente.nome} size={40} />
              <View>
                <Text style={styles.name}>{item.cliente.nome}</Text>
                <Text style={styles.service}>{item.servico}</Text>
              </View>
            </View>

            <IconLine
              icon="calendar-outline"
              text={`${item.dataCurta} • ${item.horario}`}
            />
            <IconLine
              icon="location-outline"
              text={`${item.cidade} • ${item.regiao}`}
            />

            <View style={styles.actions}>
              <Button
                compact
                variant="danger"
                title="Recusar"
                accessibilityHint={`Recusa a solicitação de ${item.cliente.nome}`}
                style={styles.flex}
                onPress={() => responder(item.id, false)}
              />
              <Button
                compact
                variant="outline"
                title="Ver detalhes"
                style={styles.flex}
                onPress={() =>
                  router.push(`/prestador/agendamento/${item.id}` as Href)
                }
              />
              <Button
                compact
                title="Aceitar"
                accessibilityHint={`Confirma o agendamento com ${item.cliente.nome}`}
                style={styles.flex}
                onPress={() => responder(item.id, true)}
              />
            </View>
          </Card>
        ))}
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
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    paddingVertical: 16,
  },
  content: {
    padding: 16,
    paddingTop: 4,
    gap: 12,
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  count: {
    fontSize: 12,
    color: colors.textMuted,
  },
  reload: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  card: {
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
});
