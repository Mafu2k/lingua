import type { LanguageCode } from "@/core/domain/language";

export interface TranslationOutput {
  text: string;
  detectedSource: LanguageCode;
}

export interface TranslatorProvider {
  readonly name: string;
  translate(
    text: string,
    source: LanguageCode | "auto",
    target: LanguageCode
  ): Promise<TranslationOutput>;
}

export interface LanguageDetector {
  detect(text: string): LanguageCode | null;
}
