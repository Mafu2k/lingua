import { isLanguageCode } from "@/core/domain/language";
import {
  TranslationError,
  type TranslationRequest,
  type TranslationResult
} from "@/core/domain/translation";
import type { TranslatorProvider } from "../domain/ports";

export class TranslateUseCase {
  constructor(private readonly provider: TranslatorProvider) {}

  async execute(request: TranslationRequest): Promise<TranslationResult> {
    const text = request.text.trim();
    if (text.length === 0) {
      throw new TranslationError("Nothing to translate.", "EMPTY_INPUT");
    }

    if (!isLanguageCode(request.target)) {
      throw new TranslationError(`Unsupported target language: ${request.target}`, "UNSUPPORTED");
    }

    if (request.source !== "auto" && request.source === request.target) {
      return {
        text: request.text,
        detectedSource: request.target,
        target: request.target,
        provider: this.provider.name
      };
    }

    try {
      const output = await this.provider.translate(text, request.source, request.target);
      return {
        text: output.detectedSource === request.target ? request.text : output.text,
        detectedSource: output.detectedSource,
        target: request.target,
        provider: this.provider.name
      };
    } catch (cause) {
      throw new TranslationError(
        cause instanceof Error ? cause.message : "Translation provider failed.",
        "PROVIDER_ERROR"
      );
    }
  }
}
