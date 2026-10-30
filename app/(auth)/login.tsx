import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { FormInput } from '../../src/components/FormInput';
import { useAuth } from '../../src/contexts/AuthContext';
import { ApiError } from '../../src/services/api';
import { colors } from '../../src/theme/colors';
import { validateEmail, validateSenhaLogin } from '../../src/utils/validators';

type Errors = {
  email?: string;
  senha?: string;
};

function showComingSoon(feature: string) {
  Alert.alert('Em breve', `${feature} ainda não está disponível.`);
}

export default function Login() {
  const router = useRouter();
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const senhaRef = useRef<TextInput>(null);

  async function handleSubmit() {
    if (submitting) {
      return;
    }

    const nextErrors: Errors = {
      email: validateEmail(email),
      senha: validateSenhaLogin(senha),
    };

    setErrors(nextErrors);
    setFormError('');

    if (nextErrors.email || nextErrors.senha) {
      return;
    }

    setSubmitting(true);

    try {
      await signIn(email.trim().toLowerCase(), senha);
      // Não precisa navegar aqui: com a sessão criada, o layout de (auth)
      // redireciona para a home automaticamente.
    } catch (error) {
      if (error instanceof ApiError) {
        const fieldErrors: Errors = {
          email: error.campos?.email,
          senha: error.campos?.senha,
        };

        if (fieldErrors.email || fieldErrors.senha) {
          setErrors(fieldErrors);
        } else {
          setFormError(error.message);
        }
      } else {
        setFormError('Ocorreu um erro inesperado. Tente novamente.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* TODO: trocar pelo logo exportado do Figma (Image com require) */}
          <View style={styles.logoRow}>
            <Text style={styles.logoText}>Nesha</Text>
            <Text style={styles.logoTag}>Cliente</Text>
          </View>

          <Text style={styles.title}>
            Encontre o cuidado que sua casa merece
          </Text>
          <Text style={styles.subtitle}>
            Área do Cliente • Faça login ou crie sua conta para contratar
            profissionais qualificados.
          </Text>

          <FormInput
            label="E-mail"
            icon="mail-outline"
            placeholder="seu@email.com"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (errors.email) {
                setErrors((prev) => ({ ...prev, email: validateEmail(text) }));
              }
            }}
            onBlur={() =>
              setErrors((prev) => ({ ...prev, email: validateEmail(email) }))
            }
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            returnKeyType="next"
            onSubmitEditing={() => senhaRef.current?.focus()}
          />

          <FormInput
            ref={senhaRef}
            label="Senha"
            icon="lock-closed-outline"
            placeholder="Sua senha"
            value={senha}
            onChangeText={(text) => {
              setSenha(text);
              if (errors.senha) {
                setErrors((prev) => ({
                  ...prev,
                  senha: validateSenhaLogin(text),
                }));
              }
            }}
            error={errors.senha}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password"
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
          />

          <TouchableOpacity
            style={styles.forgotRow}
            onPress={() => showComingSoon('A recuperação de senha')}
            accessibilityRole="button"
          >
            <Text style={styles.link}>Esqueceu a senha?</Text>
          </TouchableOpacity>

          {!!formError && <Text style={styles.formError}>{formError}</Text>}

          <TouchableOpacity
            style={[styles.primaryButton, submitting && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Entrar como cliente"
            accessibilityState={{ disabled: submitting, busy: submitting }}
          >
            {submitting ? (
              <ActivityIndicator color={colors.primaryText} />
            ) : (
              <Text style={styles.primaryButtonText}>Entrar como Cliente</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push('/cadastro')}
            activeOpacity={0.85}
            accessibilityRole="button"
          >
            <Text style={styles.secondaryButtonText}>Criar Conta Grátis</Text>
          </TouchableOpacity>

          <View style={styles.providerRow}>
            <Text style={styles.providerText}>É um profissional parceiro? </Text>
            <TouchableOpacity
              onPress={() => showComingSoon('A Área do Prestador')}
              accessibilityRole="button"
              accessibilityLabel="Área do Prestador"
              hitSlop={{ top: 12, bottom: 12 }}
            >
              <Text style={styles.link}>Área do Prestador →</Text>
            </TouchableOpacity>
          </View>
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
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.primary,
  },
  logoTag: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
    marginLeft: 6,
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 30,
    color: colors.text,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
    marginTop: 6,
    marginBottom: 28,
  },
  forgotRow: {
    alignSelf: 'flex-end',
    marginTop: 2,
    marginBottom: 24,
  },
  link: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  formError: {
    fontSize: 13,
    color: colors.error,
    textAlign: 'center',
    marginBottom: 12,
  },
  primaryButton: {
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primaryText,
  },
  secondaryButton: {
    height: 52,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
  },
  providerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 28,
  },
  providerText: {
    fontSize: 12,
    color: colors.textMuted,
  },
});
