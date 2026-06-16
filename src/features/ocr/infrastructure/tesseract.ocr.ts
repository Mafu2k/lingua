import { getLanguage, type LanguageCode } from "@/core/domain/language";
import type { OcrProgress, OcrRecognizerPort } from "../domain/ports";

export class TesseractOcrRecognizer implements OcrRecognizerPort {
  async recognize(
    image: Blob,
    language: LanguageCode,
    onProgress?: (progress: OcrProgress) => void
  ): Promise<string> {
    const { recognize } = await import("tesseract.js");
    const result = await recognize(image, getLanguage(language).tesseractCode, {
      logger: onProgress
        ? (message: { status: string; progress: number }) =>
            onProgress({ status: message.status, progress: message.progress })
        : undefined
    });
    return result.data.text.trim();
  }
}
