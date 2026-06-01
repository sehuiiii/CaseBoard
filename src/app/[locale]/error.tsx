"use client";

import {AlertTriangle} from "lucide-react";
import {useTranslations} from "next-intl";

export default function Error({
  reset
}: {
  error: Error & {digest?: string};
  reset: () => void;
}) {
  const t = useTranslations("status");

  return (
    <main className="container page-section">
      <section className="panel max-w-xl p-8">
        <AlertTriangle className="mb-4 h-9 w-9 text-[var(--cb-danger)]" />
        <h1 className="text-2xl font-bold">{t("errorTitle")}</h1>
        <p className="mt-3 text-[var(--cb-muted)]">{t("errorDesc")}</p>
        <button className="button mt-6" onClick={reset}>
          {t("retry")}
        </button>
      </section>
    </main>
  );
}
