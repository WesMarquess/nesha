import { Href, useLocalSearchParams } from 'expo-router';
import { TelaLogin } from '../../src/components/TelaLogin';

export default function Login() {
  const { cadastrado } = useLocalSearchParams<{ cadastrado?: string }>();

  return (
    <TelaLogin
      perfil="CLIENTE"
      tag="Cliente"
      titulo="Encontre o cuidado que sua casa merece"
      subtitulo="Área do Cliente • Faça login ou crie sua conta para contratar profissionais qualificados."
      botaoEntrar="Entrar como Cliente"
      rotuloSenha="Senha"
      placeholderSenha="Sua senha"
      botaoCadastro="Criar Conta Grátis"
      cadastroHref={'/cadastro' as Href}
      trocaTexto="É um profissional parceiro?"
      trocaLink="Área do Prestador →"
      trocaHref={'/login-prestador' as Href}
      aviso={cadastrado ? 'Conta criada! Agora é só entrar com seu e-mail e senha.' : undefined}
    />
  );
}
