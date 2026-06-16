import { afterEach, describe, expect, it, vi } from "vitest";
import { GoogleWebTranslator } from "./google.translator";

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

describe("GoogleWebTranslator", () => {
  it("joins multi-segment translations and reports the detected source", async () => {
    vi.stubGlobal(
      "fetch",
      mockFetch([
        [
          ["Hallo, ", "Hello, ", null, null, 3],
          ["wie geht es dir?", "how are you?", null, null, 3]
        ],
        null,
        "en"
      ])
    );

    const result = await new GoogleWebTranslator().translate("Hello, how are you?", "auto", "de");

    expect(result.text).toBe("Hallo, wie geht es dir?");
    expect(result.detectedSource).toBe("en");
  });

  it("keeps the explicit source language when one is given", async () => {
    vi.stubGlobal("fetch", mockFetch([[["Bonjour", "Hello", null, null, 3]], null, "en"]));

    const result = await new GoogleWebTranslator().translate("Hello", "en", "fr");

    expect(result.detectedSource).toBe("en");
    expect(result.text).toBe("Bonjour");
  });

  it("throws on an unexpected payload", async () => {
    vi.stubGlobal("fetch", mockFetch([null]));
    await expect(new GoogleWebTranslator().translate("x", "en", "de")).rejects.toThrow();
  });

  it("throws when the endpoint fails", async () => {
    vi.stubGlobal("fetch", mockFetch(null, false));
    await expect(new GoogleWebTranslator().translate("x", "en", "de")).rejects.toThrow(/500/);
  });
});
