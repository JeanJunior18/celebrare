// Seed dos temas da plataforma (tabela `themes`) — dado, não enum/arquivo TS,
// pra permitir adicionar um novo tema futuramente sem deploy de código.
// Controla só a paleta visual (cor + ilustração padrão); o texto padrão
// (nav/hero/rsvp/...) vive em `occasions` (ver scripts/seed-occasions.mjs)
// — cada evento escolhe as duas independentemente.
//
// `slug` é só uma chave interna estável pro upsert, sem relação com o
// `name` (o que aparece nos selects) — por isso os slugs ainda dizem
// BIRTHDAY/WEDDING mesmo os temas hoje descrevendo só cor.
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

const oliveColorTokens = {
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

const sageBlushColorTokens = {
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

const pinkColorTokens = {
  primary: {
    50: '#fdf2f7', 100: '#fce4ee', 200: '#f8c2dc', 300: '#f292bf', 400: '#e8619d',
    500: '#d63e80', 600: '#b32c66', 700: '#8f2251', 800: '#6b1a3d', 900: '#47122a',
  },
  secondary: { 100: '#fdf1e3', 300: '#f3d29a', 500: '#e0aa55', 700: '#ad7d34' },
  whimsy: { pink: '#f9c9dd', yellow: '#f7e2a8', sky: '#bfe0ee', mint: '#c8e8d2' },
  background: '#fef8fb',
  surface: '#ffffff',
  ink: '#5c4550',
  inkSoft: '#8f7784',
  accentForeground: '#fffbfd',
};

const themeSeeds = [
  { slug: 'BIRTHDAY', name: 'Oliva & Terracota', colorTokens: oliveColorTokens, defaultIllustrationUrl: null },
  { slug: 'WEDDING', name: 'Verde & Blush', colorTokens: sageBlushColorTokens, defaultIllustrationUrl: null },
  { slug: 'PINK', name: 'Rosa e Branco', colorTokens: pinkColorTokens, defaultIllustrationUrl: null },
];

async function main() {
  const databaseUrl = requireEnv('DATABASE_URL');
  const pool = new Pool({ connectionString: databaseUrl });

  for (const theme of themeSeeds) {
    await pool.query(
      `insert into themes (slug, name, color_tokens, default_illustration_url)
       values ($1, $2, $3, $4)
       on conflict (slug) do update set
         name = excluded.name,
         color_tokens = excluded.color_tokens,
         default_illustration_url = excluded.default_illustration_url`,
      [theme.slug, theme.name, JSON.stringify(theme.colorTokens), theme.defaultIllustrationUrl],
    );
    console.log(`Tema ${theme.slug} sincronizado.`);
  }

  await pool.end();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
