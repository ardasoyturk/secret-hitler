/**
 * PlayerBadge — Round portrait with name, status badges, and vote indicator.
 *
 * Used in the player circle and compact player lists.
 * Supports president/chancellor badges, dead overlay, selection, and vote display.
 */

import type { Player, VoteRecord } from "@engine/types";
import { Vote } from "@engine/types";

import portraitDefault from "@assets/portraits/player-portrait-default.svg";
import portrait1 from "@assets/portraits/player-portrait-1.svg";
import portrait2 from "@assets/portraits/player-portrait-2.svg";
import portrait3 from "@assets/portraits/player-portrait-3.svg";
import portrait4 from "@assets/portraits/player-portrait-4.svg";
import portrait5 from "@assets/portraits/player-portrait-5.svg";
import portrait6 from "@assets/portraits/player-portrait-6.svg";
import portrait7 from "@assets/portraits/player-portrait-7.svg";
import portrait8 from "@assets/portraits/player-portrait-8.svg";
import portrait9 from "@assets/portraits/player-portrait-9.svg";
import portrait10 from "@assets/portraits/player-portrait-10.svg";
import portrait11 from "@assets/portraits/player-portrait-11.svg";
import portrait12 from "@assets/portraits/player-portrait-12.svg";
import portrait13 from "@assets/portraits/player-portrait-13.svg";
import portrait14 from "@assets/portraits/player-portrait-14.svg";
import portrait15 from "@assets/portraits/player-portrait-15.svg";
import portrait16 from "@assets/portraits/player-portrait-16.svg";
import portrait17 from "@assets/portraits/player-portrait-17.svg";
import portrait18 from "@assets/portraits/player-portrait-18.svg";
import portrait19 from "@assets/portraits/player-portrait-19.svg";
import portrait20 from "@assets/portraits/player-portrait-20.svg";

const PORTRAIT_MAP: Record<number, { src: string }> = {
  0: portraitDefault,
  1: portrait1,
  2: portrait2,
  3: portrait3,
  4: portrait4,
  5: portrait5,
  6: portrait6,
  7: portrait7,
  8: portrait8,
  9: portrait9,
  10: portrait10,
  11: portrait11,
  12: portrait12,
  13: portrait13,
  14: portrait14,
  15: portrait15,
  16: portrait16,
  17: portrait17,
  18: portrait18,
  19: portrait19,
  20: portrait20,
};

const PLAYER_COLOR_BORDER: Record<string, string> = {
  red: "border-player-red",
  blue: "border-player-blue",
  green: "border-player-green",
  yellow: "border-player-yellow",
  purple: "border-player-purple",
  orange: "border-player-orange",
  pink: "border-player-pink",
  teal: "border-player-teal",
  brown: "border-player-brown",
  gray: "border-player-gray",
};

const PLAYER_COLOR_RING: Record<string, string> = {
  red: "ring-player-red",
  blue: "ring-player-blue",
  green: "ring-player-green",
  yellow: "ring-player-yellow",
  purple: "ring-player-purple",
  orange: "ring-player-orange",
  pink: "ring-player-pink",
  teal: "ring-player-teal",
  brown: "ring-player-brown",
  gray: "ring-player-gray",
};

interface PlayerBadgeProps {
  player: Player;
  isPresident?: boolean;
  isChancellor?: boolean;
  isNominee?: boolean;
  isDead?: boolean;
  selected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  showVote?: VoteRecord;
  size?: "sm" | "md";
  className?: string;
}

export function PlayerBadge({
  player,
  isPresident = false,
  isChancellor = false,
  isNominee = false,
  isDead = false,
  selected = false,
  onClick,
  disabled = false,
  showVote,
  size = "md",
  className = "",
}: PlayerBadgeProps) {
  const isClickable = !!onClick && !disabled;
  const portraitAsset = PORTRAIT_MAP[player.portraitIndex] ?? PORTRAIT_MAP[0];
  const portraitSrc = portraitAsset.src;
  const colorBorder = PLAYER_COLOR_BORDER[player.color] ?? "border-player-gray";
  const colorRing = PLAYER_COLOR_RING[player.color] ?? "ring-player-gray";

  const portraitSize = size === "sm" ? "w-10 h-10" : "w-14 h-14";
  const borderWidth = size === "sm" ? "border-2" : "border-3";
  const nameSize = size === "sm" ? "text-[10px]" : "text-xs";
  const badgeSize = size === "sm" ? "w-4 h-4 text-[8px]" : "w-5 h-5 text-[10px]";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!isClickable}
      className={[
        "relative flex flex-col items-center gap-1 select-none",
        "transition-transform duration-[var(--transition-fast)]",
        isClickable && "cursor-pointer hover:scale-110 active:scale-95",
        !isClickable && "cursor-default",
        isDead && "opacity-50",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Portrait circle */}
      <div className="relative">
        <div
          className={[
            portraitSize,
            "rounded-full overflow-hidden",
            borderWidth,
            colorBorder,
            // Selected gold glow
            selected && "ring-2 ring-gold shadow-[0_0_12px_rgba(246,181,63,0.6)]",
            // Nominee pulse
            isNominee && !selected && `ring-2 ${colorRing} pulse`,
            "bg-bg-darker",
            "transition-shadow duration-[var(--transition-normal)]",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <img
            src={portraitSrc}
            alt={player.name}
            className="w-full h-full object-cover select-none"
            draggable={false}
          />

          {/* Dead overlay */}
          {isDead && (
            <div className="absolute inset-0 bg-bg-overlay/70 flex items-center justify-center">
              <span className="text-xl leading-none" role="img" aria-label="Dead">
                &#x2620;
              </span>
            </div>
          )}
        </div>

        {/* President badge */}
        {isPresident && (
          <span
            className={[
              "absolute -top-1 -right-1 flex items-center justify-center",
              "rounded-full bg-gold text-bg-darker font-body font-bold",
              badgeSize,
              "shadow-[0_1px_3px_rgba(0,0,0,0.5)]",
            ].join(" ")}
            title="President"
          >
            P
          </span>
        )}

        {/* Chancellor badge */}
        {isChancellor && (
          <span
            className={[
              "absolute -top-1 -right-1 flex items-center justify-center",
              "rounded-full bg-gold text-bg-darker font-body font-bold",
              badgeSize,
              "shadow-[0_1px_3px_rgba(0,0,0,0.5)]",
              // If both P and C, offset C to the left
              isPresident && "-right-1 -top-1 translate-x-0 translate-y-4",
            ]
              .filter(Boolean)
              .join(" ")}
            title="Chancellor"
          >
            C
          </span>
        )}

        {/* Vote indicator */}
        {showVote && (
          <span
            className={[
              "absolute -bottom-1 left-1/2 -translate-x-1/2",
              "px-1.5 py-0.5 rounded-full text-[9px] font-body font-bold uppercase",
              "shadow-[0_1px_3px_rgba(0,0,0,0.5)]",
              showVote.vote === Vote.Ja
                ? "bg-liberal text-text-primary"
                : "bg-fascist text-text-primary",
            ].join(" ")}
          >
            {showVote.vote === Vote.Ja ? "Ja" : "Nein"}
          </span>
        )}
      </div>

      {/* Name label */}
      <span
        className={[
          "font-body font-semibold text-text-primary truncate max-w-[64px] text-center",
          nameSize,
          isDead && "line-through text-text-muted",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {player.name}
      </span>
    </button>
  );
}
