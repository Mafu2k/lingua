"use client";

import { Check, Copy, ImageUp, Loader2, RotateCcw, Volume2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { LanguageCode } from "@/core/domain/language";
import { getLanguage } from "@/core/domain/language";
import { useCopyToClipboard } from "@/shared/hooks/useCopyToClipboard";
import { useSpeak } from "@/shared/hooks/useSpeak";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/Button";
import { IconButton } from "@/shared/ui/IconButton";
import { LanguageSelect } from "@/shared/ui/LanguageSelect";
import { useTextTranslation } from "@/features/translation/ui/hooks/useTextTranslation";
import { useOcr } from "../hooks/useOcr";

export function OcrTranslator() {
  const ocr = useOcr();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [ocrLang, setOcrLang] = useState<LanguageCode>("en");
  const [target, setTarget] = useState<LanguageCode>("pl");
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { output, loading: translating, error: translationError } = useTextTranslation(
    ocr.status === "done" ? ocr.text : "",
    ocrLang,
    target
  );
  const { copied, copy } = useCopyToClipboard();
  const { supported: canSpeak, speak } = useSpeak();

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const handleFile = useCallback(
    (file: File, language: LanguageCode) => {
      if (!file.type.startsWith("image/")) return;
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(file);
      });
      fileRef.current = file;
      void ocr.recognize(file, language);
    },
    [ocr]
  );

  const onSelect = (file: File | undefined) => {
    if (file) handleFile(file, ocrLang);
  };

  const onChangeOcrLang = (language: LanguageCode) => {
    setOcrLang(language);
    if (fileRef.current) handleFile(fileRef.current, language);
  };

  const reset = () => {
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    fileRef.current = null;
    ocr.reset();
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <LanguageSelect
          value={ocrLang}
          onChange={(value) => onChangeOcrLang(value as LanguageCode)}
          label="Language in the image"
          className="flex-1"
        />
        <span className="text-muted" aria-hidden>
          →
        </span>
        <LanguageSelect
          value={target}
          onChange={(value) => setTarget(value as LanguageCode)}
          label="Translate into"
          className="flex-1"
        />
      </div>

      {!previewUrl ? (
        <Dropzone
          dragging={dragging}
          setDragging={setDragging}
          onFile={(file) => onSelect(file)}
          openPicker={() => inputRef.current?.click()}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="relative overflow-hidden rounded-3xl border border-border bg-surface shadow-soft">
            <img src={previewUrl} alt="Uploaded source" className="max-h-80 w-full object-contain" />
            <div className="absolute right-3 top-3">
              <Button variant="secondary" size="sm" onClick={reset} className="gap-2 shadow-soft">
                <RotateCcw className="h-4 w-4" />
                New image
              </Button>
            </div>
            {ocr.status === "recognizing" && (
              <div className="absolute inset-x-0 bottom-0 bg-surface/90 px-4 py-3 backdrop-blur">
                <div className="mb-1.5 flex items-center gap-2 text-sm text-text">
                  <Loader2 className="h-4 w-4 animate-spin text-accent" />
                  Reading text…
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-surface-raised">
                  <div
                    className="h-full rounded-full bg-accent transition-all"
                    style={{ width: `${Math.round(ocr.progress * 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex min-h-[15rem] flex-col gap-3">
            <div className="flex flex-1 flex-col rounded-3xl border border-border bg-surface shadow-soft">
              <textarea
                value={ocr.text}
                onChange={(event) => ocr.setText(event.target.value)}
                placeholder={ocr.status === "recognizing" ? "" : "Recognised text will appear here…"}
                aria-label="Recognised text"
                className="flex-1 resize-none bg-transparent p-4 text-base leading-relaxed text-text outline-none placeholder:text-muted"
              />
              <span className="border-t border-border px-4 py-2 text-xs font-medium text-muted">
                {getLanguage(ocrLang).flag} Detected text — edit if needed
              </span>
            </div>

            <div className="flex min-h-[6rem] flex-col rounded-3xl border border-border bg-accent-soft shadow-soft">
              <div className="relative flex-1 p-4" aria-live="polite">
                {translating && (
                  <Loader2 className="absolute right-4 top-4 h-4 w-4 animate-spin text-accent" />
                )}
                {translationError ? (
                  <p className="text-sm text-danger">{translationError}</p>
                ) : output ? (
                  <p className="whitespace-pre-wrap text-base leading-relaxed text-text">{output}</p>
                ) : (
                  <p className="text-sm text-muted">Translation</p>
                )}
              </div>
              <div className="flex items-center justify-between border-t border-border px-4 py-2">
                <span className="text-xs font-medium text-muted">
                  {getLanguage(target).flag} {getLanguage(target).nativeName}
                </span>
                <div className="flex items-center gap-1">
                  {canSpeak && output && (
                    <IconButton label="Listen to translation" onClick={() => speak(output, target)}>
                      <Volume2 className="h-5 w-5" />
                    </IconButton>
                  )}
                  <IconButton label="Copy translation" onClick={() => copy(output)} disabled={!output}>
                    {copied ? <Check className="h-5 w-5 text-success" /> : <Copy className="h-5 w-5" />}
                  </IconButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(event) => onSelect(event.target.files?.[0])}
      />
    </div>
  );
}

interface DropzoneProps {
  dragging: boolean;
  setDragging: (value: boolean) => void;
  onFile: (file: File | undefined) => void;
  openPicker: () => void;
}

function Dropzone({ dragging, setDragging, onFile, openPicker }: DropzoneProps) {
  return (
    <button
      type="button"
      onClick={openPicker}
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        onFile(event.dataTransfer.files?.[0]);
      }}
      className={cn(
        "flex min-h-[18rem] w-full flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed p-8 text-center transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        dragging ? "border-accent bg-accent-soft" : "border-border bg-surface hover:border-accent/50"
      )}
    >
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-raised text-accent">
        <ImageUp className="h-8 w-8" />
      </span>
      <span className="text-base font-medium text-text">Drop an image or tap to upload</span>
      <span className="max-w-sm text-sm text-muted">
        Documents, menus, street signs and notes. Lingua reads the text and translates it instantly.
      </span>
    </button>
  );
}
