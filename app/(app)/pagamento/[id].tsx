import { useState } from 'react';
import { ActivityIndicator, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { Href, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../../src/components/Button';
import { Card } from '../../../src/components/Card';
import { Notice } from '../../../src/components/Notice';
import { ScreenHeader } from '../../../src/components/ScreenHeader';
import {
  formatarValor,
  iniciarPagamento,
  mensagemDeErro,
  verificarPagamento,
} from '../../../src/data/agendamentos';
import { estadoDe } from '../../../src/data/estadosAgendamento';
import {
  useAgendamento,
  useRecarregarAoFocar,
  useSituacaoAgendamentos,
} from '../../../src/data/useAgendamentos';
import { colors } from '../../../src/theme/colors';

type Etapa = 'inicio' | 'abrindo' | 'aguardando' | 'verificando';

// Tela "pagamento" do Figma: o cliente paga pelo Checkout Pro do Mercado Pago.
export default function Pagamento() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const item = useAgendamento(id);
  const { carregado } = useSituacaoAgendamentos();
  useRecarregarAoFocar();

  const [etapa, setEtapa] = useState<Etapa>('inicio');
  const [aviso, setAviso] = useState('');
  const [erro, setErro] = useState('');

  if (!item) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScreenHeader title="Pagamento" />
        {carregado ? (
          <Text style={styles.vazio}>Agendamento não encontrado.</Text>
        ) : (
          <ActivityIndicator style={styles.loading} color={colors.primary} />
        )}
      </SafeAreaView>
    );
  }

  const agendamentoId = item.id;
  const jaPago = !estadoDe(item).podePagar;

  // Aprovado: vai para a confirmação. Senão, explica o que aconteceu e deixa tentar de novo.
  async function conferir() {
    setEtapa('verificando');
    setErro('');
    try {
      const atualizado = await verificarPagamento(agendamentoId);
      if (!estadoDe(atualizado).podePagar) {
        router.replace(`/confirmacao/${agendamentoId}` as Href);
        return;
      }
      setAviso(
        atualizado.pagamentoStatus === 'RECUSADO'
          ? 'O pagamento foi recusado. Tente de novo com outro cartão ou forma de pagamento.'
          : 'Ainda não recebemos a confirmação do pagamento. Se você já pagou, aguarde alguns segundos e verifique de novo.'
      );
      setEtapa('aguardando');
    } catch (error) {
      setErro(mensagemDeErro(error));
      setEtapa('aguardando');
    }
  }

  async function pagar() {
    setEtapa('abrindo');
    setErro('');
    setAviso('');
    try {
      // Deep link de volta para esta tela (no Expo Go, exp://...; no app instalado, nesha://).
      const retorno = Linking.createURL(`pagamento/${agendamentoId}`);
      const { urlCheckout } = await iniciarPagamento(agendamentoId, retorno);

      if (!urlCheckout) {
        // Backend sem Access Token do Mercado Pago: pagamento simulado.
        await conferir();
        return;
      }

      if (Platform.OS === 'web') {
        // Na web o checkout abre em outra aba; a pessoa volta aqui e confere.
        await WebBrowser.openBrowserAsync(urlCheckout);
        setAviso('Conclua o pagamento na aba do Mercado Pago e depois toque em "Já paguei, verificar".');
        setEtapa('aguardando');
        return;
      }

      await WebBrowser.openAuthSessionAsync(urlCheckout, retorno);
      await conferir();
    } catch (error) {
      setErro(mensagemDeErro(error));
      setEtapa('inicio');
    }
  }

  const ocupado = etapa === 'abrindo' || etapa === 'verificando';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScreenHeader title="Pagamento" />

      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.total}>
          <Text style={styles.totalRotulo}>Valor total do serviço</Text>
          <Text style={styles.totalValor}>{formatarValor(item.valor)}</Text>
          <Text style={styles.totalSub}>
            {item.servico} • {item.prestador.nome}
          </Text>
          <Text style={styles.totalSub}>
            {item.dataLonga} • {item.horario}
          </Text>
        </Card>

        <Text style={styles.secao} accessibilityRole="header">
          Método de Pagamento
        </Text>

        <Card style={styles.metodo}>
          <View style={styles.metodoTopo}>
            <Ionicons name="shield-checkmark-outline" size={22} color={colors.primary} />
            <Text style={styles.metodoTitulo}>Pagamento processado pelo Mercado Pago</Text>
          </View>
          <Text style={styles.metodoTexto}>
            O pagamento será realizado com segurança via Mercado Pago. Você poderá usar Pix, Cartão
            de Crédito ou saldo da sua carteira.
          </Text>
        </Card>

        <Notice
          icon="lock-closed-outline"
          text="Seu dinheiro fica protegido na Nesha até a realização completa do serviço. Se o profissional recusar ou você cancelar, o valor é estornado."
        />

        {!!erro && <Notice tone="error" icon="alert-circle-outline" text={erro} />}
        {!!aviso && <Notice icon="information-circle-outline" text={aviso} />}

        {jaPago ? (
          <Button
            title="Ver confirmação"
            onPress={() => router.replace(`/confirmacao/${agendamentoId}` as Href)}
          />
        ) : etapa === 'aguardando' ? (
          <View style={styles.botoes}>
            <Button title="Já paguei, verificar" onPress={conferir} />
            <Button title="Pagar novamente" variant="outline" onPress={pagar} />
          </View>
        ) : (
          <Button
            title={etapa === 'verificando' ? 'Verificando pagamento...' : 'Confirmar e Pagar'}
            loading={ocupado}
            onPress={pagar}
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
  loading: {
    marginTop: 32,
  },
  vazio: {
    textAlign: 'center',
    color: colors.textMuted,
    marginTop: 32,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
    gap: 16,
  },
  total: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 4,
  },
  totalRotulo: {
    fontSize: 14,
    color: colors.textMuted,
  },
  totalValor: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.primary,
    marginVertical: 4,
  },
  totalSub: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
  },
  secao: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  metodo: {
    borderColor: colors.primary,
    borderWidth: 1.5,
    gap: 8,
  },
  metodoTopo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  metodoTitulo: {
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
  },
  metodoTexto: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.textMuted,
  },
  botoes: {
    gap: 12,
  },
});
