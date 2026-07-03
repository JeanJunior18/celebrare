// Seed do evento do Davi na tabela `events`, a partir do que hoje está
// hardcoded em src/config/event.config.ts, e backfill de `event_id` nas 5
// tabelas de domínio que ainda tiverem a coluna nula. Ver
// docs/saas-platform-plan.md, fase 4.
//
// Idempotente: upsert por `slug`, seguro pra rodar de novo. Precisa rodar
// depois de `npm run db:seed-themes` (o tema BIRTHDAY precisa existir).
//
// Uso: npm run db:seed-davi-event

import { Pool } from 'pg';

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Variável de ambiente ${name} não configurada no .env`);
  return value;
}

const DAVI_EVENT_SLUG = 'arca-do-davi';

// Texto que era hardcoded no default do tema BIRTHDAY (agora genérico pra
// servir qualquer host) e virou override só do evento do Davi, pra a
// página dele não mudar.
const daviCopyOverrides = {
  nav: { brand: 'Arca do Davi' },
  hero: {
    eyebrow: 'Você está convidado para embarcar na',
    titlePrefix: 'Arca do',
    intro:
      'Há 1 ano, Davi Asher chegou e trouxe ainda mais alegria para a nossa família. Chegou a hora de celebrar seu 1º aniversário ao lado de pessoas especiais.',
  },
  giftRegistry: {
    description:
      'Preparamos uma lista com algumas sugestões de presentes para o Davi. Ela serve apenas como inspiração: você pode comprar pelos links, escolher em outro lugar ou presentear da forma que preferir. Damos preferência a brinquedos educativos e pedagógicos, que ajudam no desenvolvimento e nas descobertas dessa fase.',
  },
  gallery: { title: 'Um ano de aventuras' },
  guestbook: { subtitle: 'Deixe aqui uma mensagem cheia de carinho para o nosso pequeno navegador!' },
};

const daviEvent = {
  slug: DAVI_EVENT_SLUG,
  honoreeName: 'Davi',
  subtitleLabel: '1 aninho',
  eventDate: '2026-07-11',
  eventTime: '16:30',
  venueName: 'Sítio Portugal Eventos',
  venueAddress: 'Av. 1º de Maio, 341 — São Francisco, Codó - MA, 65400-000',
  heroImageUrl: '/hero-davi.jpg',
  googleMapsUrl: 'https://share.google/s5jo6eSNwlZ0iKPZM',
  quoteText: 'Dois a dois eles entraram na arca, como Deus havia ordenado a Noé.',
  quoteReference: 'Gênesis 7:9',
  pixKey: 'pix@asherlabs.com.br',
  pixQrCodeUrl: '/pix-qr-code.png',
  copyOverrides: daviCopyOverrides,
};

const tablesWithEventId = ['rsvps', 'gift_items', 'gift_claims', 'guestbook_messages', 'gallery_photos'];

async function main() {
  const databaseUrl = requireEnv('DATABASE_URL');
  const pool = new Pool({ connectionString: databaseUrl });

  const { rows: themeRows } = await pool.query("select id from themes where slug = 'BIRTHDAY'");
  if (themeRows.length === 0) {
    throw new Error("Tema BIRTHDAY não encontrado — rode 'npm run db:seed-themes' antes.");
  }
  const themeId = themeRows[0].id;

  const { rows: eventRows } = await pool.query(
    `insert into events (
       theme_id, slug, honoree_name, subtitle_label, event_date, event_time,
       venue_name, venue_address, hero_image_url, google_maps_url, quote_text,
       quote_reference, pix_key, pix_qr_code_url, copy_overrides
     )
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
     on conflict (slug) do update set
       theme_id = excluded.theme_id,
       honoree_name = excluded.honoree_name,
       subtitle_label = excluded.subtitle_label,
       event_date = excluded.event_date,
       event_time = excluded.event_time,
       venue_name = excluded.venue_name,
       venue_address = excluded.venue_address,
       hero_image_url = excluded.hero_image_url,
       google_maps_url = excluded.google_maps_url,
       quote_text = excluded.quote_text,
       quote_reference = excluded.quote_reference,
       pix_key = excluded.pix_key,
       pix_qr_code_url = excluded.pix_qr_code_url,
       copy_overrides = excluded.copy_overrides
     returning id`,
    [
      themeId,
      daviEvent.slug,
      daviEvent.honoreeName,
      daviEvent.subtitleLabel,
      daviEvent.eventDate,
      daviEvent.eventTime,
      daviEvent.venueName,
      daviEvent.venueAddress,
      daviEvent.heroImageUrl,
      daviEvent.googleMapsUrl,
      daviEvent.quoteText,
      daviEvent.quoteReference,
      daviEvent.pixKey,
      daviEvent.pixQrCodeUrl,
      JSON.stringify(daviEvent.copyOverrides),
    ],
  );
  const eventId = eventRows[0].id;
  console.log(`Evento ${DAVI_EVENT_SLUG} sincronizado (id ${eventId}).`);

  for (const table of tablesWithEventId) {
    const { rowCount } = await pool.query(
      `update ${table} set event_id = $1 where event_id is null`,
      [eventId],
    );
    console.log(`${table}: ${rowCount} linha(s) com event_id preenchido.`);
  }

  await pool.end();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
