// URL pública do site — usada em metadata (app/layout.tsx) e no link de
// página pública mostrado pro host (dashboard). `SITE_URL` é o domínio
// definitivo em produção; sem ela, cai pro domínio de deploy automático da
// Vercel (previews/branches) e, por fim, localhost em dev.
export function getSiteUrl(): string {
  if (process.env.SITE_URL) return process.env.SITE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
}
