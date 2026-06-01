import Image from "next/image";
import Link from "next/link";
import {BrainCircuit, Languages, Network} from "lucide-react";
import {getTranslations} from "next-intl/server";
import {getCurrentUser} from "@/lib/auth";
import {isLocale, type Locale} from "@/i18n/routing";

export default async function HomePage({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale: rawLocale} = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "ko";
  const t = await getTranslations({locale, namespace: "home"});
  const user = await getCurrentUser();

  const features = [
    {
      icon: Network,
      title: t("featureEditor"),
      desc: t("featureEditorDesc")
    },
    {
      icon: BrainCircuit,
      title: t("featureAnalysis"),
      desc: t("featureAnalysisDesc")
    },
    {
      icon: Languages,
      title: t("featureI18n"),
      desc: t("featureI18nDesc")
    }
  ];

  return (
    <main>
      <section className="container grid min-h-[calc(100vh-72px)] items-center gap-10 py-10 lg:grid-cols-[1fr_0.9fr]">
        <div>
          <p className="eyebrow">{t("eyebrow")}</p>
          <h1 className="mt-5 max-w-3xl text-5xl font-black leading-tight md:text-6xl">
            {t("title")}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--cb-muted)]">
            {t("description")}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link className="button" href={`/${locale}/boards`}>
              {t("start")}
            </Link>
            {!user ? (
              <Link className="button secondary" href={`/${locale}/signup`}>
                {t("createAccount")}
              </Link>
            ) : null}
          </div>
        </div>

        <div className="relative overflow-hidden rounded-lg border border-[var(--cb-border)] bg-[rgba(24,29,27,0.7)] p-5">
          <Image
            alt="CaseBoard logo concept"
            className="h-auto w-full rounded-md"
            height={768}
            priority
            src="/brand/caseboard-logo-horizontal-v3-cold.png"
            width={1984}
          />
          <div className="mt-5 grid grid-cols-3 gap-3">
            {["TASK", "BUG", "EVENT"].map((item) => (
              <div
                className="rounded-md border border-[var(--cb-border)] bg-[rgba(15,17,16,0.65)] p-3 text-xs font-bold text-[var(--cb-muted)]"
                key={item}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container pb-14">
        <div className="grid-cards">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <article className="panel p-5" key={feature.title}>
                <Icon className="h-7 w-7 text-[var(--cb-teal)]" />
                <h2 className="mt-4 text-xl font-black">{feature.title}</h2>
                <p className="mt-2 leading-7 text-[var(--cb-muted)]">
                  {feature.desc}
                </p>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
