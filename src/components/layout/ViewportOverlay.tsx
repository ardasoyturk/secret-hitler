import type { ComponentChildren } from "preact";
import { createPortal } from "preact/compat";

export const ViewportOverlay = function ViewportOverlay({ children }: { children: ComponentChildren }) {
	if (typeof document === "undefined") return null;

	return createPortal(children, document.body);
};
