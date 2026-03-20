/**
 * VoteCard — Ja / Nein vote button with tactile press feedback.
 *
 * Uses the actual vote card assets for authentic Secret Hitler styling.
 */

import { memo } from "preact/compat";

import voteNoImg from "@/assets/votes/vote-no.png";
import voteYesImg from "@/assets/votes/vote-yes.png";
import { useOptimizedAsset } from "@/components/game/OptimizedAssets";
import { useI18n } from "@/i18n";

const SIZE_CLASSES = {
	sm: "w-[80px]",
	md: "w-[120px]",
	lg: "w-[160px]",
} as const;

interface VoteCardProps {
	vote: "ja" | "nein";
	size?: "sm" | "md" | "lg";
	onClick?: () => void;
	disabled?: boolean;
	className?: string;
}

export const VoteCard = memo(function VoteCard({
	vote,
	size = "md",
	onClick,
	disabled = false,
	className = "",
}: VoteCardProps) {
	const { messages } = useI18n();
	const yesSrc = useOptimizedAsset("votes/vote-yes.png", voteYesImg.src);
	const noSrc = useOptimizedAsset("votes/vote-no.png", voteNoImg.src);
	const imgSrc = vote === "ja" ? yesSrc : noSrc;
	const altText = vote === "ja" ? messages.cards.voteJa : messages.cards.voteNein;

	return (
		<button
			type="button"
			onClick={onClick}
			disabled={disabled}
			className={[
				"relative flex-shrink-0 rounded-[var(--radius-card)] overflow-hidden",
				"transition-all duration-[var(--transition-fast)]",
				SIZE_CLASSES[size],
				// Tactile shadow — shifts on press
				!disabled && "shadow-[0_6px_0_var(--color-bg-darker),var(--shadow-card)]",
				!disabled && "active:shadow-[0_2px_0_var(--color-bg-darker)] active:translate-y-[4px]",
				// Hover lift
				!disabled && "cursor-pointer hover:brightness-110 hover:-translate-y-0.5",
				// Disabled state
				disabled && "opacity-40 grayscale cursor-not-allowed",
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
		</button>
	);
});
