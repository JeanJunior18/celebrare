import type { Theme } from '@/domain/entities/theme';

// Sobrescreve as custom properties de src/app/globals.css com a paleta do
// tema do evento — Tailwind v4 (`@theme inline`) só repassa essas
// variáveis, então um <style> depois do globals.css no <head> já basta pra
// recolorir todos os utilitários (`bg-primary-600`, etc.) sem duplicar
// classes por tema (docs/saas-platform-plan.md, fase 7).
export function themeCssVariables(theme: Theme): string {
  const { primary, secondary, whimsy, background, surface, ink, inkSoft, accentForeground } = theme.colorTokens;

  return `:root {
${Object.entries(primary).map(([shade, value]) => `  --color-primary-${shade}: ${value};`).join('\n')}
${Object.entries(secondary).map(([shade, value]) => `  --color-secondary-${shade}: ${value};`).join('\n')}
  --color-whimsy-pink: ${whimsy.pink};
  --color-whimsy-yellow: ${whimsy.yellow};
  --color-whimsy-sky: ${whimsy.sky};
  --color-whimsy-mint: ${whimsy.mint};
  --color-background: ${background};
  --color-surface: ${surface};
  --color-ink: ${ink};
  --color-ink-soft: ${inkSoft};
  --color-accent-foreground: ${accentForeground};
}`;
}
