'use client';

import { useActionState, useState } from 'react';

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
  const [themeId, setThemeId] = useState(currentThemeId);
  const selectedTheme = themes.find((theme) => theme.id === themeId);

  return (
    <Card whimsyAccent className="w-full max-w-2xl">
      <form action={formAction} className="flex flex-col gap-5">
        <h3 className="font-display text-lg text-primary-700">Tema</h3>

        <div className="flex items-end gap-3">
          <Select
            label="Tema do evento"
            name="themeId"
            required
            value={themeId}
            onChange={(event) => setThemeId(event.target.value)}
            options={themes.map((theme) => ({ value: theme.id, label: theme.name }))}
            className="flex-1"
          />
          <span
            aria-hidden
            className="mb-[3px] h-12 w-12 shrink-0 rounded-lg border border-primary-200"
            style={{ backgroundColor: selectedTheme?.colorTokens.primary['500'] }}
          />
        </div>

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
