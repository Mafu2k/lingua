import type { SpeechSynthesizerPort } from "../domain/ports";

export class WebSpeechSynthesizer implements SpeechSynthesizerPort {
  get supported(): boolean {
    return typeof window !== "undefined" && "speechSynthesis" in window;
  }

  speak(text: string, locale: string): Promise<void> {
    return new Promise((resolve) => {
      if (!this.supported || !text.trim()) {
        resolve();
        return;
      }

      const synth = window.speechSynthesis;
      synth.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = locale;
      utterance.rate = 1;
      utterance.pitch = 1;

      const voice = this.pickVoice(locale);
      if (voice) {
        utterance.voice = voice;
      }

      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();

      synth.speak(utterance);
    });
  }

  cancel(): void {
    if (this.supported) {
      window.speechSynthesis.cancel();
    }
  }

  private pickVoice(locale: string): SpeechSynthesisVoice | null {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) return null;

    const language = locale.toLowerCase();
    const prefix = language.split("-")[0]!;

    return (
      voices.find((voice) => voice.lang.toLowerCase() === language) ??
      voices.find((voice) => voice.lang.toLowerCase().startsWith(prefix)) ??
      null
    );
  }
}
