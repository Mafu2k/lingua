export type ProviderName = "deepl" | "google-cloud" | "google" | "mymemory";

const VALID_PROVIDERS: ProviderName[] = ["deepl", "google-cloud", "google", "mymemory"];

function readProvider(value: string | undefined): ProviderName | undefined {
  const normalized = value?.trim().toLowerCase();
  return VALID_PROVIDERS.find((provider) => provider === normalized);
}

function readNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export const env = {
  deeplApiKey: process.env.DEEPL_API_KEY?.trim() || undefined,
  googleTranslateApiKey: process.env.GOOGLE_TRANSLATE_API_KEY?.trim() || undefined,
  mymemoryContactEmail: process.env.MYMEMORY_CONTACT_EMAIL?.trim() || undefined,
  translationProvider: readProvider(process.env.TRANSLATION_PROVIDER),
  maxTextLength: readNumber(process.env.MAX_TEXT_LENGTH, 5000),
  rateLimitMax: readNumber(process.env.RATE_LIMIT_MAX, 60),
  rateLimitWindowMs: readNumber(process.env.RATE_LIMIT_WINDOW_MS, 60_000),
  providerTimeoutMs: readNumber(process.env.PROVIDER_TIMEOUT_MS, 8_000),
  isProduction: process.env.NODE_ENV === "production"
} as const;

export function hasSupportedProviderKey(): boolean {
  return Boolean(env.deeplApiKey || env.googleTranslateApiKey);
}
