export type LanguageCode = "pl" | "en" | "de" | "it" | "fr";

export interface Language {
  readonly code: LanguageCode;
  readonly name: string;
  readonly nativeName: string;
  readonly flag: string;
  readonly speechLocale: string;
  readonly francCode: string;
  readonly tesseractCode: string;
  readonly deeplCode: string;
}

export const LANGUAGES: Readonly<Record<LanguageCode, Language>> = {
  pl: {
    code: "pl",
    name: "Polish",
    nativeName: "Polski",
    flag: "🇵🇱",
    speechLocale: "pl-PL",
    francCode: "pol",
    tesseractCode: "pol",
    deeplCode: "PL"
  },
  en: {
    code: "en",
    name: "English",
    nativeName: "English",
    flag: "🇬🇧",
    speechLocale: "en-US",
    francCode: "eng",
    tesseractCode: "eng",
    deeplCode: "EN"
  },
  de: {
    code: "de",
    name: "German",
    nativeName: "Deutsch",
    flag: "🇩🇪",
    speechLocale: "de-DE",
    francCode: "deu",
    tesseractCode: "deu",
    deeplCode: "DE"
  },
  it: {
    code: "it",
    name: "Italian",
    nativeName: "Italiano",
    flag: "🇮🇹",
    speechLocale: "it-IT",
    francCode: "ita",
    tesseractCode: "ita",
    deeplCode: "IT"
  },
  fr: {
    code: "fr",
    name: "French",
    nativeName: "Français",
    flag: "🇫🇷",
    speechLocale: "fr-FR",
    francCode: "fra",
    tesseractCode: "fra",
    deeplCode: "FR"
  }
};

export const LANGUAGE_LIST: readonly Language[] = Object.values(LANGUAGES);

export const SUPPORTED_LANGUAGE_CODES = Object.keys(LANGUAGES) as LanguageCode[];

export function isLanguageCode(value: string): value is LanguageCode {
  return value in LANGUAGES;
}

export function getLanguage(code: LanguageCode): Language {
  return LANGUAGES[code];
}

const FRANC_TO_CODE: Readonly<Record<string, LanguageCode>> = Object.freeze(
  LANGUAGE_LIST.reduce<Record<string, LanguageCode>>((acc, lang) => {
    acc[lang.francCode] = lang.code;
    return acc;
  }, {})
);

export function fromFrancCode(francCode: string): LanguageCode | null {
  return FRANC_TO_CODE[francCode] ?? null;
}

export function fromBcp47(tag: string): LanguageCode | null {
  const base = tag.toLowerCase().split("-")[0] ?? "";
  return isLanguageCode(base) ? base : null;
}
