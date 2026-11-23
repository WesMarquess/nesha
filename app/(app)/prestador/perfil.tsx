import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Href, useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar } from '../../../src/components/Avatar';
import { BottomNav } from '../../../src/components/BottomNav';
import { Button } from '../../../src/components/Button';
import { Card } from '../../../src/components/Card';
import { Notice } from '../../../src/components/Notice';
import { useAuth } from '../../../src/contexts/AuthContext';
import { formatarValor } from '../../../src/data/agendamentos';
import { useFotoDePerfil } from '../../../src/hooks/useFotoDePerfil';
import { ApiError } from '../../../src/services/api';
import {
  atualizarPrestador,
  dadosEditaveis,
  getPrestadorMe,
  urlFoto,
} from '../../../src/services/auth';
import { colors } from '../../../src/theme/colors';
import type { PrestadorPerfil, UnidadePreco } from '../../../src/types/auth';

const UNIDADES: Record<UnidadePreco, string> = {
  DIA: 'dia',
  HORA: 'hora',
  SERVICO: 'serviço',
};

type Mensagem = { tom: 'success' | 'error'; texto: string };

function mensagemDeErro(error: unknown, padrao: string): string {
  return error instanceof ApiError ? error.message : padrao;
}

// Botão pequeno de texto (Editar, Alterar foto, Editar valor). O hitSlop garante 48 de toque.
function Acao({
  titulo,
  onPress,
  disabled,
  dica,
}: {
  titulo: string;
  onPress: () => void;
  disabled?: boolean;
  dica?: string;
}) {
  return (
    <TouchableOpacity
      style={[styles.acao, disabled && styles.acaoDesativada]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityHint={dica}
      accessibilityState={{ disabled }}
      hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
    >
      <Text style={styles.acaoTexto}>{titulo}</Text>
    </TouchableOpacity>
  );
}

export default function PerfilPrestador() {
  const router = useRouter();
  const { signOut } = useAuth();
  const [perfil, setPerfil] = useState<PrestadorPerfil | null>(null);
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState<Mensagem | null>(null);
  const foto = useFotoDePerfil();
  const [trocandoStatus, setTrocandoStatus] = useState(false);
  const [confirmandoSaida, setConfirmandoSaida] = useState(false);
  const [saindo, setSaindo] = useState(false);

  const carregar = useCallback((sinal: { ativo: boolean }) => {
    getPrestadorMe()
      .then((dados) => {
        if (sinal.ativo) setPerfil(dados);
      })
      .catch((error: unknown) => {
        if (sinal.ativo) {
          setErro(mensagemDeErro(error, 'Não foi possível carregar seu perfil. Tente novamente.'));
        }
      });
  }, []);

  // Recarrega ao voltar da tela de edição.
  useFocusEffect(
    useCallback(() => {
      const sinal = { ativo: true };
      carregar(sinal);
      return () => {
        sinal.ativo = false;
      };
    }, [carregar])
  );

  function tentarDeNovo() {
    setErro('');
    carregar({ ativo: true });
  }

  function editar(campo?: 'sobreMim' | 'preco') {
    router.push({
      pathname: '/prestador/editar-perfil',
      params: campo ? { campo } : {},
    } as Href);
  }

  async function alternarOnline() {
    if (!perfil || trocandoStatus) return;
    setTrocandoStatus(true);
    setMensagem(null);
    try {
      setPerfil(await atualizarPrestador({ ...dadosEditaveis(perfil), online: !perfil.online }));
    } catch (error) {
      setMensagem({
        tom: 'error',
        texto: mensagemDeErro(error, 'Não foi possível mudar seu status. Tente novamente.'),
      });
    } finally {
      setTrocandoStatus(false);
    }
  }

  async function alterarFoto() {
    setMensagem(null);
    try {
      const fotoUrl = await foto.escolher();
      if (fotoUrl) {
        setPerfil((atual) => (atual ? { ...atual, fotoUrl } : atual));
        setMensagem({ tom: 'success', texto: 'Foto de perfil atualizada.' });
      }
    } catch (error) {
      setMensagem({ tom: 'error', texto: (error as Error).message });
    }
  }

  async function handleSair() {
    setSaindo(true);
    try {
      await signOut();
    } finally {
      setSaindo(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title} accessibilityRole="header">
            Painel do Profissional
          </Text>
          {perfil && (
            <>
              <TouchableOpacity
                style={[styles.status, !perfil.online && styles.statusOffline]}
                onPress={alternarOnline}
                disabled={trocandoStatus}
                activeOpacity={0.7}
                accessibilityRole="switch"
                accessibilityLabel="Receber novas solicitações"
                accessibilityState={{ checked: perfil.online, busy: trocandoStatus }}
                hitSlop={{ top: 14, bottom: 14, left: 6, right: 6 }}
              >
                <Text style={[styles.statusTexto, !perfil.online && styles.statusTextoOffline]}>
                  {perfil.online ? 'Online' : 'Offline'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => editar()}
                accessibilityRole="button"
                accessibilityLabel="Editar perfil"
                hitSlop={{ top: 14, bottom: 14, left: 8, right: 8 }}
              >
                <Text style={styles.editar}>Editar</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {!!mensagem && (
          <Notice
            tone={mensagem.tom}
            icon={mensagem.tom === 'success' ? 'checkmark-circle-outline' : 'alert-circle-outline'}
            text={mensagem.texto}
          />
        )}

        {!perfil && !erro && (
          <ActivityIndicator
            style={styles.loading}
            size="large"
            color={colors.primary}
            accessibilityLabel="Carregando perfil"
          />
        )}

        {!!erro && (
          <View style={styles.erro}>
            <Notice tone="error" icon="alert-circle-outline" text={erro} />
            <Button title="Tentar novamente" variant="outline" onPress={tentarDeNovo} />
          </View>
        )}

        {perfil && (
          <>
            <Card style={styles.identity}>
              <Avatar nome={perfil.usuario.nome} size={80} uri={urlFoto(perfil.fotoUrl)} />
              <View style={styles.fotoAcao}>
                {foto.enviando ? (
                  <ActivityIndicator color={colors.primary} accessibilityLabel="Enviando foto" />
                ) : (
                  <Acao
                    titulo="Alterar Foto de Perfil"
                    dica="Abre suas fotos para escolher uma nova"
                    onPress={alterarFoto}
                  />
                )}
              </View>
              <Text style={styles.name}>{perfil.usuario.nome}</Text>
              <Text style={styles.servico}>{perfil.servicoPrincipal}</Text>
            </Card>

            <Card>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Minha Apresentação</Text>
                <TouchableOpacity
                  onPress={() => editar('sobreMim')}
                  accessibilityRole="button"
                  accessibilityLabel="Editar apresentação"
                  hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                >
                  <Ionicons name="create-outline" size={18} color={colors.primary} />
                </TouchableOpacity>
              </View>
              <Text style={perfil.sobreMim ? styles.texto : styles.vazio}>
                {perfil.sobreMim
                  ? `"${perfil.sobreMim}"`
                  : 'Você ainda não escreveu sua apresentação.'}
              </Text>
            </Card>

            <Card style={styles.config}>
              <Text style={styles.cardTitle}>Configurações de Serviço</Text>

              <View>
                <Text style={styles.linhaLabel}>Categorias Ativas</Text>
                <View style={styles.chips}>
                  <View style={styles.chip}>
                    <Text style={styles.chipText}>{perfil.servicoPrincipal}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.precoLinha}>
                <View style={styles.flex}>
                  <Text style={styles.linhaLabel}>Preço Médio Estimado</Text>
                  <Text style={perfil.preco != null ? styles.preco : styles.vazioValor}>
                    {perfil.preco != null
                      ? `${formatarValor(perfil.preco)} / ${UNIDADES[perfil.unidadePreco]}`
                      : 'A definir'}
                  </Text>
                </View>
                <Acao titulo="Editar Valor" onPress={() => editar('preco')} />
              </View>

              <View style={styles.divider} />

              <View>
                <Text style={styles.linhaLabel}>Minha cidade e regiões</Text>
                <Text style={styles.linhaValor}>{perfil.areaAtendimento}</Text>
              </View>
            </Card>
          </>
        )}

        {confirmandoSaida ? (
          <View style={styles.confirm}>
            <Notice
              tone="error"
              icon="log-out-outline"
              text="Tem certeza que deseja sair da sua conta?"
            />
            <View style={styles.confirmButtons}>
              <Button
                title="Cancelar"
                variant="outline"
                style={styles.flex}
                disabled={saindo}
                onPress={() => setConfirmandoSaida(false)}
              />
              <Button
                title="Sair"
                variant="danger"
                style={styles.flex}
                loading={saindo}
                onPress={handleSair}
              />
            </View>
          </View>
        ) : (
          <Button
            title="Sair da conta"
            variant="danger"
            icon="log-out-outline"
            onPress={() => setConfirmandoSaida(true)}
          />
        )}
      </ScrollView>

      <BottomNav active="perfil" area="prestador" />
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
  content: {
    padding: 16,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    flex: 1,
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },
  status: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: colors.primary,
  },
  statusOffline: {
    backgroundColor: colors.border,
  },
  statusTexto: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primaryText,
  },
  statusTextoOffline: {
    color: colors.text,
  },
  editar: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  loading: {
    marginVertical: 32,
  },
  erro: {
    gap: 12,
  },
  identity: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  fotoAcao: {
    marginTop: 12,
    minHeight: 26,
    justifyContent: 'center',
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginTop: 12,
    textAlign: 'center',
  },
  servico: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
  },
  texto: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
  },
  vazio: {
    fontSize: 13,
    color: colors.textMuted,
  },
  config: {
    gap: 12,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: colors.primarySoft,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  precoLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  preco: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary,
    marginTop: 2,
  },
  vazioValor: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textMuted,
    marginTop: 2,
  },
  acao: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: colors.primarySoft,
  },
  acaoDesativada: {
    opacity: 0.6,
  },
  acaoTexto: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  linhaLabel: {
    fontSize: 12,
    color: colors.textMuted,
  },
  linhaValor: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginTop: 2,
  },
  confirm: {
    gap: 12,
  },
  confirmButtons: {
    flexDirection: 'row',
    gap: 12,
  },
});
