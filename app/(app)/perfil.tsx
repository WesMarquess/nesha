import { Ionicons } from '@expo/vector-icons';
import { Href, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar } from '../../src/components/Avatar';
import { BottomNav } from '../../src/components/BottomNav';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { Notice } from '../../src/components/Notice';
import { StatusBadge } from '../../src/components/StatusBadge';
import { useAuth } from '../../src/contexts/AuthContext';
import { Agendamento, formatarValor } from '../../src/data/agendamentos';
import { useAgendamentos, useRecarregarAoFocar } from '../../src/data/useAgendamentos';
import { getClienteMe, urlFoto } from '../../src/services/auth';
import { colors } from '../../src/theme/colors';

type MenuItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  hint?: string;
  onPress: () => void;
};

// Linha de menu com ícone, texto e seta. A altura mínima garante área de toque de 48.
function MenuItem({ icon, label, hint, onPress }: MenuItemProps) {
  return (
    <TouchableOpacity
      style={styles.menuItem}
      activeOpacity={0.7}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={hint}
    >
      <View style={styles.menuIcon}>
        <Ionicons name={icon} size={18} color={colors.primary} />
      </View>
      <Text style={styles.menuLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

// Linha do "Histórico de Serviços" do Figma; abre o detalhe do agendamento.
function ItemHistorico({ item, onPress }: { item: Agendamento; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={styles.historicoItem}
      activeOpacity={0.7}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${item.servico} com ${item.prestador.nome}, ${item.dataCurta} às ${item.horarioInicio}, ${formatarValor(item.valor)}, finalizado`}
    >
      <View style={styles.historicoIcone}>
        <Ionicons name="checkmark-done-outline" size={18} color={colors.primary} />
      </View>
      <View style={styles.historicoInfo}>
        <Text style={styles.historicoServico}>{item.servico}</Text>
        <Text style={styles.historicoDetalhe}>
          {item.prestador.nome} • {item.dataCurta} • {item.horarioInicio}
        </Text>
      </View>
      <View style={styles.historicoDireita}>
        <Text style={styles.historicoValor}>{formatarValor(item.valor)}</Text>
        <Text style={styles.historicoStatus}>Finalizado</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function Perfil() {
  const router = useRouter();
  const { usuario, signOut } = useAuth();
  const agendamentos = useAgendamentos();
  useRecarregarAoFocar();

  const [confirmandoSaida, setConfirmandoSaida] = useState(false);
  const [saindo, setSaindo] = useState(false);
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  const [desde, setDesde] = useState<number | null>(null);

  // Recarrega ao voltar das configurações, onde a foto pode ter mudado.
  useFocusEffect(
    useCallback(() => {
      let ativo = true;
      getClienteMe()
        .then((dados) => {
          if (ativo) {
            setFotoUrl(dados.fotoUrl);
            setDesde(dados.desde ?? null);
          }
        })
        .catch(() => {
          // Sem a foto, o avatar mostra as iniciais.
        });
      return () => {
        ativo = false;
      };
    }, [])
  );

  // Só para exibição (não decidem nenhuma ação permitida).
  // Serviço ativo: o próximo confirmado. Histórico: os concluídos, do mais recente ao mais antigo.
  const servicoAtivo = agendamentos
    .filter((a) => a.status === 'CONFIRMADO')
    .sort((a, b) => a.inicio.getTime() - b.inicio.getTime())[0];
  const historico = agendamentos
    .filter((a) => a.status === 'CONCLUIDO')
    .sort((a, b) => b.inicio.getTime() - a.inicio.getTime());
  const abrir = (item: Agendamento) => router.push(`/agendamento/${item.id}` as Href);

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
        <Text style={styles.title} accessibilityRole="header">
          Meu Perfil
        </Text>

        {/* Identificação */}
        <Card style={styles.identity}>
          <TouchableOpacity
            style={styles.config}
            onPress={() => router.push('/configuracoes' as Href)}
            accessibilityRole="button"
            accessibilityLabel="Configurações do perfil"
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Ionicons name="settings-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
          <Avatar nome={usuario?.nome ?? '?'} size={80} uri={urlFoto(fotoUrl)} />
          <Text style={styles.name}>{usuario?.nome ?? 'Usuário'}</Text>
          {desde !== null && <Text style={styles.email}>Cliente Nesha desde {desde}</Text>}
          <Text style={styles.email}>{usuario?.email}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Cliente</Text>
          </View>
        </Card>

        {/* Serviço ativo (Figma: perfil-cliente) */}
        {servicoAtivo && (
          <View style={styles.secao}>
            <Text style={styles.secaoTitulo} accessibilityRole="header">
              Serviço Ativo
            </Text>
            <Card style={styles.ativo}>
              <View style={styles.ativoTopo}>
                <Text style={styles.ativoServico}>{servicoAtivo.servico}</Text>
                <StatusBadge status={servicoAtivo.status} />
              </View>
              <Text style={styles.ativoLinha}>
                Profissional: <Text style={styles.ativoDestaque}>{servicoAtivo.prestador.nome}</Text>
              </Text>
              <Text style={styles.ativoLinha}>
                Data:{' '}
                <Text style={styles.ativoDestaque}>
                  {servicoAtivo.dataCurta} • {servicoAtivo.horarioInicio}
                </Text>
              </Text>
              <View style={styles.ativoRodape}>
                <Text style={styles.ativoValor}>{formatarValor(servicoAtivo.valor)}</Text>
                <TouchableOpacity
                  style={styles.ativoAcao}
                  onPress={() => abrir(servicoAtivo)}
                  accessibilityRole="button"
                  accessibilityLabel={`Acompanhar ${servicoAtivo.servico} com ${servicoAtivo.prestador.nome}`}
                  hitSlop={{ top: 12, bottom: 12 }}
                >
                  <Text style={styles.ativoAcaoTexto}>Acompanhar</Text>
                  <Ionicons name="arrow-forward" size={16} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </Card>
          </View>
        )}

        {/* Histórico de serviços concluídos */}
        <View style={styles.secao}>
          <Text style={styles.secaoTitulo} accessibilityRole="header">
            Histórico de Serviços
          </Text>
          <Card style={styles.menu}>
            {historico.length === 0 ? (
              <Text style={styles.vazio}>Seus serviços concluídos aparecem aqui.</Text>
            ) : (
              historico.map((item, index) => (
                <View key={item.id}>
                  {index > 0 && <View style={styles.menuDivider} />}
                  <ItemHistorico item={item} onPress={() => abrir(item)} />
                </View>
              ))
            )}
          </Card>
        </View>

        {/* Atalhos */}
        <Card style={styles.menu}>
          <MenuItem
            icon="calendar-outline"
            label="Meus agendamentos"
            hint="Abre a sua agenda"
            onPress={() => router.replace('/agenda' as Href)}
          />
          <View style={styles.menuDivider} />
          <MenuItem
            icon="grid-outline"
            label="Contratar um serviço"
            hint="Abre o catálogo de serviços"
            onPress={() => router.replace('/home' as Href)}
          />
        </Card>

        {/* Sair, com confirmação para evitar toque acidental */}
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
                style={styles.confirmButton}
                disabled={saindo}
                onPress={() => setConfirmandoSaida(false)}
              />
              <Button
                title="Sair"
                variant="danger"
                style={styles.confirmButton}
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

      <BottomNav active="perfil" />
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
    gap: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },
  identity: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  config: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginTop: 12,
    textAlign: 'center',
  },
  email: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
  badge: {
    marginTop: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: colors.primarySoft,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  secao: {
    gap: 8,
  },
  secaoTitulo: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  ativo: {
    gap: 6,
    borderColor: colors.primary,
    borderWidth: 1.5,
  },
  ativoTopo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  ativoServico: {
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
  },
  ativoLinha: {
    fontSize: 13,
    color: colors.textMuted,
  },
  ativoDestaque: {
    color: colors.text,
    fontWeight: '600',
  },
  ativoRodape: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  ativoValor: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary,
  },
  ativoAcao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ativoAcaoTexto: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  vazio: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: 16,
  },
  historicoItem: {
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  historicoIcone: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historicoInfo: {
    flex: 1,
  },
  historicoServico: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  historicoDetalhe: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  historicoDireita: {
    alignItems: 'flex-end',
  },
  historicoValor: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  historicoStatus: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 2,
  },
  menu: {
    paddingVertical: 4,
  },
  menuItem: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  menuDivider: {
    height: 1,
    backgroundColor: colors.border,
  },
  confirm: {
    gap: 12,
  },
  confirmButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  confirmButton: {
    flex: 1,
  },
});
