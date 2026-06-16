"use client";

import { ArrowLeftRight, MonitorSmartphone, Trash2, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/shared/ui/Button";
import { IconButton } from "@/shared/ui/IconButton";
import { useConversation } from "../hooks/useConversation";
import { SpeakerPanel } from "./SpeakerPanel";

export function ConversationMode() {
  const conversation = useConversation();

  if (!conversation.supported) {
    return <UnsupportedNotice />;
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={conversation.swapLanguages}
            className="gap-2"
          >
            <ArrowLeftRight className="h-4 w-4" />
            Swap
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => conversation.setAutoSpeak(!conversation.autoSpeak)}
            aria-pressed={conversation.autoSpeak}
            className="gap-2"
          >
            {conversation.autoSpeak ? (
              <Volume2 className="h-4 w-4 text-accent" />
            ) : (
              <VolumeX className="h-4 w-4" />
            )}
            Voice {conversation.autoSpeak ? "on" : "off"}
          </Button>
        </div>
        <IconButton
          label="Clear conversation"
          onClick={conversation.clear}
          disabled={conversation.turns.length === 0}
        >
          <Trash2 className="h-5 w-5" />
        </IconButton>
      </div>

      {conversation.error && (
        <p role="alert" className="rounded-2xl bg-danger/10 px-4 py-3 text-sm text-danger">
          {conversation.error}
        </p>
      )}

      <div className="flex min-h-0 flex-1 flex-col gap-4 md:flex-row">
        <SpeakerPanel
          side="A"
          language={conversation.langA}
          onLanguageChange={conversation.setLangA}
          active={conversation.active === "A"}
          micDisabled={conversation.active === "B"}
          interim={conversation.active === "A" ? conversation.interim : ""}
          turns={conversation.turns}
          onToggleMic={() => conversation.toggle("A")}
          onReplay={conversation.replay}
        />
        <SpeakerPanel
          side="B"
          language={conversation.langB}
          onLanguageChange={conversation.setLangB}
          active={conversation.active === "B"}
          micDisabled={conversation.active === "A"}
          interim={conversation.active === "B" ? conversation.interim : ""}
          turns={conversation.turns}
          onToggleMic={() => conversation.toggle("B")}
          onReplay={conversation.replay}
        />
      </div>
    </div>
  );
}

function UnsupportedNotice() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-3xl border border-border bg-surface p-8 text-center shadow-soft">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-raised text-accent">
        <MonitorSmartphone className="h-7 w-7" />
      </span>
      <h2 className="text-lg font-semibold text-text">Live voice needs a compatible browser</h2>
      <p className="text-sm text-muted">
        Real-time speech recognition relies on the Web Speech API. Open Lingua in Google Chrome or
        Microsoft Edge (desktop or Android) to use Conversation mode. Text and Image translation work
        everywhere.
      </p>
    </div>
  );
}
