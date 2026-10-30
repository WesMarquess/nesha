# Padrões de projeto fundamentais

Estes são os quatro padrões GoF adotados como **fundamentais** no Nesha. Eles foram escolhidos porque resolvem problemas centrais do domínio de um marketplace de serviços (agendar, buscar, notificar e integrar serviços externos) e não apenas por existirem em frameworks.

Ao criar ou alterar uma funcionalidade que se encaixe em um dos problemas abaixo, siga o padrão correspondente. Se precisar fugir dele, explique o motivo no PR.

| Padrão | Categoria | Problema do Nesha | Onde está |
|---|---|---|---|
| [State](#state) | Comportamental | Ciclo de vida do agendamento | `src/data/estadosAgendamento.ts` |
| [Strategy](#strategy) | Comportamental | Critérios de busca e, no futuro, formas de pagamento | `src/utils/ordenacaoProfissionais.ts` |
| [Observer](#observer) | Comportamental | Avisar telas (e, no futuro, usuários) quando algo muda | `src/data/agendamentos.ts`, `src/contexts/AuthContext.tsx` |
| [Adapter](#adapter) | Estrutural | Integrar APIs externas sem depender do formato delas | `src/services/viacep.ts` |

## State

**Problema:** um agendamento passa por `PENDENTE → CONFIRMADO → CONCLUIDO`, podendo ir para `CANCELADO`. Cada status permite ações diferentes: o prestador só aceita ou recusa um pedido pendente, o cliente só cancela antes da conclusão e só avalia depois dela (uma vez).

**Como aplicar:**

- Cada status é um objeto `EstadoAgendamento` em [`estadosAgendamento.ts`](../src/data/estadosAgendamento.ts), com as flags `podeResponder`, `podeCancelar` e `podeAvaliar` e as transições `aceitar`, `recusar`, `cancelar`, `concluir` e `avaliar`.
- Uma transição não permitida lança `TransicaoInvalidaError`.
- As telas consultam o estado (`estadoDe(item).podeCancelar`). **Não compare `item.status === '...'` para decidir se uma ação é permitida.**
- Toda mudança passa pelas funções de [`agendamentos.ts`](../src/data/agendamentos.ts) (`aceitarSolicitacao`, `cancelarAgendamento` etc.), que delegam ao estado atual.
- Um novo status, como `EM_ANDAMENTO`, é um novo objeto de estado mais as transições que levam a ele. As telas não mudam.

Comparar status para escolher **texto ou cor** (como em `StatusBadge`) continua permitido: isso é apresentação, não regra de negócio.

## Strategy

**Problema:** a lista de profissionais pode ser ordenada ou filtrada por critérios diferentes ("Mais recomendados", "Disponíveis hoje", "Menor preço"), e novos critérios vão surgir ("Mais próximos"). O pagamento terá várias formas (Pix, cartão, carteira Mercado Pago) com o mesmo fluxo de confirmação.

**Como aplicar:**

- Cada critério é um objeto com a mesma assinatura (`aplicar(lista, hoje)`), em [`ordenacaoProfissionais.ts`](../src/utils/ordenacaoProfissionais.ts).
- A tela só guarda qual critério está selecionado e chama `ordenarProfissionais`. Os chips são gerados a partir de `ESTRATEGIAS_PROFISSIONAIS`.
- Um novo critério é uma nova estratégia na lista, sem alterar a tela.
- **Pagamento (planejado):** cada forma de pagamento deve ser uma estratégia com a mesma interface (por exemplo, `pagar(pedido): Promise<ResultadoPagamento>`), escolhida pelo usuário na tela de pagamento.

## Observer

**Problema:** quando um agendamento muda (o prestador aceita, o cliente cancela), todas as telas que o exibem precisam se atualizar. Quando a sessão expira, o app precisa voltar ao login sem que o módulo de rede conheça as telas.

**Como aplicar:**

- **Agendamentos:** [`agendamentos.ts`](../src/data/agendamentos.ts) mantém os observadores (`assinarAgendamentos`) e chama `notificar()` a cada mudança. As telas leem os dados pelos hooks de [`useAgendamentos.ts`](../src/data/useAgendamentos.ts) (`useSyncExternalStore`), que assinam a lista automaticamente. Nunca guarde uma cópia da lista em `useState`.
- **Sessão:** o `AuthProvider` publica o usuário via React Context (os consumidores de `useAuth()` são os observadores). O módulo `api.ts` avisa o observador registrado em `setUnauthorizedHandler` quando uma rota protegida responde 401.
- **Notificações (planejado):** avisos ao prestador sobre novas solicitações e ao cliente sobre confirmação ou cancelamento devem assinar os mesmos eventos de agendamento.

## Adapter

**Problema:** APIs externas têm formatos próprios. O ViaCEP usa `localidade` e responde `200` com `{ "erro": true }` para CEP inexistente. O Mercado Pago terá seus próprios nomes de campos e status. Se o app usasse esses formatos diretamente, uma mudança no provedor afetaria várias telas.

**Como aplicar:**

- Cada integração externa fica em `src/services/` e converte a resposta para um tipo do Nesha. Veja [`viacep.ts`](../src/services/viacep.ts): `buscarCep` devolve `Endereco` (`cidade`, não `localidade`) e transforma `{ erro: true }` em `CepNotFoundError`.
- As telas importam apenas os tipos do Nesha, nunca os tipos do provedor.
- **Mercado Pago (planejado):** criar um adaptador que converta o status de pagamento do provedor para um tipo interno (por exemplo, `'APROVADO' | 'PENDENTE' | 'RECUSADO'`). Ele seria usado pelas estratégias de pagamento do Strategy acima.
