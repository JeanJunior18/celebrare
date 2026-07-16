import type { CSSProperties, ReactNode } from 'react';

// Identidade visual da Celebrare (logo + paleta + tipografia, recebida do
// usuário em 2026-06-25) — escopo deliberadamente limitado ao shell da
// plataforma (`/`, login, signup, dashboard): só sobrescreve as custom
// properties de globals.css dentro do próprio wrapper, então `Card`,
// `Button`, `Input` etc. ficam "Celebrare" aqui sem precisar de nenhuma
// mudança neles. Página de evento (`/e/[slug]`) não usa isso — continua só
// com o tema (`themes.color_tokens`) do próprio evento.
//
// `secondary-*` não é sobrescrita de propósito: é usada em todo o app como
// cor de erro/validação (`text-secondary-700`, `border-secondary-500`), não
// como acento de marca — manter o tom terracota original preserva esse
// significado semântico.
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

export function PlatformShell({ children }: { children: ReactNode }) {
  return (
    <div style={celebrarePlatformStyle} className="flex flex-1 flex-col">
      {children}
    </div>
  );
}
