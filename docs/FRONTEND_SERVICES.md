# Front-end de serviços

Este documento registra o fluxo visual do catálogo de serviços da Área do Cliente. A implementação descrita aqui usa dados locais de demonstração e não consulta nem altera o backend.

## Telas e componentes

- `app/(app)/home.tsx`: exibe serviços recomendados. Ao tocar em um card, abre o catálogo com o serviço correspondente pré-selecionado. O botão **Ver todos** abre o catálogo sem pré-seleção.
- `app/(app)/servicos.tsx`: exibe a lista de serviços, campo de busca, seleção múltipla e resumo das opções escolhidas no rodapé.
- `src/components/ServiceListItem.tsx`: mostra cada serviço; o controle de seleção é independente da expansão dos detalhes.
- `src/utils/mocks.ts`: define os serviços e os profissionais usados como demonstração.
- `app/(app)/lista-profissionais.tsx`: recebe os IDs selecionados e mostra seus nomes junto aos resultados demonstrativos.

## Fluxo do catálogo

1. Os cards recomendados da inicial enviam `serviceId` para `/servicos`. Atualmente, Limpeza Residencial usa o ID `2` e Passadeira e Lavadeira usa o ID `5`.
2. O catálogo pré-seleciona esse serviço quando a navegação vem de um card recomendado. Também é possível marcar ou desmarcar qualquer serviço da lista.
3. A busca filtra os serviços pelo título. Tocar no nome ou na seta expande/recolhe os detalhes; tocar na caixa marca/desmarca o item.
4. O rodapé mostra a quantidade e os nomes dos serviços selecionados. **Ver profissionais** fica desabilitado enquanto nenhum serviço estiver marcado.
5. Ao avançar, o catálogo abre `/lista-profissionais` com `serviceIds` contendo os IDs separados por vírgula.

## Limites atuais

- A seleção é estado local da tela e não é salva em conta, armazenamento persistente ou backend.
- Serviços, preços, detalhes e profissionais são dados de demonstração em `src/utils/mocks.ts`.
- A tela de profissionais exibe os nomes dos serviços enviados, mas os resultados continuam sendo os profissionais mockados atuais; não há filtragem real por categoria.
- Não há criação, edição ou consulta de agendamentos nesse fluxo.