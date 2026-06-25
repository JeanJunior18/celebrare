# Plano — Arca do Davi → plataforma SaaS multi-tenant

Documento de planejamento da transformação do site de convite/RSVP de um
único evento (aniversário de 1 ano do Davi) numa plataforma que serve
múltiplos eventos (casamentos e aniversários) de múltiplos hosts.

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
