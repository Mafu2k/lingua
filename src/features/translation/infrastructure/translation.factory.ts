import { env, hasSupportedProviderKey } from "@/core/config/env";
import { TranslateUseCase } from "../application/translate.usecase";
import type { TranslatorProvider } from "../domain/ports";
import { DeeplTranslator } from "./deepl.translator";
import { FallbackTranslator } from "./fallback.translator";
import { FrancLanguageDetector } from "./franc.language-detector";
import { GoogleCloudTranslator } from "./google-cloud.translator";
import { GoogleWebTranslator } from "./google.translator";
import { MyMemoryTranslator } from "./mymemory.translator";

function resolveProvider(): TranslatorProvider {
  const detector = new FrancLanguageDetector();
  const mymemory = new MyMemoryTranslator(detector, env.mymemoryContactEmail);
  const preferred = env.translationProvider;

  if (preferred === "deepl" || (!preferred && env.deeplApiKey)) {
    if (env.deeplApiKey) {
      return new FallbackTranslator([new DeeplTranslator(env.deeplApiKey), mymemory]);
    }
  }

  if (preferred === "google-cloud" || (!preferred && env.googleTranslateApiKey)) {
    if (env.googleTranslateApiKey) {
      return new FallbackTranslator([new GoogleCloudTranslator(env.googleTranslateApiKey), mymemory]);
    }
  }

  if (preferred === "mymemory") {
    return mymemory;
  }

  if (preferred === "google") {
    return new GoogleWebTranslator();
  }

  if (env.isProduction && !hasSupportedProviderKey()) {
    console.warn(
      "[lingua] No DEEPL_API_KEY or GOOGLE_TRANSLATE_API_KEY set. Falling back to the unofficial " +
        "Google endpoint, which is not supported for production use. Configure a key for production."
    );
  }

  return new FallbackTranslator([new GoogleWebTranslator(), mymemory]);
}

let cached: TranslateUseCase | null = null;

export function getTranslateUseCase(): TranslateUseCase {
  if (!cached) {
    cached = new TranslateUseCase(resolveProvider());
  }
  return cached;
}
