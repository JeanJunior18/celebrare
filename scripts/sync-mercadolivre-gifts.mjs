// Sincroniza gift_items a partir da lista pública do Mercado Livre do
// organizador. Não usa a API oficial do ML (a geração de link de afiliado
// não tem API, e a API de itens exige um app revisado/aprovado pelo ML pra
// ler itens de outros vendedores) — em vez disso, renderiza a página da
// lista com um browser headless e extrai nome/preço/imagem de cada card,
// igual um usuário real veria.
//
// O que entra no gift_items e em qual categoria é decidido por
// scripts/gift-list.json, não pela lista inteira do ML — edite esse arquivo
// pra adicionar/remover presentes.
//
// Uso:
//   npx playwright install chromium   (só na primeira vez)
//   node scripts/sync-mercadolivre-gifts.mjs

import { createClient } from '@supabase/supabase-js';
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { Pool } from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Variável de ambiente ${name} não configurada no .env`);
  return value;
}

async function scrapeWishlistCards(wishlistUrl) {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage({
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });

  await page.goto(wishlistUrl, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  const cards = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.poly-card')).map((card) => {
      const img = card.querySelector('img.poly-component__picture');
      const link = card.querySelector('a[href*="mercadolivre.com.br"]');
      const title = img?.getAttribute('alt')?.trim() ?? null;
      return { title, href: link?.href ?? null, image: img?.getAttribute('src') ?? null };
    });
  });

  await browser.close();
  return cards;
}

function extractItemId(href) {
  if (!href) return null;
  const directMatch = href.match(/\/(MLB-?\d+)-/);
  if (directMatch) return directMatch[1].replace('-', '');
  const queryMatch = href.match(/(?:item_id|wid)%3A?=?(MLB\d+)/) ?? href.match(/[?&]wid=(MLB\d+)/);
  if (queryMatch) return queryMatch[1];
  const filterMatch = decodeURIComponent(href).match(/item_id:(MLB\d+)/);
  if (filterMatch) return filterMatch[1];
  return null;
}

function cleanPermalink(href) {
  const url = new URL(href);
  url.search = '';
  url.hash = '';
  return url.toString();
}

async function uploadImage(supabase, itemId, imageUrl) {
  const response = await fetch(imageUrl);
  if (!response.ok) throw new Error(`Falha ao baixar imagem de ${itemId}: HTTP ${response.status}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  const contentType = response.headers.get('content-type') ?? 'image/webp';
  const ext = contentType.includes('jpeg') ? 'jpg' : contentType.includes('png') ? 'png' : 'webp';
  const storagePath = `gifts/${itemId}.${ext}`;

  const { error } = await supabase.storage
    .from('media')
    .upload(storagePath, buffer, { upsert: true, contentType });
  if (error) throw error;

  const { data } = supabase.storage.from('media').getPublicUrl(storagePath);
  return data.publicUrl;
}

async function main() {
  const supabaseUrl = requireEnv('SUPABASE_URL');
  const secretKey = requireEnv('SUPABASE_SECRET_KEY');
  const databaseUrl = requireEnv('DATABASE_URL');
  const affiliateTool = requireEnv('MERCADOLIVRE_AFFILIATE_TOOL');
  const wishlistUrl = requireEnv('MERCADOLIVRE_WISHLIST_URL');

  const giftList = JSON.parse(readFileSync(path.join(__dirname, 'gift-list.json'), 'utf8'));
  const supabase = createClient(supabaseUrl, secretKey);
  const pool = new Pool({ connectionString: databaseUrl });

  console.log(`Renderizando ${wishlistUrl}...`);
  const cards = await scrapeWishlistCards(wishlistUrl);

  const byItemId = new Map();
  for (const card of cards) {
    const itemId = extractItemId(card.href);
    if (itemId) byItemId.set(itemId, card);
  }

  let created = 0;
  let updated = 0;

  for (const entry of giftList) {
    const card = byItemId.get(entry.itemId);
    if (!card) {
      console.warn(`⚠ ${entry.itemId} não encontrado na lista renderizada — pulando.`);
      continue;
    }

    console.log(`Sincronizando ${entry.itemId} — ${card.title}`);
    const imageUrl = await uploadImage(supabase, entry.itemId, card.image);
    const purchaseUrl = `${cleanPermalink(card.href)}?matt_tool=${affiliateTool}`;

    const { rows: existingRows } = await pool.query(
      'select id from gift_items where external_id = $1',
      [entry.itemId],
    );

    await pool.query(
      `insert into gift_items (external_id, name, category, size_label, quantity_needed, image_url, purchase_url)
       values ($1, $2, $3, $4, $5, $6, $7)
       on conflict (external_id) do update set
         name = excluded.name,
         category = excluded.category,
         size_label = excluded.size_label,
         quantity_needed = excluded.quantity_needed,
         image_url = excluded.image_url,
         purchase_url = excluded.purchase_url`,
      [
        entry.itemId,
        card.title,
        entry.category,
        entry.sizeLabel ?? null,
        entry.quantityNeeded ?? 1,
        imageUrl,
        purchaseUrl,
      ],
    );

    if (existingRows.length > 0) updated += 1;
    else created += 1;
  }

  await pool.end();
  console.log(`\nConcluído: ${created} criado(s), ${updated} atualizado(s).`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
