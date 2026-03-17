/**
 * PlayerCircle — Arranges player badges in a circular/oval layout.
 *
 * Uses CSS transforms to position badges around an ellipse.
 * Highlights selectable players and shows vote indicators.
 */

import type { Player, VoteRecord } from "@engine/types";
import { PlayerBadge } from "./PlayerBadge";

interface PlayerCircleProps {
  players: Player[];
  presidentIndex: number;
  chancellorNomineeId: number | null;
  lastElectedPresidentId: number | null;
  lastElectedChancellorId: number | null;
  onPlayerClick?: (id: number) => void;
  selectableIds?: number[];
  selectedId?: number | null;
  showVotes?: VoteRecord[];
  className?: string;
}

export function PlayerCircle({
  players,
  presidentIndex,
  chancellorNomineeId,
  lastElectedPresidentId,
  lastElectedChancellorId,
  onPlayerClick,
  selectableIds,
  selectedId = null,
  showVotes,
  className = "",
}: PlayerCircleProps) {
  const count = players.length;

  // Ellipse radii — adjusted by player count for good spacing
  const radiusX = Math.max(120, count * 18);
  const radiusY = Math.max(90, count * 14);

  return (
    <div
      className={["relative mx-auto", className].filter(Boolean).join(" ")}
      style={{
        width: radiusX * 2 + 80,
        height: radiusY * 2 + 80,
      }}
    >
      {players.map((player, idx) => {
        // Distribute evenly around the ellipse, starting from the top (-90deg)
        const angle = (2 * Math.PI * idx) / count - Math.PI / 2;
        const x = radiusX * Math.cos(angle);
        const y = radiusY * Math.sin(angle);

        const isPresident = idx === presidentIndex;
        const isNominee = player.id === chancellorNomineeId;
        const isLastPresident = player.id === lastElectedPresidentId;
        const isLastChancellor = player.id === lastElectedChancellorId;
        const isSelectable = selectableIds?.includes(player.id) ?? false;
        const isSelected = player.id === selectedId;
        const isDead = !player.isAlive;

        const voteRecord = showVotes?.find((v) => v.playerId === player.id);

        return (
          <div
            key={player.id}
            className="absolute transition-all duration-[var(--transition-slow)]"
            style={{
              left: "50%",
              top: "50%",
              transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
            }}
          >
            <PlayerBadge
              player={player}
              isPresident={isPresident}
              isChancellor={isLastChancellor && !isNominee}
              isNominee={isNominee}
              isDead={isDead}
              selected={isSelected}
              onClick={isSelectable && onPlayerClick ? () => onPlayerClick(player.id) : undefined}
              disabled={!isSelectable}
              showVote={voteRecord}
              size="md"
              className={[
                // Dim unselectable players when selection is active
                selectableIds &&
                  selectableIds.length > 0 &&
                  !isSelectable &&
                  !isDead &&
                  "opacity-40",
              ]
                .filter(Boolean)
                .join(" ")}
            />
            {/* Term-limit indicator for last elected government */}
            {(isLastPresident || isLastChancellor) && !isPresident && (
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                <span className="text-[8px] font-body text-text-muted uppercase tracking-wider">
                  {isLastPresident && isLastChancellor ? "term" : isLastPresident ? "ex-P" : "ex-C"}
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
