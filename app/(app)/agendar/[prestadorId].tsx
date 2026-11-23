import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Href, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../../src/components/Button';
import { Card } from '../../../src/components/Card';
import { FormInput } from '../../../src/components/FormInput';
import { Notice } from '../../../src/components/Notice';
import { ScreenHeader } from '../../../src/components/ScreenHeader';
import { SeletorDeDias } from '../../../src/components/SeletorDeDias';
import { criarAgendamento, formatarValor, mensagemDeErro } from '../../../src/data/agendamentos';
import { usePrestador } from '../../../src/data/usePrestador';
import { horariosOcupados } from '../../../src/services/agendamentos';
import { colors } from '../../../src/theme/colors';
import type { HorarioOcupado, PrestadorCatalogo } from '../../../src/types/agendamento';
import { deixarAviso } from '../../../src/utils/avisoPendente';
import { chaveDoDia, diaPorExtenso, hora, inicioDoDia, isoComFuso, somarDias } from '../../../src/utils/datas';

const DIAS_VISIVEIS = 5;

// Os três horários da tela agenda-contratacao do Figma.
const HORARIOS = [
  { inicio: 8, fim: 12, rotulo: '08:00 - Período da Manhã' },
  { inicio: 13, fim: 17, rotulo: '13:00 - Período da Tarde' },
  { inicio: 17, fim: 20, rotulo: '17:00 - Fim de tarde' },
] as const;

type Horario = (typeof HORARIOS)[number];

function noDia(chave: string, horaCheia: number): Date {
  const [ano, mes, dia] = chave.split('-').map(Number);
  return new Date(ano, mes - 1, dia, horaCheia);
}

function atendeNoDia(p: PrestadorCatalogo, dia: Date): boolean {
  return p.diasAtendimento.length === 0 || p.diasAtendimento.includes(dia.getDay());
}

// Mesma regra do backend: por dia ou por serviço é o preço; por hora, preço × horas.
function valorEstimado(p: PrestadorCatalogo, horario: Horario): number | null {
  if (p.preco == null) return null;
  return p.unidadePreco === 'HORA' ? p.preco * (horario.fim - horario.inicio) : p.preco;
}

export default function AgendarServico() {
  const router = useRouter();
  const { prestadorId } = useLocalSearchParams<{ prestadorId: string }>();
  const { prestador, erro: erroPrestador } = usePrestador(prestadorId);

  const hoje = inicioDoDia(new Date());
  const [primeiroDia, setPrimeiroDia] = useState(hoje);
  const [dia, setDia] = useState<string | null>(null);
  const [horario, setHorario] = useState<Horario | null>(null);
  const [observacoes, setObservacoes] = useState('');
  const [ocupados, setOcupados] = useState<HorarioOcupado[]>([]);
  const [recarga, setRecarga] = useState(0);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');

  // Horários já ocupados nos dias visíveis.
  useEffect(() => {
    if (!prestadorId) return;
    let ativo = true;
    horariosOcupados(
      prestadorId,
      chaveDoDia(primeiroDia),
      chaveDoDia(somarDias(primeiroDia, DIAS_VISIVEIS - 1))
    )
      .then((lista) => {
        if (ativo) setOcupados(lista);
      })
      .catch(() => {
        // Sem a lista, o backend ainda recusa um horário ocupado ao solicitar.
      });
    return () => {
      ativo = false;
    };
  }, [prestadorId, primeiroDia, recarga]);

  if (!prestador) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScreenHeader title="Selecione Data e Hora" />
        {erroPrestador ? (
          <Text style={styles.vazio}>{erroPrestador}</Text>
        ) : (
          <ActivityIndicator style={styles.loading} color={colors.primary} />
        )}
      </SafeAreaView>
    );
  }

  const p = prestador;
  // Primeiro dia visível em que o profissional atende, até a pessoa escolher outro.
  const diaEscolhido =
    dia ??
    chaveDoDia(
      Array.from({ length: DIAS_VISIVEIS }, (_, i) => somarDias(primeiroDia, i)).find((d) =>
        atendeNoDia(p, d)
      ) ?? primeiroDia
    );

  function indisponivel(h: Horario): boolean {
    const inicio = noDia(diaEscolhido, h.inicio);
    const fim = noDia(diaEscolhido, h.fim);
    if (inicio <= new Date()) return true;
    return ocupados.some((o) => new Date(o.inicio) < fim && new Date(o.fim) > inicio);
  }

  const selecionado = horario && !indisponivel(horario) ? horario : null;

  async function solicitar() {
    if (!selecionado || enviando) return;
    setEnviando(true);
    setErro('');
    try {
      const texto = observacoes.trim();
      await criarAgendamento({
        prestadorId: p.id,
        inicio: isoComFuso(noDia(diaEscolhido, selecionado.inicio)),
        fim: isoComFuso(noDia(diaEscolhido, selecionado.fim)),
        ...(texto ? { observacoes: texto } : {}),
      });
      deixarAviso(`Solicitação enviada! ${p.nome.split(' ')[0]} vai confirmar o horário.`);
      router.navigate({ pathname: '/agenda', params: { aba: 'PENDENTE' } } as Href);
    } catch (error) {
      setErro(mensagemDeErro(error));
      setRecarga((n) => n + 1);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScreenHeader title="Selecione Data e Hora" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.com}>
            Agendamento com <Text style={styles.comNome}>{p.nome}</Text> • {p.servicoPrincipal}
          </Text>

          <SeletorDeDias
            primeiroDia={primeiroDia}
            selecionado={diaEscolhido}
            onSelecionar={(chave) => {
              setDia(chave);
              setHorario(null);
            }}
            onMudarPagina={(novo) => {
              setPrimeiroDia(novo);
              setDia(null);
              setHorario(null);
            }}
            primeiroPermitido={hoje}
            desabilitado={(d) => !atendeNoDia(p, d)}
          />

          <Text style={styles.secao} accessibilityRole="header">
            Horários Disponíveis
          </Text>

          <View accessibilityRole="radiogroup" style={styles.horarios}>
            {HORARIOS.map((h) => {
              const bloqueado = indisponivel(h);
              const ativo = selecionado === h;
              return (
                <TouchableOpacity
                  key={h.inicio}
                  style={[styles.horario, ativo && styles.horarioAtivo, bloqueado && styles.horarioBloqueado]}
                  onPress={() => setHorario(h)}
                  disabled={bloqueado}
                  activeOpacity={0.8}
                  accessibilityRole="radio"
                  accessibilityLabel={`${h.rotulo}${bloqueado ? ', indisponível' : ''}`}
                  accessibilityState={{ checked: ativo, disabled: bloqueado }}
                >
                  <View style={[styles.radio, ativo && styles.radioAtivo]}>
                    {ativo && <View style={styles.radioMiolo} />}
                  </View>
                  <Text style={[styles.horarioTexto, ativo && styles.horarioTextoAtivo, bloqueado && styles.textoBloqueado]}>
                    {h.rotulo}
                  </Text>
                  {bloqueado && <Text style={styles.indisponivel}>Indisponível</Text>}
                </TouchableOpacity>
              );
            })}
          </View>

          {selecionado && (
            <Card>
              <Text style={styles.resumoRotulo}>Período de Atendimento Estimado</Text>
              <Text style={styles.resumoValor}>
                {diaPorExtenso(noDia(diaEscolhido, selecionado.inicio))} das{' '}
                {hora(noDia(diaEscolhido, selecionado.inicio))} às {hora(noDia(diaEscolhido, selecionado.fim))}
              </Text>
              <Text style={[styles.resumoRotulo, styles.espaco]}>Valor estimado</Text>
              <Text style={styles.resumoPreco}>{formatarValor(valorEstimado(p, selecionado))}</Text>
            </Card>
          )}

          <FormInput
            label="Observações para o profissional (opcional)"
            placeholder="Ex.: portão azul, tocar o interfone do apartamento 42."
            value={observacoes}
            onChangeText={setObservacoes}
            multiline
            maxLength={500}
          />

          {!!erro && <Notice tone="error" icon="alert-circle-outline" text={erro} />}

          <Button
            title="Solicitar Agendamento"
            loading={enviando}
            disabled={!selecionado}
            onPress={solicitar}
          />
          <Text style={styles.dica}>
            O profissional recebe sua solicitação e confirma o horário. O pagamento será feito depois,
            pelo app.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
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
  com: {
    fontSize: 13,
    color: colors.textMuted,
  },
  comNome: {
    fontWeight: '700',
    color: colors.text,
  },
  secao: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  horarios: {
    gap: 10,
  },
  horario: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  horarioAtivo: {
    borderColor: colors.primary,
    borderWidth: 1.5,
    backgroundColor: colors.primarySoft,
  },
  horarioBloqueado: {
    backgroundColor: colors.background,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioAtivo: {
    borderColor: colors.primary,
  },
  radioMiolo: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  horarioTexto: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  horarioTextoAtivo: {
    fontWeight: '700',
  },
  textoBloqueado: {
    color: colors.placeholder,
  },
  indisponivel: {
    fontSize: 12,
    color: colors.textMuted,
  },
  resumoRotulo: {
    fontSize: 12,
    color: colors.textMuted,
  },
  resumoValor: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
    marginTop: 4,
  },
  espaco: {
    marginTop: 12,
  },
  resumoPreco: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary,
    marginTop: 4,
  },
  dica: {
    fontSize: 12,
    lineHeight: 17,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
