# Celebrare — instruções de projeto

Plataforma multi-evento de convite e RSVP (celebrare.me) — cada host cria
sua conta e gerencia o próprio evento (aniversário, casamento, etc.) num
dashboard; convidado nunca precisa de login. Migração de "Arca do Davi"
(site de aniversário de 1 ano do Davi, single-tenant) pra essa plataforma:
ver docs/saas-platform-plan.md. O evento do Davi (`/e/arca-do-davi`,
slug fixo em `src/app/page.tsx`) é o primeiro evento da plataforma — ainda
sem host próprio (nunca passou por signup), administrado via `/internal/*`
até o aniversário real (2026-07-11).

## Stack
- Next.js 16 (App Router, Turbopack), TypeScript estrito, Tailwind CSS
- Dados: Postgres direto via Drizzle ORM + `pg` (`DATABASE_URL`) — local em
  dev, mesmo Postgres hospedado pela Supabase em produção por ora. Ver
  docs/saas-platform-plan.md (fase 1 — migração em andamento).
- Storage de mídia: S3-compatible (`@aws-sdk/client-s3`,
  `src/infrastructure/storage/`) contra o endpoint S3 do Supabase Storage
  (bucket `media`) — fase 6. Não existe mais `@supabase/supabase-js` no
  projeto.
- Autenticação de host: Auth.js (NextAuth v5) com Credentials provider
  (email/senha, bcryptjs) + adapter Drizzle, sem OAuth por ora (fase 5).
  Convidado nunca loga — isso é só pro dono do evento gerenciar seu próprio
  evento (dashboard ainda não existe — fase 7).
- Deploy: Vercel

## Comandos
- `npm run dev` — servidor local
- `npm run build` — build de produção; rodar localmente antes de todo deploy
- `npm run lint` — ESLint
- `npm run test` — testes unitários (vitest) da camada `application/use-cases/`
- `npm run db:generate` — gera migration Drizzle a partir de
  `src/infrastructure/postgres/schema.ts`
- `npm run db:migrate` — aplica as migrations de
  `src/infrastructure/postgres/migrations/` em `DATABASE_URL`

## Regras inegociáveis (segurança)
Detalhe completo em `.claude/rules/security.md` (carregado em toda sessão).
Resumo: nenhuma chave (Supabase, `DATABASE_URL`, `S3_*`, `AUTH_SECRET`) chega
ao browser; nenhuma tem prefixo `NEXT_PUBLIC_`; não usar `"use cache"` em
dados mutáveis (`gift_items`, `rsvps`, `guestbook_messages`).

## Arquitetura
Camadas em `src/domain/ -> src/application/ -> src/infrastructure/ -> src/app/`.
Detalhe completo e mapeamento SOLID em `.claude/rules/architecture.md`.

## Domínio
Entidades, tabelas, enums e regras de negócio (claim atômico de presente,
fulfillment de item em quantidade com overshoot, mural sem moderação): @docs/domain-model.md

## Identidade visual
Paleta, tipografia, iconografia e mapeamento de seções pro mockup de
referência (Arca de Noé / safari de bebê): @docs/visual-identity.md

## Histórico
O roteiro de construção original (prompts por etapa, usados só durante o
bootstrap) está em `docs/build-plan.md`. Não precisa ser relido em sessões de
manutenção — não está importado aqui de propósito, pra não consumir contexto
com algo que já foi executado.