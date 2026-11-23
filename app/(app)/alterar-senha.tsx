import { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../src/components/Button';
import { FormInput } from '../../src/components/FormInput';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { ApiError } from '../../src/services/api';
import { alterarSenha } from '../../src/services/auth';
import { colors } from '../../src/theme/colors';
import { deixarAviso } from '../../src/utils/avisoPendente';
import { validateRepetirSenha, validateSenha } from '../../src/utils/validators';

type Campo = 'senhaAtual' | 'novaSenha' | 'repetirSenha';
type Erros = Partial<Record<Campo, string>>;

function validar(campo: Campo, v: Record<Campo, string>): string {
  switch (campo) {
    case 'senhaAtual':
      return v.senhaAtual ? '' : 'Informe sua senha atual.';
    case 'novaSenha':
      return validateSenha(v.novaSenha);
    case 'repetirSenha':
      return validateRepetirSenha(v.novaSenha, v.repetirSenha);
  }
}

export default function AlterarSenha() {
  const router = useRouter();
  const [valores, setValores] = useState<Record<Campo, string>>({
    senhaAtual: '',
    novaSenha: '',
    repetirSenha: '',
  });
  const [erros, setErros] = useState<Erros>({});
  const [erroEnvio, setErroEnvio] = useState('');
  const [salvando, setSalvando] = useState(false);

  const novaRef = useRef<TextInput>(null);
  const repetirRef = useRef<TextInput>(null);

  function mudar(campo: Campo, valor: string) {
    const proximo = { ...valores, [campo]: valor };
    setValores(proximo);
    if (erros[campo]) {
      setErros((prev) => ({ ...prev, [campo]: validar(campo, proximo) }));
    }
  }

  function sair(campo: Campo) {
    setErros((prev) => ({ ...prev, [campo]: validar(campo, valores) }));
  }

  async function salvar() {
    if (salvando) return;

    const proximos: Erros = {};
    (Object.keys(valores) as Campo[]).forEach((c) => {
      const msg = validar(c, valores);
      if (msg) proximos[c] = msg;
    });
    setErros(proximos);
    if (Object.keys(proximos).length > 0) return;

    setSalvando(true);
    setErroEnvio('');
    try {
      await alterarSenha({ senhaAtual: valores.senhaAtual, novaSenha: valores.novaSenha });
      deixarAviso('Senha alterada com sucesso.');
      router.back();
    } catch (error) {
      if (error instanceof ApiError) {
        const campos = error.campos ?? {};
        setErros((prev) => ({
          ...prev,
          ...(campos.senhaAtual ? { senhaAtual: campos.senhaAtual } : {}),
          ...(campos.novaSenha ? { novaSenha: campos.novaSenha } : {}),
        }));
        setErroEnvio(error.message);
      } else {
        setErroEnvio('Não foi possível alterar a senha. Tente novamente.');
      }
    } finally {
      setSalvando(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScreenHeader title="Alterar senha" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <FormInput
            label="Senha atual"
            icon="lock-closed-outline"
            placeholder="Sua senha atual"
            value={valores.senhaAtual}
            onChangeText={(t) => mudar('senhaAtual', t)}
            onBlur={() => sair('senhaAtual')}
            error={erros.senhaAtual}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="current-password"
            returnKeyType="next"
            onSubmitEditing={() => novaRef.current?.focus()}
          />
          <FormInput
            ref={novaRef}
            label="Nova senha"
            icon="lock-closed-outline"
            placeholder="Sua nova senha forte"
            value={valores.novaSenha}
            onChangeText={(t) => mudar('novaSenha', t)}
            onBlur={() => sair('novaSenha')}
            error={erros.novaSenha}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="new-password"
            returnKeyType="next"
            onSubmitEditing={() => repetirRef.current?.focus()}
          />
          <FormInput
            ref={repetirRef}
            label="Repetir nova senha"
            icon="lock-closed-outline"
            placeholder="Repita a nova senha"
            value={valores.repetirSenha}
            onChangeText={(t) => mudar('repetirSenha', t)}
            onBlur={() => sair('repetirSenha')}
            error={erros.repetirSenha}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="new-password"
            returnKeyType="done"
            onSubmitEditing={salvar}
          />

          <Text style={styles.dica}>
            A senha deve ter ao menos 8 caracteres, com letra maiúscula, minúscula, número e
            caractere especial.
          </Text>

          {!!erroEnvio && <Text style={styles.erroEnvio}>{erroEnvio}</Text>}

          <Button title="Alterar senha" loading={salvando} onPress={salvar} />
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
    padding: 16,
    paddingBottom: 32,
  },
  dica: {
    fontSize: 12,
    lineHeight: 17,
    color: colors.textMuted,
    marginBottom: 20,
  },
  erroEnvio: {
    fontSize: 13,
    color: colors.error,
    textAlign: 'center',
    marginBottom: 12,
  },
});
