import type { ReactNode } from "react";
import { memo } from "react";
import { createPortal } from "react-dom";

export const ViewportOverlay = memo(function ViewportOverlay({ children }: { children: ReactNode }) {
	if (typeof document === "undefined") return null;

	return createPortal(children, document.body);
});
