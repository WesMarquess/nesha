# Nesha Backend

API em Java/Spring Boot que implementa o contrato descrito em [`../docs/API.md`](../docs/API.md) (conta, cadastro e perfil) e [`../docs/AGENDA.md`](../docs/AGENDA.md) (agendamentos e pagamento) para o app Expo/React Native.

## Stack

- Java 21, Spring Boot 4
- Spring Web MVC, Spring Security (JWT com jjwt, senhas com BCrypt), Spring Data JPA, Bean Validation
- Flyway para as migrations do banco (`ddl-auto=validate` em todos os perfis)
- H2 em arquivo (dev) / PostgreSQL (prod)
- Mercado Pago Checkout Pro para o pagamento dos agendamentos (simulado quando não há token)

## Rodando localmente

```bash
./mvnw spring-boot:run
```

Sobe em `http://0.0.0.0:8080` no perfil `dev` (ativo por padrão), com banco H2 **em arquivo** em `backend/data/` (ignorado pelo git): os dados continuam depois de reiniciar. Para começar do zero, pare o backend e apague a pasta `backend/data`.

Na primeira execução o perfil `dev` cria contas de teste: um cliente e dois prestadores para cada serviço do catálogo, todos com a senha `Nesha@123`. A lista está em [`../docs/CONTAS_DE_TESTE.md`](../docs/CONTAS_DE_TESTE.md). As contas só são criadas se o e-mail ainda não existir, então reiniciar não duplica nada.

Console do H2 em `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:file:./data/nesha`, usuário `sa`, sem senha). Pare o backend antes de abrir o arquivo por outra ferramenta.

Para o app Expo apontar para este backend, veja a seção 7 de [`../docs/API.md`](../docs/API.md). Ao testar em um celular físico, use o IP da máquina na rede, não `localhost`.

### Testes

```bash
./mvnw test
```

Os testes usam H2 em memória (limpo a cada execução), não criam as contas de teste e **nunca chamam o Mercado Pago**: o `pom.xml` força o token vazio, mesmo que exista um `local.properties`.

## Configuração

| Variável / propriedade | Uso | Padrão (dev) |
|---|---|---|
| `SPRING_PROFILES_ACTIVE` | `dev` (H2) ou `prod` (Postgres) | `dev` |
| `NESHA_JWT_SECRET` | Segredo HMAC para assinar os tokens JWT | valor de desenvolvimento, **trocar em produção** |
| `NESHA_JWT_EXPIRACAO_SEGUNDOS` | Validade do `accessToken`, em segundos | `3600` |
| `MERCADOPAGO_ACCESS_TOKEN` | Access Token de **teste** do Mercado Pago | vazio, com pagamentos simulados |
| `NESHA_H2_ARQUIVO` | Caminho do arquivo do H2 (perfil `dev`) | `./data/nesha` |
| `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` | Conexão Postgres (somente perfil `prod`) | — |

O token do Mercado Pago também pode ficar em `backend/local.properties`, que é ignorado pelo git (modelo em [`local.properties.example`](local.properties.example)). Sem token, o backend usa o `PagamentoSimulado`: não abre checkout e aprova o pagamento na primeira verificação.

## Estrutura

```
src/main/java/com/nesha/backend/
├── config/        # CORS e contas de teste do perfil dev (DadosDeTeste)
├── controller/    # Endpoints REST (/api/v1/...)
├── dto/           # Records de request/response (a API nunca expõe as entidades)
├── entity/        # Entidades JPA e enums (StatusAgendamento implementa o padrão State)
├── exception/     # ApiException + handler global de erros
├── pagamento/     # GatewayPagamento (Adapter): Mercado Pago e pagamento simulado
├── repository/    # Spring Data JPA
├── security/      # JWT (geração/validação), filtro e SecurityConfig
├── service/       # Regras de negócio (auth, cliente, prestador, catálogo, agendamento, reputação, foto)
└── validation/    # Validadores customizados (CPF, telefone, UF)

src/main/resources/db/migration/   # Migrations do Flyway (V1 a V7)
```

Os padrões de projeto adotados (State, Strategy, Observer, Adapter) estão descritos em [`../docs/DESIGN_PATTERNS.md`](../docs/DESIGN_PATTERNS.md).

## Endpoints

Todos em `/api/v1`. Sem indicação, exigem `Authorization: Bearer <token>`.

**Autenticação e conta**
- `POST /auth/login` — público, login único para cliente e prestador
- `GET /usuarios/me` — usuário logado
- `PUT /usuarios/me/senha` — troca de senha
- `PUT /usuarios/me/foto` — upload da foto de perfil (`multipart/form-data`, JPG/PNG/WebP, até 5 MB)
- `GET /usuarios/{usuarioId}/foto` — público

**Cliente**
- `POST /clientes` — público, cadastro
- `GET /clientes/me`, `PUT /clientes/me` — perfil do cliente

**Prestador**
- `POST /prestadores` — público, cadastro
- `GET /prestadores/me`, `PUT /prestadores/me` — perfil do prestador (inclui ficar online/offline)
- `GET /prestadores?servico=...` — catálogo (só prestadores online, os mais bem avaliados primeiro)
- `GET /prestadores/{usuarioId}` — perfil público com reputação
- `GET /prestadores/{usuarioId}/horarios-ocupados?de=&ate=` — períodos ocupados (até 62 dias)
- `GET /prestadores/{usuarioId}/avaliacoes` — avaliações recebidas

**Agendamentos**
- `POST /agendamentos` — cliente solicita um serviço
- `GET /agendamentos?status=` e `GET /agendamentos/{id}` — os do usuário logado (cliente ou prestador)
- `POST /agendamentos/{id}/aceitar`, `/recusar`, `/concluir` — prestador
- `POST /agendamentos/{id}/cancelar`, `/avaliacao` — cliente
- `POST /agendamentos/{id}/pagamento` — cria o checkout do Mercado Pago
- `POST /agendamentos/{id}/pagamento/verificar` — consulta o pagamento quando o app volta do checkout

Ciclo do agendamento: `AGUARDANDO_PAGAMENTO → PENDENTE → CONFIRMADO → CONCLUIDO`, com `CANCELADO` a partir de qualquer status ativo. Sem preço definido ("a combinar"), o agendamento já nasce `PENDENTE`. Se um agendamento pago for recusado ou cancelado, o pagamento é estornado automaticamente.

Erros seguem o formato padrão `{ codigo, mensagem, campos? }` descrito na seção 4 de [`../docs/API.md`](../docs/API.md). Transições de status não permitidas respondem `409 TRANSICAO_INVALIDA`.

## Pendências

- `POST /auth/forgot-password` e `POST /auth/refresh` ainda não foram implementados (ver seção 8 de [`../docs/API.md`](../docs/API.md)).
- Pagamento sem webhook: o app pede a verificação ao voltar do checkout.
- CORS liberado para qualquer origem: revisar antes de publicar.
- Sem documentação OpenAPI/Swagger: o contrato está nos arquivos Markdown de `docs/`.
