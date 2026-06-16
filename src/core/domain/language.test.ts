import { describe, expect, it } from "vitest";
import {
  fromBcp47,
  fromFrancCode,
  getLanguage,
  isLanguageCode,
  LANGUAGE_LIST,
  SUPPORTED_LANGUAGE_CODES
} from "./language";

describe("language registry", () => {
  it("exposes the five supported languages", () => {
    expect(SUPPORTED_LANGUAGE_CODES).toEqual(["pl", "en", "de", "it", "fr"]);
    expect(LANGUAGE_LIST).toHaveLength(5);
  });

  it("validates language codes", () => {
    expect(isLanguageCode("pl")).toBe(true);
    expect(isLanguageCode("es")).toBe(false);
  });

  it("maps franc codes back to language codes", () => {
    expect(fromFrancCode("deu")).toBe("de");
    expect(fromFrancCode("ita")).toBe("it");
    expect(fromFrancCode("spa")).toBeNull();
  });

  it("normalises BCP-47 tags from translation providers", () => {
    expect(fromBcp47("EN")).toBe("en");
    expect(fromBcp47("en-GB")).toBe("en");
    expect(fromBcp47("pt-BR")).toBeNull();
  });

  it("returns speech locales for each language", () => {
    expect(getLanguage("pl").speechLocale).toBe("pl-PL");
    expect(getLanguage("fr").speechLocale).toBe("fr-FR");
  });
});
