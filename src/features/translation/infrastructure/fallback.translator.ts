import type { LanguageCode } from "@/core/domain/language";
import type { TranslationOutput, TranslatorProvider } from "../domain/ports";

export class FallbackTranslator implements TranslatorProvider {
  readonly name: string;

  constructor(private readonly providers: TranslatorProvider[]) {
    if (providers.length === 0) {
      throw new Error("FallbackTranslator requires at least one provider");
    }
    this.name = providers[0]!.name;
  }

  async translate(
    text: string,
    source: LanguageCode | "auto",
    target: LanguageCode
  ): Promise<TranslationOutput> {
    let lastError: unknown;
    for (const provider of this.providers) {
      try {
        const output = await provider.translate(text, source, target);
        if (output.text.trim()) {
          return output;
        }
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError instanceof Error ? lastError : new Error("All translation providers failed");
  }
}
