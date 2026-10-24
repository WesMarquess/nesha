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
| POST | `/clientes` | Público | Tela de cadastro |
| GET | `/usuarios/me` | Bearer | Restaurar sessão ao abrir o app |
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
- `perfil`: `CLIENTE` ou `PRESTADOR`. O app do cliente só aceita `CLIENTE` e mostra erro para outro perfil.

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
  "cpf": "52998224725",
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

### 3.3 `GET /usuarios/me`

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

### 3.4 `POST /auth/forgot-password` (previsto)

Dispara o e-mail de recuperação de senha. A tela ainda não existe no app.

```json
{ "email": "maria@email.com" }
```

**Resposta `204 No Content`** — sempre, exista o e-mail ou não, para não revelar quais e-mails estão cadastrados.

### 3.5 `POST /auth/refresh` (previsto, opcional)

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
| 403 | `PERFIL_INVALIDO` |
| 409 | `EMAIL_JA_CADASTRADO`, `CPF_JA_CADASTRADO` |
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
  -d '{"nome":"Maria Silva","cpf":"52998224725","telefone":"11987654321","email":"maria@email.com","senha":"Senha@123","endereco":{"cep":"01310100","logradouro":"Avenida Paulista","numero":"1000","bairro":"Bela Vista","cidade":"São Paulo","uf":"SP"}}'

# Login
curl -i -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"maria@email.com","senha":"Senha@123"}'

# Usuário logado (troque TOKEN pelo accessToken do login)
curl -i http://localhost:8080/api/v1/usuarios/me \
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

**Onde fica no código do app**

| Arquivo | Função |
|---|---|
| `src/services/api.ts` | Cliente HTTP (token, timeout, erros padronizados) |
| `src/services/auth.ts` | Chamadas `login`, `register`, `getMe` (e o modo simulado) |
| `src/types/auth.ts` | Tipos das requisições e respostas |
| `src/contexts/AuthContext.tsx` | Sessão: guarda o token e restaura ao abrir |

---

## 8. Pontos para alinhar com o backend

1. **Rotas e nomes de campos** acima estão ok, ou o backend prefere outros?
2. **Login compartilhado** entre Cliente e Prestador (diferenciado por `perfil`) ou rotas separadas?
3. **Refresh token:** será usado? Qual a validade do `accessToken`?
4. **Confirmação de e-mail** no cadastro: vai existir? Se sim, o fluxo muda (cadastro não libera login até confirmar).
5. **Formato de erro** da seção 4 está ok para o backend padronizar?
