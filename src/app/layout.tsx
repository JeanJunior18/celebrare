import type { Metadata } from 'next';
import { Caveat, Fraunces, Nunito } from 'next/font/google';

import './globals.css';

const fraunces = Fraunces({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  style: ['normal', 'italic'],
});

const caveat = Caveat({
  variable: '--font-script',
  subsets: ['latin'],
  weight: ['600', '700'],
});

const nunito = Nunito({
  variable: '--font-body',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
});

const siteUrl = 'https://arca-do-davi.asherlabs.com.br';

// Fallback genérico — `/` e `/e/[slug]` sobrescrevem via `generateMetadata`
// depois de buscar o evento (docs/saas-platform-plan.md, fase 7). Páginas
// sem evento (`/login`, `/signup`, `/internal/*`) usam esse default.
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Convites e confirmação de presença',
  description: 'Crie e gerencie o convite e a confirmação de presença do seu evento.',
  openGraph: {
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${fraunces.variable} ${caveat.variable} ${nunito.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background font-body text-ink">{children}</body>
    </html>
  );
}
