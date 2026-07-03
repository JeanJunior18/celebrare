// Seed dos temas da plataforma (tabela `themes`) — dado, não enum/arquivo TS,
// pra permitir adicionar um 3º tema futuramente sem deploy de código.
// Ver docs/saas-platform-plan.md, fase 3.
//
// BIRTHDAY: cores e textos extraídos do que já está em produção hoje
// (src/app/globals.css + componentes de seção hardcoded pro evento do Davi).
// WEDDING: placeholder — não existe mockup de referência ainda (ver
// docs/visual-identity.md); paleta e copy genéricas até a fase 7, quando o
// primeiro evento desse tema for criado.
//
// Idempotente: upsert por `slug`, seguro pra rodar de novo.
//
// Uso: npm run db:seed-themes

import { Pool } from 'pg';

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Variável de ambiente ${name} não configurada no .env`);
  return value;
}

const birthdayColorTokens = {
  primary: {
    50: '#f5f7ee', 100: '#e8ecd7', 200: '#d2dbb1', 300: '#b7c687', 400: '#98ac63',
    500: '#7c9249', 600: '#5f6f44', 700: '#4a5736', 800: '#38422a', 900: '#272d1e',
  },
  secondary: { 100: '#f4e3d6', 300: '#e2b991', 500: '#c8956d', 700: '#9c6b45' },
  whimsy: { pink: '#f3c9c2', yellow: '#f0dca0', sky: '#b9d3e0', mint: '#c7d9b5' },
  background: '#f5f0e6',
  surface: '#faf6ee',
  ink: '#5c5446',
  inkSoft: '#8a8071',
  accentForeground: '#fffbf3',
};

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

const weddingColorTokens = {
  primary: {
    50: '#f3f6f1', 100: '#e3ebdd', 200: '#c7d7ba', 300: '#a8c093', 400: '#8aa872',
    500: '#6f8f57', 600: '#577044', 700: '#445737', 800: '#33422a', 900: '#232d1d',
  },
  secondary: { 100: '#f6e6e4', 300: '#e8bcb8', 500: '#d4928c', 700: '#a8665f' },
  whimsy: { pink: '#f3d9d6', yellow: '#f0e3b8', sky: '#c9d9e0', mint: '#d7e3c9' },
  background: '#f8f5f0',
  surface: '#fffaf5',
  ink: '#5a5048',
  inkSoft: '#8d8275',
  accentForeground: '#fffdf9',
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

const themeSeeds = [
  {
    slug: 'BIRTHDAY',
    name: 'Aniversário',
    colorTokens: birthdayColorTokens,
    defaultCopy: birthdayDefaultCopy,
    defaultIllustrationUrl: null,
  },
  {
    slug: 'WEDDING',
    name: 'Casamento',
    colorTokens: weddingColorTokens,
    defaultCopy: weddingDefaultCopy,
    defaultIllustrationUrl: null,
  },
];

async function main() {
  const databaseUrl = requireEnv('DATABASE_URL');
  const pool = new Pool({ connectionString: databaseUrl });

  for (const theme of themeSeeds) {
    await pool.query(
      `insert into themes (slug, name, color_tokens, default_copy, default_illustration_url)
       values ($1, $2, $3, $4, $5)
       on conflict (slug) do update set
         name = excluded.name,
         color_tokens = excluded.color_tokens,
         default_copy = excluded.default_copy,
         default_illustration_url = excluded.default_illustration_url`,
      [
        theme.slug,
        theme.name,
        JSON.stringify(theme.colorTokens),
        JSON.stringify(theme.defaultCopy),
        theme.defaultIllustrationUrl,
      ],
    );
    console.log(`Tema ${theme.slug} sincronizado.`);
  }

  await pool.end();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
