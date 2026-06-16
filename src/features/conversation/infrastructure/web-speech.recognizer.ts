import type { RecognitionCallbacks, SpeechRecognizerPort } from "../domain/ports";

const BENIGN_ERRORS = new Set(["no-speech", "aborted"]);

export class WebSpeechRecognizer implements SpeechRecognizerPort {
  private recognition: SpeechRecognition | null = null;
  private listening = false;
  private fatalError = false;

  get supported(): boolean {
    if (typeof window === "undefined") return false;
    return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  start(locale: string, callbacks: RecognitionCallbacks): void {
    if (typeof window === "undefined") return;
    const Constructor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Constructor) {
      callbacks.onError("not-supported");
      return;
    }

    this.stop();
    this.listening = true;
    this.fatalError = false;

    const recognition = new Constructor();
    recognition.lang = locale;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i]!;
        const transcript = result[0]?.transcript ?? "";
        if (result.isFinal) {
          callbacks.onFinal(transcript.trim());
        } else {
          interim += transcript;
        }
      }
      if (interim) {
        callbacks.onInterim(interim.trim());
      }
    };

    recognition.onerror = (event) => {
      if (BENIGN_ERRORS.has(event.error)) {
        return;
      }
      this.fatalError = true;
      callbacks.onError(event.error);
    };

    recognition.onend = () => {
      if (this.listening && !this.fatalError && this.recognition === recognition) {
        try {
          recognition.start();
          return;
        } catch {
          /* fall through to a clean stop */
        }
      }
      this.listening = false;
      callbacks.onEnd();
    };

    this.recognition = recognition;
    try {
      recognition.start();
    } catch {
      /* recognition was already running */
    }
  }

  stop(): void {
    this.listening = false;
    if (this.recognition) {
      const recognition = this.recognition;
      this.recognition = null;
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      try {
        recognition.stop();
      } catch {
        /* already stopped */
      }
    }
  }
}
