import Image from "next/image";
import Link from "next/link";
import {Archive, UserRound} from "lucide-react";
import {getTranslations} from "next-intl/server";
import type {AuthUser} from "@/lib/auth";
import type {Locale} from "@/i18n/routing";
import {LocaleSwitcher} from "./locale-switcher";
import {LogoutButton} from "./logout-button";

export async function SiteHeader({
  locale,
  user
}: {
  locale: Locale;
  user: AuthUser | null;
}) {
  const t = await getTranslations({locale, namespace: "nav"});

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--cb-border)] bg-[rgba(15,17,16,0.86)] backdrop-blur">
      <div className="container flex min-h-16 items-center justify-between gap-4 py-3">
        <Link className="flex items-center gap-3" href={`/${locale}`}>
          <Image
            alt="CaseBoard"
            className="h-9 w-auto"
            height={180}
            priority
            src="/brand/caseboard-logo-flat.svg"
            width={760}
          />
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              <Link
                className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-bold text-[var(--cb-muted)] hover:text-[var(--cb-text)]"
                href={`/${locale}/boards`}
              >
                <Archive className="h-4 w-4" />
                {t("boards")}
              </Link>
              <Link
                className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-bold text-[var(--cb-muted)] hover:text-[var(--cb-text)]"
                href={`/${locale}/mypage`}
              >
                <UserRound className="h-4 w-4" />
                {t("mypage")}
              </Link>
              <LogoutButton label={t("logout")} locale={locale} />
            </>
          ) : (
            <>
              <Link
                className="rounded-md px-3 py-2 text-sm font-bold text-[var(--cb-muted)] hover:text-[var(--cb-text)]"
                href={`/${locale}/login`}
              >
                {t("login")}
              </Link>
              <Link className="button" href={`/${locale}/signup`}>
                {t("signup")}
              </Link>
            </>
          )}
          <LocaleSwitcher locale={locale} />
        </nav>

        <div className="md:hidden">
          <LocaleSwitcher locale={locale} />
        </div>
      </div>
    </header>
  );
}
