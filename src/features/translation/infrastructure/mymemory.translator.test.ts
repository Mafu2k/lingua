import { afterEach, describe, expect, it, vi } from "vitest";
import type { LanguageCode } from "@/core/domain/language";
import type { LanguageDetector } from "../domain/ports";
import { MyMemoryTranslator } from "./mymemory.translator";

const detector = (language: LanguageCode | null): LanguageDetector => ({ detect: () => language });

function mockFetch(payload: unknown, ok = true) {
  return vi.fn().mockResolvedValue({
    ok,
    status: ok ? 200 : 500,
    json: () => Promise.resolve(payload)
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("MyMemoryTranslator", () => {
  it("decodes HTML entities in the translation", async () => {
    vi.stubGlobal(
      "fetch",
      mockFetch({ responseStatus: 200, responseData: { translatedText: "L&#39;eau &amp; le feu" } })
    );

    const result = await new MyMemoryTranslator(detector("fr")).translate("water and fire", "en", "fr");

    expect(result.text).toBe("L'eau & le feu");
    expect(result.detectedSource).toBe("en");
  });

  it("resolves an auto source through the injected detector", async () => {
    const fetchMock = mockFetch({ responseStatus: 200, responseData: { translatedText: "Hello" } });
    vi.stubGlobal("fetch", fetchMock);

    const result = await new MyMemoryTranslator(detector("de")).translate("Hallo", "auto", "en");

    expect(result.detectedSource).toBe("de");
    const requestedUrl = String(fetchMock.mock.calls[0]![0]);
    expect(requestedUrl).toContain("langpair=de%7Cen");
  });

  it("throws when MyMemory reports a non-200 status", async () => {
    vi.stubGlobal("fetch", mockFetch({ responseStatus: 403, responseDetails: "quota exceeded" }));

    await expect(
      new MyMemoryTranslator(detector("en")).translate("x", "en", "de")
    ).rejects.toThrow(/quota exceeded/);
  });
});
