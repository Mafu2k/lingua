import { env } from "@/core/config/env";
import { fromBcp47, getLanguage, type LanguageCode } from "@/core/domain/language";
import type { TranslationOutput, TranslatorProvider } from "../domain/ports";

interface DeeplResponse {
  translations?: Array<{ text: string; detected_source_language?: string }>;
  message?: string;
}

export class DeeplTranslator implements TranslatorProvider {
  readonly name = "deepl";
  private readonly endpoint: string;

  constructor(private readonly apiKey: string) {
    this.endpoint = apiKey.endsWith(":fx")
      ? "https://api-free.deepl.com/v2/translate"
      : "https://api.deepl.com/v2/translate";
  }

  async translate(
    text: string,
    source: LanguageCode | "auto",
    target: LanguageCode
  ): Promise<TranslationOutput> {
    const response = await fetch(this.endpoint, {
      method: "POST",
      headers: {
        Authorization: `DeepL-Auth-Key ${this.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text: [text],
        ...(source === "auto" ? {} : { source_lang: getLanguage(source).deeplCode }),
        target_lang: getLanguage(target).deeplCode
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(env.providerTimeoutMs)
    });

    const payload = (await response.json()) as DeeplResponse;
    const translation = payload.translations?.[0];

    if (!response.ok || !translation) {
      throw new Error(payload.message || `DeepL responded with ${response.status}`);
    }

    const detected =
      source === "auto"
        ? fromBcp47(translation.detected_source_language ?? "") ?? "en"
        : source;

    return { text: translation.text, detectedSource: detected };
  }
}
