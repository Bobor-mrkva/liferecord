export const LOCALES = ["en", "fr", "es", "de", "hu", "zh"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "lr_locale";

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "EN",
  fr: "FR",
  es: "ES",
  de: "DE",
  zh: "中文",
  hu: "HU",
};

export const LOCALE_NATIVE_NAMES: Record<Locale, string> = {
  en: "English",
  fr: "Français",
  es: "Español",
  de: "Deutsch",
  zh: "中文",
  hu: "Magyar",
};

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}
