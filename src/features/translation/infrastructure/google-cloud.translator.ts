import { env } from "@/core/config/env";
import { fromBcp47, getLanguage, type LanguageCode } from "@/core/domain/language";
import type { TranslationOutput, TranslatorProvider } from "../domain/ports";

const ENDPOINT = "https://translation.googleapis.com/language/translate/v2";

interface GoogleCloudResponse {
  data?: {
    translations?: Array<{ translatedText: string; detectedSourceLanguage?: string }>;
  };
  error?: { message?: string };
}

export class GoogleCloudTranslator implements TranslatorProvider {
  readonly name = "google-cloud";

  constructor(private readonly apiKey: string) {}

  async translate(
    text: string,
    source: LanguageCode | "auto",
    target: LanguageCode
  ): Promise<TranslationOutput> {
    const response = await fetch(`${ENDPOINT}?key=${encodeURIComponent(this.apiKey)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        q: [text],
        target: getLanguage(target).code,
        format: "text",
        ...(source === "auto" ? {} : { source: getLanguage(source).code })
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(env.providerTimeoutMs)
    });

    const payload = (await response.json()) as GoogleCloudResponse;
    const translation = payload.data?.translations?.[0];

    if (!response.ok || !translation) {
      throw new Error(payload.error?.message || `Google Cloud responded with ${response.status}`);
    }

    const detected =
      source === "auto"
        ? fromBcp47(translation.detectedSourceLanguage ?? "") ?? "en"
        : source;

    return { text: translation.translatedText, detectedSource: detected };
  }
}
