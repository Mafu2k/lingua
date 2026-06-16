import type { Metadata } from "next";
import { TextTranslator } from "@/features/translation/ui/components/TextTranslator";
import { PageHeader } from "@/shared/ui/PageHeader";

export const metadata: Metadata = {
  title: "Text"
};

export default function TextPage() {
  return (
    <div className="mx-auto w-full max-w-4xl animate-fade-up">
      <PageHeader
        title="Text translator"
        subtitle="Type or paste any text. Lingua detects the language and translates instantly."
      />
      <TextTranslator />
    </div>
  );
}
