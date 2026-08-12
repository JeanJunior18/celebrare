'use server';

import { revalidatePath } from 'next/cache';
import { ZodError } from 'zod';

import { createOccasion } from '@/application/use-cases/create-occasion.use-case';
import { updateOccasion } from '@/application/use-cases/update-occasion.use-case';
import { db } from '@/infrastructure/postgres/client';
import { PostgresOccasionRepository } from '@/infrastructure/postgres/occasion-repository.postgres';

export interface OccasionActionResult {
  success: boolean;
  message?: string;
}

function parseJsonField(formData: FormData, field: string): unknown {
  const raw = String(formData.get(field) ?? '');
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error(`Campo "${field}" não é um JSON válido.`);
  }
}

export async function createOccasionAction(
  _prevState: OccasionActionResult | null,
  formData: FormData,
): Promise<OccasionActionResult> {
  try {
    const repository = new PostgresOccasionRepository(db);

    const result = await createOccasion(repository, {
      slug: String(formData.get('slug') ?? ''),
      name: String(formData.get('name') ?? ''),
      defaultCopy: parseJsonField(formData, 'defaultCopy') as never,
    });

    if (!result.success) {
      return { success: false, message: 'Esse slug de ocasião já existe.' };
    }

    revalidatePath('/internal/occasions');
    return { success: true };
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, message: error.issues[0]?.message ?? 'Dados inválidos.' };
    }
    return { success: false, message: error instanceof Error ? error.message : 'Erro inesperado.' };
  }
}

export async function updateOccasionAction(
  _prevState: OccasionActionResult | null,
  formData: FormData,
): Promise<OccasionActionResult> {
  try {
    const repository = new PostgresOccasionRepository(db);
    const occasionId = String(formData.get('occasionId') ?? '');

    await updateOccasion(repository, occasionId, {
      name: String(formData.get('name') ?? ''),
      defaultCopy: parseJsonField(formData, 'defaultCopy') as never,
    });

    revalidatePath('/internal/occasions');
    return { success: true };
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, message: error.issues[0]?.message ?? 'Dados inválidos.' };
    }
    return { success: false, message: error instanceof Error ? error.message : 'Erro inesperado.' };
  }
}
