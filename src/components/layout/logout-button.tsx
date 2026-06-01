"use client";

import {LogOut} from "lucide-react";
import {useTransition} from "react";
import {logoutAction} from "@/lib/actions/auth-actions";
import type {Locale} from "@/i18n/routing";

export function LogoutButton({
  label,
  locale
}: {
  label: string;
  locale: Locale;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      className="inline-flex items-center gap-2 rounded-md border border-[var(--cb-border)] px-3 py-2 text-sm font-bold text-[var(--cb-muted)] hover:text-[var(--cb-text)]"
      disabled={isPending}
      onClick={() => startTransition(() => logoutAction(locale))}
      type="button"
    >
      <LogOut className="h-4 w-4" />
      {label}
    </button>
  );
}
