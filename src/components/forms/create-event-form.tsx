'use client';

import { useActionState } from 'react';

import { createDashboardEventAction } from '@/app/actions/dashboard.actions';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import type { Theme } from '@/domain/entities/theme';

export interface CreateEventFormProps {
  themes: Theme[];
}

export function CreateEventForm({ themes }: CreateEventFormProps) {
  const [state, formAction, isPending] = useActionState(createDashboardEventAction, null);

  if (state?.success) {
    return <p className="font-body text-primary-700">Evento criado! Atualize a página pra ver seu dashboard. 💚</p>;
  }

  return (
    <Card whimsyAccent className="w-full max-w-2xl">
      <form action={formAction} className="flex flex-col gap-5">
        <Select
          label="Tema"
          name="themeId"
          required
          options={themes.map((theme) => ({ value: theme.id, label: theme.name }))}
        />

        <div className="flex flex-col gap-5 md:flex-row">
          <Input label="Nome do aniversariante/casal" name="honoreeName" required minLength={2} className="flex-1" />
          <Input
            label="Subtítulo"
            name="subtitleLabel"
            placeholder="ex: 1 aninho, Casamento"
            required
            className="flex-1"
          />
        </div>

        <div className="flex flex-col gap-5 md:flex-row">
          <Input label="Data" name="eventDate" type="date" required className="flex-1" />
          <Input label="Horário" name="eventTime" type="time" required className="flex-1" />
        </div>

        <Input label="Local" name="venueName" required minLength={2} />
        <Input label="Endereço" name="venueAddress" required minLength={2} />
        <Input label="Link do Google Maps (opcional)" name="googleMapsUrl" type="url" placeholder="https://..." />

        <Textarea label="Frase/citação (opcional)" name="quoteText" rows={2} />
        <Input label="Referência da citação (opcional)" name="quoteReference" placeholder="ex: Gênesis 7:9" />

        <div className="flex flex-col gap-5 md:flex-row">
          <Input label="Chave Pix (opcional)" name="pixKey" className="flex-1" />
          <Input
            label="URL do QR code do Pix (opcional)"
            name="pixQrCodeUrl"
            type="url"
            placeholder="https://..."
            className="flex-1"
          />
        </div>

        <div className="mt-2 flex flex-col items-center gap-2">
          <Button type="submit" disabled={isPending} className="w-full md:w-auto md:px-12">
            {isPending ? 'Criando…' : 'Criar evento'}
          </Button>
          {state?.message && <p className="font-body text-sm text-secondary-700">{state.message}</p>}
        </div>
      </form>
    </Card>
  );
}
