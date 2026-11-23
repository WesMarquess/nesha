import { Href, useLocalSearchParams } from 'expo-router';
import { TelaLogin } from '../../src/components/TelaLogin';

// O Figma pede "CPF ou CNPJ", mas o login é o mesmo do cliente (e-mail e senha):
// ver docs/API.md, seção 8.
export default function LoginPrestador() {
  const { cadastrado } = useLocalSearchParams<{ cadastrado?: string }>();

  return (
    <TelaLogin
      perfil="PRESTADOR"
      tag="Prestador"
      titulo="Expanda seu trabalho prestando serviços com a gente"
      subtitulo="Área do Profissional • Gerencie sua agenda, conquiste novos clientes e receba com segurança."
      botaoEntrar="Entrar como Profissional"
      rotuloSenha="Senha de Acesso"
      placeholderSenha="Sua senha profissional"
      botaoCadastro="Quero me Cadastrar"
      cadastroHref={'/cadastro-prestador' as Href}
      trocaTexto="Quer contratar um serviço?"
      trocaLink="Área do Cliente →"
      trocaHref={'/login' as Href}
      aviso={
        cadastrado
          ? 'Cadastro concluído! Entre com seu e-mail e senha para acessar seu painel.'
          : undefined
      }
    />
  );
}
