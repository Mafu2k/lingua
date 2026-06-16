"use client";

import { useEffect, useState } from "react";
import type { LanguageCode } from "@/core/domain/language";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";
import { requestTranslation } from "@/shared/lib/translation-client";

interface TranslationState {
  output: string;
  detectedSource: LanguageCode | null;
  loading: boolean;
  error: string | null;
}

const IDLE: TranslationState = { output: "", detectedSource: null, loading: false, error: null };

export function useTextTranslation(
  text: string,
  source: LanguageCode | "auto",
  target: LanguageCode
): TranslationState {
  const debounced = useDebouncedValue(text.trim(), 450);
  const [state, setState] = useState<TranslationState>(IDLE);

  useEffect(() => {
    if (!debounced) {
      setState(IDLE);
      return;
    }

    const controller = new AbortController();
    setState((previous) => ({ ...previous, loading: true, error: null }));

    requestTranslation({ text: debounced, source, target, signal: controller.signal })
      .then((result) =>
        setState({ output: result.text, detectedSource: result.detectedSource, loading: false, error: null })
      )
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setState({
          output: "",
          detectedSource: null,
          loading: false,
          error: error instanceof Error ? error.message : "Translation failed."
        });
      });

    return () => controller.abort();
  }, [debounced, source, target]);

  return state;
}
