/**
 * PartyCard — Shows a player's party membership (investigation result).
 *
 * Reveals with a dramatic stamp-in animation.
 */

import partyFascistImg from "@assets/cards/party-membership-fascist.png";
import partyLiberalImg from "@assets/cards/party-membership-liberal.png";
import { useOptimizedAsset } from "@components/game/OptimizedAssets";
import { memo } from "react";

interface PartyCardProps {
	party: "liberal" | "fascist";
	className?: string;
}

export const PartyCard = memo(function PartyCard({ party, className = "" }: PartyCardProps) {
	const liberalSrc = useOptimizedAsset("cards/party-membership-liberal.png", partyLiberalImg.src);
	const fascistSrc = useOptimizedAsset("cards/party-membership-fascist.png", partyFascistImg.src);
	const imgSrc = party === "liberal" ? liberalSrc : fascistSrc;
	const altText = `Party Membership: ${party}`;

	const glowClass =
		party === "liberal" ? "shadow-[0_0_24px_rgba(90,155,166,0.45)]" : "shadow-[0_0_24px_rgba(224,91,43,0.45)]";

	return (
		<div
			className={["relative w-[200px] rounded-[var(--radius-card)] overflow-hidden", "stamp", glowClass, className]
				.filter(Boolean)
				.join(" ")}
		>
			<img src={imgSrc} alt={altText} className="block h-auto w-full select-none" draggable={false} />
		</div>
	);
});
