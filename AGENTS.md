<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Arca do Davi — estrutura e regras pro agente

## Camadas (`src/`)

```
domain/
  entities/          → tipos puros, zero dependências externas
  enums/
  repositories/       → interfaces (ports)
application/
  use-cases/          → regras de negócio, dependem só das interfaces
infrastructure/
  supabase/            → implementações concretas (adapters), só importado server-side
config/
  event.config.ts      → conteúdo estático do evento
app/
  actions/              → Server Actions = composition root
  internal/guest-log/   → rota oculta, service role
  page.tsx               → página única com seções por âncora
components/
  ui/         → primitivos sem lógica de negócio
  sections/   → uma seção por domínio (Hero, RSVP, Gift, Gallery, Guestbook)
  forms/
  gift/
```

Dependências fluem em uma direção só: `domain -> application -> infrastructure -> app`.
`domain/` nunca importa nada das outras camadas.

## Regra inegociável: client/server boundary

Nenhum arquivo com `'use client'` no topo pode importar `@supabase/supabase-js`
ou qualquer arquivo de `infrastructure/`. Dado vindo do servidor é buscado num
Server Component pai e passado via props, ou obtido através de uma Server
Action em `app/actions/`.

## Regra inegociável: cache

Não usar a diretiva `"use cache"` em nenhuma page, layout ou componente que
leia `gift_items`, `rsvps` ou `guestbook_messages` — esses dados precisam ser
sempre dinâmicos/frescos por request (status de presente reservado, contagem
de convidados, etc. não podem ficar desatualizados).
