import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

type Tone = 'warning' | 'error' | 'success';

type NoticeProps = {
  text: string;
  tone?: Tone;
  icon?: keyof typeof Ionicons.glyphMap;
};

const tones: Record<Tone, { fg: string; bg: string; border: string; icon: string }> = {
  warning: {
    fg: colors.warningText,
    bg: colors.warningSoft,
    border: colors.warningBorder,
    icon: colors.warningIcon,
  },
  error: {
    fg: colors.error,
    bg: colors.errorSoft,
    border: colors.errorBorder,
    icon: colors.error,
  },
  success: {
    fg: colors.primary,
    bg: colors.primarySoft,
    border: colors.border,
    icon: colors.primary,
  },
};

export function Notice({ text, tone = 'warning', icon }: NoticeProps) {
  const t = tones[tone];

  return (
    <View style={[styles.box, { backgroundColor: t.bg, borderColor: t.border }]}>
      {!!icon && <Ionicons name={icon} size={16} color={t.icon} />}
      <Text style={[styles.text, { color: t.fg }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },
  text: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
  },
});
