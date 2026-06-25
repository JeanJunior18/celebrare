---
paths:
  - "src/**/*.ts"
  - "src/**/*.tsx"
---

# Architecture & SOLID conventions

Arquitetura em camadas (ports & adapters). Direção de dependência:
domain -> application -> infrastructure/app. Nunca o inverso.

## Camadas

- `domain/entities/` — tipos puros em TypeScript. Sem import de React,
  Next.js ou Supabase.
- `domain/repositories/` — só interfaces (ports). Sem implementação.
- `application/use-cases/` — uma função por use case, recebe uma instância
  de repositório como parâmetro (injeção via construtor/factory), valida
  input com `zod`, chama o repositório, devolve um resultado tipado. Sem
  import de nada em `infrastructure/`.
- `infrastructure/postgres/` — implementações concretas (adapters) dos
  repositórios de domínio, via Drizzle ORM + driver `pg`, contra
  `DATABASE_URL` (Postgres local em dev; mesmo Postgres hospedado pela
  Supabase, por ora, em produção — ver docs/saas-platform-plan.md). Cada
  repositório recebe a instância `db` (`NodePgDatabase`) via construtor —
  nunca importa o client de `./client.ts` diretamente dentro de si. A lógica
  atômica que já existia como função/trigger Postgres (`claim_gift_item`,
  `upsert_rsvp`, fulfillment de fralda) continua no banco
  (`src/infrastructure/postgres/migrations/`); os repositórios chamam essas
  functions via SQL crua (`db.execute(sql\`select * from ...\`)`), nunca
  reimplementam essa lógica em TypeScript.
- `infrastructure/storage/` — port `MediaStorage` (`upload(path, data,
  contentType): Promise<string>`) + adapter `S3MediaStorage`
  (`@aws-sdk/client-s3`, fase 6), único lugar autorizado a importar esse
  SDK. Aponta hoje pro endpoint S3-compatible do Supabase Storage (bucket
  `media`) via env vars `S3_*`; trocar de provider (R2, S3 real) é só mudar
  essas env vars e a URL pública em `createMediaStorage()`
  (`s3-media-storage.ts`), sem tocar nos repositórios que chamam
  `uploadImageToMedia`/`uploadRemoteImageToMedia` (`upload-image.ts`). Não
  existe mais `@supabase/supabase-js` no projeto — DB e Storage são ambos
  acessados por protocolos genéricos (Postgres direto, S3).
- `infrastructure/auth/auth.ts` — único lugar autorizado a importar
  `next-auth`/`@auth/drizzle-adapter` (fase 5). O callback `authorize` do
  Credentials provider não fala com o banco direto — instancia
  `PostgresHostRepository` e chama o use case `authenticate-host`, mesmo
  padrão de DI dos outros repositórios. `signIn`/`signOut` exportados daqui
  são consumidos só por `app/actions/auth.actions.ts`.
- `app/actions/` — Server Actions (`'use server'`). Composition root: é o
  único lugar que conecta uma implementação concreta de `infrastructure/` a
  um use case de `application/`. Sem lógica de negócio ou validação aqui —
  isso já aconteceu no use case.
- `components/ui/` — primitivos de apresentação, sem lógica de negócio, sem
  fetch de dados.
- `components/sections/` — um componente por seção de domínio (Hero, Rsvp,
  GiftRegistry, Gallery, Guestbook, Footer). Server Component por padrão; só
  a folha interativa (um formulário, um botão de claim) é Client Component.

## Mapeamento SOLID

- **SRP** — um componente de formulário nunca chama o Postgres/S3 direto; um
  repositório nunca decide regra de negócio; um use case nunca renderiza nada.
- **OCP** — o comportamento por categoria de presente (`REGISTRY_ITEM` vs
  `DIAPER_PACK`) é um strategy map indexado por `GiftCategory`, não um
  `if/else` espalhado pelos componentes. Nova categoria no futuro = nova
  entrada no map, sem editar branch existente.
- **LSP** — qualquer implementação de `GiftRepository` precisa devolver os
  mesmos formatos de resultado tipado pros casos esperados (ex:
  `{ success: false, reason: 'ALREADY_CLAIMED' }`), nunca lançar throw pra um
  resultado de negócio esperado.
- **ISP** — interfaces de repositório pequenas, uma por domínio
  (`RsvpRepository`, `GiftRepository`, `GuestbookRepository`,
  `GalleryRepository`, `HostRepository`). Nunca fundir num repositório
  genérico.
- **DIP** — `application/use-cases/` e `app/actions/` dependem das
  interfaces em `domain/repositories/`, nunca de uma classe concreta do
  Postgres ou do Supabase diretamente.

Schema completo e regras de negócio detalhadas: @docs/domain-model.md