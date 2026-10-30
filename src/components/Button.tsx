import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

type Variant = 'primary' | 'outline' | 'danger';

type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: Variant;
  icon?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  disabled?: boolean;
  compact?: boolean;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  icon,
  loading,
  disabled,
  compact,
  accessibilityHint,
  style,
}: ButtonProps) {
  const v = variants[variant];

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!(disabled || loading), busy: !!loading }}
      // O botão compacto tem 38 de altura; o hitSlop leva a área de toque a 48.
      hitSlop={compact ? { top: 5, bottom: 5 } : undefined}
      style={[
        styles.base,
        compact && styles.compact,
        { backgroundColor: v.bg, borderColor: v.border },
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={v.fg} />
      ) : (
        <>
          {!!icon && (
            <Ionicons name={icon} size={16} color={v.fg} style={styles.icon} />
          )}
          <Text style={[styles.text, compact && styles.textCompact, { color: v.fg }]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const variants: Record<Variant, { bg: string; fg: string; border: string }> = {
  primary: { bg: colors.primary, fg: colors.primaryText, border: colors.primary },
  outline: { bg: colors.surface, fg: colors.primary, border: colors.primary },
  danger: { bg: colors.errorSoft, fg: colors.error, border: colors.errorBorder },
};

const styles = StyleSheet.create({
  base: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  compact: {
    height: 38,
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  disabled: {
    opacity: 0.5,
  },
  icon: {
    marginRight: 8,
  },
  text: {
    fontSize: 14,
    fontWeight: '700',
  },
  textCompact: {
    fontSize: 13,
  },
});
