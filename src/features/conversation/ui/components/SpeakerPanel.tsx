import { Volume2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { getLanguage, type LanguageCode } from "@/core/domain/language";
import { cn } from "@/shared/lib/cn";
import { LanguageSelect } from "@/shared/ui/LanguageSelect";
import { MicButton } from "@/shared/ui/MicButton";
import type { ConversationTurn, Speaker } from "../hooks/useConversation";

interface SpeakerPanelProps {
  side: Speaker;
  language: LanguageCode;
  onLanguageChange: (code: LanguageCode) => void;
  active: boolean;
  micDisabled: boolean;
  interim: string;
  turns: ConversationTurn[];
  onToggleMic: () => void;
  onReplay: (turn: ConversationTurn) => void;
}

export function SpeakerPanel({
  side,
  language,
  onLanguageChange,
  active,
  micDisabled,
  interim,
  turns,
  onToggleMic,
  onReplay
}: SpeakerPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const nativeName = getLanguage(language).nativeName;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [turns, interim]);

  return (
    <section
      className={cn(
        "flex min-h-0 flex-1 flex-col rounded-3xl border bg-surface transition-colors",
        active ? "border-accent shadow-glow" : "border-border shadow-soft"
      )}
      aria-label={`Speaker ${side}, ${nativeName}`}
    >
      <header className="flex items-center justify-between gap-3 border-b border-border p-4">
        <LanguageSelect
          value={language}
          onChange={(value) => onLanguageChange(value as LanguageCode)}
          label={`Language for speaker ${side}`}
          className="w-44"
        />
        <span
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium",
            active ? "bg-danger/15 text-danger" : "bg-surface-raised text-muted"
          )}
          aria-live="polite"
        >
          {active ? "Listening…" : `Speaker ${side}`}
        </span>
      </header>

      <div
        ref={scrollRef}
        className="flex min-h-[180px] flex-1 flex-col gap-3 overflow-y-auto p-4"
        aria-live="polite"
      >
        {turns.length === 0 && !interim && (
          <p className="m-auto max-w-[24ch] text-center text-sm text-muted">
            Tap the microphone and start speaking in {nativeName}.
          </p>
        )}

        {turns.map((turn) => {
          const isOwn = turn.speaker === side;
          const text = isOwn ? turn.original : turn.translated;
          return (
            <Bubble
              key={turn.id}
              isOwn={isOwn}
              pending={!isOwn && turn.pending}
              text={text}
              onReplay={!isOwn && !turn.pending ? () => onReplay(turn) : undefined}
            />
          );
        })}

        {active && interim && (
          <Bubble isOwn pending={false} text={interim} muted />
        )}
      </div>

      <footer className="flex flex-col items-center gap-2 border-t border-border p-4">
        <MicButton
          active={active}
          disabled={micDisabled}
          onClick={onToggleMic}
          label={active ? `Stop listening to speaker ${side}` : `Start listening to speaker ${side}`}
        />
        <span className="text-xs text-muted">{active ? "Tap to stop" : "Tap to speak"}</span>
      </footer>
    </section>
  );
}

interface BubbleProps {
  isOwn: boolean;
  pending: boolean;
  text: string;
  muted?: boolean;
  onReplay?: () => void;
}

function Bubble({ isOwn, pending, text, muted = false, onReplay }: BubbleProps) {
  return (
    <div className={cn("flex", isOwn ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "group relative max-w-[85%] rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed",
          isOwn
            ? cn("bg-accent text-accent-contrast", muted && "opacity-60")
            : "bg-surface-raised text-text"
        )}
      >
        {pending ? <PendingDots /> : text}
        {onReplay && (
          <button
            type="button"
            onClick={onReplay}
            aria-label="Replay translation"
            className="ml-2 inline-flex translate-y-0.5 text-muted opacity-0 transition-opacity hover:text-accent focus-visible:opacity-100 group-hover:opacity-100"
          >
            <Volume2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

function PendingDots() {
  return (
    <span className="inline-flex items-center gap-1 py-1" aria-label="Translating">
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.3s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.15s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current" />
    </span>
  );
}
