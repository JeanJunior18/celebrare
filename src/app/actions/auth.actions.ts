'use server';

import { AuthError } from 'next-auth';
import { redirect } from 'next/navigation';
import { ZodError } from 'zod';

import { registerHost } from '@/application/use-cases/register-host.use-case';
import { signIn, signOut } from '@/infrastructure/auth/auth';
import { db } from '@/infrastructure/postgres/client';
import { PostgresHostRepository } from '@/infrastructure/postgres/host-repository.postgres';

export interface AuthActionResult {
  success: boolean;
  message?: string;
}

export async function registerHostAction(
  _prevState: AuthActionResult | null,
  formData: FormData,
): Promise<AuthActionResult> {
  const email = String(formData.get('email') ?? '');
  const password = String(formData.get('password') ?? '');

  try {
    const repository = new PostgresHostRepository(db);

    const result = await registerHost(repository, {
      name: formData.get('name')?.toString() || undefined,
      email,
      password,
    });

    if (!result.success) {
      return { success: false, message: 'Esse email já está cadastrado.' };
    }
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, message: error.issues[0]?.message ?? 'Dados inválidos.' };
    }
    return { success: false, message: error instanceof Error ? error.message : 'Erro inesperado.' };
  }

  return loginHostAction(null, formData);
}

export async function loginHostAction(
  _prevState: AuthActionResult | null,
  formData: FormData,
): Promise<AuthActionResult> {
  try {
    await signIn('credentials', {
      email: String(formData.get('email') ?? ''),
      password: String(formData.get('password') ?? ''),
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, message: 'Email ou senha inválidos.' };
    }
    return { success: false, message: error instanceof Error ? error.message : 'Erro inesperado.' };
  }

  redirect('/dashboard');
}

export async function logoutHostAction(): Promise<void> {
  await signOut({ redirectTo: '/login' });
}
