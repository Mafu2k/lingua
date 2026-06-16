import type { LanguageCode } from "@/core/domain/language";
import type { TranslationResult } from "@/core/domain/translation";

export interface TranslateInput {
  text: string;
  source: LanguageCode | "auto";
  target: LanguageCode;
  signal?: AbortSignal;
}

export async function requestTranslation(input: TranslateInput): Promise<TranslationResult> {
  const response = await fetch("/api/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: input.text, source: input.source, target: input.target }),
    signal: input.signal
  });

  const payload = (await response.json()) as TranslationResult & { error?: string };

  if (!response.ok) {
    throw new Error(payload.error ?? "Translation failed.");
  }

  return payload;
}
