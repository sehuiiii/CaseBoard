import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import {PrismaAdapter} from "@auth/prisma-adapter";
import {redirect} from "next/navigation";
import type {Locale} from "@/i18n/routing";
import {verifyPassword} from "@/lib/password";
import {prisma} from "@/lib/prisma";
import {isValidEmail, normalizeEmail} from "@/lib/validation";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
};

export const {handlers, auth, signIn, signOut} = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt"
  },
  providers: [
    Credentials({
      credentials: {
        email: {label: "Email", type: "email"},
        password: {label: "Password", type: "password"}
      },
      async authorize(credentials) {
        const email =
          typeof credentials.email === "string"
            ? normalizeEmail(credentials.email)
            : "";
        const password =
          typeof credentials.password === "string" ? credentials.password : "";

        if (!isValidEmail(email) || !password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email
          }
        });

        if (!user || !(await verifyPassword(password, user.passwordHash))) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name
        };
      }
    })
  ],
  callbacks: {
    jwt({token, user}) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
      }

      return token;
    },
    session({session, token}) {
      if (session.user) {
        session.user.id = String(token.id);
        session.user.name = token.name ?? "";
        session.user.email = token.email ?? "";
      }

      return session;
    }
  }
});

export async function getCurrentUser(): Promise<AuthUser | null> {
  const session = await auth();
  const sessionUser = session?.user;

  if (!sessionUser?.id || !sessionUser.email) {
    return null;
  }

  return {
    id: sessionUser.id,
    email: sessionUser.email,
    name: sessionUser.name ?? ""
  };
}

export async function requireUser(locale: Locale): Promise<AuthUser> {
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  return user;
}
