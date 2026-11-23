# API do Nesha — contrato app ↔ backend

> **Status: proposta do front-end.** Os endpoints abaixo foram definidos pelo app para a Área do Cliente.
> O backend deve confirmar ou ajustar. Se algo mudar, atualize este arquivo e os arquivos
> `src/types/auth.ts`, `src/services/auth.ts` e `src/services/api.ts` do app.

## 1. Convenções

| Item | Regra |
|---|---|
| Base URL | `{HOST}/api/v1` (o app lê de `EXPO_PUBLIC_API_URL`, já com o `/api/v1`) |
| Formato | JSON UTF-8 nas requisições e respostas (`Content-Type: application/json`) |
| Nomes de campos | Português, `camelCase` |
| Autenticação | Header `Authorization: Bearer <accessToken>` nas rotas protegidas |
| CPF, telefone, CEP | Trafegam **somente com dígitos** (o app remove a máscara) |
| E-mail | O app envia em minúsculas. O backend deve tratar como único e sem diferenciar maiúsculas |
| IDs | String opaca (UUID ou número como string) |
| HTTPS | Obrigatório em produção |

## 2. Resumo dos endpoints

| Método | Rota | Acesso | Uso no app |
|---|---|---|---|
| POST | `/auth/login` | Público | Tela de login |
| POST | `/clientes` | Público | Tela de cadastro (Área do Cliente) |
| POST | `/prestadores` | Público | Tela de cadastro (Área do Prestador) |
| GET | `/usuarios/me` | Bearer | Restaurar sessão ao abrir o app (os dois perfis) |
| GET | `/prestadores/me` | Bearer | Perfil completo do prestador logado (`meu-perfil-prestador`) |
| PUT | `/prestadores/me` | Bearer | Editar perfil, preço e status Online do prestador |
| PUT | `/prestadores/me/foto` | Bearer | Alterar foto de perfil do prestador (multipart) |
| GET | `/prestadores/{usuarioId}/foto` | Público | Exibir a foto do prestador |
| POST | `/auth/forgot-password` | Público | Previsto (tela ainda não existe) |
| POST | `/auth/refresh` | Público | Previsto, opcional |

---

## 3. Endpoints

### 3.1 `POST /auth/login`

Autentica um usuário.

**Requisição**

```json
{
  "email": "maria@email.com",
  "senha": "Senha@123"
}
```

**Resposta `200 OK`**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "tokenType": "Bearer",
  "expiresIn": 3600,
  "usuario": {
    "id": "b1f1c7a0-5d0c-4e0a-9d2e-0c8f6a9f1111",
    "nome": "Maria Silva",
    "email": "maria@email.com",
    "perfil": "CLIENTE"
  }
}
```

- `expiresIn`: validade do token em segundos.
- `perfil`: `CLIENTE` ou `PRESTADOR`. O app tem uma tela de login para cada área (Cliente e Prestador); cada uma só aceita o próprio perfil e mostra erro para o outro, sem salvar o token.

**Erros**

| HTTP | `codigo` | Quando |
|---|---|---|
| 400 | `VALIDACAO` | E-mail ou senha ausentes/mal formatados |
| 401 | `CREDENCIAIS_INVALIDAS` | E-mail inexistente **ou** senha errada (mesma resposta para os dois) |
| 403 | `PERFIL_INVALIDO` | Opcional: conta existe, mas não é de cliente |

---

### 3.2 `POST /clientes`

Cadastra um novo cliente. O app **não** faz login automático depois: leva a pessoa para a tela de login.

**Requisição**

```json
{
  "nome": "Maria Silva",
  "cpf": "00000000000",
  "telefone": "11987654321",
  "email": "maria@email.com",
  "senha": "Senha@123",
  "endereco": {
    "cep": "01310100",
    "logradouro": "Avenida Paulista",
    "numero": "1000",
    "complemento": "Apto 12",
    "bairro": "Bela Vista",
    "cidade": "São Paulo",
    "uf": "SP"
  }
}
```

`endereco.complemento` é opcional (omitido quando vazio). Os demais campos são obrigatórios.

**Resposta `201 Created`**

```json
{
  "usuario": {
    "id": "b1f1c7a0-5d0c-4e0a-9d2e-0c8f6a9f1111",
    "nome": "Maria Silva",
    "email": "maria@email.com",
    "perfil": "CLIENTE"
  }
}
```

A resposta **nunca** deve conter a senha (nem o hash).

**Erros**

| HTTP | `codigo` | Quando |
|---|---|---|
| 400 | `VALIDACAO` | Algum campo inválido (detalhado em `campos`) |
| 409 | `EMAIL_JA_CADASTRADO` | E-mail já em uso |
| 409 | `CPF_JA_CADASTRADO` | CPF já em uso |

Nos erros 409, envie também `campos` (ex.: `{ "email": "Este e-mail já está cadastrado." }`) para o app mostrar a mensagem no campo certo.

---

### 3.3 `POST /prestadores`

Cadastra um novo prestador. Mesmo padrão de `POST /clientes`: nome, cpf, telefone, email, senha e
endereço são idênticos (mesmas regras da seção 5), mais os campos específicos do prestador. O app
**não** faz login automático depois: leva a pessoa para a tela de login (login é o mesmo endpoint
`POST /auth/login`, único para os dois perfis — ver seção 8, item 2, já resolvido).

**Requisição**

```json
{
  "nome": "Francisco Oliveira",
  "cpf": "00000000000",
  "telefone": "11987654321",
  "email": "francisco@email.com",
  "senha": "Senha@123",
  "endereco": {
    "cep": "01310100",
    "logradouro": "Avenida Paulista",
    "numero": "1000",
    "complemento": "Apto 12",
    "bairro": "Bela Vista",
    "cidade": "São Paulo",
    "uf": "SP"
  },
  "servicoPrincipal": "Jardinagem",
  "areaAtendimento": "São Paulo - Zona Sul e Oeste",
  "sobreMim": "Jardineiro com experiência em manutenção de quintais, poda e replantio.",
  "preco": 130.00,
  "unidadePreco": "DIA",
  "tempoResposta": "Menos de 1 hora",
  "especialidades": ["Poda de árvores e arbustos", "Roçagem e limpeza de terreno"],
  "diasAtendimento": [1, 2, 3, 4, 5, 6]
}
```

| Campo | Regra |
|---|---|
| `servicoPrincipal` | Obrigatório, até 255 caracteres (ex.: "Jardinagem") |
| `areaAtendimento` | Obrigatório, até 255 caracteres — texto livre de cidade/região (ex.: "São Paulo - Zona Sul e Oeste"). **Não substitui** `endereco`, que continua sendo o endereço formal do usuário |
| `sobreMim` | Opcional, até 2000 caracteres |
| `preco` | Opcional, numérico, maior que zero |
| `unidadePreco` | Opcional: `DIA`, `HORA` ou `SERVICO`. Default `DIA` quando omitido |
| `tempoResposta` | Opcional, texto livre, até 100 caracteres (ex.: "Menos de 1 hora") |
| `especialidades` | Opcional, lista de textos não vazios |
| `diasAtendimento` | Opcional, lista de dias (`0` = domingo … `6` = sábado) |

A tela `cadastro-prestador` envia só os dados pessoais, o endereço, `servicoPrincipal`,
`areaAtendimento` e `sobreMim`. Preço, especialidades e dias de atendimento são definidos depois, na
tela de configurações de serviço (ainda não implementada), e por isso são opcionais aqui.

**Resposta `201 Created`**

```json
{
  "usuario": {
    "id": "b1f1c7a0-5d0c-4e0a-9d2e-0c8f6a9f2222",
    "nome": "Francisco Oliveira",
    "email": "francisco@email.com",
    "perfil": "PRESTADOR"
  }
}
```

Mesmo formato de `CadastroClienteResponse`, só com `UsuarioResponse` (sem os campos específicos de
prestador). Para a tela de perfil completo do próprio prestador, use `GET /prestadores/me` (seção
3.4) — essa separação evita que `UsuarioResponse` (usado também pelo cliente) cresça com campos que
não fazem sentido para quem é cliente.

**Erros**

| HTTP | `codigo` | Quando |
|---|---|---|
| 400 | `VALIDACAO` | Algum campo inválido (detalhado em `campos`) |
| 409 | `EMAIL_JA_CADASTRADO` | E-mail já em uso |
| 409 | `CPF_JA_CADASTRADO` | CPF já em uso |

---

### 3.4 `GET /prestadores/me`

Devolve o usuário dono do token **mais** os campos específicos de prestador. Para telas que só
precisam dos dados básicos (`id`, `nome`, `email`, `perfil`), use `GET /usuarios/me`.

**Header:** `Authorization: Bearer <accessToken>`

**Resposta `200 OK`**

```json
{
  "usuario": {
    "id": "b1f1c7a0-5d0c-4e0a-9d2e-0c8f6a9f2222",
    "nome": "Francisco Oliveira",
    "email": "francisco@email.com",
    "perfil": "PRESTADOR"
  },
  "telefone": "11987654321",
  "servicoPrincipal": "Jardinagem",
  "areaAtendimento": "São Paulo - Zona Sul e Oeste",
  "sobreMim": "Jardineiro com experiência em manutenção de quintais, poda e replantio.",
  "preco": 130.00,
  "unidadePreco": "DIA",
  "tempoResposta": "Menos de 1 hora",
  "online": true,
  "fotoUrl": "/prestadores/b1f1c7a0-5d0c-4e0a-9d2e-0c8f6a9f2222/foto?v=1795000000000",
  "especialidades": ["Poda de árvores e arbustos", "Roçagem e limpeza de terreno"],
  "diasAtendimento": [1, 2, 3, 4, 5, 6],
  "disponibilidade": "Seg a Sáb"
}
```

- `disponibilidade`: texto legível (ex.: "Seg a Sáb") **derivado** de `diasAtendimento` pela API, não
  persistido — assim os dois nunca ficam desalinhados. Vem vazio (`""`) se não houver dias.
- `preco`: `null` enquanto o prestador não definir um preço. `especialidades` e `diasAtendimento`
  vêm como lista vazia nesse caso.
- `online`: selo "Online" do painel; indica se o prestador está recebendo novas solicitações.
  Começa `true` no cadastro.
- `fotoUrl`: caminho **relativo à base da API** (`/api/v1`); o app monta a URL completa. `null` se
  não houver foto. O parâmetro `v` muda a cada envio, para o app não mostrar uma foto antiga do cache.
- `rating`/`reviewsCount` do mock do app **não** aparecem aqui — dependem da entidade de avaliação,
  que ainda não existe (ligada aos agendamentos).

**Erros**

| HTTP | `codigo` | Quando |
|---|---|---|
| 401 | `TOKEN_INVALIDO` / `TOKEN_EXPIRADO` | Mesmo comportamento de `GET /usuarios/me` |
| 404 | `PRESTADOR_NAO_ENCONTRADO` | Token válido, mas de um usuário `CLIENTE` (sem `prestador_perfil`) |

---

### 3.4.1 `PUT /prestadores/me`

Atualiza os dados editáveis do prestador logado (telas `meu-perfil-prestador` e "Editar perfil").
O app envia **todos** os campos abaixo; os que não mudaram vão com o valor atual. E-mail, CPF,
endereço, especialidades e dias de atendimento não são alterados por esta rota.

**Header:** `Authorization: Bearer <accessToken>`

```json
{
  "nome": "Francisco Oliveira",
  "telefone": "11987654321",
  "servicoPrincipal": "Jardineiro",
  "areaAtendimento": "São Paulo • Zona Sul e Oeste",
  "sobreMim": "Trabalho com manutenção de jardins há 8 anos.",
  "preco": 130.00,
  "unidadePreco": "DIA",
  "online": true
}
```

| Campo | Regra |
|---|---|
| `nome`, `telefone` | Mesmas regras do cadastro (seção 5) |
| `servicoPrincipal`, `areaAtendimento` | Obrigatórios, até 255 caracteres |
| `sobreMim` | Opcional, até 2000 caracteres; vazio remove a apresentação |
| `preco` | Opcional (`null` = "A definir"), maior que zero |
| `unidadePreco` | Opcional: `DIA`, `HORA` ou `SERVICO` (padrão `DIA`) |
| `online` | Obrigatório, `true` ou `false` |

**Resposta `200 OK`:** o perfil atualizado, no mesmo formato de `GET /prestadores/me`.

**Erros:** `400 VALIDACAO` (com `campos`), `401` como nas demais rotas protegidas e
`404 PRESTADOR_NAO_ENCONTRADO` para token de cliente.

### 3.4.2 `PUT /prestadores/me/foto`

Envia a foto de perfil do prestador logado. Corpo `multipart/form-data` com o arquivo no campo
`foto`. Aceita JPG, PNG ou WebP de até 5 MB; o tipo é conferido pelo conteúdo do arquivo, não pelo
nome ou pelo `Content-Type` informado.

**Resposta `200 OK`:** o perfil atualizado, com o novo `fotoUrl`.

| HTTP | `codigo` | Quando |
|---|---|---|
| 400 | `FOTO_INVALIDA` | Campo `foto` ausente ou arquivo que não é JPG/PNG/WebP |
| 413 | `FOTO_MUITO_GRANDE` | Arquivo com mais de 5 MB |

### 3.4.3 `GET /prestadores/{usuarioId}/foto`

**Público** (sem token), para a foto aparecer também para o cliente. Devolve os bytes da imagem com
o `Content-Type` correspondente. `404 FOTO_NAO_ENCONTRADA` se o prestador não tiver foto.

---

### 3.5 `GET /usuarios/me`

Devolve o usuário dono do token. O app chama ao abrir, para validar o token salvo no aparelho.

**Header:** `Authorization: Bearer <accessToken>`

**Resposta `200 OK`**

```json
{
  "id": "b1f1c7a0-5d0c-4e0a-9d2e-0c8f6a9f1111",
  "nome": "Maria Silva",
  "email": "maria@email.com",
  "perfil": "CLIENTE"
}
```

**Erros**

| HTTP | `codigo` | Quando |
|---|---|---|
| 401 | `TOKEN_INVALIDO` | Token ausente, malformado ou assinatura inválida |
| 401 | `TOKEN_EXPIRADO` | Token vencido |

O app encerra a sessão local ao receber qualquer `401` em rota protegida.

---

### 3.6 `POST /auth/forgot-password` (previsto)

Dispara o e-mail de recuperação de senha. A tela ainda não existe no app.

```json
{ "email": "maria@email.com" }
```

**Resposta `204 No Content`** — sempre, exista o e-mail ou não, para não revelar quais e-mails estão cadastrados.

### 3.7 `POST /auth/refresh` (previsto, opcional)

Renovação do token sem novo login. O app ainda **não** usa. Se o backend adotar, o login passa a devolver também `refreshToken`, e este endpoint recebe `{ "refreshToken": "..." }` e devolve um novo `accessToken`.

---

## 4. Formato padrão de erro

Toda resposta de erro (4xx/5xx) deve seguir este corpo:

```json
{
  "codigo": "VALIDACAO",
  "mensagem": "Dados inválidos.",
  "campos": {
    "email": "E-mail inválido.",
    "endereco.cep": "CEP inválido."
  }
}
```

| Campo | Regra |
|---|---|
| `codigo` | Constante em MAIÚSCULAS, estável (o app pode decidir por ela) |
| `mensagem` | Texto em português, pronto para exibir ao usuário |
| `campos` | Opcional. Chave = caminho do campo no JSON (`endereco.cep`); valor = mensagem para aquele campo |

**Códigos usados**

| HTTP | `codigo` |
|---|---|
| 400 | `VALIDACAO` |
| 401 | `CREDENCIAIS_INVALIDAS`, `TOKEN_INVALIDO`, `TOKEN_EXPIRADO` |
| 400 | `FOTO_INVALIDA` |
| 403 | `PERFIL_INVALIDO` |
| 404 | `PRESTADOR_NAO_ENCONTRADO`, `FOTO_NAO_ENCONTRADA` |
| 409 | `EMAIL_JA_CADASTRADO`, `CPF_JA_CADASTRADO` |
| 413 | `FOTO_MUITO_GRANDE` |
| 500 | `ERRO_INTERNO` |

---

## 5. Regras de validação

O app valida antes de enviar, mas só para dar resposta rápida. **O backend deve repetir todas as regras**, pois é a fonte da verdade.

| Campo | Regra |
|---|---|
| `nome` | Obrigatório; pelo menos nome e sobrenome |
| `cpf` | 11 dígitos; único (sem checagem de dígito verificador — projeto acadêmico, não precisa ser um CPF real) |
| `telefone` | 10 ou 11 dígitos (DDD + número); DDD ≥ 11; com 11 dígitos, o terceiro dígito é `9` |
| `email` | Formato válido; único |
| `senha` | Mínimo 8 caracteres, com maiúscula, minúscula, número e caractere especial |
| `endereco.cep` | 8 dígitos |
| `endereco.logradouro` | Obrigatório |
| `endereco.numero` | Obrigatório; até 10 caracteres |
| `endereco.complemento` | Opcional |
| `endereco.bairro` | Obrigatório |
| `endereco.cidade` | Obrigatório |
| `endereco.uf` | Sigla de estado válida, 2 letras maiúsculas |

No login, o app só exige e-mail válido e senha preenchida. Não aplica as regras de força de senha.

---

## 6. Testar o backend sem o app (curl)

```bash
# Cadastro
curl -i -X POST http://localhost:8080/api/v1/clientes \
  -H "Content-Type: application/json" \
  -d '{"nome":"Maria Silva","cpf":"00000000000","telefone":"11987654321","email":"maria@email.com","senha":"Senha@123","endereco":{"cep":"01310100","logradouro":"Avenida Paulista","numero":"1000","bairro":"Bela Vista","cidade":"São Paulo","uf":"SP"}}'

# Login
curl -i -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"maria@email.com","senha":"Senha@123"}'

# Usuário logado (troque TOKEN pelo accessToken do login)
curl -i http://localhost:8080/api/v1/usuarios/me \
  -H "Authorization: Bearer TOKEN"

# Cadastro de prestador
curl -i -X POST http://localhost:8080/api/v1/prestadores \
  -H "Content-Type: application/json" \
  -d '{"nome":"Francisco Oliveira","cpf":"00000000001","telefone":"11987654321","email":"francisco@email.com","senha":"Senha@123","endereco":{"cep":"01310100","logradouro":"Avenida Paulista","numero":"1000","bairro":"Bela Vista","cidade":"São Paulo","uf":"SP"},"servicoPrincipal":"Jardinagem","areaAtendimento":"São Paulo - Zona Sul e Oeste","preco":130.00,"especialidades":["Poda de árvores"],"diasAtendimento":[1,2,3,4,5,6]}'

# Perfil completo do prestador logado (troque TOKEN pelo accessToken do login)
curl -i http://localhost:8080/api/v1/prestadores/me \
  -H "Authorization: Bearer TOKEN"
```

---

## 7. Como o app aponta para o backend

Crie `.env.local` na raiz do app (modelo em `.env.example`):

```
EXPO_PUBLIC_API_URL=http://192.168.0.10:8080/api/v1
EXPO_PUBLIC_USE_MOCK=false
```

- **Celular físico (Expo Go):** use o IP do computador do backend na mesma rede Wi-Fi, não `localhost`. O backend precisa aceitar conexões de fora da máquina (escutar em `0.0.0.0`) e o firewall precisa liberar a porta.
- **Emulador Android:** `http://10.0.2.2:8080/api/v1`.
- Depois de mudar o `.env.local`, reinicie com `npx expo start -c`.
- **Modo simulado:** com `EXPO_PUBLIC_USE_MOCK=true` o app funciona sem backend. Login: `teste@nesha.com` / `Senha@123`.
  Na Área do Prestador: `prestador@example.com` / `Senha@123`.

**Onde fica no código do app**

| Arquivo | Função |
|---|---|
| `src/services/api.ts` | Cliente HTTP (token, timeout, erros padronizados) |
| `src/services/auth.ts` | Chamadas `login`, `register`, `registerPrestador`, `getMe`, `getPrestadorMe` (e o modo simulado) |
| `src/types/auth.ts` | Tipos das requisições e respostas |
| `src/contexts/AuthContext.tsx` | Sessão: guarda o token e restaura ao abrir |

---

## 8. Pontos para alinhar com o backend

1. **Rotas e nomes de campos** acima estão ok, ou o backend prefere outros?
2. ~~**Login compartilhado** entre Cliente e Prestador (diferenciado por `perfil`) ou rotas separadas?~~
   **Resolvido:** login compartilhado, único `POST /auth/login` para os dois perfis — ver seção 3.1.
3. **Refresh token:** será usado? Qual a validade do `accessToken`?
4. **Confirmação de e-mail** no cadastro: vai existir? Se sim, o fluxo muda (cadastro não libera login até confirmar).
5. **Formato de erro** da seção 4 está ok para o backend padronizar?
6. **CPF vs. CNPJ no cadastro de prestador:** a tela `cadastro-prestador` no Figma pede "CPF ou
   CNPJ", mas o backend aceita hoje **somente CPF** (mesma validação `@CpfValido` do cliente, 11
   dígitos). Suportar CNPJ exigiria um validador novo e, possivelmente, campos adicionais de pessoa
   jurídica — ficou de fora desta tarefa. Fluxo e UI não devem oferecer CNPJ até isso ser decidido.
7. **Campos de perfil do prestador por categoria:** as telas `configuracoes-servico-prestador` no
   Figma modelam preço e disponibilidade **por categoria de serviço** (um prestador pode ter preço e
   agenda diferentes para "Jardinagem" e "Manutenção de Piscina", por exemplo). O backend desta tarefa
   modela isso de forma mais simples — um preço, uma lista de dias e uma lista de especialidades por
   prestador (tabela `prestador_perfil`) — suficiente para `cadastro-prestador`,
   `perfil-prestador` e `meu-perfil-prestador`. Configuração por categoria fica para uma tarefa futura,
   quando o grupo decidir o modelo (provavelmente uma tabela `prestador_categoria` com preço e agenda
   próprios).
8. ~~**Foto de perfil do prestador:** upload próprio ou só URL?~~ **Resolvido:** upload pelo app
   (seção 3.4.2), guardado no banco e servido publicamente (seção 3.4.3).
9. **Login do prestador por CPF/CNPJ:** a tela `login-prestador` no Figma pede "CPF ou CNPJ" e senha,
   mas o app usa **e-mail** e senha, como o cliente, porque o `POST /auth/login` é o mesmo para os
   dois perfis. Trocar exigiria aceitar CPF no login do backend.
