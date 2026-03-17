/**
 * PartyCard — Shows a player's party membership (investigation result).
 *
 * Reveals with a dramatic stamp-in animation.
 */

import partyLiberalImg from "@assets/cards/party-membership-liberal.png";
import partyFascistImg from "@assets/cards/party-membership-fascist.png";

interface PartyCardProps {
  party: "liberal" | "fascist";
  className?: string;
}

export function PartyCard({ party, className = "" }: PartyCardProps) {
  const imgSrc = party === "liberal" ? partyLiberalImg.src : partyFascistImg.src;
  const altText = `Party Membership: ${party}`;

  const glowClass =
    party === "liberal"
      ? "shadow-[0_0_24px_rgba(90,155,166,0.45)]"
      : "shadow-[0_0_24px_rgba(224,91,43,0.45)]";

  return (
    <div
      className={[
        "relative w-[200px] rounded-[var(--radius-card)] overflow-hidden",
        "stamp",
        glowClass,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <img
        src={imgSrc}
        alt={altText}
        className="w-full h-auto block select-none"
        draggable={false}
      />
    </div>
  );
}
