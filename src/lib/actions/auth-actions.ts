"use server";

import {Prisma} from "@prisma/client";
import {AuthError} from "next-auth";
import {hashPassword} from "@/lib/password";
import {signIn, signOut} from "@/lib/auth";
import {prisma} from "@/lib/prisma";
import {isValidEmail, normalizeEmail, readString} from "@/lib/validation";
import type {Locale} from "@/i18n/routing";

export type AuthActionState = {
  error?: "invalid" | "emailExists" | "required";
};

export async function signupAction(
  locale: Locale,
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = normalizeEmail(readString(formData, "email"));
  const name = readString(formData, "name");
  const password = readString(formData, "password");

  if (!isValidEmail(email) || name.length < 2 || password.length < 6) {
    return {error: "required"};
  }

  try {
    await prisma.user.create({
      data: {
        email,
        name,
        passwordHash: await hashPassword(password)
      }
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {error: "emailExists"};
    }

    throw error;
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: `/${locale}/boards`
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return {error: "invalid"};
    }

    throw error;
  }

  return {};
}

export async function loginAction(
  locale: Locale,
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = normalizeEmail(readString(formData, "email"));
  const password = readString(formData, "password");

  if (!isValidEmail(email) || password.length < 1) {
    return {error: "invalid"};
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: `/${locale}/boards`
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return {error: "invalid"};
    }

    throw error;
  }

  return {};
}

export async function logoutAction(locale: Locale) {
  await signOut({
    redirectTo: `/${locale}`
  });
}
