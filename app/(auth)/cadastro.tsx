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
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { FormInput } from '../../src/components/FormInput';
import { ApiError } from '../../src/services/api';
import { register } from '../../src/services/auth';
import { buscarCep, CepNotFoundError } from '../../src/services/viacep';
import { colors } from '../../src/theme/colors';
import type { RegisterRequest } from '../../src/types/auth';
import { maskCEP, maskCPF, maskPhone, onlyDigits } from '../../src/utils/masks';
import {
  validateBairro,
  validateCEP,
  validateCidade,
  validateCPF,
  validateEmail,
  validateLogradouro,
  validateNome,
  validateNumero,
  validateRepetirSenha,
  validateSenha,
  validateTelefone,
  validateUF,
} from '../../src/utils/validators';

type Field =
  | 'nome'
  | 'cpf'
  | 'telefone'
  | 'cep'
  | 'logradouro'
  | 'numero'
  | 'complemento'
  | 'bairro'
  | 'cidade'
  | 'uf'
  | 'email'
  | 'senha'
  | 'repetirSenha';

type Values = Record<Field, string>;
type Errors = Partial<Record<Field, string>>;

const initialValues: Values = {
  nome: '',
  cpf: '',
  telefone: '',
  cep: '',
  logradouro: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  uf: '',
  email: '',
  senha: '',
  repetirSenha: '',
};

// Chave do erro devolvido pelo backend (caminho no JSON) -> campo do formulário.
const CAMPOS_API: Record<string, Field> = {
  nome: 'nome',
  cpf: 'cpf',
  telefone: 'telefone',
  email: 'email',
  senha: 'senha',
  'endereco.cep': 'cep',
  'endereco.logradouro': 'logradouro',
  'endereco.numero': 'numero',
  'endereco.complemento': 'complemento',
  'endereco.bairro': 'bairro',
  'endereco.cidade': 'cidade',
  'endereco.uf': 'uf',
};

// Converte o formulário (com máscaras) no corpo de POST /clientes.
function buildRegisterPayload(values: Values): RegisterRequest {
  const complemento = values.complemento.trim();

  return {
    nome: values.nome.trim(),
    cpf: onlyDigits(values.cpf),
    telefone: onlyDigits(values.telefone),
    email: values.email.trim().toLowerCase(),
    senha: values.senha,
    endereco: {
      cep: onlyDigits(values.cep),
      logradouro: values.logradouro.trim(),
      numero: values.numero.trim(),
      ...(complemento ? { complemento } : {}),
      bairro: values.bairro.trim(),
      cidade: values.cidade.trim(),
      uf: values.uf.trim().toUpperCase(),
    },
  };
}

function validateField(field: Field, values: Values): string {
  switch (field) {
    case 'nome':
      return validateNome(values.nome);
    case 'cpf':
      return validateCPF(values.cpf);
    case 'telefone':
      return validateTelefone(values.telefone);
    case 'cep':
      return validateCEP(values.cep);
    case 'logradouro':
      return validateLogradouro(values.logradouro);
    case 'numero':
      return validateNumero(values.numero);
    case 'complemento':
      return ''; // opcional
    case 'bairro':
      return validateBairro(values.bairro);
    case 'cidade':
      return validateCidade(values.cidade);
    case 'uf':
      return validateUF(values.uf);
    case 'email':
      return validateEmail(values.email);
    case 'senha':
      return validateSenha(values.senha);
    case 'repetirSenha':
      return validateRepetirSenha(values.senha, values.repetirSenha);
  }
}

export default function Cadastro() {
  const [values, setValues] = useState<Values>(initialValues);
  const [errors, setErrors] = useState<Errors>({});
  const [accepted, setAccepted] = useState(false);
  const [termsError, setTermsError] = useState('');
  const [loadingCep, setLoadingCep] = useState(false);
  const [cepLookupError, setCepLookupError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const router = useRouter();

  // Guarda o último CEP consultado para ignorar respostas antigas.
  const lastCepRef = useRef('');

  const cpfRef = useRef<TextInput>(null);
  const telefoneRef = useRef<TextInput>(null);
  const cepRef = useRef<TextInput>(null);
  const logradouroRef = useRef<TextInput>(null);
  const numeroRef = useRef<TextInput>(null);
  const complementoRef = useRef<TextInput>(null);
  const bairroRef = useRef<TextInput>(null);
  const cidadeRef = useRef<TextInput>(null);
  const ufRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const senhaRef = useRef<TextInput>(null);
  const repetirSenhaRef = useRef<TextInput>(null);

  function handleChange(field: Field, value: string) {
    const next = { ...values, [field]: value };
    setValues(next);

    // Se o campo já estava com erro, revalida enquanto a pessoa corrige.
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: validateField(field, next) }));
    }

    // Mudou a senha: atualiza a checagem do "Repetir senha" se já houve erro lá.
    if (field === 'senha' && errors.repetirSenha) {
      setErrors((prev) => ({
        ...prev,
        repetirSenha: validateRepetirSenha(value, next.repetirSenha),
      }));
    }
  }

  function handleBlur(field: Field) {
    setErrors((prev) => ({ ...prev, [field]: validateField(field, values) }));
  }

  async function lookupCep(cep: string) {
    lastCepRef.current = cep;
    setLoadingCep(true);
    setCepLookupError('');

    try {
      const endereco = await buscarCep(cep);

      if (lastCepRef.current !== cep) {
        return;
      }

      setValues((prev) => ({
        ...prev,
        logradouro: endereco.logradouro,
        bairro: endereco.bairro,
        cidade: endereco.cidade,
        uf: endereco.uf,
      }));
      setErrors((prev) => ({
        ...prev,
        cep: '',
        logradouro: '',
        bairro: '',
        cidade: '',
        uf: '',
      }));

      if (endereco.logradouro) {
        numeroRef.current?.focus();
      } else {
        logradouroRef.current?.focus();
      }
    } catch (error) {
      if (lastCepRef.current !== cep) {
        return;
      }

      setCepLookupError(
        error instanceof CepNotFoundError
          ? 'CEP não encontrado. Confira o número ou preencha o endereço manualmente.'
          : 'Não foi possível consultar o CEP. Preencha o endereço manualmente.'
      );
    } finally {
      if (lastCepRef.current === cep) {
        setLoadingCep(false);
      }
    }
  }

  function handleCepChange(text: string) {
    const masked = maskCEP(text);
    const digits = onlyDigits(masked);

    handleChange('cep', masked);
    setCepLookupError('');

    if (digits.length === 8) {
      lookupCep(digits);
    } else {
      // Invalida qualquer consulta em andamento.
      lastCepRef.current = '';
      setLoadingCep(false);
    }
  }

  function handleToggleTerms() {
    const next = !accepted;
    setAccepted(next);
    setTermsError(next ? '' : 'Você precisa aceitar os termos para continuar.');
  }

  function handleApiError(error: unknown) {
    if (!(error instanceof ApiError)) {
      setFormError('Ocorreu um erro inesperado. Tente novamente.');
      return;
    }

    const fieldErrors: Errors = {};
    Object.entries(error.campos ?? {}).forEach(([campo, mensagem]) => {
      const field = CAMPOS_API[campo];
      if (field) {
        fieldErrors[field] = mensagem;
      }
    });

    if (Object.keys(fieldErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...fieldErrors }));
    } else {
      setFormError(error.message);
    }
  }

  function goToLogin() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/login');
    }
  }

  async function handleSubmit() {
    if (submitting) {
      return;
    }

    const fields = Object.keys(initialValues) as Field[];
    const nextErrors: Errors = {};

    fields.forEach((field) => {
      const message = validateField(field, values);
      if (message) {
        nextErrors[field] = message;
      }
    });

    setErrors(nextErrors);

    const termsMessage = accepted
      ? ''
      : 'Você precisa aceitar os termos para continuar.';
    setTermsError(termsMessage);

    if (Object.keys(nextErrors).length > 0 || termsMessage) {
      return;
    }

    setSubmitting(true);
    setFormError('');

    try {
      await register(buildRegisterPayload(values));
      Alert.alert('Conta criada!', 'Agora é só entrar com seu e-mail e senha.', [
        { text: 'Entrar', onPress: () => router.replace('/login') },
      ]);
    } catch (error) {
      handleApiError(error);
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

          <Text style={styles.title}>Crie sua conta</Text>
          <Text style={styles.subtitle}>
            Preencha os dados abaixo para contratar os melhores profissionais
            para sua casa.
          </Text>

          <FormInput
            label="Nome Completo"
            icon="person-outline"
            placeholder="Seu nome completo"
            value={values.nome}
            onChangeText={(text) => handleChange('nome', text)}
            onBlur={() => handleBlur('nome')}
            error={errors.nome}
            autoCapitalize="words"
            autoComplete="name"
            returnKeyType="next"
            onSubmitEditing={() => cpfRef.current?.focus()}
          />

          <FormInput
            ref={cpfRef}
            label="CPF"
            icon="document-outline"
            placeholder="000.000.000-00"
            value={values.cpf}
            onChangeText={(text) => handleChange('cpf', maskCPF(text))}
            onBlur={() => handleBlur('cpf')}
            error={errors.cpf}
            keyboardType="number-pad"
            maxLength={14}
            returnKeyType="next"
            onSubmitEditing={() => telefoneRef.current?.focus()}
          />

          <FormInput
            ref={telefoneRef}
            label="Telefone / WhatsApp"
            icon="call-outline"
            placeholder="(11) 99999-9999"
            value={values.telefone}
            onChangeText={(text) => handleChange('telefone', maskPhone(text))}
            onBlur={() => handleBlur('telefone')}
            error={errors.telefone}
            keyboardType="phone-pad"
            maxLength={15}
            returnKeyType="next"
            onSubmitEditing={() => cepRef.current?.focus()}
          />

          <FormInput
            ref={cepRef}
            label="CEP"
            icon="location-outline"
            placeholder="00000-000"
            value={values.cep}
            onChangeText={handleCepChange}
            onBlur={() => handleBlur('cep')}
            error={errors.cep || cepLookupError}
            loading={loadingCep}
            keyboardType="number-pad"
            maxLength={9}
            returnKeyType="next"
            onSubmitEditing={() => logradouroRef.current?.focus()}
          />

          <FormInput
            ref={logradouroRef}
            label="Rua"
            icon="home-outline"
            placeholder="Nome da rua"
            value={values.logradouro}
            onChangeText={(text) => handleChange('logradouro', text)}
            onBlur={() => handleBlur('logradouro')}
            error={errors.logradouro}
            autoCapitalize="words"
            returnKeyType="next"
            onSubmitEditing={() => numeroRef.current?.focus()}
          />

          <View style={styles.row}>
            <FormInput
              ref={numeroRef}
              containerStyle={styles.rowNumero}
              label="Número"
              placeholder="123"
              value={values.numero}
              onChangeText={(text) => handleChange('numero', text)}
              onBlur={() => handleBlur('numero')}
              error={errors.numero}
              maxLength={10}
              returnKeyType="next"
              onSubmitEditing={() => complementoRef.current?.focus()}
            />

            <FormInput
              ref={complementoRef}
              containerStyle={styles.rowComplemento}
              label="Complemento"
              placeholder="Apto, bloco (opcional)"
              value={values.complemento}
              onChangeText={(text) => handleChange('complemento', text)}
              autoCapitalize="words"
              returnKeyType="next"
              onSubmitEditing={() => bairroRef.current?.focus()}
            />
          </View>

          <FormInput
            ref={bairroRef}
            label="Bairro"
            placeholder="Seu bairro"
            value={values.bairro}
            onChangeText={(text) => handleChange('bairro', text)}
            onBlur={() => handleBlur('bairro')}
            error={errors.bairro}
            autoCapitalize="words"
            returnKeyType="next"
            onSubmitEditing={() => cidadeRef.current?.focus()}
          />

          <View style={styles.row}>
            <FormInput
              ref={cidadeRef}
              containerStyle={styles.rowCidade}
              label="Cidade"
              placeholder="Sua cidade"
              value={values.cidade}
              onChangeText={(text) => handleChange('cidade', text)}
              onBlur={() => handleBlur('cidade')}
              error={errors.cidade}
              autoCapitalize="words"
              returnKeyType="next"
              onSubmitEditing={() => ufRef.current?.focus()}
            />

            <FormInput
              ref={ufRef}
              containerStyle={styles.rowUf}
              label="UF"
              placeholder="SP"
              value={values.uf}
              onChangeText={(text) =>
                handleChange('uf', text.toUpperCase().replace(/[^A-Z]/g, ''))
              }
              onBlur={() => handleBlur('uf')}
              error={errors.uf}
              autoCapitalize="characters"
              maxLength={2}
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
            />
          </View>

          <FormInput
            ref={emailRef}
            label="E-mail"
            icon="mail-outline"
            placeholder="seu@email.com"
            value={values.email}
            onChangeText={(text) => handleChange('email', text)}
            onBlur={() => handleBlur('email')}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            returnKeyType="next"
            onSubmitEditing={() => senhaRef.current?.focus()}
          />

          <FormInput
            ref={senhaRef}
            label="Criar Senha"
            icon="lock-closed-outline"
            placeholder="Sua senha forte"
            value={values.senha}
            onChangeText={(text) => handleChange('senha', text)}
            onBlur={() => handleBlur('senha')}
            error={errors.senha}
            secureTextEntry
            autoCapitalize="none"
            returnKeyType="next"
            onSubmitEditing={() => repetirSenhaRef.current?.focus()}
          />

          <FormInput
            ref={repetirSenhaRef}
            label="Repetir senha"
            icon="lock-closed-outline"
            placeholder="Repita sua senha"
            value={values.repetirSenha}
            onChangeText={(text) => handleChange('repetirSenha', text)}
            onBlur={() => handleBlur('repetirSenha')}
            error={errors.repetirSenha}
            secureTextEntry
            autoCapitalize="none"
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
          />

          <View style={styles.termsRow}>
            <TouchableOpacity
              style={[styles.checkbox, accepted && styles.checkboxChecked]}
              onPress={handleToggleTerms}
              activeOpacity={0.7}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: accepted }}
              accessibilityLabel="Li e concordo com os Termos de Uso e a Política de Privacidade"
              // A caixa tem 22 de lado; o hitSlop leva a área de toque a 48.
              hitSlop={{ top: 13, bottom: 13, left: 13, right: 13 }}
            >
              {accepted && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
            </TouchableOpacity>

            <Text style={styles.termsText}>
              Li e concordo com os{' '}
              <Text style={styles.link} onPress={() => {}}>
                Termos de Uso
              </Text>{' '}
              e a{' '}
              <Text style={styles.link} onPress={() => {}}>
                Política de Privacidade
              </Text>{' '}
              da Nesha.
            </Text>
          </View>
          {!!termsError && <Text style={styles.termsError}>{termsError}</Text>}

          {!!formError && <Text style={styles.formError}>{formError}</Text>}

          <TouchableOpacity
            style={[styles.button, submitting && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Criar minha conta Nesha"
            accessibilityState={{ disabled: submitting, busy: submitting }}
          >
            {submitting ? (
              <ActivityIndicator color={colors.primaryText} />
            ) : (
              <Text style={styles.buttonText}>Cria minha conta Nesha</Text>
            )}
          </TouchableOpacity>

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Já tem conta? </Text>
            <TouchableOpacity
              onPress={goToLogin}
              accessibilityRole="button"
              accessibilityLabel="Fazer login"
              hitSlop={{ top: 12, bottom: 12 }}
            >
              <Text style={styles.link}>Fazer Login →</Text>
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
    color: colors.text,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
    marginTop: 4,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  rowNumero: {
    flex: 1,
  },
  rowComplemento: {
    flex: 2,
  },
  rowCidade: {
    flex: 3,
  },
  rowUf: {
    flex: 1,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 4,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 1,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
  },
  termsText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    color: colors.textMuted,
  },
  termsError: {
    fontSize: 12,
    color: colors.error,
    marginTop: 4,
  },
  link: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  button: {
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  formError: {
    fontSize: 13,
    color: colors.error,
    textAlign: 'center',
    marginTop: 12,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primaryText,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
  },
  loginText: {
    fontSize: 12,
    color: colors.textMuted,
  },
});
