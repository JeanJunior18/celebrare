import Link from 'next/link';

export function DashboardBackLink() {
  return (
    <div className="mx-auto w-full max-w-2xl px-6 pt-8">
      <Link href="/dashboard" className="font-body text-sm font-semibold text-primary-700 underline">
        ← Voltar ao menu
      </Link>
    </div>
  );
}
