"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { LanguageCode } from "@/core/domain/language";
import { TesseractOcrRecognizer } from "../../infrastructure/tesseract.ocr";

type Status = "idle" | "recognizing" | "done" | "error";

interface OcrState {
  status: Status;
  progress: number;
  text: string;
  error: string | null;
}

const INITIAL: OcrState = { status: "idle", progress: 0, text: "", error: null };

export function useOcr() {
  const recognizer = useMemo(() => new TesseractOcrRecognizer(), []);
  const [state, setState] = useState<OcrState>(INITIAL);
  const runId = useRef(0);

  const recognize = useCallback(
    async (image: Blob, language: LanguageCode) => {
      const current = ++runId.current;
      setState({ status: "recognizing", progress: 0, text: "", error: null });
      try {
        const text = await recognizer.recognize(image, language, ({ status, progress }) => {
          if (current === runId.current && status === "recognizing text") {
            setState((prev) => ({ ...prev, progress }));
          }
        });
        if (current !== runId.current) return;
        setState({ status: "done", progress: 1, text, error: null });
      } catch (error) {
        if (current !== runId.current) return;
        setState({
          status: "error",
          progress: 0,
          text: "",
          error: error instanceof Error ? error.message : "Could not read the image."
        });
      }
    },
    [recognizer]
  );

  const setText = useCallback((text: string) => {
    setState((prev) => ({ ...prev, text }));
  }, []);

  const reset = useCallback(() => {
    runId.current += 1;
    setState(INITIAL);
  }, []);

  return { ...state, recognize, setText, reset };
}
