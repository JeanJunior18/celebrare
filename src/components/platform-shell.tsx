import type { CSSProperties, ReactNode } from 'react';

import type { ThemeColorTokens } from '@/domain/entities/theme';

// Identidade visual da Celebrare (logo + paleta + tipografia, recebida do
// usuário em 2026-06-25) — usada como default do shell da plataforma (`/`,
// login, signup) e do dashboard antes do host ter um evento. Só sobrescreve
// as custom properties de globals.css dentro do próprio wrapper, então
// `Card`, `Button`, `Input` etc. ficam "Celebrare" aqui sem precisar de
// nenhuma mudança neles.
//
// `secondary-*` não é sobrescrita de propósito: é usada em todo o app como
// cor de erro/validação (`text-secondary-700`, `border-secondary-500`), não
// como acento de marca — manter o tom terracota original preserva esse
// significado semântico. Vale tanto pro default da Celebrare quanto pro
// tema de evento aplicado no dashboard (ver `eventThemeStyle` abaixo).
const celebrarePlatformStyle: CSSProperties = {
  ['--color-primary-50' as string]: '#f1f2f7',
  ['--color-primary-100' as string]: '#dfe1ec',
  ['--color-primary-200' as string]: '#b9bdd6',
  ['--color-primary-300' as string]: '#8e94b9',
  ['--color-primary-400' as string]: '#62699c',
  ['--color-primary-500' as string]: '#434a7c',
  ['--color-primary-600' as string]: '#2f3563',
  ['--color-primary-700' as string]: '#232752',
  ['--color-primary-800' as string]: '#1a1d3d',
  ['--color-primary-900' as string]: '#11132a',
  ['--color-whimsy-pink' as string]: '#e0a7ad',
  ['--color-whimsy-yellow' as string]: '#d9a857',
  ['--color-whimsy-sky' as string]: '#c7a875',
  ['--color-whimsy-mint' as string]: '#e3c08a',
  ['--color-background' as string]: '#f8f5ef',
  ['--color-surface' as string]: '#fffdfa',
  ['--color-ink' as string]: '#2a2d45',
  ['--color-ink-soft' as string]: '#6b6f8a',
  ['--color-accent-foreground' as string]: '#ffffff',
  ['--font-display' as string]: 'var(--font-platform-display)',
  ['--font-body' as string]: 'var(--font-platform-body)',
};

// Dentro do dashboard do próprio host, o shell segue o tema (cor) do
// evento dele em vez da marca fixa da Celebrare — a tipografia continua a
// da plataforma (Playfair/Poppins), só a cor muda.
function eventThemeStyle(colorTokens: ThemeColorTokens): CSSProperties {
  return {
    ['--color-primary-50' as string]: colorTokens.primary['50'],
    ['--color-primary-100' as string]: colorTokens.primary['100'],
    ['--color-primary-200' as string]: colorTokens.primary['200'],
    ['--color-primary-300' as string]: colorTokens.primary['300'],
    ['--color-primary-400' as string]: colorTokens.primary['400'],
    ['--color-primary-500' as string]: colorTokens.primary['500'],
    ['--color-primary-600' as string]: colorTokens.primary['600'],
    ['--color-primary-700' as string]: colorTokens.primary['700'],
    ['--color-primary-800' as string]: colorTokens.primary['800'],
    ['--color-primary-900' as string]: colorTokens.primary['900'],
    ['--color-whimsy-pink' as string]: colorTokens.whimsy.pink,
    ['--color-whimsy-yellow' as string]: colorTokens.whimsy.yellow,
    ['--color-whimsy-sky' as string]: colorTokens.whimsy.sky,
    ['--color-whimsy-mint' as string]: colorTokens.whimsy.mint,
    ['--color-background' as string]: colorTokens.background,
    ['--color-surface' as string]: colorTokens.surface,
    ['--color-ink' as string]: colorTokens.ink,
    ['--color-ink-soft' as string]: colorTokens.inkSoft,
    ['--color-accent-foreground' as string]: colorTokens.accentForeground,
    ['--font-display' as string]: 'var(--font-platform-display)',
    ['--font-body' as string]: 'var(--font-platform-body)',
  };
}

export interface PlatformShellProps {
  children: ReactNode;
  // Passe o tema do evento do host (`event.theme.colorTokens`) pro shell do
  // dashboard seguir a cor escolhida por ele; omitido = marca da Celebrare
  // (usado em `/`, `/login`, `/signup` e no dashboard antes de ter evento).
  themeColorTokens?: ThemeColorTokens;
}

export function PlatformShell({ children, themeColorTokens }: PlatformShellProps) {
  const style = themeColorTokens ? eventThemeStyle(themeColorTokens) : celebrarePlatformStyle;

  return (
    <div style={style} className="flex flex-1 flex-col">
      {children}
    </div>
  );
}
