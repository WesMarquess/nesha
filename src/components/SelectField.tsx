import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

type SelectFieldProps = {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  placeholder: string;
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
};

// Campo com aparência de input que abre a lista de opções logo abaixo.
export function SelectField({
  label,
  icon,
  placeholder,
  options,
  value,
  onChange,
  error,
}: SelectFieldProps) {
  const [aberto, setAberto] = useState(false);

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>

      <TouchableOpacity
        style={[styles.box, !!error && styles.boxError]}
        onPress={() => setAberto((prev) => !prev)}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${value || placeholder}`}
        accessibilityHint="Abre a lista de opções"
        accessibilityState={{ expanded: aberto }}
      >
        {!!icon && (
          <Ionicons name={icon} size={20} color={colors.textMuted} style={styles.icon} />
        )}
        <Text style={[styles.value, !value && styles.placeholder]} numberOfLines={1}>
          {value || placeholder}
        </Text>
        <Ionicons
          name={aberto ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={colors.textMuted}
        />
      </TouchableOpacity>

      {aberto && (
        <View style={styles.lista}>
          {options.map((opcao, index) => {
            const selecionada = opcao === value;
            return (
              <TouchableOpacity
                key={opcao}
                style={[styles.opcao, index > 0 && styles.opcaoBorda]}
                onPress={() => {
                  onChange(opcao);
                  setAberto(false);
                }}
                accessibilityRole="button"
                accessibilityState={{ selected: selecionada }}
              >
                <Text style={[styles.opcaoTexto, selecionada && styles.opcaoSelecionada]}>
                  {opcao}
                </Text>
                {selecionada && <Ionicons name="checkmark" size={18} color={colors.primary} />}
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
  },
  boxError: {
    borderColor: colors.error,
  },
  icon: {
    marginRight: 10,
  },
  value: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  placeholder: {
    color: colors.placeholder,
  },
  lista: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  opcao: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
  },
  opcaoBorda: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  opcaoTexto: {
    fontSize: 14,
    color: colors.text,
  },
  opcaoSelecionada: {
    fontWeight: '700',
    color: colors.primary,
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginTop: 4,
  },
});
