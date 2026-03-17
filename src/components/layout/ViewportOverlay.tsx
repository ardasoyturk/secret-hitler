import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { ReactNode } from "react";

export function ViewportOverlay({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(children, document.body);
}
