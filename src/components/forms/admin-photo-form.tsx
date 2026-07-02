'use client';

import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';

import {
  createGalleryPhotoAction,
  getNextGalleryDisplayOrderAction,
  type AdminGalleryActionResult,
} from '@/app/actions/admin-gallery.actions';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

interface SelectedPhoto {
  id: string;
  file: File;
  description: string;
}

interface SubmitResult {
  success: boolean;
  message?: string;
}

export interface AdminPhotoFormProps {
  // Mesmo motivo do `action` em AdminGiftForm — reaproveitado pelo
  // dashboard de host (fase 7) com actions que resolvem o eventId da sessão.
  createPhotoAction?: (
    state: AdminGalleryActionResult | null,
    formData: FormData,
  ) => Promise<AdminGalleryActionResult>;
  getNextDisplayOrder?: () => Promise<number>;
}

export function AdminPhotoForm({
  createPhotoAction = createGalleryPhotoAction,
  getNextDisplayOrder = getNextGalleryDisplayOrderAction,
}: AdminPhotoFormProps) {
  const [photos, setPhotos] = useState<SelectedPhoto[]>([]);
  const [isPending, setIsPending] = useState(false);
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [formKey, setFormKey] = useState(0);

  const previewUrls = useMemo(
    () => photos.map((photo) => URL.createObjectURL(photo.file)),
    [photos],
  );

  useEffect(() => {
    return () => previewUrls.forEach((url) => URL.revokeObjectURL(url));
  }, [previewUrls]);

  function handleFilesChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    setPhotos(files.map((file) => ({ id: crypto.randomUUID(), file, description: '' })));
    setResult(null);
  }

  function handleRemovePhoto(index: number) {
    setPhotos((current) => current.filter((_, photoIndex) => photoIndex !== index));
  }

  function handleDescriptionChange(index: number, description: string) {
    setPhotos((current) =>
      current.map((photo, photoIndex) => (photoIndex === index ? { ...photo, description } : photo)),
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (photos.length === 0) return;

    setIsPending(true);
    setResult(null);

    let addedCount = 0;
    let firstError: string | undefined;

    try {
      const baseDisplayOrder = await getNextDisplayOrder();

      for (const [index, photo] of photos.entries()) {
        const photoFormData = new FormData();
        photoFormData.set('description', photo.description);
        photoFormData.set('displayOrder', String(baseDisplayOrder + index));
        photoFormData.set('image', photo.file);

        const photoResult = await createPhotoAction(null, photoFormData);
        if (photoResult.success) {
          addedCount += 1;
        } else {
          firstError ??= photoResult.message;
        }
      }
    } catch (error) {
      firstError = error instanceof Error ? error.message : 'Erro inesperado.';
    }

    setIsPending(false);

    if (addedCount === photos.length) {
      setResult({ success: true });
      setPhotos([]);
      setFormKey((key) => key + 1);
    } else {
      setResult({
        success: false,
        message: `${addedCount}/${photos.length} foto(s) adicionada(s). ${firstError ?? ''}`.trim(),
      });
    }
  }

  return (
    <Card whimsyAccent className="w-full max-w-2xl">
      <form key={formKey} onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Input
          label="Imagens"
          name="image"
          type="file"
          accept="image/*"
          multiple
          required
          onChange={handleFilesChange}
        />

        {photos.length > 0 && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {photos.map((photo, index) => (
              <div
                key={photo.id}
                className="flex flex-col gap-2 rounded-xl border border-primary-200 p-2"
              >
                <div className="relative aspect-square overflow-hidden rounded-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrls[index]}
                    alt={photo.file.name}
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(index)}
                    className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-ink/70 font-body text-xs text-surface"
                    aria-label={`Remover ${photo.file.name}`}
                  >
                    ×
                  </button>
                </div>
                <Input
                  label="Descrição"
                  placeholder="Ex: 1 mês, Ensaio, Recepção..."
                  value={photo.description}
                  onChange={(event) => handleDescriptionChange(index, event.target.value)}
                  required
                />
              </div>
            ))}
          </div>
        )}

        <div className="mt-2 flex flex-col items-center gap-2">
          <Button
            type="submit"
            disabled={isPending || photos.length === 0}
            className="w-full md:w-auto md:px-12"
          >
            {isPending ? 'Salvando…' : `Adicionar ${photos.length || ''} foto(s)`}
          </Button>
          {result?.success && (
            <p className="font-body text-sm text-primary-700">Foto(s) adicionada(s)! ♡</p>
          )}
          {result?.success === false && (
            <p className="font-body text-sm text-secondary-700">{result.message}</p>
          )}
        </div>
      </form>
    </Card>
  );
}
