import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import { sendEmail } from "emails";
import LoginLink from "emails/login-link";
import WelcomeEmail from "emails/welcome-email";
import { type NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import GoogleProvider from "next-auth/providers/google";
import { subscribe } from "../flodesk";
import { isStored, storage } from "../storage";
import { IS_PRODUCTION, SESSION_TOKEN_NAME } from "./constants";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  providers: [
    EmailProvider({
      async sendVerificationRequest({ identifier, url }) {
        // For now the dev and prod should be the same unless we want to handle them email differently later.
        if (!IS_PRODUCTION) {
          await sendEmail({
            email: identifier,
            subject: `Your ${process.env.NEXT_PUBLIC_APP_NAME} Login Link`,
            react: LoginLink({ url, email: identifier }),
          });
          return;
        }
        await sendEmail({
          email: identifier,
          subject: `Your ${process.env.NEXT_PUBLIC_APP_NAME} Login Link`,
          react: LoginLink({ url, email: identifier }),
        });
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  cookies: {
    sessionToken: {
      name: IS_PRODUCTION
        ? `__Secure-${SESSION_TOKEN_NAME}`
        : SESSION_TOKEN_NAME,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        // When working on localhost, the cookie domain must be omitted entirely (https://stackoverflow.com/a/1188145)
        domain: IS_PRODUCTION
          ? `.${process.env.NEXT_PUBLIC_APP_DOMAIN}`
          : undefined,
        secure: IS_PRODUCTION,
      },
    },
  },
  pages: {
    error: "/login",
  },
  callbacks: {
    signIn: async ({ user, account, profile }) => {
      console.log({ user, account, profile });

      if (!user.email) {
        return false;
      }

      // TODO: Remove dub.co's isBlacklistedEmail function
      // if (!user.email || (await isBlacklistedEmail(user.email))) {
      //   return false;
      // }

      // Disabling for now to test
      // if (!allowedDomain(user.email, !IS_PRODUCTION)) {
      //   return false;
      // }

      if (account?.provider === "google") {
        const userExists = await prisma.user.findUnique({
          where: { email: user.email },
          select: { id: true, name: true, image: true },
        });
        if (!userExists || !profile) {
          return true;
        }
        // if the user already exists via email,
        // update the user with their name and image
        if (userExists && profile) {
          const profilePic =
            profile[account.provider === "google" ? "picture" : "avatar_url"];
          let newAvatar: string | null = null;
          // if the existing user doesn't have an image or the image is not stored in R2
          if (
            (!userExists.image || !isStored(userExists.image)) &&
            profilePic
          ) {
            const { url } = await storage.upload(
              `avatars/${userExists.id}`,
              profilePic,
            );
            newAvatar = url;
          }
          await prisma.user.update({
            where: { email: user.email },
            data: {
              // @ts-expect-error - this is a bug in the types, `login` is a valid on the `Profile` type
              ...(!userExists.name && { name: profile.name || profile.login }),
              ...(newAvatar && { image: newAvatar }),
            },
          });
        }
      }
      return true;
    },
    jwt: async ({ token, user, trigger }) => {
      if (user) {
        token.user = user;
      }

      // refresh the user's data if they update their name / email
      if (trigger === "update") {
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
      if (message.isNewUser) {
        const email = message.user.email as string;
        const user = await prisma.user.findUnique({
          where: { email },
          select: {
            name: true,
            createdAt: true,
          },
        });
        // only send the welcome email if the user was created in the last 10s
        // (this is a workaround because the `isNewUser` flag is triggered when a user does `dangerousEmailAccountLinking`)
        if (
          user?.createdAt &&
          new Date(user.createdAt).getTime() > Date.now() - 10000 &&
          process.env.NEXT_PUBLIC_IS_DUB
        ) {
          await Promise.allSettled([
            subscribe({ email, name: user.name || undefined }),
            sendEmail({
              subject: `Welcome to ${process.env.NEXT_PUBLIC_APP_DOMAIN}`,
              email,
              react: WelcomeEmail({
                email,
                name: user.name || null,
              }),
              marketing: true,
            }),
          ]);
        }
      }
      // lazily backup user avatar to R2
      const currentImage = message.user.image;
      if (currentImage && !isStored(currentImage)) {
        const { url } = await storage.upload(
          `avatars/${message.user.id}`,
          currentImage,
        );
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
