/**
 * NextAuth configuration
 * Separation of Concerns: Auth options, callbacks
 */

import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { ensureUser, getUserPlan } from '@/lib/services/userService';
import type { Plan } from '@/lib/auth/types';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (user.id) {
        await ensureUser(user.id, user.email ?? null, user.name ?? null, user.image ?? null);
      }
      return true;
    },
    async jwt({ token }) {
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const plan: Plan = await getUserPlan(token.sub ?? '');
        (session.user as { id?: string; plan?: Plan }).id = token.sub ?? undefined;
        (session.user as { id?: string; plan?: Plan }).plan = plan;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
};
