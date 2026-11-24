# Contas de teste

Contas criadas automaticamente pelo backend no perfil `dev` (classe
`backend/src/main/java/com/nesha/backend/config/DadosDeTeste.java`). Servem só para testar e
apresentar o app: não são criadas no perfil `prod` nem nos testes automáticos.

**Senha de todas as contas:** `Nesha@123`

## Como funciona

- O banco do perfil `dev` é um H2 em arquivo, na pasta `backend/data/` (ignorada pelo git). Os
  dados continuam depois de reiniciar o backend.
- Ao subir, o backend cria as contas abaixo **que ainda não existirem** (pelo e-mail). Na primeira
  vez isso leva alguns segundos: espere a linha `Dados de teste: N conta(s) criada(s)` no log antes
  de entrar no app.
- Para começar do zero (apagar agendamentos, avaliações e contas criadas pelo app), pare o
  backend, apague a pasta `backend/data` e suba de novo: as contas de teste são recriadas.
- Com o backend rodando, o console do H2 fica em `http://localhost:8080/h2-console` (JDBC URL
  `jdbc:h2:file:./data/nesha`, usuário `sa`, sem senha).

## Cliente

| Nome | E-mail | Endereço |
|---|---|---|
| Mariana Oliveira | `cliente@example.com` | Rua das Flores, 123, Apto 42, Itaim Bibi, São Paulo - SP |

Use esta conta para contratar e pagar. O pagamento acontece no checkout do Mercado Pago: lá, entre
com a **conta de comprador de teste** do Mercado Pago (não é a conta do app) e pague com um cartão
de teste com titular `APRO` (passo a passo em `docs/AGENDA.md`, seção 13).

## Prestadores (2 por serviço do catálogo)

Entre pela tela de login do profissional. Prestadores com valor "A combinar" recebem a
solicitação sem passar pelo pagamento.

| Serviço | Nome | E-mail | Valor | Dias | Atendimento |
|---|---|---|---|---|---|
| Limpeza Residencial | Aline Souza | `aline@example.com` | R$ 160 / dia | Seg a Sáb | São Paulo - Centro e Zona Sul |
| Limpeza Residencial | Juliana Ribeiro | `juliana@example.com` | R$ 130 / dia | Seg a Sex | São Paulo - Zona Oeste |
| Limpeza reforçada (pós obra) | Roberto Almeida | `roberto@example.com` | R$ 350 / serviço | Seg a Sáb | São Paulo - Todas as regiões |
| Limpeza reforçada (pós obra) | Sandra Moreira | `sandra@example.com` | A combinar | Seg a Sex | São Paulo - Zona Norte |
| Organizador Profissional | Camila Fernandes | `camila@example.com` | R$ 180 / dia | Seg a Sex | São Paulo - Zona Sul e Oeste |
| Organizador Profissional | Patrícia Lopes | `patricia@example.com` | R$ 200 / dia | Seg a Sáb | São Paulo - Centro |
| Passadeira e Lavadeira | Beatriz Costa | `beatriz@example.com` | R$ 110 / dia | Seg a Sáb | São Paulo - Zona Sul |
| Passadeira e Lavadeira | Marlene Duarte | `marlene@example.com` | R$ 100 / dia | Seg a Sex | São Paulo - Zona Leste |
| Limpeza e Manutenção de Piscinas | Thiago Martins | `thiago@example.com` | R$ 150 / serviço | Seg a Sáb | São Paulo - Zona Sul e Oeste |
| Limpeza e Manutenção de Piscinas | Eduardo Pires | `eduardo@example.com` | R$ 170 / serviço | Todos os dias | Grande São Paulo |
| Eletricista Residencial | Marcos Vieira | `marcos@example.com` | R$ 90 / hora | Seg a Sáb | São Paulo - Zona Norte e Centro |
| Eletricista Residencial | Rafael Gomes | `rafael@example.com` | R$ 100 / hora | Seg a Sex | São Paulo - Zona Oeste |
| Encanador | José Carvalho | `jose@example.com` | R$ 80 / hora | Seg a Sáb | São Paulo - Zona Leste |
| Encanador | Paulo Henrique | `paulo@example.com` | R$ 95 / hora | Todos os dias | São Paulo - Centro e Zona Sul |
| Pintor Residencial | Antônio Ferreira | `antonio@example.com` | R$ 120 / dia | Seg a Sáb | São Paulo - Zona Sul |
| Pintor Residencial | Lucas Barbosa | `lucas@example.com` | R$ 140 / dia | Seg a Sex | São Paulo - Zona Oeste e Centro |
| Gesseiro | Sérgio Nascimento | `sergio@example.com` | R$ 250 / dia | Seg a Sáb | São Paulo - Todas as regiões |
| Gesseiro | Wagner Teixeira | `wagner@example.com` | A combinar | Seg a Sex | São Paulo - Zona Norte |
| Pedreiro | Francisco Oliveira | `francisco@example.com` | R$ 200 / dia | Seg a Sáb | São Paulo - Zona Sul e Oeste |
| Pedreiro | Gilberto Santos | `gilberto@example.com` | R$ 220 / dia | Seg a Sex | São Paulo - Zona Leste |
| Montador de Móveis | Diego Rocha | `diego@example.com` | R$ 70 / serviço | Seg a Sáb | São Paulo - Centro e Zona Norte |
| Montador de Móveis | Felipe Araújo | `felipe@example.com` | R$ 85 / serviço | Todos os dias | São Paulo - Zona Sul |
| Chaveiro | Ricardo Mendes | `ricardo@example.com` | R$ 60 / serviço | Todos os dias | São Paulo - Todas as regiões |
| Chaveiro | Vinícius Castro | `vinicius@example.com` | R$ 75 / serviço | Seg a Sáb | São Paulo - Zona Oeste |
| Instalação de Redes e Telas de Proteção | André Cardoso | `andre@example.com` | R$ 150 / serviço | Seg a Sáb | São Paulo - Zona Sul e Centro |
| Instalação de Redes e Telas de Proteção | Rodrigo Nunes | `rodrigo@example.com` | R$ 160 / serviço | Seg a Sex | São Paulo - Zona Norte e Leste |
| Cozinheiro Doméstico | Helena Prado | `helena@example.com` | R$ 150 / dia | Seg a Sex | São Paulo - Zona Oeste |
| Cozinheiro Doméstico | Rosana Freitas | `rosana@example.com` | R$ 170 / dia | Seg a Sáb | São Paulo - Zona Sul |
| Jardineiro | Marta Rocha | `marta@example.com` | R$ 120 / dia | Seg, Qua e Sex | São Paulo - Centro e Zona Norte |
| Jardineiro | Carlos Eduardo | `carlos@example.com` | R$ 150 / dia | Seg a Sex | São Paulo - Todas as regiões |
| Controle de Pragas | Fábio Monteiro | `fabio@example.com` | R$ 190 / serviço | Seg a Sáb | São Paulo - Todas as regiões |
| Controle de Pragas | Leandro Batista | `leandro@example.com` | R$ 210 / serviço | Seg a Sex | São Paulo - Zona Leste e Centro |
