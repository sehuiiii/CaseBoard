"use client";

import Link from "next/link";
import {usePathname} from "next/navigation";
import {Languages} from "lucide-react";
import {locales, type Locale} from "@/i18n/routing";

export function LocaleSwitcher({locale}: {locale: Locale}) {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-1 rounded-md border border-[var(--cb-border)] bg-[rgba(34,40,36,0.72)] p-1">
      <Languages className="mx-1 h-4 w-4 text-[var(--cb-muted)]" />
      {locales.map((targetLocale) => {
        const segments = pathname.split("/");
        segments[1] = targetLocale;
        const href = segments.join("/") || `/${targetLocale}`;

        return (
          <Link
            aria-current={targetLocale === locale ? "page" : undefined}
            className={`rounded px-2 py-1 text-xs font-bold uppercase ${
              targetLocale === locale
                ? "bg-[var(--cb-teal)] text-[#071011]"
                : "text-[var(--cb-muted)] hover:text-[var(--cb-text)]"
            }`}
            href={href}
            key={targetLocale}
          >
            {targetLocale}
          </Link>
        );
      })}
    </div>
  );
}
