'use client';

import { useActionState, useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { fetchGiftLinkMetadataAction, type AdminGiftActionResult } from '@/app/actions/admin-gift.actions';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { GiftCategory } from '@/domain/enums/gift-category';

const categoryOptions = [
  { value: GiftCategory.REGISTRY_ITEM, label: 'Item de lista' },
  { value: GiftCategory.BULK_ITEM, label: 'Item em quantidade' },
];

const emptyValues = { name: '', description: '', purchaseUrl: '', imageUrl: undefined as string | undefined };

export interface AdminGiftFormProps {
  // Action resolve o eventId da sessão do host — só há um consumidor hoje
  // (`/dashboard/gifts`), mas fica como prop pra manter o form sem
  // acoplamento a um evento específico.
  action: (state: AdminGiftActionResult | null, formData: FormData) => Promise<AdminGiftActionResult>;
}

export function AdminGiftForm({ action }: AdminGiftFormProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(action, null);
  const [formKey, setFormKey] = useState(0);
  const [prevState, setPrevState] = useState(state);
  const [values, setValues] = useState(emptyValues);
  const [fetchError, setFetchError] = useState<string | undefined>();
  const [isFetchingMetadata, startFetchingMetadata] = useTransition();

  if (state !== prevState) {
    setPrevState(state);
    if (state?.success) {
      setFormKey((key) => key + 1);
      setValues(emptyValues);
      setFetchError(undefined);
    }
  }

  useEffect(() => {
    if (state?.success) router.refresh();
  }, [state, router]);

  function handleFetchMetadata() {
    if (!values.purchaseUrl) return;

    startFetchingMetadata(async () => {
      const result = await fetchGiftLinkMetadataAction(values.purchaseUrl);
      if (!result.success) {
        setFetchError(result.message);
        return;
      }

      setFetchError(undefined);
      setValues((current) => ({
        ...current,
        name: result.name ?? current.name,
        description: result.description ?? current.description,
        imageUrl: result.imageUrl ?? current.imageUrl,
      }));
    });
  }

  return (
    <Card whimsyAccent className="w-full max-w-2xl">
      <form key={formKey} action={formAction} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <Input
                label="Link do presente (opcional)"
                name="purchaseUrl"
                type="url"
                placeholder="https://..."
                value={values.purchaseUrl}
                onChange={(event) => setValues((current) => ({ ...current, purchaseUrl: event.target.value }))}
              />
            </div>
            <Button
              type="button"
              variant="secondary"
              disabled={!values.purchaseUrl || isFetchingMetadata}
              onClick={handleFetchMetadata}
            >
              {isFetchingMetadata ? 'Buscando…' : 'Buscar dados'}
            </Button>
          </div>
          {fetchError && <p className="font-body text-xs text-secondary-700">{fetchError}</p>}
        </div>

        <Input
          label="Nome"
          name="name"
          placeholder="Nome do presente"
          required
          minLength={2}
          value={values.name}
          onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))}
        />
        <Textarea
          label="Descrição (opcional)"
          name="description"
          placeholder="Detalhes do presente"
          value={values.description}
          onChange={(event) => setValues((current) => ({ ...current, description: event.target.value }))}
        />

        <div className="flex flex-col gap-5 md:flex-row">
          <Select label="Categoria" name="category" options={categoryOptions} required />
          <Input label="Tamanho (opcional)" name="sizeLabel" placeholder="Ex: G, XG" />
        </div>

        <Input
          label="Quantidade necessária"
          name="quantityNeeded"
          type="number"
          defaultValue={1}
          min={1}
          inputMode="numeric"
        />

        <div className="flex flex-col gap-3">
          <Input label="Imagem (deixe em branco se buscou pelo link)" name="image" type="file" accept="image/*" />
          {values.imageUrl && (
            <div className="flex items-center gap-3">
              <img
                src={values.imageUrl}
                alt="Imagem encontrada no link"
                className="h-16 w-16 rounded-lg border border-primary-100/60 object-cover"
              />
              <span className="font-body text-xs text-ink-soft">Imagem encontrada no link.</span>
              <input type="hidden" name="imageUrl" value={values.imageUrl} />
            </div>
          )}
        </div>

        <div className="mt-2 flex flex-col items-center gap-2">
          <Button type="submit" disabled={isPending} className="w-full md:w-auto md:px-12">
            {isPending ? 'Salvando…' : 'Adicionar presente'}
          </Button>
          {state?.success && (
            <p className="font-body text-sm text-primary-700">Presente adicionado! ♡</p>
          )}
          {state?.success === false && (
            <p className="font-body text-sm text-secondary-700">{state.message}</p>
          )}
        </div>
      </form>
    </Card>
  );
}
