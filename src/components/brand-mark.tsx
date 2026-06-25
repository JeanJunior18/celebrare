// Wordmark da plataforma (Celebrare) — usado só em páginas que não têm um
// evento/tema carregado (login, signup, dashboard). Páginas de evento usam
// a marca do próprio evento (`event.theme.defaultCopy.nav.brand`, ver
// NavBar), nunca essa.
export function BrandMark() {
  return (
    <p className="text-center font-display text-sm uppercase tracking-[0.15em] text-primary-700">
      Celebrare
    </p>
  );
}
