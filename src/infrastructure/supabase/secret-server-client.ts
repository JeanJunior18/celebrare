// Client server-only, usado apenas pro Supabase Storage (bucket `media`) e,
// futuramente, pela leitura privada de rsvps em app/internal/guest-log/. O
// acesso a dados (gift_items, gallery_photos etc.) passou a ser direto via
// Postgres (src/infrastructure/postgres/) — ver docs/saas-platform-plan.md.
import { createClient } from '@supabase/supabase-js';

export function createSecretServerClient() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!);
}
