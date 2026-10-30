import { forwardRef, useState } from 'react';
import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

type FormInputProps = TextInputProps & {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  error?: string;
  loading?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
};

export const FormInput = forwardRef<TextInput, FormInputProps>(
  (
    {
      label,
      icon,
      error,
      loading,
      containerStyle,
      secureTextEntry,
      style,
      ...rest
    },
    ref
  ) => {
    const isPassword = !!secureTextEntry;
    const [hidden, setHidden] = useState(true);

    return (
      <View style={[styles.field, containerStyle]}>
        <Text style={styles.label}>{label}</Text>

        <View style={[styles.inputBox, !!error && styles.inputBoxError]}>
          {!!icon && (
            <Ionicons
              name={icon}
              size={20}
              color={colors.textMuted}
              style={styles.leftIcon}
            />
          )}

          <TextInput
            ref={ref}
            style={[styles.input, style]}
            placeholderTextColor={colors.placeholder}
            secureTextEntry={isPassword && hidden}
            {...rest}
          />

          {!!loading && (
            <ActivityIndicator size="small" color={colors.primary} />
          )}

          {isPassword && (
            <TouchableOpacity
              onPress={() => setHidden((prev) => !prev)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole="button"
              accessibilityLabel={hidden ? 'Mostrar senha' : 'Ocultar senha'}
            >
              <Ionicons
                name={hidden ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color={colors.textMuted}
              />
            </TouchableOpacity>
          )}
        </View>

        {!!error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    );
  }
);

FormInput.displayName = 'FormInput';

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
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
  },
  inputBoxError: {
    borderColor: colors.error,
  },
  leftIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    paddingVertical: 0,
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginTop: 4,
  },
});
