"use client";

import { ArrowLeftRight, Check, Copy, Loader2, Volume2, X } from "lucide-react";
import { useState } from "react";
import { getLanguage, type LanguageCode } from "@/core/domain/language";
import { useCopyToClipboard } from "@/shared/hooks/useCopyToClipboard";
import { useSpeak } from "@/shared/hooks/useSpeak";
import { cn } from "@/shared/lib/cn";
import { IconButton } from "@/shared/ui/IconButton";
import { LanguageSelect } from "@/shared/ui/LanguageSelect";
import { useTextTranslation } from "../hooks/useTextTranslation";

const MAX_LENGTH = 5000;

export function TextTranslator() {
  const [text, setText] = useState("");
  const [source, setSource] = useState<LanguageCode | "auto">("auto");
  const [target, setTarget] = useState<LanguageCode>("en");

  const { output, detectedSource, loading, error } = useTextTranslation(text, source, target);
  const { copied, copy } = useCopyToClipboard();
  const { supported: canSpeak, speak } = useSpeak();

  const resolvedSource = source === "auto" ? detectedSource : source;

  const swap = () => {
    const nextSource = resolvedSource ?? "en";
    setSource(target);
    setTarget(nextSource);
    setText(output || text);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <LanguageSelect
          value={source}
          onChange={setSource}
          includeAuto
          detected={detectedSource}
          label="Source language"
          className="flex-1"
        />
        <IconButton label="Swap languages" onClick={swap} disabled={!resolvedSource}>
          <ArrowLeftRight className="h-5 w-5" />
        </IconButton>
        <LanguageSelect
          value={target}
          onChange={(value) => setTarget(value as LanguageCode)}
          label="Target language"
          className="flex-1"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex min-h-[15rem] flex-col rounded-3xl border border-border bg-surface shadow-soft">
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value.slice(0, MAX_LENGTH))}
            placeholder="Type or paste text…"
            aria-label="Text to translate"
            className="flex-1 resize-none bg-transparent p-5 text-lg leading-relaxed text-text outline-none placeholder:text-muted"
          />
          <div className="flex items-center justify-between gap-2 border-t border-border px-4 py-2.5">
            <span className="text-xs tabular-nums text-muted">
              {text.length} / {MAX_LENGTH}
            </span>
            <div className="flex items-center gap-1">
              {canSpeak && resolvedSource && text.trim() && (
                <IconButton label="Listen to source text" onClick={() => speak(text, resolvedSource)}>
                  <Volume2 className="h-5 w-5" />
                </IconButton>
              )}
              {text && (
                <IconButton label="Clear text" onClick={() => setText("")}>
                  <X className="h-5 w-5" />
                </IconButton>
              )}
            </div>
          </div>
        </div>

        <div
          className={cn(
            "flex min-h-[15rem] flex-col rounded-3xl border border-border shadow-soft transition-colors",
            output ? "bg-accent-soft" : "bg-surface"
          )}
        >
          <div className="relative flex-1 p-5" aria-live="polite">
            {loading && (
              <Loader2 className="absolute right-5 top-5 h-5 w-5 animate-spin text-accent" aria-label="Translating" />
            )}
            {error ? (
              <p className="text-base text-danger">{error}</p>
            ) : output ? (
              <p className="whitespace-pre-wrap text-lg leading-relaxed text-text">{output}</p>
            ) : (
              <p className="text-lg text-muted">Translation</p>
            )}
          </div>
          <div className="flex items-center justify-between gap-2 border-t border-border px-4 py-2.5">
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
  );
}
