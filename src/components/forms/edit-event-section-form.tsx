'use client';

import { useActionState } from 'react';

import { updateDashboardEventSectionAction } from '@/app/actions/dashboard.actions';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Switch } from '@/components/ui/Switch';
import { Textarea } from '@/components/ui/Textarea';
import type { SectionKey } from '@/domain/entities/event';

export interface EditEventSectionField {
  name: 'title' | 'subtitle' | 'description';
  label: string;
  // Texto já resolvido (override do evento ou default do tema) — mostrado
  // como placeholder pra o host ver o que aparece hoje na página pública.
  currentValue: string;
  // Só o override salvo (vazio = "seguindo o tema").
  overrideValue: string;
  multiline?: boolean;
}

export interface EditEventSectionFormProps {
  section: SectionKey;
  title: string;
  visible: boolean;
  fields: EditEventSectionField[];
}

export function EditEventSectionForm({ section, title, visible, fields }: EditEventSectionFormProps) {
  const [state, formAction, isPending] = useActionState(updateDashboardEventSectionAction, null);

  return (
    <Card whimsyAccent className="w-full max-w-2xl">
      <form action={formAction} className="flex flex-col gap-5">
        <input type="hidden" name="section" value={section} />

        <div className="flex items-center justify-between gap-4">
          <h3 className="font-display text-lg text-primary-700">{title}</h3>
          <Switch label="Visível" name="visible" defaultChecked={visible} className="w-auto" />
        </div>

        {fields.map((field) =>
          field.multiline ? (
            <Textarea
              key={field.name}
              label={field.label}
              name={field.name}
              placeholder={field.currentValue}
              defaultValue={field.overrideValue}
              rows={2}
            />
          ) : (
            <Input
              key={field.name}
              label={field.label}
              name={field.name}
              placeholder={field.currentValue}
              defaultValue={field.overrideValue}
            />
          ),
        )}

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
