'use server';

import { revalidatePath } from 'next/cache';
import { ZodError } from 'zod';

import { createTheme } from '@/application/use-cases/create-theme.use-case';
import { updateTheme } from '@/application/use-cases/update-theme.use-case';
import { db } from '@/infrastructure/postgres/client';
import { PostgresThemeRepository } from '@/infrastructure/postgres/theme-repository.postgres';

export interface ThemeActionResult {
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

export async function createThemeAction(
  _prevState: ThemeActionResult | null,
  formData: FormData,
): Promise<ThemeActionResult> {
  try {
    const repository = new PostgresThemeRepository(db);

    const result = await createTheme(repository, {
      slug: String(formData.get('slug') ?? ''),
      name: String(formData.get('name') ?? ''),
      colorTokens: parseJsonField(formData, 'colorTokens') as never,
      defaultCopy: parseJsonField(formData, 'defaultCopy') as never,
      defaultIllustrationUrl: formData.get('defaultIllustrationUrl')?.toString() || undefined,
    });

    if (!result.success) {
      return { success: false, message: 'Esse slug de tema já existe.' };
    }

    revalidatePath('/internal/themes');
    return { success: true };
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, message: error.issues[0]?.message ?? 'Dados inválidos.' };
    }
    return { success: false, message: error instanceof Error ? error.message : 'Erro inesperado.' };
  }
}

export async function updateThemeAction(
  _prevState: ThemeActionResult | null,
  formData: FormData,
): Promise<ThemeActionResult> {
  try {
    const repository = new PostgresThemeRepository(db);
    const themeId = String(formData.get('themeId') ?? '');

    await updateTheme(repository, themeId, {
      name: String(formData.get('name') ?? ''),
      colorTokens: parseJsonField(formData, 'colorTokens') as never,
      defaultCopy: parseJsonField(formData, 'defaultCopy') as never,
      defaultIllustrationUrl: formData.get('defaultIllustrationUrl')?.toString() || undefined,
    });

    revalidatePath('/internal/themes');
    return { success: true };
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, message: error.issues[0]?.message ?? 'Dados inválidos.' };
    }
    return { success: false, message: error instanceof Error ? error.message : 'Erro inesperado.' };
  }
}
