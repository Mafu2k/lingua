export interface RecognitionCallbacks {
  onInterim: (transcript: string) => void;
  onFinal: (transcript: string) => void;
  onError: (error: string) => void;
  onEnd: () => void;
}

export interface SpeechRecognizerPort {
  readonly supported: boolean;
  start(locale: string, callbacks: RecognitionCallbacks): void;
  stop(): void;
}

export interface SpeechSynthesizerPort {
  readonly supported: boolean;
  speak(text: string, locale: string): Promise<void>;
  cancel(): void;
}
