import { franc } from "franc-min";
import { fromFrancCode, LANGUAGE_LIST, type LanguageCode } from "@/core/domain/language";
import type { LanguageDetector } from "../domain/ports";

const ALLOWED_FRANC_CODES = LANGUAGE_LIST.map((language) => language.francCode);

export class FrancLanguageDetector implements LanguageDetector {
  detect(text: string): LanguageCode | null {
    const trimmed = text.trim();
    if (trimmed.length < 3) {
      return null;
    }

    const francCode = franc(trimmed, {
      only: ALLOWED_FRANC_CODES,
      minLength: 3
    });

    if (francCode === "und") {
      return null;
    }

    return fromFrancCode(francCode);
  }
}
