import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Href, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';

type Aba = 'catalogo' | 'agenda' | 'perfil';

type BottomNavProps = {
  active: Aba;
  // Cliente: '/agenda'. Prestador: '/prestador/agenda'.
  agendaHref?: string;
};

export function BottomNav({ active, agendaHref = '/agenda' }: BottomNavProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const items: {
    key: Aba;
    label: string;
    href: string;
    icon: keyof typeof Ionicons.glyphMap;
  }[] = [
    { key: 'catalogo', label: 'Catálogo', href: '/home', icon: 'grid-outline' },
    { key: 'agenda', label: 'Agenda', href: agendaHref, icon: 'calendar-outline' },
    { key: 'perfil', label: 'Perfil', href: '/perfil', icon: 'person-outline' },
  ];

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
            onPress={() => {
              if (!selected) {
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
