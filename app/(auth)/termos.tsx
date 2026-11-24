import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { colors } from '../../src/theme/colors';

type Tipo = 'uso' | 'privacidade' | 'parceria';

type Documento = { titulo: string; secoes: { titulo: string; texto: string }[] };

// Textos resumidos dos documentos legais da Nesha (projeto acadêmico).
const DOCUMENTOS: Record<Tipo, Documento> = {
  uso: {
    titulo: 'Termos de Uso',
    secoes: [
      {
        titulo: '1. Sobre a Nesha',
        texto:
          'A Nesha é uma plataforma que conecta clientes a profissionais autônomos de serviços domésticos. A Nesha não presta os serviços diretamente: ela intermedeia a contratação, o agendamento e o pagamento.',
      },
      {
        titulo: '2. Conta do cliente',
        texto:
          'Para contratar é preciso criar uma conta com dados verdadeiros. Você é responsável por manter sua senha em segredo e por todas as ações feitas com a sua conta.',
      },
      {
        titulo: '3. Agendamento e pagamento',
        texto:
          'O agendamento só é enviado ao profissional depois do pagamento aprovado pelo Mercado Pago. O valor fica retido até a realização do serviço e é estornado se o profissional recusar a solicitação ou se você cancelar antes do atendimento.',
      },
      {
        titulo: '4. Avaliações',
        texto:
          'Depois de concluído, você pode avaliar o serviço. As avaliações devem ser honestas e respeitosas; conteúdos ofensivos podem ser removidos.',
      },
      {
        titulo: '5. Responsabilidades',
        texto:
          'O cliente deve garantir acesso ao local e informar corretamente o endereço e o que precisa ser feito. O profissional é responsável pela execução do serviço contratado.',
      },
    ],
  },
  privacidade: {
    titulo: 'Política de Privacidade',
    secoes: [
      {
        titulo: '1. Dados que coletamos',
        texto:
          'Nome, e-mail, telefone, CPF, endereço e foto de perfil informados no cadastro, além dos agendamentos e avaliações feitos no aplicativo.',
      },
      {
        titulo: '2. Para que usamos',
        texto:
          'Para identificar você, permitir o agendamento com os profissionais, processar o pagamento e mostrar seu histórico de serviços. O profissional vê apenas os dados necessários para realizar o atendimento.',
      },
      {
        titulo: '3. Pagamentos',
        texto:
          'Os dados de cartão e Pix são informados diretamente no Mercado Pago. A Nesha não armazena números de cartão.',
      },
      {
        titulo: '4. Seus direitos (LGPD)',
        texto:
          'Você pode consultar e corrigir seus dados nas configurações da conta e solicitar a exclusão dos seus dados pelos canais de atendimento da Nesha.',
      },
      {
        titulo: '5. Segurança',
        texto:
          'As senhas são armazenadas de forma criptografada e o acesso à API exige autenticação.',
      },
    ],
  },
  parceria: {
    titulo: 'Termos de Parceria',
    secoes: [
      {
        titulo: '1. Profissional parceiro',
        texto:
          'O profissional parceiro é autônomo e escolhe quais solicitações aceitar, seus dias de atendimento e o valor cobrado pelos serviços.',
      },
      {
        titulo: '2. Solicitações',
        texto:
          'As solicitações chegam já pagas pelo cliente. Ao aceitar, o profissional se compromete a comparecer na data e no período combinados.',
      },
      {
        titulo: '3. Recebimento',
        texto:
          'O valor do serviço é liberado depois que o atendimento é marcado como concluído.',
      },
      {
        titulo: '4. Conduta',
        texto:
          'O profissional deve tratar o cliente com respeito, cuidar do local de trabalho e manter seu perfil com informações verdadeiras. Avaliações negativas recorrentes podem levar à suspensão da parceria.',
      },
    ],
  },
};

export default function Termos() {
  const { tipo } = useLocalSearchParams<{ tipo?: string }>();
  const documento = DOCUMENTOS[(tipo as Tipo) in DOCUMENTOS ? (tipo as Tipo) : 'uso'];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScreenHeader title={documento.titulo} />
      <ScrollView contentContainerStyle={styles.content}>
        {documento.secoes.map((secao) => (
          <View key={secao.titulo} style={styles.secao}>
            <Text style={styles.secaoTitulo} accessibilityRole="header">
              {secao.titulo}
            </Text>
            <Text style={styles.texto}>{secao.texto}</Text>
          </View>
        ))}
        <Text style={styles.rodape}>Última atualização: novembro de 2026.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 24,
    paddingTop: 8,
    gap: 20,
  },
  secao: {
    gap: 6,
  },
  secaoTitulo: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
  },
  texto: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.textMuted,
  },
  rodape: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 8,
  },
});
