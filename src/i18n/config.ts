export const LOCALES = ["pt-AO", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "pt-AO";
export const LOCALE_COOKIE_NAME = "NANNY_LOCALE";

export function isLocale(value: string | undefined): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}
