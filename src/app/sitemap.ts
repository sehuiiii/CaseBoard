import type {MetadataRoute} from "next";
import {locales} from "@/i18n/routing";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return locales.flatMap((locale) => [
    {
      url: `${baseUrl}/${locale}`,
      lastModified: new Date()
    },
    {
      url: `${baseUrl}/${locale}/login`,
      lastModified: new Date()
    },
    {
      url: `${baseUrl}/${locale}/signup`,
      lastModified: new Date()
    }
  ]);
}
