// Mensagem de sucesso para a tela anterior mostrar ao voltar ao foco (ex.: "Senha alterada").
// Lida uma vez só: pegarAviso() já limpa.
let pendente: string | null = null;

export function deixarAviso(texto: string) {
  pendente = texto;
}

export function pegarAviso(): string | null {
  const texto = pendente;
  pendente = null;
  return texto;
}
