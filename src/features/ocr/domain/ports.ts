import type { LanguageCode } from "@/core/domain/language";

export interface OcrProgress {
  status: string;
  progress: number;
}

export interface OcrRecognizerPort {
  recognize(
    image: Blob,
    language: LanguageCode,
    onProgress?: (progress: OcrProgress) => void
  ): Promise<string>;
}
