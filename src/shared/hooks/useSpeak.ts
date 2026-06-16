"use client";

import { useCallback, useEffect, useState } from "react";
import { getLanguage, type LanguageCode } from "@/core/domain/language";

export function useSpeak(): {
  supported: boolean;
  speak: (text: string, language: LanguageCode) => void;
} {
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "speechSynthesis" in window);
  }, []);

  const speak = useCallback(
    (text: string, language: LanguageCode) => {
      if (!supported || !text.trim()) return;
      const synth = window.speechSynthesis;
      synth.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = getLanguage(language).speechLocale;
      const prefix = getLanguage(language).speechLocale.split("-")[0]!;
      const voice = synth
        .getVoices()
        .find((candidate) => candidate.lang.toLowerCase().startsWith(prefix));
      if (voice) utterance.voice = voice;
      synth.speak(utterance);
    },
    [supported]
  );

  return { supported, speak };
}
