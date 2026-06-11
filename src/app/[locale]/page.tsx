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
      <section className="forensic-hero">
        <div className="hero-stage" aria-hidden="true">
          <div className="hero-map">
            <div className="hero-line one" />
            <div className="hero-line two" />
            <div className="hero-line three" />
            <div className="hero-node task">
              <span>Task</span>
              <strong>API flow</strong>
              <small>Owner, deadline, and dependency evidence</small>
            </div>
            <div className="hero-node bug">
              <span>Bug</span>
              <strong>Auth failure</strong>
              <small>Blocked by session callback risk</small>
            </div>
            <div className="hero-node person">
              <span>Person</span>
              <strong>Investigator</strong>
              <small>Responsible project contact</small>
            </div>
            <div className="hero-node event">
              <span>Event</span>
              <strong>Release check</strong>
              <small>Final review milestone</small>
            </div>
          </div>
        </div>

        <div className="container">
          <div className="hero-copy">
            <Image
              alt="CaseBoard"
              className="hero-logo-lockup"
              height={180}
              priority
              src="/brand/caseboard-logo-flat.svg"
              width={760}
            />
            <p className="eyebrow mt-8">{t("eyebrow")}</p>
            <h1 className="mt-5 max-w-3xl text-5xl font-black leading-tight md:text-6xl">
              {t("title")}
            </h1>
            <p className="section-caption mt-5 text-lg">
              {t("description")}
            </p>
            <div className="hero-actions">
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
        </div>
      </section>

      <section className="container pb-14">
        <div className="grid-cards">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <article className="feature-card panel" key={feature.title}>
                <Icon className="h-7 w-7 text-[var(--cb-teal-strong)]" />
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
