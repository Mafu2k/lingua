import { useCallback, useEffect, useRef, useState } from "react";

export function useCopyToClipboard(resetDelay = 2000): {
  copied: boolean;
  copy: (value: string) => Promise<boolean>;
} {
  const [copied, setCopied] = useState(false);
  const timeout = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => clearTimeout(timeout.current), []);

  const copy = useCallback(
    async (value: string) => {
      if (!value) return false;
      try {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        clearTimeout(timeout.current);
        timeout.current = setTimeout(() => setCopied(false), resetDelay);
        return true;
      } catch {
        setCopied(false);
        return false;
      }
    },
    [resetDelay]
  );

  return { copied, copy };
}
