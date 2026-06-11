"use client";

import Link from "next/link";
import {useActionState} from "react";
import type {Locale} from "@/i18n/routing";
import {
  type AuthActionState,
  loginAction,
  signupAction
} from "@/lib/actions/auth-actions";

type AuthCopy = {
  title: string;
  email: string;
  password: string;
  name: string;
  submit: string;
  errorRequired: string;
  errorInvalid: string;
  errorEmailExists: string;
  alternate: string;
  alternateLink: string;
};

export function AuthForm({
  copy,
  locale,
  mode
}: {
  copy: AuthCopy;
  locale: Locale;
  mode: "login" | "signup";
}) {
  const action = mode === "login" ? loginAction : signupAction;
  const [state, formAction, isPending] = useActionState<AuthActionState, FormData>(
    action.bind(null, locale),
    {}
  );

  const errorMessage = state.error
    ? {
        required: copy.errorRequired,
        invalid: copy.errorInvalid,
        emailExists: copy.errorEmailExists
      }[state.error]
    : null;

  return (
    <section className="container page-section">
      <div className="auth-panel panel p-8">
        <p className="eyebrow">CaseBoard</p>
        <h1 className="mt-3 text-3xl font-black">{copy.title}</h1>
        <div className="mt-4 h-px w-20 bg-[var(--cb-border-strong)]" />

        <form action={formAction} className="mt-8 space-y-4">
          {mode === "signup" ? (
            <label className="block space-y-2">
              <span className="text-sm font-bold text-[var(--cb-muted)]">
                {copy.name}
              </span>
              <input className="input" name="name" required />
            </label>
          ) : null}

          <label className="block space-y-2">
            <span className="text-sm font-bold text-[var(--cb-muted)]">
              {copy.email}
            </span>
            <input className="input" name="email" required type="email" />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-bold text-[var(--cb-muted)]">
              {copy.password}
            </span>
            <input
              className="input"
              minLength={6}
              name="password"
              required
              type="password"
            />
          </label>

          {errorMessage ? (
            <p className="rounded-md border border-[rgba(182,75,69,0.4)] bg-[rgba(182,75,69,0.12)] px-3 py-2 text-sm text-[#e9b0ad]">
              {errorMessage}
            </p>
          ) : null}

          <button className="button w-full" disabled={isPending} type="submit">
            {copy.submit}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-[var(--cb-muted)]">
          {copy.alternate}{" "}
          <Link
            className="font-bold text-[var(--cb-teal-strong)]"
            href={`/${locale}/${mode === "login" ? "signup" : "login"}`}
          >
            {copy.alternateLink}
          </Link>
        </p>
      </div>
    </section>
  );
}
