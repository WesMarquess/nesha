import { ReactNode, useCallback, useEffect, useState } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { Href, useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar } from '../../src/components/Avatar';
import { BottomNav } from '../../src/components/BottomNav';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { FormInput } from '../../src/components/FormInput';
import { Notice } from '../../src/components/Notice';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { useAuth } from '../../src/contexts/AuthContext';
import { useBuscaCep } from '../../src/hooks/useBuscaCep';
import { useFotoDePerfil } from '../../src/hooks/useFotoDePerfil';
import { ApiError } from '../../src/services/api';
import { atualizarCliente, getClienteMe, urlFoto } from '../../src/services/auth';
import { colors } from '../../src/theme/colors';
import type { AtualizarClienteRequest, ClientePerfil } from '../../src/types/auth';
import { pegarAviso } from '../../src/utils/avisoPendente';
import { maskCEP, maskPhone, onlyDigits } from '../../src/utils/masks';
import {
  validateBairro,
  validateCEP,
  validateCidade,
  validateLogradouro,
  validateNome,
  validateNumero,
  validateTelefone,
  validateUF,
} from '../../src/utils/validators';

type Campo =
  | 'nome'
  | 'telefone'
  | 'cep'
  | 'logradouro'
  | 'numero'
  | 'complemento'
  | 'bairro'
  | 'cidade'
  | 'uf';

type Valores = Record<Campo, string>;
type Erros = Partial<Record<Campo, string>>;
type Secao = 'contato' | 'endereco' | null;
type Mensagem = { tom: 'success' | 'error'; texto: string };

const CAMPOS_CONTATO: Campo[] = ['nome', 'telefone'];

// Chave do erro devolvido pelo backend -> campo do formulário.
const CAMPOS_API: Record<string, Campo> = {
  nome: 'nome',
  telefone: 'telefone',
  'endereco.cep': 'cep',
  'endereco.logradouro': 'logradouro',
  'endereco.numero': 'numero',
  'endereco.complemento': 'complemento',
  'endereco.bairro': 'bairro',
  'endereco.cidade': 'cidade',
  'endereco.uf': 'uf',
};

function valoresDe(perfil: ClientePerfil): Valores {
  const e = perfil.endereco;
  return {
    nome: perfil.usuario.nome,
    telefone: maskPhone(perfil.telefone),
    cep: maskCEP(e.cep),
    logradouro: e.logradouro,
    numero: e.numero,
    complemento: e.complemento ?? '',
    bairro: e.bairro,
    cidade: e.cidade,
    uf: e.uf,
  };
}

function paraEnvio(v: Valores): AtualizarClienteRequest {
  const complemento = v.complemento.trim();
  return {
    nome: v.nome.trim(),
    telefone: onlyDigits(v.telefone),
    endereco: {
      cep: onlyDigits(v.cep),
      logradouro: v.logradouro.trim(),
      numero: v.numero.trim(),
      ...(complemento ? { complemento } : {}),
      bairro: v.bairro.trim(),
      cidade: v.cidade.trim(),
      uf: v.uf.trim().toUpperCase(),
    },
  };
}

function validar(campo: Campo, v: Valores): string {
  switch (campo) {
    case 'nome':
      return validateNome(v.nome);
    case 'telefone':
      return validateTelefone(v.telefone);
    case 'cep':
      return validateCEP(v.cep);
    case 'logradouro':
      return validateLogradouro(v.logradouro);
    case 'numero':
      return validateNumero(v.numero);
    case 'complemento':
      return '';
    case 'bairro':
      return validateBairro(v.bairro);
    case 'cidade':
      return validateCidade(v.cidade);
    case 'uf':
      return validateUF(v.uf);
  }
}

function resumoEndereco(v: Valores): string {
  const rua = [v.logradouro, v.numero].filter(Boolean).join(', ');
  return [rua, v.complemento].filter(Boolean).join(' • ') + (v.cidade ? `, ${v.cidade}` : '');
}

// Linha de configuração que abre os campos logo abaixo (Contato, Endereço).
function LinhaExpansivel({
  titulo,
  resumo,
  aberta,
  comErro,
  onPress,
  children,
}: {
  titulo: string;
  resumo: string;
  aberta: boolean;
  comErro?: boolean;
  onPress: () => void;
  children?: ReactNode;
}) {
  return (
    <Card style={comErro ? styles.cardErro : undefined}>
      <TouchableOpacity
        style={styles.linha}
        onPress={onPress}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`${titulo}: ${resumo}`}
        accessibilityState={{ expanded: aberta }}
      >
        <View style={styles.flex}>
          <Text style={styles.linhaTitulo}>{titulo}</Text>
          <Text style={styles.linhaResumo} numberOfLines={2}>
            {resumo}
          </Text>
        </View>
        <Ionicons
          name={aberta ? 'chevron-up' : 'chevron-forward'}
          size={18}
          color={colors.textMuted}
        />
      </TouchableOpacity>
      {aberta && <View style={styles.campos}>{children}</View>}
    </Card>
  );
}

export default function ConfiguracoesCliente() {
  const router = useRouter();
  const { signOut } = useAuth();
  const foto = useFotoDePerfil();

  const [perfil, setPerfil] = useState<ClientePerfil | null>(null);
  const [valores, setValores] = useState<Valores | null>(null);
  const [erros, setErros] = useState<Erros>({});
  const [erroCarga, setErroCarga] = useState('');
  const [secao, setSecao] = useState<Secao>(null);
  const [mensagem, setMensagem] = useState<Mensagem | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [confirmandoSaida, setConfirmandoSaida] = useState(false);
  const [saindo, setSaindo] = useState(false);

  const cep = useBuscaCep((endereco) => {
    setValores((prev) => (prev ? { ...prev, ...endereco } : prev));
    setErros((prev) => ({ ...prev, cep: '', logradouro: '', bairro: '', cidade: '', uf: '' }));
  });

  // Mostra o aviso deixado pela tela de alterar senha ao voltar para cá.
  useFocusEffect(
    useCallback(() => {
      const texto = pegarAviso();
      if (texto) setMensagem({ tom: 'success', texto });
    }, [])
  );

  useEffect(() => {
    let ativo = true;

    getClienteMe()
      .then((dados) => {
        if (!ativo) return;
        setPerfil(dados);
        setValores(valoresDe(dados));
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

  const alterado =
    !!perfil &&
    !!valores &&
    JSON.stringify(paraEnvio(valores)) !== JSON.stringify(paraEnvio(valoresDe(perfil)));

  function mudar(campo: Campo, valor: string) {
    if (!valores) return;
    const proximo = { ...valores, [campo]: valor };
    setValores(proximo);
    setMensagem(null);
    if (erros[campo]) {
      setErros((prev) => ({ ...prev, [campo]: validar(campo, proximo) }));
    }
  }

  function sair(campo: Campo) {
    if (valores) setErros((prev) => ({ ...prev, [campo]: validar(campo, valores) }));
  }

  function mudarCep(texto: string) {
    const mascarado = maskCEP(texto);
    mudar('cep', mascarado);
    const digitos = onlyDigits(mascarado);
    if (digitos.length === 8) {
      cep.buscar(digitos);
    } else {
      cep.cancelar();
    }
  }

  function alternar(s: Exclude<Secao, null>) {
    setSecao((atual) => (atual === s ? null : s));
  }

  async function alterarFoto() {
    setMensagem(null);
    try {
      const fotoUrl = await foto.escolher();
      if (fotoUrl) {
        setPerfil((atual) => (atual ? { ...atual, fotoUrl } : atual));
        setMensagem({ tom: 'success', texto: 'Foto de perfil atualizada.' });
      }
    } catch (error) {
      setMensagem({ tom: 'error', texto: (error as Error).message });
    }
  }

  async function salvar() {
    if (!valores || salvando) return;

    const proximos: Erros = {};
    (Object.keys(valores) as Campo[]).forEach((c) => {
      const msg = validar(c, valores);
      if (msg) proximos[c] = msg;
    });
    setErros(proximos);

    if (Object.keys(proximos).length > 0) {
      // Abre a seção com erro para a pessoa ver o que corrigir.
      setSecao(Object.keys(proximos).some((c) => CAMPOS_CONTATO.includes(c as Campo)) ? 'contato' : 'endereco');
      setMensagem({ tom: 'error', texto: 'Revise os campos destacados.' });
      return;
    }

    setSalvando(true);
    setMensagem(null);
    try {
      const atualizado = await atualizarCliente(paraEnvio(valores));
      setPerfil(atualizado);
      setValores(valoresDe(atualizado));
      setSecao(null);
      setMensagem({ tom: 'success', texto: 'Alterações salvas.' });
    } catch (error) {
      if (error instanceof ApiError) {
        const doServidor: Erros = {};
        Object.entries(error.campos ?? {}).forEach(([chave, msg]) => {
          const c = CAMPOS_API[chave];
          if (c) doServidor[c] = msg;
        });
        setErros((prev) => ({ ...prev, ...doServidor }));
        setMensagem({ tom: 'error', texto: error.message });
      } else {
        setMensagem({ tom: 'error', texto: 'Não foi possível salvar. Tente novamente.' });
      }
    } finally {
      setSalvando(false);
    }
  }

  async function handleSair() {
    setSaindo(true);
    try {
      await signOut();
    } finally {
      setSaindo(false);
    }
  }

  const erroContato = CAMPOS_CONTATO.some((c) => !!erros[c]);
  const erroEndereco = (Object.keys(erros) as Campo[]).some(
    (c) => !CAMPOS_CONTATO.includes(c) && !!erros[c]
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScreenHeader title="Configurações do Perfil" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {!!mensagem && (
            <Notice
              tone={mensagem.tom}
              icon={mensagem.tom === 'success' ? 'checkmark-circle-outline' : 'alert-circle-outline'}
              text={mensagem.texto}
            />
          )}

          {!valores && !erroCarga && (
            <ActivityIndicator
              style={styles.loading}
              size="large"
              color={colors.primary}
              accessibilityLabel="Carregando perfil"
            />
          )}

          {!!erroCarga && <Notice tone="error" icon="alert-circle-outline" text={erroCarga} />}

          {perfil && valores && (
            <>
              <Card style={styles.identity}>
                <Avatar nome={perfil.usuario.nome} size={80} uri={urlFoto(perfil.fotoUrl)} />
                <View style={styles.fotoAcao}>
                  {foto.enviando ? (
                    <ActivityIndicator color={colors.primary} accessibilityLabel="Enviando foto" />
                  ) : (
                    <TouchableOpacity
                      style={styles.acao}
                      onPress={alterarFoto}
                      accessibilityRole="button"
                      accessibilityHint="Abre suas fotos para escolher uma nova"
                      hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
                    >
                      <Text style={styles.acaoTexto}>Alterar Foto de Perfil</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <Text style={styles.name}>{perfil.usuario.nome}</Text>
                <Text style={styles.email}>{perfil.usuario.email}</Text>
              </Card>

              <Text style={styles.secao} accessibilityRole="header">
                Dados Cadastrais
              </Text>

              <LinhaExpansivel
                titulo="Contato"
                resumo={valores.telefone}
                aberta={secao === 'contato'}
                comErro={erroContato}
                onPress={() => alternar('contato')}
              >
                <FormInput
                  label="Nome Completo"
                  icon="person-outline"
                  placeholder="Seu nome completo"
                  value={valores.nome}
                  onChangeText={(t) => mudar('nome', t)}
                  onBlur={() => sair('nome')}
                  error={erros.nome}
                  autoCapitalize="words"
                />
                <FormInput
                  label="Telefone / WhatsApp"
                  icon="call-outline"
                  placeholder="(11) 99999-9999"
                  value={valores.telefone}
                  onChangeText={(t) => mudar('telefone', maskPhone(t))}
                  onBlur={() => sair('telefone')}
                  error={erros.telefone}
                  keyboardType="phone-pad"
                  maxLength={15}
                />
              </LinhaExpansivel>

              <LinhaExpansivel
                titulo="Endereço de Atendimento"
                resumo={resumoEndereco(valores)}
                aberta={secao === 'endereco'}
                comErro={erroEndereco}
                onPress={() => alternar('endereco')}
              >
                <FormInput
                  label="CEP"
                  icon="location-outline"
                  placeholder="00000-000"
                  value={valores.cep}
                  onChangeText={mudarCep}
                  onBlur={() => sair('cep')}
                  error={erros.cep || cep.erro}
                  loading={cep.carregando}
                  keyboardType="number-pad"
                  maxLength={9}
                />
                <FormInput
                  label="Rua"
                  icon="home-outline"
                  placeholder="Nome da rua"
                  value={valores.logradouro}
                  onChangeText={(t) => mudar('logradouro', t)}
                  onBlur={() => sair('logradouro')}
                  error={erros.logradouro}
                  autoCapitalize="words"
                />
                <View style={styles.row}>
                  <FormInput
                    containerStyle={styles.rowNumero}
                    label="Número"
                    placeholder="123"
                    value={valores.numero}
                    onChangeText={(t) => mudar('numero', t)}
                    onBlur={() => sair('numero')}
                    error={erros.numero}
                    maxLength={10}
                  />
                  <FormInput
                    containerStyle={styles.rowComplemento}
                    label="Complemento"
                    placeholder="Apto, bloco (opcional)"
                    value={valores.complemento}
                    onChangeText={(t) => mudar('complemento', t)}
                    autoCapitalize="words"
                  />
                </View>
                <FormInput
                  label="Bairro"
                  placeholder="Seu bairro"
                  value={valores.bairro}
                  onChangeText={(t) => mudar('bairro', t)}
                  onBlur={() => sair('bairro')}
                  error={erros.bairro}
                  autoCapitalize="words"
                />
                <View style={styles.row}>
                  <FormInput
                    containerStyle={styles.rowCidade}
                    label="Cidade"
                    placeholder="Sua cidade"
                    value={valores.cidade}
                    onChangeText={(t) => mudar('cidade', t)}
                    onBlur={() => sair('cidade')}
                    error={erros.cidade}
                    autoCapitalize="words"
                  />
                  <FormInput
                    containerStyle={styles.rowUf}
                    label="UF"
                    placeholder="SP"
                    value={valores.uf}
                    onChangeText={(t) => mudar('uf', t.toUpperCase().replace(/[^A-Z]/g, ''))}
                    onBlur={() => sair('uf')}
                    error={erros.uf}
                    autoCapitalize="characters"
                    maxLength={2}
                  />
                </View>
              </LinhaExpansivel>

              <Text style={styles.secao} accessibilityRole="header">
                Privacidade e Segurança
              </Text>

              <Card>
                <TouchableOpacity
                  style={styles.linha}
                  onPress={() => router.push('/alterar-senha' as Href)}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel="Segurança: alterar senha"
                >
                  <View style={styles.flex}>
                    <Text style={styles.linhaTitulo}>Segurança</Text>
                    <Text style={styles.linhaResumo}>Alterar senha</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                </TouchableOpacity>
              </Card>

              <Button
                title="Salvar alterações"
                loading={salvando}
                disabled={!alterado}
                onPress={salvar}
              />
            </>
          )}

          {confirmandoSaida ? (
            <View style={styles.confirm}>
              <Notice
                tone="error"
                icon="log-out-outline"
                text="Tem certeza que deseja sair da sua conta?"
              />
              <View style={styles.confirmButtons}>
                <Button
                  title="Cancelar"
                  variant="outline"
                  style={styles.flex}
                  disabled={saindo}
                  onPress={() => setConfirmandoSaida(false)}
                />
                <Button
                  title="Sair"
                  variant="danger"
                  style={styles.flex}
                  loading={saindo}
                  onPress={handleSair}
                />
              </View>
            </View>
          ) : (
            <Button
              title="Sair da conta"
              variant="danger"
              onPress={() => setConfirmandoSaida(true)}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <BottomNav active="perfil" />
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
    gap: 14,
  },
  loading: {
    marginVertical: 32,
  },
  identity: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  fotoAcao: {
    marginTop: 12,
    minHeight: 26,
    justifyContent: 'center',
  },
  acao: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: colors.primarySoft,
  },
  acaoTexto: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginTop: 12,
    textAlign: 'center',
  },
  email: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
  secao: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    marginTop: 6,
  },
  cardErro: {
    borderColor: colors.error,
  },
  linha: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  linhaTitulo: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  linhaResumo: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  campos: {
    marginTop: 14,
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
  confirm: {
    gap: 12,
  },
  confirmButtons: {
    flexDirection: 'row',
    gap: 12,
  },
});
