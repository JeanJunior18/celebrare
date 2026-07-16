import type { Host } from '@/domain/entities/host';

export interface HostCredentials extends Host {
  passwordHash: string;
}

export interface HostRepository {
  findByEmail(email: string): Promise<HostCredentials | null>;
  create(input: { name?: string; email: string; passwordHash: string }): Promise<Host>;
}
