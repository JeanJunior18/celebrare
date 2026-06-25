import bcrypt from 'bcryptjs';
import { z } from 'zod';

import type { Host } from '@/domain/entities/host';
import type { HostRepository } from '@/domain/repositories/host-repository';

const authenticateHostInputSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

export type AuthenticateHostInput = z.infer<typeof authenticateHostInputSchema>;

// Retorna null pra qualquer falha (email inexistente, senha errada, input
// inválido) em vez de lançar — o callback `authorize` do Auth.js espera
// exatamente esse contrato pra negar o login.
export async function authenticateHost(
  hostRepository: HostRepository,
  input: AuthenticateHostInput,
): Promise<Host | null> {
  const parsed = authenticateHostInputSchema.safeParse(input);
  if (!parsed.success) return null;

  const host = await hostRepository.findByEmail(parsed.data.email);
  if (!host) return null;

  const isValid = await bcrypt.compare(parsed.data.password, host.passwordHash);
  if (!isValid) return null;

  return { id: host.id, name: host.name, email: host.email, createdAt: host.createdAt };
}
