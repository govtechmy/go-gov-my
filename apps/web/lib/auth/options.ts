import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';
import { sendEmail } from 'emails';
import LoginLink from 'emails/login-link';
import { type NextAuthOptions } from 'next-auth';
import EmailProvider from 'next-auth/providers/email';
import GoogleProvider from 'next-auth/providers/google';
import { isStored, storage } from '../storage';
import { IS_PRODUCTION, SESSION_TOKEN_NAME } from './constants';

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  providers: [
    EmailProvider({
      async sendVerificationRequest({ identifier, url }) {
        // For now the dev and prod should be the same unless we want to handle them email differently later.
        if (!IS_PRODUCTION) {
          console.log({ url });
          return;
        }
        await sendEmail({
          email: identifier,
          subject: `Your ${process.env.NEXT_PUBLIC_APP_NAME} Login Link`,
          react: LoginLink({ url, email: identifier }),
        });
      },
    }),
    // GoogleProvider({
    //   clientId: process.env.GOOGLE_CLIENT_ID as string,
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    //   allowDangerousEmailAccountLinking: true,
    // }),
  ],
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  cookies: {
    sessionToken: {
      name: IS_PRODUCTION ? `__Secure-${SESSION_TOKEN_NAME}` : SESSION_TOKEN_NAME,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        // When working on localhost, the cookie domain must be omitted entirely (https://stackoverflow.com/a/1188145)
        domain: IS_PRODUCTION ? `.${process.env.NEXT_PUBLIC_APP_DOMAIN}` : undefined,
        secure: IS_PRODUCTION,
      },
    },
  },
  pages: {
    error: '/login',
  },
  callbacks: {
    signIn: async ({ user, account, profile }) => {
      try {
        console.log('Starting signIn callback');
        if (!user.email) {
          return false;
        }

        // if (account?.provider === 'google') {
        //   const userExists = await prisma.user.findUnique({
        //     where: { email: user.email },
        //     select: { id: true, name: true, image: true },
        //   });

        //   if (!userExists || !profile) {
        //     return true;
        //   }

        //   // if the user already exists via email,
        //   // update the user with their name and image
        //   if (userExists && profile) {
        //     const profilePic = profile[account.provider === 'google' ? 'picture' : 'avatar_url'];
        //     let newAvatar: string | null = null;

        //     try {
        //       // Only attempt upload if there's a profile picture and it needs updating
        //       if ((!userExists.image || !isStored(userExists.image)) && profilePic) {
        //         const { url } = await storage.upload(`avatars/${userExists.id}`, profilePic);
        //         newAvatar = url;
        //       }

        //       await prisma.user.update({
        //         where: { email: user.email },
        //         data: {
        //           // @ts-expect-error - this is a bug in the types, `login` is a valid on the `Profile` type
        //           name: profile.name || profile.login,
        //           ...(newAvatar && { image: newAvatar }),
        //         },
        //       });
        //     } catch (error) {
        //       console.error('Error updating user profile:', error);
        //       // Continue the sign-in process even if avatar upload fails
        //       return true;
        //     }
        //   }
        // }
        return true;
      } catch (error) {
        console.error('SignIn callback error:', error);
        // Continue the sign-in process even if there's an error
        return true;
      }
    },
    jwt: async ({ token, user, trigger }) => {
      if (user) {
        token.user = user;
      }

      // refresh the user's data if they update their name / email
      if (trigger === 'update') {
        const refreshedUser = await prisma.user.findUnique({
          where: { id: token.sub },
        });
        if (refreshedUser) {
          token.user = refreshedUser;
        } else {
          return {};
        }
      }

      return token;
    },
    session: async ({ session, token }) => {
      session.user = {
        id: token.sub,
        // @ts-ignore
        ...(token || session).user,
      };
      return session;
    },
  },
  events: {
    async signIn(message) {
      // lazily backup user avatar to R2
      const currentImage = message.user.image;
      if (currentImage && !isStored(currentImage)) {
        const { url } = await storage.upload(`avatars/${message.user.id}`, currentImage);
        await prisma.user.update({
          where: {
            id: message.user.id,
          },
          data: {
            image: url,
          },
        });
      }
    },
  },
};
