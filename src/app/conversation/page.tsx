import type { Metadata } from "next";
import { ConversationMode } from "@/features/conversation/ui/components/ConversationMode";
import { PageHeader } from "@/shared/ui/PageHeader";

export const metadata: Metadata = {
  title: "Live"
};

export default function ConversationPage() {
  return (
    <div className="mx-auto flex h-full min-h-[78vh] w-full max-w-5xl flex-col animate-fade-up">
      <PageHeader
        title="Conversation mode"
        subtitle="Two people, two languages, one device. Tap a microphone and start talking."
      />
      <div className="min-h-0 flex-1">
        <ConversationMode />
      </div>
    </div>
  );
}
