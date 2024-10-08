import type { UserRole } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './options';

export interface Session {
  // This must match the User model from Prisma
  user: {
    email: string;
    id: string;
    name?: string | null;
    image?: string | null;
    role: UserRole;
    agencyCode: string;
  };
}

/**
 * Extend next-auth's session type to match our Session type
 * Docs: https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      email: string;
      id: string;
      name?: string | null;
      image?: string | null;
      role: UserRole;
      agencyCode: string;
    };
  }
}

export const getSession = async () => {
  return getServerSession(authOptions) as Promise<Session>;
};
