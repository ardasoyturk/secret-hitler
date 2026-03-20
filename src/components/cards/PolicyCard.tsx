/**
 * PolicyCard — Displays a liberal or fascist policy tile.
 *
 * When unrevealed, shows the card back. When revealed, shows the
 * policy type with the appropriate imagery and a scale-pop animation.
 */

import { memo } from "preact/compat";

import policyFascistImg from "@/assets/cards/policy-fascist.png";
import policyBackImg from "@/assets/cards/policy-folder-cover-back.png";
import policyLiberalImg from "@/assets/cards/policy-liberal.png";
import { useOptimizedAsset } from "@/components/game/OptimizedAssets";
import { useI18n } from "@/i18n";

const SIZE_CLASSES = {
	sm: "w-[60px]",
	md: "w-[90px]",
	lg: "w-[130px]",
} as const;

interface PolicyCardProps {
	type: "liberal" | "fascist";
	size?: "sm" | "md" | "lg";
	revealed?: boolean;
	onClick?: () => void;
	selected?: boolean;
	className?: string;
}

export const PolicyCard = memo(function PolicyCard({
	type,
	size = "md",
	revealed = true,
	onClick,
	selected = false,
	className = "",
}: PolicyCardProps) {
	const { messages } = useI18n();
	const isClickable = !!onClick;

	const policyImg = type === "fascist" ? policyFascistImg : policyLiberalImg;
	const revealedSrc = useOptimizedAsset(
		type === "fascist" ? "cards/policy-fascist.png" : "cards/policy-liberal.png",
		policyImg.src,
	);
	const backSrc = useOptimizedAsset("cards/policy-folder-cover-back.png", policyBackImg.src);
	const imgSrc = revealed ? revealedSrc : backSrc;
	const altText = revealed ? messages.cards.policy(messages.enums.policyTypes[type]) : messages.cards.faceDownPolicy;

	return (
		<button
			type="button"
			onClick={onClick}
			disabled={!isClickable}
			className={[
				"relative flex-shrink-0 rounded-[var(--radius-card)] overflow-hidden",
				"transition-all duration-[var(--transition-normal)]",
				SIZE_CLASSES[size],
				// shadow
				"shadow-[var(--shadow-card)]",
				// selected gold glow
				selected && "ring-2 ring-gold shadow-[0_0_16px_rgba(246,181,63,0.6)]",
				// clickable hover/active
				isClickable && "cursor-pointer hover:scale-105 active:scale-95",
				!isClickable && "cursor-default",
				// reveal animation
				revealed && "scale-pop",
				className,
			]
				.filter(Boolean)
				.join(" ")}
		>
			<img
				src={imgSrc}
				alt={altText}
				className="pointer-events-none block h-auto w-full select-none"
				draggable={false}
			/>

			{/* Subtle shine overlay on hover for clickable cards */}
			{isClickable && (
				<span className="absolute inset-0 bg-white/0 transition-colors duration-[var(--transition-fast)] hover:bg-white/5" />
			)}
		</button>
	);
});
