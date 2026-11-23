import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Href, usePathname, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';

type Aba = 'catalogo' | 'agenda' | 'perfil';

type Item = {
  key: Aba;
  label: string;
  href: string;
  icon: keyof typeof Ionicons.glyphMap;
};

// O prestador não contrata serviços, então não tem a aba Catálogo.
const ITENS: Record<'cliente' | 'prestador', Item[]> = {
  cliente: [
    { key: 'catalogo', label: 'Catálogo', href: '/home', icon: 'grid-outline' },
    { key: 'agenda', label: 'Agenda', href: '/agenda', icon: 'calendar-outline' },
    { key: 'perfil', label: 'Perfil', href: '/perfil', icon: 'person-outline' },
  ],
  prestador: [
    { key: 'agenda', label: 'Agenda', href: '/prestador/agenda', icon: 'calendar-outline' },
    { key: 'perfil', label: 'Perfil', href: '/prestador/perfil', icon: 'person-outline' },
  ],
};

type BottomNavProps = {
  active: Aba;
  area?: 'cliente' | 'prestador';
};

export function BottomNav({ active, area = 'cliente' }: BottomNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const items = ITENS[area];

  return (
    <View
      style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 8) }]}
      accessibilityRole="tablist"
    >
      {items.map((item) => {
        const selected = item.key === active;
        const color = selected ? colors.primary : colors.textMuted;

        return (
          <TouchableOpacity
            key={item.key}
            style={styles.item}
            activeOpacity={0.7}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            // Compara com a rota, não com a aba ativa: em telas internas (ex.:
            // Novas Solicitações) a aba Agenda fica marcada e precisa voltar à agenda.
            onPress={() => {
              if (pathname !== item.href) {
                router.replace(item.href as Href);
              }
            }}
          >
            <Ionicons name={item.icon} size={22} color={color} />
            <Text style={[styles.label, { color }, selected && styles.labelActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  label: {
    fontSize: 11,
  },
  labelActive: {
    fontWeight: '700',
  },
});
