# Nesha

App de marketplace de serviços domésticos: conecta clientes a profissionais qualificados (faxina, manutenção, reparos etc.) para contratação, agendamento e acompanhamento de serviços.

## Visão geral

O projeto tem dois perfis de usuário — **Cliente** (contrata) e **Prestador** (presta o serviço) — e é dividido em:

- **App mobile**: construído com Expo Router, cobre cadastro/login, catálogo de serviços e agenda (para cliente e prestador).
- **Backend**: API em Java/Spring Boot responsável por autenticação e cadastro de clientes.

Hoje o app já cobre o fluxo de autenticação (login/cadastro de cliente) e a agenda de atendimentos; o catálogo de categorias é funcional sobre dados estáticos. Fluxos de descoberta de profissionais, contratação e pagamento ainda não foram implementados.

## Stack

| Camada | Tecnologia |
|---|---|
| App | Expo Router, React Native, TypeScript |
| Backend | Java 21, Spring Boot, Spring Security (JWT), Spring Data JPA |
| Banco de dados | H2 em memória (dev) / PostgreSQL (prod) |

## Estrutura

```
nesha/
├── app/                        # rotas (Expo Router — cada arquivo é uma tela)
│   ├── (auth)/                 # login, cadastro — não autenticado
│   └── (app)/                  # catálogo, agenda, perfil — autenticado
│       └── prestador/          # telas da área do prestador
├── src/
│   ├── components/             # componentes reutilizáveis (Button, Card, BottomNav...)
│   ├── contexts/                # AuthContext — sessão e token
│   ├── services/                 # cliente HTTP, chamadas de auth, ViaCEP
│   ├── data/                     # dados de telas ainda sem backend próprio (agenda, categorias)
│   ├── theme/                    # cores
│   ├── types/                    # tipos compartilhados
│   └── utils/                    # máscaras e validadores
├── assets/images/               # ícones do app e imagens de categorias do catálogo
├── docs/API.md                  # contrato de API entre app e backend
└── backend/                      # API Spring Boot (ver backend/README.md)
```

## Como rodar

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto. O valor de `EXPO_PUBLIC_API_URL` muda dependendo de onde você vai rodar o app — veja as opções abaixo.

Para desenvolver sem o backend, use o modo simulado:

```
EXPO_PUBLIC_USE_MOCK=true
```

Com isso o login funciona com `teste@nesha.com` / `Senha@123` e o cadastro não persiste de verdade. Pule a seção "Rodar o backend" se for usar esse modo.

### 3. Rodar o backend (opcional, para testar com dados reais)

```bash
cd backend
./mvnw spring-boot:run
```

Sobe em `http://0.0.0.0:8080` com banco H2 em memória — não precisa de nenhuma configuração extra. Deixe esse terminal aberto enquanto testa o app.

### 4. Rodar o app

#### Testando no navegador (web)

Nesse caso o `.env.local` pode usar `localhost`, já que o navegador roda na mesma máquina que o backend:

```
EXPO_PUBLIC_API_URL=http://localhost:8080/api/v1
EXPO_PUBLIC_USE_MOCK=false
```

```bash
npx expo start --web
```

#### Testando no celular físico (Expo Go)

O celular é um dispositivo separado na rede, então `localhost` não funciona — é preciso usar o IP da sua máquina na rede Wi-Fi.

1. Descubra o IP da sua máquina:

   ```bash
   # macOS
   ipconfig getifaddr en0

   # Windows
   ipconfig (endereço IPv4)
   ```

2. Use esse IP no `.env.local`:

   ```
   EXPO_PUBLIC_API_URL=http://SEU_IP_AQUI:8080/api/v1
   EXPO_PUBLIC_USE_MOCK=false
   ```

3. Garanta que o celular e o computador estão na **mesma rede Wi-Fi**.

4. Suba o Expo e escaneie o QR code com o app Expo Go:

   ```bash
   npx expo start
   ```

> Trocou de rede Wi-Fi? O IP muda — repita o passo 1 e atualize o `.env.local`.

#### Outros ambientes

| Onde o app roda | `EXPO_PUBLIC_API_URL` |
|---|---|
| Simulador iOS | `http://localhost:8080/api/v1` |
| Emulador Android | `http://10.0.2.2:8080/api/v1` |
| Celular físico | IP da máquina na rede (ver acima) |

Depois de qualquer mudança no `.env.local`, reinicie com `npx expo start -c` (o `-c` limpa o cache para recarregar as variáveis).

### Fluxo de teste completo

Com `PULAR_LOGIN = false` em `src/config/dev.ts` (padrão), o app abre no login. Fluxo esperado:

`/login` → "Criar Conta Grátis" → `/cadastro` → preenche e envia → volta para `/login` (cadastro não loga automaticamente) → login com as credenciais cadastradas → catálogo de serviços.

## Outros comandos

```bash
npx expo lint        # lint
npx tsc --noEmit      # typecheck
```

## Documentação adicional

- [`docs/API.md`](docs/API.md) — contrato de API entre app e backend
- [`docs/DESIGN_PATTERNS.md`](docs/DESIGN_PATTERNS.md) — padrões de projeto fundamentais (State, Strategy, Observer, Adapter) e quando aplicá-los
- [`backend/README.md`](backend/README.md) — detalhes do backend (variáveis de ambiente, estrutura, endpoints)
