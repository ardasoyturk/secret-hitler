/**
 * VoteCard — Ja / Nein vote button with tactile press feedback.
 *
 * Uses the actual vote card assets for authentic Secret Hitler styling.
 */

import voteYesImg from "@assets/votes/vote-yes.png";
import voteNoImg from "@assets/votes/vote-no.png";

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

export function VoteCard({
  vote,
  size = "md",
  onClick,
  disabled = false,
  className = "",
}: VoteCardProps) {
  const imgSrc = vote === "ja" ? voteYesImg.src : voteNoImg.src;
  const altText = vote === "ja" ? "Ja! (Yes)" : "Nein! (No)";

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
        className="w-full h-auto block select-none pointer-events-none"
        draggable={false}
      />
    </button>
  );
}
