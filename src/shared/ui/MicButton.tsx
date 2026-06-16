import { Mic, MicOff } from "lucide-react";
import { cn } from "@/shared/lib/cn";

interface MicButtonProps {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  label: string;
  size?: "md" | "lg";
}

export function MicButton({ active, disabled = false, onClick, label, size = "lg" }: MicButtonProps) {
  const dimension = size === "lg" ? "h-20 w-20" : "h-16 w-16";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      aria-label={label}
      className={cn(
        "relative inline-flex items-center justify-center rounded-full transition-all duration-300",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/40",
        "disabled:cursor-not-allowed disabled:opacity-40",
        dimension,
        active
          ? "bg-danger text-white shadow-glow"
          : "bg-accent text-accent-contrast shadow-soft hover:brightness-110 active:scale-95"
      )}
    >
      {active && (
        <>
          <span className="absolute inset-0 animate-pulse-ring rounded-full bg-danger/40" aria-hidden />
          <span
            className="absolute inset-0 animate-pulse-ring rounded-full bg-danger/30 [animation-delay:0.5s]"
            aria-hidden
          />
        </>
      )}
      {active ? (
        <MicOff className={size === "lg" ? "h-8 w-8" : "h-7 w-7"} />
      ) : (
        <Mic className={size === "lg" ? "h-8 w-8" : "h-7 w-7"} />
      )}
    </button>
  );
}
