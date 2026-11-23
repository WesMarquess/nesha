import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../../src/components/Button';
import { FormInput } from '../../../src/components/FormInput';
import { Notice } from '../../../src/components/Notice';
import { ScreenHeader } from '../../../src/components/ScreenHeader';
import { SelectField } from '../../../src/components/SelectField';
import { SERVICOS_PRESTADOR } from '../../../src/data/servicos';
import { ApiError } from '../../../src/services/api';
import {
  atualizarPrestador,
  dadosEditaveis,
  getPrestadorMe,
} from '../../../src/services/auth';
import { colors } from '../../../src/theme/colors';
import type { PrestadorPerfil, UnidadePreco } from '../../../src/types/auth';
import { maskPhone, onlyDigits } from '../../../src/utils/masks';
import { validateNome, validateTelefone } from '../../../src/utils/validators';

const UNIDADES: readonly { key: UnidadePreco; label: string }[] = [
  { key: 'DIA', label: 'Por dia' },
  { key: 'HORA', label: 'Por hora' },
  { key: 'SERVICO', label: 'Por serviço' },
];

type Valores = {
  nome: string;
  telefone: string;
  servicoPrincipal: string;
  areaAtendimento: string;
  sobreMim: string;
  preco: string;
  unidadePreco: UnidadePreco;
};

type Campo = Exclude<keyof Valores, 'unidadePreco'>;
type Erros = Partial<Record<Campo, string>>;

// Chave do erro devolvido pelo backend -> campo do formulário.
const CAMPOS_API: Record<string, Campo> = {
  nome: 'nome',
  telefone: 'telefone',
  servicoPrincipal: 'servicoPrincipal',
  areaAtendimento: 'areaAtendimento',
  sobreMim: 'sobreMim',
  preco: 'preco',
};

function valoresIniciais(perfil: PrestadorPerfil): Valores {
  return {
    nome: perfil.usuario.nome,
    telefone: maskPhone(perfil.telefone),
    servicoPrincipal: perfil.servicoPrincipal,
    areaAtendimento: perfil.areaAtendimento,
    sobreMim: perfil.sobreMim ?? '',
    preco: perfil.preco != null ? perfil.preco.toFixed(2).replace('.', ',') : '',
    unidadePreco: perfil.unidadePreco,
  };
}

// Aceita "130", "130,50" e "1.300,50". Vazio = sem preço definido.
function lerPreco(texto: string): number | null | undefined {
  const limpo = texto.trim();
  if (!limpo) return null;
  const normalizado = limpo.includes(',') ? limpo.replace(/\./g, '').replace(',', '.') : limpo;
  if (!/^\d+(\.\d{1,2})?$/.test(normalizado)) return undefined;
  return Number(normalizado);
}

function validar(campo: Campo, v: Valores): string {
  switch (campo) {
    case 'nome':
      return validateNome(v.nome);
    case 'telefone':
      return validateTelefone(v.telefone);
    case 'servicoPrincipal':
      return v.servicoPrincipal ? '' : 'Escolha seu serviço principal.';
    case 'areaAtendimento':
      return v.areaAtendimento.trim() ? '' : 'Informe onde você atende.';
    case 'sobreMim':
      return '';
    case 'preco': {
      const preco = lerPreco(v.preco);
      if (preco === undefined) return 'Informe um valor como 130 ou 130,50.';
      if (preco !== null && (preco <= 0 || preco > 99999999.99)) return 'Informe um valor maior que zero.';
      return '';
    }
  }
}

export default function EditarPerfilPrestador() {
  const router = useRouter();
  const { campo } = useLocalSearchParams<{ campo?: 'sobreMim' | 'preco' }>();

  const [perfil, setPerfil] = useState<PrestadorPerfil | null>(null);
  const [valores, setValores] = useState<Valores | null>(null);
  const [erros, setErros] = useState<Erros>({});
  const [erroCarga, setErroCarga] = useState('');
  const [erroEnvio, setErroEnvio] = useState('');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    let ativo = true;

    getPrestadorMe()
      .then((dados) => {
        if (!ativo) return;
        setPerfil(dados);
        setValores(valoresIniciais(dados));
      })
      .catch((error: unknown) => {
        if (ativo) {
          setErroCarga(
            error instanceof ApiError ? error.message : 'Não foi possível carregar seu perfil.'
          );
        }
      });

    return () => {
      ativo = false;
    };
  }, []);

  function mudar(c: keyof Valores, valor: string) {
    if (!valores) return;
    const proximo = { ...valores, [c]: valor } as Valores;
    setValores(proximo);
    if (c !== 'unidadePreco' && erros[c]) {
      setErros((prev) => ({ ...prev, [c]: validar(c, proximo) }));
    }
  }

  function sair(c: Campo) {
    if (valores) setErros((prev) => ({ ...prev, [c]: validar(c, valores) }));
  }

  async function salvar() {
    if (!perfil || !valores || salvando) return;

    const proximos: Erros = {};
    (Object.keys(CAMPOS_API) as Campo[]).forEach((c) => {
      const msg = validar(c, valores);
      if (msg) proximos[c] = msg;
    });
    setErros(proximos);
    if (Object.keys(proximos).length > 0) {
      setErroEnvio('Revise os campos destacados.');
      return;
    }

    setSalvando(true);
    setErroEnvio('');
    try {
      await atualizarPrestador({
        ...dadosEditaveis(perfil),
        nome: valores.nome.trim(),
        telefone: onlyDigits(valores.telefone),
        servicoPrincipal: valores.servicoPrincipal,
        areaAtendimento: valores.areaAtendimento.trim(),
        sobreMim: valores.sobreMim.trim(),
        preco: lerPreco(valores.preco) ?? null,
        unidadePreco: valores.unidadePreco,
      });
      router.back();
    } catch (error) {
      if (error instanceof ApiError) {
        const doServidor: Erros = {};
        Object.entries(error.campos ?? {}).forEach(([chave, msg]) => {
          const c = CAMPOS_API[chave];
          if (c) doServidor[c] = msg;
        });
        setErros((prev) => ({ ...prev, ...doServidor }));
        setErroEnvio(error.message);
      } else {
        setErroEnvio('Não foi possível salvar. Tente novamente.');
      }
    } finally {
      setSalvando(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScreenHeader title="Editar perfil" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {!valores && !erroCarga && (
            <ActivityIndicator
              style={styles.loading}
              size="large"
              color={colors.primary}
              accessibilityLabel="Carregando perfil"
            />
          )}

          {!!erroCarga && <Notice tone="error" icon="alert-circle-outline" text={erroCarga} />}

          {valores && (
            <>
              <FormInput
                label="Nome Completo"
                icon="person-outline"
                placeholder="Seu nome profissional"
                value={valores.nome}
                onChangeText={(t) => mudar('nome', t)}
                onBlur={() => sair('nome')}
                error={erros.nome}
                autoCapitalize="words"
              />

              <FormInput
                label="Número de Telefone Profissional"
                icon="call-outline"
                placeholder="(11) 99999-9999"
                value={valores.telefone}
                onChangeText={(t) => mudar('telefone', maskPhone(t))}
                onBlur={() => sair('telefone')}
                error={erros.telefone}
                keyboardType="phone-pad"
                maxLength={15}
              />

              <SelectField
                label="Serviço Principal"
                icon="briefcase-outline"
                placeholder="Escolha seu serviço"
                options={SERVICOS_PRESTADOR}
                value={valores.servicoPrincipal}
                onChange={(s) => {
                  mudar('servicoPrincipal', s);
                  setErros((prev) => ({ ...prev, servicoPrincipal: '' }));
                }}
                error={erros.servicoPrincipal}
              />

              <FormInput
                label="Cidade e regiões de atendimento"
                icon="pin-outline"
                placeholder="Ex: São Paulo • Zona Sul, Centro..."
                value={valores.areaAtendimento}
                onChangeText={(t) => mudar('areaAtendimento', t)}
                onBlur={() => sair('areaAtendimento')}
                error={erros.areaAtendimento}
                maxLength={255}
              />

              <FormInput
                label="Minha Apresentação"
                placeholder="Conte um pouco sobre sua experiência e como trabalha..."
                value={valores.sobreMim}
                onChangeText={(t) => mudar('sobreMim', t)}
                error={erros.sobreMim}
                multiline
                maxLength={2000}
                autoFocus={campo === 'sobreMim'}
              />

              <FormInput
                label="Preço Médio Estimado (R$)"
                icon="cash-outline"
                placeholder="Ex: 130,00 (deixe vazio para definir depois)"
                value={valores.preco}
                onChangeText={(t) => mudar('preco', t.replace(/[^\d.,]/g, ''))}
                onBlur={() => sair('preco')}
                error={erros.preco}
                keyboardType="decimal-pad"
                maxLength={14}
                autoFocus={campo === 'preco'}
              />

              <Text style={styles.label} nativeID="unidade-preco">
                Cobrança
              </Text>
              <View
                style={styles.chips}
                accessibilityRole="radiogroup"
                accessibilityLabelledBy="unidade-preco"
              >
                {UNIDADES.map(({ key, label }) => {
                  const selecionada = valores.unidadePreco === key;
                  return (
                    <TouchableOpacity
                      key={key}
                      style={[styles.chip, selecionada && styles.chipSelecionado]}
                      onPress={() => mudar('unidadePreco', key)}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: selecionada }}
                      // O chip tem 36 de altura; o hitSlop leva a área de toque a 48.
                      hitSlop={{ top: 6, bottom: 6 }}
                    >
                      <Text style={[styles.chipTexto, selecionada && styles.chipTextoSelecionado]}>
                        {label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {!!erroEnvio && <Text style={styles.erroEnvio}>{erroEnvio}</Text>}

              <Button title="Salvar Alterações" loading={salvando} onPress={salvar} />
            </>
          )}
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
  loading: {
    marginVertical: 32,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  chip: {
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    justifyContent: 'center',
  },
  chipSelecionado: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipTexto: {
    fontSize: 13,
    color: colors.text,
  },
  chipTextoSelecionado: {
    color: colors.primaryText,
    fontWeight: '700',
  },
  erroEnvio: {
    fontSize: 13,
    color: colors.error,
    textAlign: 'center',
    marginBottom: 12,
  },
});
