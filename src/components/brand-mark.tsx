// Wordmark da plataforma (Celebrare) — usado só dentro de <PlatformShell>
// (login, signup, dashboard). Páginas de evento usam a marca do próprio
// evento (`event.theme.defaultCopy.nav.brand`, ver NavBar), nunca essa.
export function BrandMark() {
  return (
    <p className="flex items-center justify-center gap-1.5 pt-10 font-display text-xl italic text-primary-700">
      <span aria-hidden className="text-[var(--color-whimsy-yellow)]">
        ✦
      </span>
      celebrare
    </p>
  );
}
