import { DrizzleAdapter } from '@auth/drizzle-adapter';
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

import { authenticateHost } from '@/application/use-cases/authenticate-host.use-case';
import { db } from '@/infrastructure/postgres/client';
import { accounts, sessions, users, verificationTokens } from '@/infrastructure/postgres/schema';
import { PostgresHostRepository } from '@/infrastructure/postgres/host-repository.postgres';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  // Credentials provider não suporta sessão de banco — Auth.js cairia pra
  // 'jwt' de qualquer forma, mas deixamos explícito.
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        if (typeof credentials?.email !== 'string' || typeof credentials?.password !== 'string') {
          return null;
        }

        const repository = new PostgresHostRepository(db);
        return authenticateHost(repository, { email: credentials.email, password: credentials.password });
      },
    }),
  ],
  callbacks: {
    // Sessão JWT não carrega `id` por padrão — o dashboard precisa dele pra
    // achar o evento do host (`events.owner_user_id`), ver
    // `src/infrastructure/auth/next-auth.d.ts`.
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (session.user) session.user.id = token.id as string;
      return session;
    },
  },
});
