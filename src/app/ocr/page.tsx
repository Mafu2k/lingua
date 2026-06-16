import type { Metadata } from "next";
import { OcrTranslator } from "@/features/ocr/ui/components/OcrTranslator";
import { PageHeader } from "@/shared/ui/PageHeader";

export const metadata: Metadata = {
  title: "Image"
};

export default function OcrPage() {
  return (
    <div className="mx-auto w-full max-w-4xl animate-fade-up">
      <PageHeader
        title="Image translator"
        subtitle="Upload a photo of a document, menu or sign. Lingua reads and translates the text."
      />
      <OcrTranslator />
    </div>
  );
}
