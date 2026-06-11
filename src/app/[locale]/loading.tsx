"use client";

import {Loader2} from "lucide-react";
import {useTranslations} from "next-intl";

export default function Loading() {
  const t = useTranslations("status");

  return (
    <main className="container page-section">
      <div className="panel flex items-center gap-3 p-6 text-sm text-[var(--cb-muted)]">
        <Loader2 className="h-5 w-5 animate-spin text-[var(--cb-teal)]" />
        <span>{t("loading")}</span>
      </div>
    </main>
  );
}
