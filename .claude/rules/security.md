# Security rules (não-negociáveis)

- Arquivos com `'use client'` no topo nunca importam `@supabase/supabase-js`,
  `drizzle-orm`/`pg`, nem nada de `src/infrastructure/`. Se um componente
  precisa de dado do servidor, busque num Server Component pai e passe via
  props, ou chame uma Server Action de `src/app/actions/`.
- `DATABASE_URL` (acesso direto ao Postgres via Drizzle, em
  `src/infrastructure/postgres/`) nunca aparece em código que entra no
  bundle do client, pelo mesmo motivo das chaves do Supabase abaixo — é uma
  connection string com privilégio total sobre as 5 tabelas de domínio, sem
  RLS de PostgREST no caminho. Desde a migração pra Drizzle
  (docs/saas-platform-plan.md, fase 1), é esse client — não mais o
  `@supabase/supabase-js` com chave `anon`/`publishable` — quem lê/escreve
  `rsvps`, `gift_items`, `gift_claims`, `guestbook_messages` e
  `gallery_photos`. RLS continua habilitada nas tabelas hospedadas pela
  Supabase como defesa em profundidade, mas deixou de ser a camada
  decisória de autorização — essa responsabilidade é do código em
  `src/infrastructure/postgres/` e `src/application/use-cases/`, que só é
  alcançável a partir de Server Components/Actions.
- `SUPABASE_SECRET_KEY` hoje é usada apenas pro Supabase Storage (bucket
  `media`): em `src/infrastructure/supabase/secret-server-client.ts`,
  consumido por `app/actions/admin-gift.actions.ts` e
  `app/actions/admin-gallery.actions.ts` (upload de imagem antes do insert
  via Postgres) e por `scripts/sync-mercadolivre-gifts.mjs`. Nunca deve
  aparecer dentro de `src/components/`, nem em nenhum arquivo que entre no
  bundle do client — scripts em `scripts/` rodam fora do Next.js (via
  `node`), nunca são importados pelo app.
- Nenhuma variável de ambiente com chave do Supabase tem prefixo
  `NEXT_PUBLIC_`. Se aparecer uma, é bug — corrige antes de seguir.
- `AUTH_SECRET` (assinatura dos JWT de sessão do Auth.js, fase 5) segue a
  mesma regra: nunca `NEXT_PUBLIC_`, nunca importado por código client. Senha
  de host nunca é armazenada em texto puro — só `password_hash` (bcryptjs,
  ver `application/use-cases/register-host.use-case.ts`), e o hash nunca sai
  de `domain/repositories/host-repository.ts`/`infrastructure/postgres/
  host-repository.postgres.ts` — `authenticate-host.use-case.ts` devolve o
  `Host` já sem o hash pro callback `authorize` do Auth.js.
- Não adicione a diretiva `"use cache"` em nenhuma page, layout ou componente
  que leia `gift_items`, `rsvps` ou `guestbook_messages`. Esses dados
  precisam ser dinâmicos a cada request — cache aqui mostraria status de
  claim ou contagem de convidados desatualizados.
- `rsvps` não tem rota pública de leitura, por design. O único caminho
  autorizado é `RsvpRepository.listAll()` (hoje `PostgresRsvpRepository`),
  chamado só a partir de `app/internal/guest-log/`. Não exponha esse método
  a nenhuma Server Action acessível por convidado.
- Antes de todo deploy, rode `next build` localmente e confirme que não falha
  por um client component importando código server-only — essa falha é
  esperada e correta, nunca silencie movendo o import pra outro lugar.
- Todo o prefixo `/internal/*` é protegido por Basic Auth em `src/proxy.ts`
  (convenção `proxy` do Next.js 16, equivalente ao antigo `middleware.ts`),
  que compara o header `Authorization` contra
  `ADMIN_BASIC_AUTH_USER`/`ADMIN_BASIC_AUTH_PASSWORD` (env vars setadas pelo
  usuário, nunca hardcoded). Qualquer rota nova criada sob
  `src/app/internal/` herda essa proteção automaticamente pelo `matcher` do
  proxy.