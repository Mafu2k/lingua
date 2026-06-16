import { ChevronDown } from "lucide-react";
import { useId } from "react";
import { getLanguage, LANGUAGE_LIST, type LanguageCode } from "@/core/domain/language";
import { cn } from "@/shared/lib/cn";

type Value = LanguageCode | "auto";

interface LanguageSelectProps {
  value: Value;
  onChange: (value: Value) => void;
  includeAuto?: boolean;
  detected?: LanguageCode | null;
  label: string;
  className?: string;
}

export function LanguageSelect({
  value,
  onChange,
  includeAuto = false,
  detected = null,
  label,
  className
}: LanguageSelectProps) {
  const id = useId();
  const autoLabel = detected ? `Auto · ${getLanguage(detected).nativeName}` : "Auto-detect";

  return (
    <div className={cn("relative", className)}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value as Value)}
        className={cn(
          "h-11 w-full cursor-pointer appearance-none rounded-2xl border border-border bg-surface-raised",
          "pl-4 pr-10 text-sm font-medium text-text transition-colors",
          "hover:border-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        )}
      >
        {includeAuto && <option value="auto">{autoLabel}</option>}
        {LANGUAGE_LIST.map((language) => (
          <option key={language.code} value={language.code}>
            {language.flag} {language.nativeName}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
      />
    </div>
  );
}
