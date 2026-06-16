import { MessagesSquare, ScanText, Type, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { LANGUAGE_LIST } from "@/core/domain/language";

interface FeatureCard {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
  accent: boolean;
}

const FEATURES: FeatureCard[] = [
  {
    href: "/conversation",
    icon: MessagesSquare,
    title: "Conversation",
    description: "Real-time, two-way voice translation with split-screen and spoken replies.",
    accent: true
  },
  {
    href: "/text",
    icon: Type,
    title: "Text",
    description: "Instant translation with automatic language detection and one-tap copy.",
    accent: false
  },
  {
    href: "/ocr",
    icon: ScanText,
    title: "Image",
    description: "Read and translate documents, menus, signs and handwritten notes.",
    accent: false
  }
];

export default function HomePage() {
  return (
    <div className="mx-auto w-full max-w-4xl animate-fade-up">
      <section className="py-6 sm:py-10">
        <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted">
          <span className="h-2 w-2 rounded-full bg-success" />
          5 languages · real-time voice
        </p>
        <h1 className="text-balance text-3xl font-semibold tracking-tight text-text sm:text-5xl">
          Talk naturally across languages.
        </h1>
        <p className="mt-4 max-w-xl text-pretty text-base text-muted sm:text-lg">
          Lingua brings premium, low-latency translation to every conversation — by voice, by text, or
          straight from a photo.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        {FEATURES.map((feature, index) => (
          <FeatureTile key={feature.href} feature={feature} wide={index === 0} />
        ))}
      </section>

      <section className="mt-8 rounded-3xl border border-border bg-surface p-5 shadow-soft">
        <h2 className="text-sm font-medium text-muted">Supported languages</h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {LANGUAGE_LIST.map((language) => (
            <li
              key={language.code}
              className="inline-flex items-center gap-2 rounded-full bg-surface-raised px-3 py-1.5 text-sm text-text"
            >
              <span aria-hidden>{language.flag}</span>
              {language.nativeName}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function FeatureTile({ feature, wide }: { feature: FeatureCard; wide: boolean }) {
  const Icon = feature.icon;
  return (
    <Link
      href={feature.href}
      className={`group flex flex-col gap-3 rounded-3xl border p-6 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-raised ${
        wide ? "sm:col-span-2" : ""
      } ${feature.accent ? "border-transparent bg-accent text-accent-contrast" : "border-border bg-surface"}`}
    >
      <span
        className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
          feature.accent ? "bg-white/15" : "bg-surface-raised text-accent"
        }`}
      >
        <Icon className="h-6 w-6" />
      </span>
      <span className="text-lg font-semibold">{feature.title}</span>
      <span className={`text-sm ${feature.accent ? "text-accent-contrast/80" : "text-muted"}`}>
        {feature.description}
      </span>
    </Link>
  );
}
