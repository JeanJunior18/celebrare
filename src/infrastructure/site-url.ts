import { headers } from 'next/headers';

// URL pública do site — usada no metadataBase estático (app/layout.tsx),
// fora de contexto de requisição, onde não dá pra ler headers. `SITE_URL` é
// o domínio definitivo em produção; sem ela, cai pro domínio de deploy
// automático da Vercel (previews/branches, que muda a cada deploy) e, por
// fim, localhost em dev.
export function getSiteUrl(): string {
  if (process.env.SITE_URL) return process.env.SITE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
}

// Base da URL a partir do host da própria requisição — usado onde o link
// mostrado precisa bater com o domínio que o host tá realmente acessando
// (dashboard), em vez do domínio de deploy da Vercel (que muda a cada
// preview/branch e não é o `SITE_URL` definitivo). Só pode ser chamada em
// contexto de requisição (Server Component/Route Handler/Server Action).
export async function getRequestSiteUrl(): Promise<string> {
  const headersList = await headers();
  const host = headersList.get('host');
  if (!host) return getSiteUrl();

  const protocol = host.startsWith('localhost') || host.startsWith('127.0.0.1') ? 'http' : 'https';
  return `${protocol}://${host}`;
}
