"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getLanguage, type LanguageCode } from "@/core/domain/language";
import { requestTranslation } from "@/shared/lib/translation-client";
import { WebSpeechRecognizer } from "../../infrastructure/web-speech.recognizer";
import { WebSpeechSynthesizer } from "../../infrastructure/web-speech.synthesizer";

export type Speaker = "A" | "B";

export interface ConversationTurn {
  id: string;
  speaker: Speaker;
  original: string;
  translated: string;
  from: LanguageCode;
  to: LanguageCode;
  pending: boolean;
}

interface UseConversationOptions {
  initialLangA?: LanguageCode;
  initialLangB?: LanguageCode;
}

export function useConversation({
  initialLangA = "pl",
  initialLangB = "en"
}: UseConversationOptions = {}) {
  const recognizer = useMemo(() => new WebSpeechRecognizer(), []);
  const synthesizer = useMemo(() => new WebSpeechSynthesizer(), []);

  const [supported, setSupported] = useState(true);
  const [langA, setLangA] = useState<LanguageCode>(initialLangA);
  const [langB, setLangB] = useState<LanguageCode>(initialLangB);
  const [active, setActive] = useState<Speaker | null>(null);
  const [interim, setInterim] = useState("");
  const [turns, setTurns] = useState<ConversationTurn[]>([]);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const langRef = useRef({ A: langA, B: langB });
  langRef.current = { A: langA, B: langB };
  const autoSpeakRef = useRef(autoSpeak);
  autoSpeakRef.current = autoSpeak;

  useEffect(() => {
    setSupported(recognizer.supported);
  }, [recognizer]);

  useEffect(() => {
    return () => {
      recognizer.stop();
      synthesizer.cancel();
    };
  }, [recognizer, synthesizer]);

  const handleFinal = useCallback(
    async (speaker: Speaker, transcript: string) => {
      if (!transcript) return;
      const from = langRef.current[speaker];
      const to = speaker === "A" ? langRef.current.B : langRef.current.A;
      const id = crypto.randomUUID();

      setInterim("");
      setTurns((prev) => [...prev, { id, speaker, original: transcript, translated: "", from, to, pending: true }]);

      try {
        const result = await requestTranslation({ text: transcript, source: from, target: to });
        setTurns((prev) =>
          prev.map((turn) => (turn.id === id ? { ...turn, translated: result.text, pending: false } : turn))
        );
        if (autoSpeakRef.current) {
          void synthesizer.speak(result.text, getLanguage(to).speechLocale);
        }
      } catch (cause) {
        setTurns((prev) =>
          prev.map((turn) =>
            turn.id === id
              ? { ...turn, translated: "—", pending: false }
              : turn
          )
        );
        setError(cause instanceof Error ? cause.message : "Translation failed.");
      }
    },
    [synthesizer]
  );

  const stop = useCallback(() => {
    recognizer.stop();
    setActive(null);
    setInterim("");
  }, [recognizer]);

  const listen = useCallback(
    (speaker: Speaker) => {
      setError(null);
      synthesizer.cancel();
      setInterim("");
      setActive(speaker);
      recognizer.start(getLanguage(langRef.current[speaker]).speechLocale, {
        onInterim: (text) => setInterim(text),
        onFinal: (text) => void handleFinal(speaker, text),
        onError: (code) => {
          setError(describeError(code));
          setActive(null);
          setInterim("");
        },
        onEnd: () => {
          setActive(null);
          setInterim("");
        }
      });
    },
    [recognizer, synthesizer, handleFinal]
  );

  const toggle = useCallback(
    (speaker: Speaker) => {
      if (active === speaker) {
        stop();
      } else {
        listen(speaker);
      }
    },
    [active, listen, stop]
  );

  const clear = useCallback(() => {
    setTurns([]);
    setInterim("");
    setError(null);
  }, []);

  const replay = useCallback(
    (turn: ConversationTurn) => {
      if (turn.translated && turn.translated !== "—") {
        void synthesizer.speak(turn.translated, getLanguage(turn.to).speechLocale);
      }
    },
    [synthesizer]
  );

  const swapLanguages = useCallback(() => {
    setLangA(langRef.current.B);
    setLangB(langRef.current.A);
  }, []);

  return {
    supported,
    langA,
    langB,
    setLangA,
    setLangB,
    swapLanguages,
    active,
    interim,
    turns,
    autoSpeak,
    setAutoSpeak,
    error,
    toggle,
    clear,
    replay
  };
}

function describeError(code: string): string {
  switch (code) {
    case "not-allowed":
    case "service-not-allowed":
      return "Microphone access was blocked. Allow it in your browser settings, then try again.";
    case "not-supported":
      return "Speech recognition is not supported in this browser. Use Google Chrome or Microsoft Edge.";
    case "audio-capture":
      return "No microphone was found. Connect one and check your system input settings.";
    case "network":
      return "Speech service unreachable. It needs an internet connection and works in Google Chrome or Microsoft Edge — some Chromium browsers (Brave, Vivaldi) disable it. On a phone it also requires HTTPS.";
    case "language-not-supported":
      return "This language is not available for speech recognition in your browser.";
    default:
      return "Speech recognition error. Please try again.";
  }
}
