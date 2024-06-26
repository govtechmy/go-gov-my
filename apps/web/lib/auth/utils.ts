import type { UserRole } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./options";

export interface Session {
  user: {
    email: string;
    id: string;
    name: string;
    image?: string;
    role: UserRole;
  };
}

/**
 * Extend next-auth's session type to match our Session type
 * Docs: https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      email: string;
      id: string;
      name: string;
      image?: string;
      role: UserRole;
    };
  }
}

export const getSession = async () => {
  return getServerSession(authOptions) as Promise<Session>;
};
