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
import { Href, useRouter } from 'expo-router';
import { FormInput } from './FormInput';
import { Notice } from './Notice';
import { useAuth } from '../contexts/AuthContext';
import { ApiError } from '../services/api';
import { colors } from '../theme/colors';
import type { Perfil } from '../types/auth';
import { validateEmail, validateSenhaLogin } from '../utils/validators';

type Errors = {
  email?: string;
  senha?: string;
};

type TelaLoginProps = {
  perfil: Perfil;
  tag: string;
  titulo: string;
  subtitulo: string;
  botaoEntrar: string;
  rotuloSenha: string;
  placeholderSenha: string;
  botaoCadastro: string;
  cadastroHref: Href;
  trocaTexto: string;
  trocaLink: string;
  trocaHref: Href;
  // Mensagem de sucesso mostrada ao voltar do cadastro.
  aviso?: string;
};

function showComingSoon(feature: string) {
  Alert.alert('Em breve', `${feature} ainda não está disponível.`);
}

// Formulário de login comum às Áreas do Cliente e do Prestador.
export function TelaLogin({
  perfil,
  tag,
  titulo,
  subtitulo,
  botaoEntrar,
  rotuloSenha,
  placeholderSenha,
  botaoCadastro,
  cadastroHref,
  trocaTexto,
  trocaLink,
  trocaHref,
  aviso,
}: TelaLoginProps) {
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
      await signIn(email.trim().toLowerCase(), senha, perfil);
      // Não precisa navegar aqui: com a sessão criada, o layout de (auth)
      // redireciona para a área do perfil automaticamente.
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
            <Text
              style={[styles.logoTag, perfil === 'PRESTADOR' && styles.logoTagPrestador]}
            >
              {tag}
            </Text>
          </View>

          <Text style={styles.title}>{titulo}</Text>
          <Text style={styles.subtitle}>{subtitulo}</Text>

          {!!aviso && (
            <View style={styles.aviso}>
              <Notice tone="success" icon="checkmark-circle-outline" text={aviso} />
            </View>
          )}

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
            label={rotuloSenha}
            icon="lock-closed-outline"
            placeholder={placeholderSenha}
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
            accessibilityLabel={botaoEntrar}
            accessibilityState={{ disabled: submitting, busy: submitting }}
          >
            {submitting ? (
              <ActivityIndicator color={colors.primaryText} />
            ) : (
              <Text style={styles.primaryButtonText}>{botaoEntrar}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push(cadastroHref)}
            activeOpacity={0.85}
            accessibilityRole="button"
          >
            <Text style={styles.secondaryButtonText}>{botaoCadastro}</Text>
          </TouchableOpacity>

          <View style={styles.providerRow}>
            <Text style={styles.providerText}>{trocaTexto} </Text>
            <TouchableOpacity
              onPress={() => router.replace(trocaHref)}
              accessibilityRole="button"
              accessibilityLabel={trocaLink.replace(' →', '')}
              hitSlop={{ top: 12, bottom: 12 }}
            >
              <Text style={styles.link}>{trocaLink}</Text>
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
  logoTagPrestador: {
    color: colors.prestadorTag,
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
  aviso: {
    marginTop: -12,
    marginBottom: 20,
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
