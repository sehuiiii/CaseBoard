"use client";

import Link from "next/link";
import {usePathname} from "next/navigation";
import {FileQuestion} from "lucide-react";
import {useTranslations} from "next-intl";
import {defaultLocale, isLocale} from "@/i18n/routing";

export default function NotFound() {
  const t = useTranslations("status");
  const pathname = usePathname();
  const firstSegment = pathname.split("/")[1];
  const locale = isLocale(firstSegment) ? firstSegment : defaultLocale;

  return (
    <main className="container page-section">
      <section className="panel max-w-xl p-8">
        <FileQuestion className="mb-4 h-9 w-9 text-[var(--cb-teal)]" />
        <h1 className="text-2xl font-bold">{t("notFoundTitle")}</h1>
        <p className="mt-3 text-[var(--cb-muted)]">{t("notFoundDesc")}</p>
        <Link className="button mt-6" href={`/${locale}`}>
          {t("backHome")}
        </Link>
      </section>
    </main>
  );
}
