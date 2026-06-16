import { describe, expect, it, vi } from "vitest";
import type { TranslatorProvider } from "../domain/ports";
import { FallbackTranslator } from "./fallback.translator";

function provider(name: string, translate: TranslatorProvider["translate"]): TranslatorProvider {
  return { name, translate };
}

describe("FallbackTranslator", () => {
  it("returns the first successful provider result", async () => {
    const primary = vi.fn().mockResolvedValue({ text: "ok", detectedSource: "en" });
    const secondary = vi.fn();
    const fallback = new FallbackTranslator([provider("a", primary), provider("b", secondary)]);

    const result = await fallback.translate("hi", "en", "de");

    expect(result.text).toBe("ok");
    expect(secondary).not.toHaveBeenCalled();
  });

  it("moves to the next provider when one throws", async () => {
    const primary = vi.fn().mockRejectedValue(new Error("down"));
    const secondary = vi.fn().mockResolvedValue({ text: "recovered", detectedSource: "en" });
    const fallback = new FallbackTranslator([provider("a", primary), provider("b", secondary)]);

    const result = await fallback.translate("hi", "en", "de");

    expect(result.text).toBe("recovered");
    expect(secondary).toHaveBeenCalledOnce();
  });

  it("throws when every provider fails", async () => {
    const fallback = new FallbackTranslator([
      provider("a", vi.fn().mockRejectedValue(new Error("first"))),
      provider("b", vi.fn().mockRejectedValue(new Error("second")))
    ]);

    await expect(fallback.translate("hi", "en", "de")).rejects.toThrow("second");
  });

  it("exposes the primary provider name", () => {
    const fallback = new FallbackTranslator([
      provider("deepl", vi.fn()),
      provider("mymemory", vi.fn())
    ]);
    expect(fallback.name).toBe("deepl");
  });
});
