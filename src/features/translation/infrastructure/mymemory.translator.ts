import { env } from "@/core/config/env";
import { type LanguageCode } from "@/core/domain/language";
import type { LanguageDetector, TranslationOutput, TranslatorProvider } from "../domain/ports";

interface MyMemoryResponse {
  responseStatus: number;
  responseData?: { translatedText?: string };
  responseDetails?: string;
}

const ENDPOINT = "https://api.mymemory.translated.net/get";

export class MyMemoryTranslator implements TranslatorProvider {
  readonly name = "mymemory";

  constructor(
    private readonly detector: LanguageDetector,
    private readonly contactEmail?: string
  ) {}

  async translate(
    text: string,
    source: LanguageCode | "auto",
    target: LanguageCode
  ): Promise<TranslationOutput> {
    const resolvedSource: LanguageCode = source === "auto" ? this.detector.detect(text) ?? "en" : source;

    const params = new URLSearchParams({
      q: text,
      langpair: `${resolvedSource}|${target}`
    });
    if (this.contactEmail) {
      params.set("de", this.contactEmail);
    }

    const response = await fetch(`${ENDPOINT}?${params.toString()}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(env.providerTimeoutMs)
    });

    if (!response.ok) {
      throw new Error(`MyMemory responded with ${response.status}`);
    }

    const payload = (await response.json()) as MyMemoryResponse;
    const translated = payload.responseData?.translatedText;

    if (payload.responseStatus !== 200 || !translated) {
      throw new Error(payload.responseDetails || "MyMemory returned no translation");
    }

    return { text: decodeEntities(translated), detectedSource: resolvedSource };
  }
}

function decodeEntities(value: string): string {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}
