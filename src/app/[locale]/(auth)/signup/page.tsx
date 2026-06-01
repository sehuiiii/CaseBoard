import {getTranslations} from "next-intl/server";
import {AuthForm} from "@/components/auth/auth-form";
import {isLocale, type Locale} from "@/i18n/routing";

export default async function SignupPage({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale: rawLocale} = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "ko";
  const t = await getTranslations({locale, namespace: "auth"});

  return (
    <AuthForm
      copy={{
        title: t("signupTitle"),
        email: t("email"),
        password: t("password"),
        name: t("name"),
        submit: t("signupButton"),
        errorRequired: t("required"),
        errorInvalid: t("invalid"),
        errorEmailExists: t("emailExists"),
        alternate: t("hasAccount"),
        alternateLink: t("goLogin")
      }}
      locale={locale}
      mode="signup"
    />
  );
}
