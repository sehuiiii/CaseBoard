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
    <header className="site-header sticky top-0 z-40">
      <div className="container flex min-h-16 items-center justify-between gap-3 py-3">
        <Link className="flex min-w-0 items-center gap-3" href={`/${locale}`}>
          <Image
            alt="CaseBoard"
            className="h-8 w-auto sm:h-9"
            height={180}
            priority
            src="/brand/caseboard-logo-flat.svg"
            width={760}
          />
        </Link>

        <nav className="flex items-center gap-1.5 sm:gap-2">
          {user ? (
            <>
              <Link
                className="nav-link"
                href={`/${locale}/boards`}
              >
                <Archive className="h-4 w-4" />
                <span className="hidden sm:inline">{t("boards")}</span>
              </Link>
              <Link
                className="nav-link"
                href={`/${locale}/mypage`}
              >
                <UserRound className="h-4 w-4" />
                <span className="hidden sm:inline">{t("mypage")}</span>
              </Link>
              <LogoutButton label={t("logout")} locale={locale} />
            </>
          ) : (
            <>
              <Link
                className="nav-link"
                href={`/${locale}/login`}
              >
                {t("login")}
              </Link>
              <Link className="button hidden sm:inline-flex" href={`/${locale}/signup`}>
                {t("signup")}
              </Link>
            </>
          )}
          <LocaleSwitcher locale={locale} />
        </nav>
      </div>
    </header>
  );
}
