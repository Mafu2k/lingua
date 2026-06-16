import type { LanguageCode } from "./language";

export interface TranslationRequest {
  readonly text: string;
  readonly source: LanguageCode | "auto";
  readonly target: LanguageCode;
}

export interface TranslationResult {
  readonly text: string;
  readonly detectedSource: LanguageCode;
  readonly target: LanguageCode;
  readonly provider: string;
}

export class TranslationError extends Error {
  constructor(
    message: string,
    readonly code: "EMPTY_INPUT" | "PROVIDER_ERROR" | "UNSUPPORTED"
  ) {
    super(message);
    this.name = "TranslationError";
  }
}
