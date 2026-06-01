import type {ReactNode} from "react";
import {isLocale, type Locale} from "@/i18n/routing";
import {requireUser} from "@/lib/auth";

export default async function ProtectedLayout({
  children,
  params
}: {
  children: ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale: rawLocale} = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "ko";
  await requireUser(locale);

  return children;
}
