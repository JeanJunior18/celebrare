// Seed das ocasiões da plataforma (tabela `occasions`) — dado, não
// enum/arquivo TS, pra permitir adicionar uma 3ª ocasião futuramente sem
// deploy de código. Controla só o texto padrão (nav/hero/rsvp/...);
// paleta de cor é responsabilidade independente de `themes` (ver
// scripts/seed-themes.mjs) — cada evento escolhe as duas separadamente.
//
// BIRTHDAY: texto extraído do que já está em produção hoje (componentes
// de seção hardcoded pro evento do Davi). WEDDING: placeholder — sem
// mockup de referência ainda.
//
// Idempotente: upsert por `slug`, seguro pra rodar de novo.
//
// Uso: npm run db:seed-occasions

import { Pool } from 'pg';

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Variável de ambiente ${name} não configurada no .env`);
  return value;
}

// `{name}` é um placeholder literal, interpolado com `event.honoreeName`
// em `resolveEventCopy` (src/domain/entities/event.ts) — mesma ideia do
// hero, que já separa `titlePrefix` do nome renderizado à parte.
const birthdayDefaultCopy = {
  nav: {
    brand: 'Aniversário de {name}',
    links: [
      { href: '#inicio', label: 'Início' },
      { href: '#presenca', label: 'Presença' },
      { href: '#presentes', label: 'Presentes' },
      { href: '#como-chegar', label: 'Como chegar' },
      { href: '#galeria', label: 'Galeria' },
      { href: '#mensagens', label: 'Mensagens' },
    ],
  },
  hero: {
    eyebrow: 'Você está convidado para celebrar',
    intro: 'Chegou a hora de celebrar mais um aniversário ao lado de pessoas especiais.',
    titlePrefix: 'O aniversário de',
    tagline: 'Vai ser uma festa cheia de alegria com você!',
  },
  rsvp: {
    title: 'Confirme sua presença',
    subtitle: 'Sua presença tornará esse dia ainda mais especial!',
  },
  giftRegistry: {
    title: 'Lista de presentes',
    subtitle: 'O melhor presente é ter você conosco! Mas, se quiser nos presentear, escolha como preferir:',
    description: '',
    pixCardTitle: 'Pix presente',
    pixCardSubtitle: 'Contribua com qualquer valor.',
  },
  gallery: { title: 'Nossos momentos' },
  guestbook: {
    title: 'Mensagem para {name}',
    subtitle: 'Deixe aqui uma mensagem cheia de carinho!',
  },
  footer: { signoff: 'Com amor, para {name} 💚' },
};

const weddingDefaultCopy = {
  nav: {
    brand: 'Nosso Casamento',
    links: [
      { href: '#inicio', label: 'Início' },
      { href: '#presenca', label: 'Presença' },
      { href: '#presentes', label: 'Lista de casamento' },
      { href: '#como-chegar', label: 'Como chegar' },
      { href: '#galeria', label: 'Galeria' },
      { href: '#mensagens', label: 'Mensagens' },
    ],
  },
  hero: {
    eyebrow: 'Você está convidado para celebrar',
    intro: 'Depois de uma linda história, chegou a hora de dizermos sim e celebrar esse novo capítulo ao lado de quem amamos.',
    titlePrefix: 'O casamento de',
    tagline: 'Vai ser uma festa cheia de amor com você!',
  },
  rsvp: {
    title: 'Confirme sua presença',
    subtitle: 'Sua presença tornará esse dia ainda mais especial!',
  },
  giftRegistry: {
    title: 'Lista de casamento',
    subtitle: 'O melhor presente é ter você conosco! Mas, se quiser nos presentear, escolha como preferir:',
    description: '',
    pixCardTitle: 'Pix de presente',
    pixCardSubtitle: 'Contribua com qualquer valor.',
  },
  gallery: { title: 'Nossa história em fotos' },
  guestbook: {
    title: 'Mensagem para os noivos',
    subtitle: 'Deixe aqui uma mensagem cheia de carinho para celebrar esse novo capítulo!',
  },
  footer: { signoff: 'Com amor, por esse novo começo 💚' },
};

const occasionSeeds = [
  { slug: 'BIRTHDAY', name: 'Aniversário', defaultCopy: birthdayDefaultCopy },
  { slug: 'WEDDING', name: 'Casamento', defaultCopy: weddingDefaultCopy },
];

async function main() {
  const databaseUrl = requireEnv('DATABASE_URL');
  const pool = new Pool({ connectionString: databaseUrl });

  for (const occasion of occasionSeeds) {
    await pool.query(
      `insert into occasions (slug, name, default_copy)
       values ($1, $2, $3)
       on conflict (slug) do update set
         name = excluded.name,
         default_copy = excluded.default_copy`,
      [occasion.slug, occasion.name, JSON.stringify(occasion.defaultCopy)],
    );
    console.log(`Ocasião ${occasion.slug} sincronizada.`);
  }

  await pool.end();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
