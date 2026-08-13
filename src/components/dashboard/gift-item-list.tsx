'use client';

import { useState, useTransition } from 'react';
import type { FormEvent } from 'react';

import type { AdminGiftMutationResult } from '@/app/actions/dashboard.actions';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import type { GiftItem } from '@/domain/entities/gift-item';
import { GiftCategory } from '@/domain/enums/gift-category';
import { GiftStatus } from '@/domain/enums/gift-status';

const categoryOptions = [
  { value: GiftCategory.REGISTRY_ITEM, label: 'Item de lista' },
  { value: GiftCategory.BULK_ITEM, label: 'Item em quantidade' },
];

const statusLabels: Record<GiftStatus, string> = {
  [GiftStatus.AVAILABLE]: 'Disponível',
  [GiftStatus.CLAIMED]: 'Reservado',
  [GiftStatus.FULFILLED]: 'Completo',
};

export interface GiftItemListProps {
  items: GiftItem[];
  updateAction: (formData: FormData) => Promise<AdminGiftMutationResult>;
  deleteAction: (giftItemId: string) => Promise<AdminGiftMutationResult>;
}

export function GiftItemList({ items: initialItems, updateAction, deleteAction }: GiftItemListProps) {
  const [items, setItems] = useState(initialItems);
  const [prevInitialItems, setPrevInitialItems] = useState(initialItems);
  if (initialItems !== prevInitialItems) {
    setPrevInitialItems(initialItems);
    setItems(initialItems);
  }
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [errorByItem, setErrorByItem] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  function handleDelete(item: GiftItem) {
    const confirmed = window.confirm(`Remover "${item.name}" da lista de presentes? Essa ação não pode ser desfeita.`);
    if (!confirmed) return;

    setPendingId(item.id);
    startTransition(async () => {
      const result = await deleteAction(item.id);
      setPendingId(null);
      if (result.success) {
        setItems((current) => current.filter((current_) => current_.id !== item.id));
      } else {
        setErrorByItem((current) => ({ ...current, [item.id]: result.message ?? 'Erro ao remover.' }));
      }
    });
  }

  function handleSubmitEdit(item: GiftItem, event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.set('id', item.id);

    setPendingId(item.id);
    startTransition(async () => {
      const result = await updateAction(formData);
      setPendingId(null);
      if (result.success && result.item) {
        setItems((current) => current.map((current_) => (current_.id === item.id ? result.item! : current_)));
        setEditingId(null);
        setErrorByItem((current) => {
          const rest = { ...current };
          delete rest[item.id];
          return rest;
        });
      } else {
        setErrorByItem((current) => ({ ...current, [item.id]: result.message ?? 'Erro ao atualizar.' }));
      }
    });
  }

  if (items.length === 0) {
    return <p className="font-body text-ink-soft">Nenhum presente cadastrado ainda.</p>;
  }

  return (
    <div className="grid w-full max-w-2xl gap-3">
      {items.map((item) => {
        const isEditing = editingId === item.id;
        const rowPending = isPending && pendingId === item.id;

        return (
          <Card key={item.id} className="flex flex-col gap-3">
            {isEditing ? (
              <form onSubmit={(event) => handleSubmitEdit(item, event)} className="flex flex-col gap-4">
                <Input label="Nome" name="name" required minLength={2} defaultValue={item.name} />
                <Textarea label="Descrição (opcional)" name="description" defaultValue={item.description ?? ''} />
                <div className="flex flex-col gap-4 md:flex-row">
                  <Select
                    label="Categoria"
                    name="category"
                    options={categoryOptions}
                    required
                    defaultValue={item.category}
                  />
                  <Input label="Tamanho (opcional)" name="sizeLabel" defaultValue={item.sizeLabel ?? ''} />
                </div>
                <Input
                  label="Quantidade necessária"
                  name="quantityNeeded"
                  type="number"
                  min={1}
                  inputMode="numeric"
                  defaultValue={item.quantityNeeded}
                />
                <Input label="Link do presente (opcional)" name="purchaseUrl" type="url" defaultValue={item.purchaseUrl ?? ''} />
                <Input label="Nova imagem (opcional, mantém a atual se em branco)" name="image" type="file" accept="image/*" />
                {item.imageUrl && <input type="hidden" name="imageUrl" value={item.imageUrl} />}

                <div className="flex gap-2">
                  <Button type="submit" variant="secondary" disabled={rowPending} className="px-4 py-2 text-xs">
                    {rowPending ? 'Salvando…' : 'Salvar alterações'}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={rowPending}
                    onClick={() => setEditingId(null)}
                    className="px-4 py-2 text-xs"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            ) : (
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-3">
                  {item.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="h-16 w-16 shrink-0 rounded-lg border border-primary-100/60 object-cover"
                    />
                  )}
                  <div>
                    <p className="font-display text-primary-700">{item.name}</p>
                    <p className="font-body text-xs text-ink-soft">
                      {categoryOptions.find((option) => option.value === item.category)?.label} ·{' '}
                      {statusLabels[item.status]} · {item.quantityNeeded}{' '}
                      {item.quantityNeeded === 1 ? 'unidade' : 'unidades'}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={rowPending}
                    onClick={() => setEditingId(item.id)}
                    className="px-3 py-1.5 text-xs text-primary-700"
                  >
                    Editar
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={rowPending}
                    onClick={() => handleDelete(item)}
                    className="px-3 py-1.5 text-xs text-secondary-700 hover:bg-secondary-50"
                  >
                    Remover
                  </Button>
                </div>
              </div>
            )}

            {errorByItem[item.id] && <p className="font-body text-xs text-secondary-700">{errorByItem[item.id]}</p>}
          </Card>
        );
      })}
    </div>
  );
}
