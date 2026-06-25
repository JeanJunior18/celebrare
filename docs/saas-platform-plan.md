# Plano — Arca do Davi → plataforma SaaS multi-tenant (Celebrare)

Documento de planejamento da transformação do site de convite/RSVP de um
único evento (aniversário de 1 ano do Davi) numa plataforma que serve
múltiplos eventos (casamentos e aniversários) de múltiplos hosts. Nome e
domínio decididos em 2026-06-25: **Celebrare** (celebrare.me).

Este documento descreve o estado final desejado e as fases pra chegar lá.
Não substitui @docs/domain-model.md nem @docs/visual-identity.md — quando a
migração avançar, este arquivo deve ser incorporado a eles e removido.

## Decisões de escopo (confirmadas)

- **Onboarding**: self-service — host se cadastra e gerencia o próprio
  evento num dashboard autenticado.
- **Billing**: fora desta fase. Sem Stripe, sem planos, sem gate de feature.
- **URL pública**: path com slug (`/e/[slug]`), sem subdomínio nem domínio
  customizado por enquanto. Futuramente será por subdomínio
- **Temas**: 2 temas no lançamento — `WEDDING` e `BIRTHDAY` — modelados como
  dados no Postgres (tabela `themes`), não como enum/arquivo TS, pra permitir
  adicionar um 3º tema futuramente sem deploy de código.
- **Dependência de Supabase**: reduzir ao mínimo. Supabase continua sendo o
  Postgres hospedado (por ora), mas o código deve tratá-lo como "um Postgres
  qualquer" — sem usar Supabase Auth, sem depender do cliente PostgREST
  (`@supabase/supabase-js`) pra leitura/escrita, e com storage de mídia
  abstraído atrás de uma interface própria. Critério: qualquer peça
  Supabase-específica só entra se tiver benefício extremo que justifique o
  lock-in; o padrão é a opção portável. Futuramente será adicionado soluções
  mais baratas como S3 e um postgres em uma VPS com algum gerenciador de container

## A. Decisões arquiteturais (reduzir lock-in)

| Camada | Hoje (acoplado) | Proposto (portável) |
|---|---|---|
| Acesso a dados | `@supabase/supabase-js` (PostgREST) | **Drizzle ORM** + driver `pg` direto na `DATABASE_URL` — trocar de provider é só mudar a connection string |
| Migrations | CLI da Supabase (`supabase/migrations/`) | **Drizzle Kit** gerando SQL puro a partir do schema TypeScript |
| Autenticação de host | Supabase Auth (GoTrue, `auth.users`) | **Auth.js (NextAuth v5)** com adapter Drizzle — tabelas `users`/`accounts`/`sessions` no nosso próprio schema |
| Storage de mídia | `@supabase/supabase-js` Storage client | Interface `MediaStorage` em `src/infrastructure/storage/`, implementada com `@aws-sdk/client-s3` contra o endpoint S3-compatible do Supabase Storage — trocável por R2/S3 real sem tocar use-cases |
| Autorização | RLS (policies por `anon`/`service_role`) | Enforcement explícito em `src/application/use-cases/` (checagem de `owner_user_id`). RLS pode continuar como defesa adicional, mas deixa de ser a camada decisória — já é consistente com a regra de que client nunca fala direto com o banco |

A separação de camadas já existente
(`src/domain/ -> src/application/ -> src/infrastructure/ -> src/app/`) não
muda — a troca fica contida em `src/infrastructure/`.

## B. Domínios e modelos (schema)

### Auth.js (autenticação de host)

```sql
users(id, email, password_hash, created_at)
accounts(...)   -- tabela padrão do adapter Auth.js (suporte a OAuth futuro)
sessions(...)   -- tabela padrão do adapter Auth.js
```

### themes (novo — tema é dado, não enum)

| Campo | Tipo | Regra |
|---|---|---|
| id | uuid PK | |
| slug | text | unique, ex.: `WEDDING`, `BIRTHDAY` |
| name | text | nome exibível, ex.: "Casamento" |
| color_tokens | jsonb | mapeia pras CSS vars de `globals.css` (`primary`, `secondary`, `whimsy`, etc.) |
| default_copy | jsonb | headings/subtítulos default de cada seção (hoje hardcoded nos componentes) |
| default_illustration_url | text | ilustração padrão do tema |
| created_at | timestamptz | default now() |

### events (novo — tenant raiz)

| Campo | Tipo | Regra |
|---|---|---|
| id | uuid PK | |
| owner_user_id | uuid FK -> users.id | dono do evento |
| theme_id | uuid FK -> themes.id | |
| slug | text | unique, usado em `/e/[slug]` |
| honoree_name | text | nome do aniversariante ou do casal |
| subtitle_label | text | ex.: "1 aninho" ou "Casamento" |
| event_date | date | |
| event_time | time | |
| venue_name | text | |
| venue_address | text | |
| google_maps_url | text | nullable |
| quote_text | text | nullable |
| quote_reference | text | nullable |
| pix_key | text | nullable |
| pix_qr_code_url | text | nullable |
| created_at | timestamptz | default now() |

Substitui `src/config/event.config.ts` como fonte de verdade.

### Entidades existentes — ganham `event_id`

Todas referenciam `events.id`, mantendo as regras de negócio já documentadas
em @docs/domain-model.md (claim atômico via RPC, upsert de RSVP por
whatsapp, overshoot de fralda):

- `rsvps` (+ `event_id`)
- `gift_items` (+ `event_id`)
- `gift_claims` (+ `event_id`)
- `guestbook_messages` (+ `event_id`)
- `gallery_photos` (+ `event_id`; campo `age_label` (enum `baby_age_stage`)
  generalizado para `timeline_label text` livre — o enum fixo de estágios de
  bebê não serve pra casamento)

## C. Histórias de usuário

### Host (dono do evento)

- Como visitante, quero me cadastrar com email/senha pra criar meu evento.
- Como host, quero fazer login e ver um dashboard só do meu evento.
- Como host, quero escolher um tema (casamento/aniversário) ao criar o
  evento.
- Como host, quero editar os dados do meu evento (nome, data, local, pix,
  frase) sem precisar de deploy.
- Como host, quero adicionar/editar itens da lista de presentes e fotos da
  galeria pelo meu dashboard.
- Como host, quero ver a lista de RSVPs confirmados do meu evento.
- Como host (fora do MVP), quero customizar cores/textos do meu tema além
  do padrão.

### Convidado (sem login)

- Como convidado, quero acessar o site do evento por um link único
  (`/e/[slug]`).
- Como convidado, quero confirmar presença informando nome, whatsapp e
  quantidade de acompanhantes.
- Como convidado, quero reservar um item da lista de presentes, ou
  contribuir com fraldas mesmo que já tenha sido reservado o suficiente.
- Como convidado, quero deixar uma mensagem no mural do evento.
- Como convidado, quero ver a galeria de fotos e a chave/QR code do pix.

### Operador da plataforma (você)

- Como operador, quero ver todos os eventos cadastrados na plataforma.
- Como operador, quero criar/editar temas disponíveis (linha na tabela
  `themes`) sem precisar de deploy de código.

## D. Novas funcionalidades (visão de produto)

- Cadastro e login de host (Auth.js).
- Dashboard de host: CRUD do próprio evento + presentes + fotos + RSVPs,
  substituindo o admin global atual (`/internal/gifts`, `/internal/photos`,
  Basic Auth via `src/proxy.ts`).
- Seleção de tema na criação do evento, lido do banco (`themes`).
- Painel de operador: visão de todos os eventos; gestão de temas.
- Fora do MVP, citado mas não implementado agora: billing/assinatura,
  domínio customizado por evento, múltiplos eventos por host, theme builder
  totalmente customizável por host.

## E. Fases de implementação

Ordem pensada pra não quebrar a produção atual — o evento real do Davi
acontece em 2026-07-11 e o site já está no ar coletando RSVPs/presentes.

### Checklist de progresso

- [x] **Fase 1 — Trocar camada de dados** (`feat/saas`, 2026-06-24): Drizzle +
  `pg` instalados; schema das 5 tabelas em
  `src/infrastructure/postgres/schema.ts`; 6 repositórios novos em
  `src/infrastructure/postgres/` substituindo os `*.supabase.ts`; storage de
  mídia continua 100% Supabase. Validado com lint, testes unitários, `next
  build` e um fluxo real (RSVP, claim de presente, mural) contra Postgres
  local. **Pendente:** `DATABASE_URL` de produção (rodando só local até
  aqui) — precisa apontar pra connection string do Postgres hospedado pela
  Supabase antes de mergear `feat/saas` em `main`.
- [x] **Fase 2 — Migrations via Drizzle Kit** (parcial): baseline gerada em
  `src/infrastructure/postgres/migrations/` (`0000_graceful_hellcat.sql` +
  `0001_functions_and_triggers.sql`, espelhando `supabase/migrations/`).
  **Pendente:** aposentar de fato `supabase/migrations/` e o CLI da Supabase
  como ferramenta de migração — só faz sentido depois do cutover de
  produção da fase 1, pra não ter duas fontes de verdade de schema ao mesmo
  tempo.
- [x] **Fase 3 — `themes`** (`feat/saas`, 2026-06-25): tabela criada
  (`src/infrastructure/postgres/schema.ts` + migration `0002_wise_micromax.sql`);
  seed idempotente em `scripts/seed-themes.mjs` (`npm run db:seed-themes`)
  pros 2 temas. `BIRTHDAY` extraído fiel do que já está em produção
  (`globals.css` + textos hardcoded nas seções); `WEDDING` é placeholder —
  sem mockup de referência ainda, paleta/copy genéricas a revisar quando
  existir o primeiro evento desse tema. **Sem wiring no app ainda** — a
  tabela só passa a ser lida quando `events.theme_id` existir (fase 4); até
  lá nenhum componente foi alterado.
- [x] **Fase 4 — `events` + `event_id`** (`feat/saas`, 2026-06-25): tabela
  `events` criada (sem `owner_user_id` ainda — entra na fase 5, junto da
  tabela `users`); `event_id` adicionado nas 5 tabelas (nullable → backfill
  → `not null`, migrations `0003`–`0004`); seed do evento do Davi em
  `scripts/seed-davi-event.mjs` (`npm run db:seed-davi-event`), com dados de
  `event.config.ts` e tema `BIRTHDAY`. Como nenhum repositório passa
  `event_id` explicitamente ainda (isso só chega na fase 7), criei a
  function `default_event_id()` (migration `0005`) como `DEFAULT` da coluna
  nas 5 tabelas (migration `0006`) — mantém os caminhos de escrita atuais
  (RSVP, claim de presente, mural) funcionando sem tocar em código.
  Documentado no schema pra ser removido quando o app passar a escolher o
  evento explicitamente. Validado com lint, testes, build e o fluxo real de
  novo (RSVP, claim, mural — todos com `event_id` preenchido
  automaticamente).
- [x] **Fase 5 — Auth.js** (`feat/saas`, 2026-06-25): tabelas
  `user`/`account`/`session`/`verificationToken` no schema Drizzle
  (`src/infrastructure/postgres/schema.ts`, migration `0007`), formato
  compatível com `@auth/drizzle-adapter` (PK `uuid`, não `text`, pra
  consistência com o resto do schema). Só Credentials provider (email/senha
  com `bcryptjs`) — sem OAuth, decisão confirmada com o usuário antes de
  começar; `accounts`/`sessions`/`verificationToken` ficam sem uso por ora,
  prontas pra quando algum provider OAuth entrar. Sessão é JWT (Credentials
  não suporta sessão de banco). Camadas novas: `domain/entities/host.ts`,
  `domain/repositories/host-repository.ts`,
  `infrastructure/postgres/host-repository.postgres.ts`,
  `application/use-cases/{register,authenticate}-host.use-case.ts`,
  `infrastructure/auth/auth.ts` (único lugar autorizado a importar
  `next-auth`), `app/actions/auth.actions.ts`, páginas `/signup` e `/login`.
  `events.owner_user_id` ficou **nullable** — o evento do Davi não tem host
  (foi criado direto pelo dev, sem inventar conta/senha fake); passa a ser
  preenchido organicamente pelos eventos criados via signup, a partir da
  fase 7. Validado com lint, testes, build e fluxo real (signup → sessão
  JWT válida via `/api/auth/session`; login com senha certa funciona; senha
  errada nega login sem criar sessão).
- [x] **Fase 6 — Storage** (`feat/saas`, 2026-06-25): port `MediaStorage`
  (`upload(path, data, contentType)`) + adapter `S3MediaStorage`
  (`@aws-sdk/client-s3`) em `src/infrastructure/storage/`, contra o
  endpoint S3-compatible do Supabase Storage (env vars `S3_*`, geradas pelo
  usuário em Project Settings → Storage → S3 Connection). Trocados:
  `PostgresAdminGiftRepository`/`PostgresAdminGalleryRepository` (recebem
  `MediaStorage` em vez de `SupabaseClient`),
  `scripts/sync-mercadolivre-gifts.mjs`. `src/infrastructure/supabase/`
  removido por completo (ficou vazio) e `@supabase/supabase-js` desinstalado
  — não há mais nenhum uso da lib no projeto, DB e Storage são ambos
  protocolos genéricos agora. Validado com lint, build, testes e upload
  real pela UI de `/internal/gifts` — confirmei a imagem acessível
  publicamente na URL do bucket antes de limpar o dado de teste.
- [x] **Fase 7 — Roteamento por slug + dashboard de host** (`feat/saas`,
  2026-06-25): `src/app/e/[slug]/page.tsx` (público, qualquer evento) e
  `src/app/page.tsx` (slug fixo `arca-do-davi`) compartilham
  `<EventPage>`, que renderiza as 9 seções via props (`event` + `event.theme`)
  em vez de `eventConfig`/strings hardcoded; cores do tema injetadas via
  `<style>` com custom properties (`themeCssVariables`); `generateMetadata`
  por página (title/OG/Twitter) usando `react.cache()` pra não duplicar a
  query do evento. Correções de correção multi-tenant que apareceram no
  caminho: unique de `rsvps` passou a ser `(event_id, whatsapp_number)` —
  era global; `event_id` passou a ser explícito em todo repositório/use
  case/action/form (RSVP, claim de presente — incluindo `claim_gift_item`
  validar que o item pertence ao evento informado —, mural, admin), e o
  `default_event_id()` da fase 4 foi removido por já não ter consumidor.
  Dashboard em `src/app/dashboard/` (gate por `auth()`): sem evento próprio
  → form de criação (tema + dados); com evento → links pra
  `gifts`/`gallery`/`rsvps`, reaproveitando `AdminGiftForm`/`AdminPhotoForm`
  via prop de `action` em vez de duplicar componente.
  `/internal/gifts`/`/internal/photos` continuam administrando só o evento
  do Davi por enquanto (helper `getDaviEventId()`) — substituí-los de fato
  é trabalho do cutover (fase 8). Validado com lint, testes (+3 novos pro
  `create-event.use-case`), build e dois fluxos reais de ponta a ponta: (1)
  evento `WEDDING` criado direto no banco, renderizado em `/e/[slug]` com
  tema/copy/título corretos, sem afetar o evento do Davi; (2) signup →
  criar evento pelo dashboard → adicionar presente → ver a página pública
  → RSVP de convidado → confirmar na lista de confirmações do dashboard.
- [~] **Fase 8 — Cutover** (`feat/saas`, 2026-06-25, parcial — decisão
  deliberada de escopo): cadastro público em `/signup` já está aberto
  desde a fase 5, sem convite/aprovação — nada a fazer aí. Adicionada a
  visão de operador que faltava: `/internal/events` (lista todos os
  eventos, com/sem host) e `/internal/themes` (lista + cria/edita tema via
  formulário com textarea JSON pra `color_tokens`/`default_copy` — exatamente
  a história "criar/editar temas sem deploy" do plano). **Decisão:**
  `/internal/gifts` e `/internal/photos` **não foram removidos nem
  redirecionados** — continuam administrando só o evento do Davi
  (`getDaviEventId()`), porque é o único jeito de gerenciar esse evento
  (não tem host: `owner_user_id` é null de propósito, fase 5) e o
  aniversário real é em 2026-07-11, a ~2 semanas da data desta sessão.
  Substituir esse caminho por completo (ex.: criar um host pro Davi e
  migrar pro dashboard, ou apagar as rotas) é trabalho de uma sessão
  futura, feito com calma e fora da janela do evento real — não nessa
  sessão. Validado com lint, build, testes e fluxo real (listar eventos,
  editar tema existente, criar tema novo — todos refletindo na hora, sem
  deploy).

### Detalhe de cada fase

1. **Trocar camada de dados**: instalar Drizzle + `pg`; modelar as 5 tabelas
   atuais no schema Drizzle; reescrever os repositórios em
   `src/infrastructure/postgres/` (substitui `src/infrastructure/supabase/`)
   implementando as mesmas interfaces de `src/domain/repositories/` — zero
   mudança de comportamento visível.
2. **Migrations via Drizzle Kit**: gerar baseline a partir do schema atual;
   aposentar `supabase/migrations/` e o CLI da Supabase como ferramenta de
   migração (o Postgres em si continua sendo o hospedado pela Supabase).
3. **`themes`**: criar tabela; seed dos 2 temas extraindo cores de
   `src/app/globals.css` e textos hoje hardcoded nos componentes de seção.
4. **`events` + `event_id`**: criar tabela `events`; adicionar `event_id`
   nullable nas 5 tabelas; seed do evento do Davi (tema `BIRTHDAY` + dados
   de `event.config.ts` atual) e `UPDATE` em massa setando `event_id`;
   só então tornar a coluna `not null`.
5. **Auth.js**: tabelas `users`/`accounts`/`sessions`; fluxo de
   signup/login de host.
6. **Storage**: interface `MediaStorage` em `src/infrastructure/storage/` +
   implementação S3-compatible (`@aws-sdk/client-s3` contra o endpoint do
   Supabase Storage).
7. **Roteamento por slug + dashboard de host**: `src/app/e/[slug]/page.tsx`
   (público) substitui `src/app/page.tsx` hardcoded; `src/app/dashboard/`
   (autenticado) substitui o uso de `/internal/gifts` e `/internal/photos`
   como admin global do cliente final.
8. **Cutover**: abrir cadastro público; `/internal/*` (Basic Auth) passa a
   servir só a visão de operador da plataforma.

## Referências

- Modelo de domínio atual (pré-SaaS): @docs/domain-model.md
- Identidade visual e estrutura de seções: @docs/visual-identity.md
- Regras de segurança não-negociáveis: @.claude/rules/security.md
