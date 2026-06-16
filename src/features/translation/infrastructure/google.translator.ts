import { env } from "@/core/config/env";
import { fromBcp47, type LanguageCode } from "@/core/domain/language";
import type { TranslationOutput, TranslatorProvider } from "../domain/ports";

const ENDPOINT = "https://translate.googleapis.com/translate_a/single";

type GoogleSegment = [string, string, ...unknown[]];
type GooglePayload = [GoogleSegment[] | null, unknown, string | undefined, ...unknown[]];

export class GoogleWebTranslator implements TranslatorProvider {
  readonly name = "google";

  async translate(
    text: string,
    source: LanguageCode | "auto",
    target: LanguageCode
  ): Promise<TranslationOutput> {
    const params = new URLSearchParams({
      client: "gtx",
      sl: source,
      tl: target,
      dt: "t",
      q: text
    });

    const response = await fetch(`${ENDPOINT}?${params.toString()}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(env.providerTimeoutMs)
    });

    if (!response.ok) {
      throw new Error(`Google endpoint responded with ${response.status}`);
    }

    const payload = (await response.json()) as GooglePayload;
    const segments = payload[0];

    if (!Array.isArray(segments)) {
      throw new Error("Google endpoint returned an unexpected payload");
    }

    const translated = segments
      .map((segment) => (Array.isArray(segment) ? segment[0] : ""))
      .join("")
      .trim();

    if (!translated) {
      throw new Error("Google endpoint returned an empty translation");
    }

    const detected = (source === "auto" ? fromBcp47(payload[2] ?? "") : source) ?? "en";
    return { text: translated, detectedSource: detected };
  }
}
