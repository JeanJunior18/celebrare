import { redirect } from 'next/navigation';

import { PlatformShell } from '@/components/platform-shell';
import { auth } from '@/infrastructure/auth/auth';
import { db } from '@/infrastructure/postgres/client';
import { PostgresEventRepository } from '@/infrastructure/postgres/event-repository.postgres';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const eventRepository = new PostgresEventRepository(db);
  const event = await eventRepository.findByOwnerUserId(session.user.id);

  return <PlatformShell themeColorTokens={event?.theme.colorTokens}>{children}</PlatformShell>;
}
