import { describe, expect, it, vi } from "vitest";
import { TranslationError } from "@/core/domain/translation";
import type { TranslationOutput, TranslatorProvider } from "../domain/ports";
import { TranslateUseCase } from "./translate.usecase";

function buildProvider(translate: TranslatorProvider["translate"]): TranslatorProvider {
  return { name: "fake", translate };
}

function output(text: string, detectedSource: TranslationOutput["detectedSource"]): TranslationOutput {
  return { text, detectedSource };
}

describe("TranslateUseCase", () => {
  it("rejects empty input", async () => {
    const useCase = new TranslateUseCase(buildProvider(vi.fn()));
    await expect(useCase.execute({ text: "   ", source: "auto", target: "pl" })).rejects.toThrow(
      TranslationError
    );
  });

  it("skips the provider when an explicit source equals the target", async () => {
    const translate = vi.fn();
    const useCase = new TranslateUseCase(buildProvider(translate));

    const result = await useCase.execute({ text: "Dzień dobry", source: "pl", target: "pl" });

    expect(translate).not.toHaveBeenCalled();
    expect(result.detectedSource).toBe("pl");
    expect(result.text).toBe("Dzień dobry");
  });

  it("delegates auto-detection to the provider", async () => {
    const translate = vi.fn().mockResolvedValue(output("Good morning", "de"));
    const useCase = new TranslateUseCase(buildProvider(translate));

    const result = await useCase.execute({ text: "Guten Morgen", source: "auto", target: "en" });

    expect(translate).toHaveBeenCalledWith("Guten Morgen", "auto", "en");
    expect(result.detectedSource).toBe("de");
    expect(result.text).toBe("Good morning");
  });

  it("returns the original text when the detected source matches the target", async () => {
    const translate = vi.fn().mockResolvedValue(output("anything", "pl"));
    const useCase = new TranslateUseCase(buildProvider(translate));

    const result = await useCase.execute({ text: "Dzień dobry", source: "auto", target: "pl" });

    expect(result.text).toBe("Dzień dobry");
    expect(result.detectedSource).toBe("pl");
  });

  it("wraps provider failures in a TranslationError", async () => {
    const useCase = new TranslateUseCase(
      buildProvider(vi.fn().mockRejectedValue(new Error("boom")))
    );

    await expect(
      useCase.execute({ text: "Hello", source: "en", target: "de" })
    ).rejects.toMatchObject({ code: "PROVIDER_ERROR" });
  });
});
