'use client';

import { useActionState } from 'react';

import { createThemeAction, updateThemeAction, type ThemeActionResult } from '@/app/actions/internal-theme.actions';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import type { Theme } from '@/domain/entities/theme';

export interface ThemeFormProps {
  theme?: Theme;
}

export function ThemeForm({ theme }: ThemeFormProps) {
  const action = theme ? updateThemeAction : createThemeAction;
  const [state, formAction, isPending] = useActionState<ThemeActionResult | null, FormData>(action, null);

  if (state?.success) {
    return <p className="font-body text-primary-700">Tema salvo! Atualize a página pra ver. 💚</p>;
  }

  return (
    <Card whimsyAccent className="w-full max-w-2xl">
      <form action={formAction} className="flex flex-col gap-5">
        {theme && <input type="hidden" name="themeId" value={theme.id} />}

        {theme ? (
          <Input label="Slug" name="slug" defaultValue={theme.slug} disabled />
        ) : (
          <Input label="Slug" name="slug" placeholder="ex: WEDDING" required minLength={2} />
        )}

        <Input label="Nome" name="name" defaultValue={theme?.name} required minLength={2} />

        <Textarea
          label="Cores (JSON — color_tokens)"
          name="colorTokens"
          defaultValue={theme ? JSON.stringify(theme.colorTokens, null, 2) : ''}
          required
          rows={10}
          className="font-mono text-xs"
        />

        <Input
          label="Ilustração padrão (URL, opcional)"
          name="defaultIllustrationUrl"
          type="url"
          defaultValue={theme?.defaultIllustrationUrl ?? ''}
        />

        <div className="mt-2 flex flex-col items-center gap-2">
          <Button type="submit" disabled={isPending} className="w-full md:w-auto md:px-12">
            {isPending ? 'Salvando…' : theme ? 'Salvar alterações' : 'Criar tema'}
          </Button>
          {state?.message && <p className="font-body text-sm text-secondary-700">{state.message}</p>}
        </div>
      </form>
    </Card>
  );
}
