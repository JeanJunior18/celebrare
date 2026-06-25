import type { Metadata } from 'next';
import { Caveat, Fraunces, Nunito, Playfair_Display, Poppins } from 'next/font/google';

import './globals.css';

// Fontes dos temas de evento (BIRTHDAY/WEDDING) — não tocar; identidade da
// Celebrare usa Playfair Display + Poppins, só no shell da plataforma
// (ver PlatformShell).
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

// Identidade da Celebrare (shell da plataforma: login/signup/dashboard) —
// variáveis próprias pra não vazar pras páginas de evento, que mantêm a
// tipografia do tema (PlatformShell remapeia --font-display/--font-body
// pra essas duas dentro do seu escopo).
const playfairDisplay = Playfair_Display({
  variable: '--font-platform-display',
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  style: ['normal', 'italic'],
});

const poppins = Poppins({
  variable: '--font-platform-body',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const siteUrl = 'https://celebrare.me';

// Fallback genérico — `/` e `/e/[slug]` sobrescrevem via `generateMetadata`
// depois de buscar o evento (docs/saas-platform-plan.md, fase 7). Páginas
// sem evento (`/login`, `/signup`, `/internal/*`) usam esse default.
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Celebrare — convites e confirmação de presença',
  description: 'Crie e gerencie o convite e a confirmação de presença do seu evento na Celebrare.',
  openGraph: {
    siteName: 'Celebrare',
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
      className={`${fraunces.variable} ${caveat.variable} ${nunito.variable} ${playfairDisplay.variable} ${poppins.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background font-body text-ink">{children}</body>
    </html>
  );
}
