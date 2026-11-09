import { Ionicons } from '@expo/vector-icons';
import { Href, useRouter } from 'expo-router';
import { useState } from 'react';
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
import { useAuth } from '../../src/contexts/AuthContext';
import { useAgendamentos } from '../../src/data/useAgendamentos';
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

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <View
      style={styles.stat}
      accessible
      accessibilityLabel={`${value} ${label}`}
    >
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function Perfil() {
  const router = useRouter();
  const { usuario, signOut } = useAuth();
  const agendamentos = useAgendamentos();

  const [confirmandoSaida, setConfirmandoSaida] = useState(false);
  const [saindo, setSaindo] = useState(false);

  // Contagens só para exibição (não decidem nenhuma ação permitida).
  const proximos = agendamentos.filter((a) => a.status === 'CONFIRMADO').length;
  const pendentes = agendamentos.filter((a) => a.status === 'PENDENTE').length;
  const concluidos = agendamentos.filter((a) => a.status === 'CONCLUIDO').length;

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
          <Avatar nome={usuario?.nome ?? '?'} size={80} />
          <Text style={styles.name}>{usuario?.nome ?? 'Usuário'}</Text>
          <Text style={styles.email}>{usuario?.email}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Cliente</Text>
          </View>
        </Card>

        {/* Resumo dos agendamentos */}
        <Card style={styles.stats}>
          <Stat value={proximos} label="Próximos" />
          <View style={styles.statDivider} />
          <Stat value={pendentes} label="Pendentes" />
          <View style={styles.statDivider} />
          <Stat value={concluidos} label="Concluídos" />
        </Card>

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
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.border,
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
