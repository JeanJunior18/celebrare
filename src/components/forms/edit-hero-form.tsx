'use client';

import { useActionState } from 'react';

import { updateDashboardEventHeroAction } from '@/app/actions/dashboard.actions';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';

export interface EditHeroFormProps {
  heroImageUrl: string | null;
  intro: string;
  overrideIntro: string;
}

export function EditHeroForm({ heroImageUrl, intro, overrideIntro }: EditHeroFormProps) {
  const [state, formAction, isPending] = useActionState(updateDashboardEventHeroAction, null);

  return (
    <Card whimsyAccent className="w-full max-w-2xl">
      <form action={formAction} className="flex flex-col gap-5">
        <h3 className="font-display text-lg text-primary-700">Hero</h3>

        <div className="flex flex-col gap-3">
          {heroImageUrl && (
            <img
              src={heroImageUrl}
              alt="Foto atual do hero"
              className="h-32 w-32 rounded-2xl border border-primary-100/60 object-cover"
            />
          )}
          <Input label="Trocar foto (opcional)" name="image" type="file" accept="image/*" />
        </div>

        <Textarea
          label="Texto de introdução"
          name="heroIntro"
          placeholder={intro}
          defaultValue={overrideIntro}
          rows={3}
        />

        <div className="mt-2 flex flex-col items-start gap-2">
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
