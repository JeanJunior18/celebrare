import Link from 'next/link';

import { listThemes } from '@/application/use-cases/list-themes.use-case';
import { ThemeForm } from '@/components/forms/theme-form';
import { Card } from '@/components/ui/Card';
import { SectionContainer } from '@/components/ui/SectionContainer';
import { db } from '@/infrastructure/postgres/client';
import { PostgresThemeRepository } from '@/infrastructure/postgres/theme-repository.postgres';

export const dynamic = 'force-dynamic';

export default async function InternalThemesPage() {
  const repository = new PostgresThemeRepository(db);
  const themes = await listThemes(repository);

  return (
    <main className="flex flex-1 flex-col">
      <SectionContainer title="Temas" subtitle="Temas disponíveis pra novos eventos — editar aqui não precisa de deploy.">
        <div className="grid w-full max-w-2xl gap-3">
          {themes.map((theme) => (
            <Link key={theme.id} href={`/internal/themes/${theme.id}`}>
              <Card className="flex items-center justify-between gap-3 transition-shadow hover:shadow-card-hover">
                <div>
                  <p className="font-display text-primary-700">{theme.name}</p>
                  <p className="font-body text-xs text-ink-soft">{theme.slug}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </SectionContainer>

      <SectionContainer title="Criar tema" subtitle="Adiciona um 3º tema (ou mais) sem deploy de código.">
        <ThemeForm />
      </SectionContainer>
    </main>
  );
}
