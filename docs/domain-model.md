# Domain model — Arca do Davi

Fonte de verdade para qualquer código em `src/domain/`,
`src/infrastructure/supabase/`, ou nas migrations de `supabase/migrations/`.

## Entidades e tabelas

### rsvps

| Campo | Tipo | Regra |
|---|---|---|
| id | uuid PK | |
| guest_name | text | not null |
| companion_count | int | >= 0, default 0 |
| whatsapp_number | text | not null, **unique** |
| created_at | timestamptz | default now() |

RLS: sem nenhuma policy pra `anon` — nem insert, nem select. Toda escrita
passa pela RPC `upsert_rsvp` (ver regra de negócio #6); leitura só via
`SUPABASE_SECRET_KEY` em `app/internal/guest-log/`.

### gift_items

| Campo | Tipo | Regra |
|---|---|---|
| id | uuid PK | |
| name | text | not null |
| description | text | nullable |
| image_url | text | nullable, Supabase Storage |
| category | enum `gift_category` | REGISTRY_ITEM \| BULK_ITEM |
| size_label | text | nullable, só pra BULK_ITEM |
| quantity_needed | int | > 0, default 1 |
| status | enum `gift_status` | AVAILABLE \| CLAIMED \| FULFILLED |
| created_at | timestamptz | default now() |
| purchase_url | text | nullable, link de afiliado opcional — qualquer categoria, independente do fluxo de claim |

RLS: select liberado pra `anon`. Sem insert/update público — gerenciado via
dashboard, seed (`scripts/sync-mercadolivre-gifts.mjs`) ou pela rota privada
`src/app/internal/gifts/` (Basic Auth + `SUPABASE_SECRET_KEY`).

### gift_claims

| Campo | Tipo | Regra |
|---|---|---|
| id | uuid PK | |
| gift_item_id | uuid FK -> gift_items.id | |
| guest_name | text | not null |
| guest_whatsapp | text | nullable |
| quantity_claimed | int | > 0, default 1 |
| created_at | timestamptz | default now() |

RLS: insert liberado pra `anon`. Sem policy de select — identidade de quem
reservou nunca é exposta publicamente.

### guestbook_messages

| Campo | Tipo | Regra |
|---|---|---|
| id | uuid PK | |
| guest_name | text | not null |
| message | text | not null, <= 500 chars |
| is_approved | bool | default true |
| created_at | timestamptz | default now() |

RLS: insert liberado pra `anon`. Select liberado pra `anon` filtrado por
`is_approved = true`.

### gallery_photos

| Campo | Tipo | Regra |
|---|---|---|
| id | uuid PK | |
| age_label | enum `baby_age_stage` | NEWBORN \| THREE_MONTHS \| SIX_MONTHS \| NINE_MONTHS \| ONE_YEAR |
| image_url | text | not null |
| display_order | int | not null |

RLS: select liberado pra `anon` apenas. Insert só pela rota privada
`src/app/internal/photos/` (Basic Auth + `SUPABASE_SECRET_KEY`).

## Regras de negócio

1. **Claim de registry item é atômico.** Sempre via RPC
   `claim_gift_item(p_gift_item_id, p_guest_name, p_guest_whatsapp)` — nunca
   insert direto em `gift_claims` pra um `REGISTRY_ITEM`. A RPC faz
   `UPDATE gift_items SET status='CLAIMED' WHERE id=$1 AND status='AVAILABLE'`
   e só insere a claim se essa atualização afetou uma linha; se afetou zero,
   lança `'ALREADY_CLAIMED'`. A implementação de
   `GiftRepository.claimRegistryItem` precisa capturar essa exception e
   devolver `{ success: false, reason: 'ALREADY_CLAIMED' }` — nunca deixar
   propagar como throw não tratado (contrato de LSP da interface).

2. **Item em quantidade (`BULK_ITEM`) permite overshoot.** Insert direto em
   `gift_claims` com `quantity_claimed`. Um trigger
   (`trg_bulk_gift_fulfillment`) soma todas as claims daquele
   `gift_item_id` e marca `status = 'FULFILLED'` quando a soma atinge
   `quantity_needed`. Sem teto — reservar mais do que falta é permitido por
   design. Categoria genérica: serve pra roupas, fraldas ou qualquer
   presente onde vários convidados podem contribuir.

3. **PIX não é um `gift_item`.** É conteúdo estático de
   `config/event.config.ts` (chave + QR code) — nunca modelado como recurso
   reservável porque não é finito nem exclusivo.

4. **Mensagem do mural publica na hora.** `is_approved` nasce `true`. Sem
   fila de moderação. Pra remover algo, seta `is_approved = false` ou deleta
   a linha direto no dashboard do Supabase.

5. **`rsvps` não tem leitura pública, por design.** A única forma de listar
   confirmações é a rota interna em `app/internal/guest-log/`, que usa o
   client de service role. Todo o prefixo `/internal/*` (guest-log,
   `gifts/`, `photos/`) é protegido por Basic Auth via `src/proxy.ts`
   — não é mais só obscuridade de URL.

6. **RSVP é upsert por `whatsapp_number`, nunca insert cego.** Sempre via RPC
   `upsert_rsvp(p_guest_name, p_companion_count, p_whatsapp_number, p_confirm_update)`
   — nunca insert/update direto na tabela (não há policy de `anon` pra isso).
   A RPC primeiro busca uma linha com aquele `whatsapp_number`:
   - Se não existe, insere e retorna `{ status: 'CREATED' }`.
   - Se existe e `p_confirm_update = false`, **não altera nada** e retorna
     `{ status: 'ALREADY_EXISTS', guest_name, companion_count }` com os
     dados já registrados, pra UI perguntar "já existe uma confirmação de
     {guest_name}, quer atualizar a quantidade de acompanhantes?".
   - Se existe e `p_confirm_update = true`, atualiza **só** `companion_count`
     (nunca o nome) e retorna `{ status: 'UPDATED' }`.
   `RsvpRepository.upsert` devolve esse resultado tipado (`RsvpUpsertResult`)
   sem transformação — mesmo contrato de LSP do `claimRegistryItem`.

## Enums (TypeScript — precisam bater exatamente com os enums do Postgres)

```ts
enum GiftCategory { REGISTRY_ITEM = 'REGISTRY_ITEM', BULK_ITEM = 'BULK_ITEM' }
enum GiftStatus { AVAILABLE = 'AVAILABLE', CLAIMED = 'CLAIMED', FULFILLED = 'FULFILLED' }
enum BabyAgeStage {
  NEWBORN = 'NEWBORN', THREE_MONTHS = 'THREE_MONTHS', SIX_MONTHS = 'SIX_MONTHS',
  NINE_MONTHS = 'NINE_MONTHS', ONE_YEAR = 'ONE_YEAR',
}
```