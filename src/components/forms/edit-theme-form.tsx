'use client';

import { useActionState } from 'react';

import { updateDashboardEventThemeAction } from '@/app/actions/dashboard.actions';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import type { Theme } from '@/domain/entities/theme';

export interface EditThemeFormProps {
  themes: Theme[];
  currentThemeId: string;
}

export function EditThemeForm({ themes, currentThemeId }: EditThemeFormProps) {
  const [state, formAction, isPending] = useActionState(updateDashboardEventThemeAction, null);

  return (
    <Card whimsyAccent className="w-full max-w-2xl">
      <form action={formAction} className="flex flex-col gap-5">
        <h3 className="font-display text-lg text-primary-700">Tema</h3>

        <Select
          label="Tema do evento"
          name="themeId"
          required
          defaultValue={currentThemeId}
          options={themes.map((theme) => ({ value: theme.id, label: theme.name }))}
        />

        <div className="flex flex-col items-start gap-2">
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Salvando…' : 'Salvar'}
          </Button>
          {state?.success && <p className="font-body text-sm text-primary-700">Salvo! ♡</p>}
          {state?.success === false && <p className="font-body text-sm text-secondary-700">{state.message}</p>}
        </div>
      </form>
    </Card>
  );
}
