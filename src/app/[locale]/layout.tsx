import type {Metadata} from "next";
import {NextIntlClientProvider} from "next-intl";
import {getMessages, getTranslations} from "next-intl/server";
import {notFound} from "next/navigation";
import type {ReactNode} from "react";
import "../globals.css";
import {isLocale, locales, type Locale} from "@/i18n/routing";
import {SiteHeader} from "@/components/layout/site-header";
import {getCurrentUser} from "@/lib/auth";

type Props = {
  children: ReactNode;
  params: Promise<{locale: string}>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({locale}));
}

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale} = await params;
  const safeLocale = isLocale(locale) ? locale : "ko";
  const t = await getTranslations({locale: safeLocale, namespace: "meta"});
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return {
    metadataBase: new URL(appUrl),
    title: t("title"),
    description: t("description"),
    icons: {
      icon: "/favicon.svg"
    },
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: `${appUrl}/${safeLocale}`,
      siteName: "CaseBoard",
      images: [
        {
          url: "/brand/caseboard-logo-horizontal-v3-cold.png",
          width: 1984,
          height: 768,
          alt: "CaseBoard"
        }
      ],
      locale: safeLocale === "ko" ? "ko_KR" : "en_US",
      type: "website"
    }
  };
}

export default async function LocaleLayout({children, params}: Props) {
  const {locale} = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const messages = await getMessages({locale});
  const user = await getCurrentUser();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <div className="app-shell">
            <SiteHeader locale={locale as Locale} user={user} />
            {children}
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
