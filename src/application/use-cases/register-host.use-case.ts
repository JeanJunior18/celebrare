import bcrypt from 'bcryptjs';
import { z } from 'zod';

import type { Host } from '@/domain/entities/host';
import type { HostRepository } from '@/domain/repositories/host-repository';

const PASSWORD_HASH_ROUNDS = 10;

const registerHostInputSchema = z.object({
  name: z.string().trim().min(2).optional(),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8, 'A senha precisa ter pelo menos 8 caracteres.'),
});

export type RegisterHostInput = z.infer<typeof registerHostInputSchema>;

export type RegisterHostResult = { success: true; host: Host } | { success: false; reason: 'EMAIL_TAKEN' };

export async function registerHost(
  hostRepository: HostRepository,
  input: RegisterHostInput,
): Promise<RegisterHostResult> {
  const parsed = registerHostInputSchema.parse(input);

  const existing = await hostRepository.findByEmail(parsed.email);
  if (existing) return { success: false, reason: 'EMAIL_TAKEN' };

  const passwordHash = await bcrypt.hash(parsed.password, PASSWORD_HASH_ROUNDS);
  const host = await hostRepository.create({ name: parsed.name, email: parsed.email, passwordHash });

  return { success: true, host };
}
