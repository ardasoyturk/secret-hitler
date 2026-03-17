/**
 * GameOverScreen — Victory screen showing the winning team,
 * victory reason, and all player roles revealed.
 */

import type { GameState, GameAction } from "@engine/types";
import { Team, Role, VictoryReason } from "@engine/types";

import victoryFascistHeader from "@assets/victory/victory-fascist-header.png";
import victoryFascistFooter from "@assets/victory/victory-fascist-footer.png";
import victoryLiberalHeader from "@assets/victory/victory-liberal-header.png";
import victoryLiberalFooter from "@assets/victory/victory-liberal-footer.png";

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

const PORTRAITS = [
  portrait1,
  portrait2,
  portrait3,
  portrait4,
  portrait5,
  portrait6,
  portrait7,
  portrait8,
  portrait9,
  portrait10,
  portrait11,
  portrait12,
  portrait13,
  portrait14,
  portrait15,
  portrait16,
  portrait17,
  portrait18,
  portrait19,
  portrait20,
];

const VICTORY_REASONS: Record<VictoryReason, string> = {
  [VictoryReason.LiberalPolicies]: "5 Liberal policies have been enacted. Democracy prevails!",
  [VictoryReason.FascistPolicies]:
    "6 Fascist policies have been enacted. The government has fallen.",
  [VictoryReason.HitlerExecuted]: "Hitler has been found and executed. Freedom is restored!",
  [VictoryReason.HitlerElectedChancellor]:
    "Hitler was elected Chancellor with 3+ Fascist policies in play. The conspiracy succeeds.",
};

function getRoleBadge(role: Role) {
  switch (role) {
    case Role.Hitler:
      return {
        label: "Hitler",
        className: "bg-fascist-deep text-text-primary",
      };
    case Role.Fascist:
      return {
        label: "Fascist",
        className: "bg-fascist/80 text-text-primary",
      };
    case Role.Liberal:
      return {
        label: "Liberal",
        className: "bg-liberal/80 text-text-primary",
      };
  }
}

interface ScreenProps {
  state: GameState;
  dispatch: (action: GameAction) => void;
}

export function GameOverScreen({ state, dispatch }: ScreenProps) {
  const winner = state.winner;
  const reason = state.victoryReason;

  if (!winner || !reason) return null;

  const isLiberalWin = winner === Team.Liberal;
  const headerImg = isLiberalWin ? victoryLiberalHeader : victoryFascistHeader;
  const footerImg = isLiberalWin ? victoryLiberalFooter : victoryFascistFooter;
  const teamColor = isLiberalWin ? "text-liberal" : "text-fascist";
  const glowClass = isLiberalWin ? "glow-liberal" : "glow-fascist";

  // Sort players: winning team first, then losing team
  const sortedPlayers = [...state.players].sort((a, b) => {
    const aIsWinner =
      (isLiberalWin && a.role === Role.Liberal) || (!isLiberalWin && a.role !== Role.Liberal);
    const bIsWinner =
      (isLiberalWin && b.role === Role.Liberal) || (!isLiberalWin && b.role !== Role.Liberal);
    if (aIsWinner && !bIsWinner) return -1;
    if (!aIsWinner && bIsWinner) return 1;
    // Within the same team, put Hitler last
    if (a.role === Role.Hitler) return 1;
    if (b.role === Role.Hitler) return -1;
    return 0;
  });

  return (
    <div className="h-dvh w-full flex flex-col overflow-hidden px-4 py-4">
      {/* Victory header image */}
      <div className={["w-full max-w-md mx-auto flex-shrink-0 stamp mb-3", glowClass].join(" ")}>
        <img
          src={headerImg.src}
          alt={`${winner} victory`}
          className="w-full h-auto block rounded-t-[var(--radius-card)]"
          draggable={false}
        />
      </div>

      {/* Victory title */}
      <div className="text-center flex-shrink-0 mb-3">
        <h1
          className={["font-heading text-3xl sm:text-4xl tracking-wide mb-1", teamColor].join(" ")}
        >
          {isLiberalWin ? "Liberals Win!" : "Fascists Win!"}
        </h1>
        <p className="text-text-secondary font-body text-xs max-w-sm mx-auto">
          {VICTORY_REASONS[reason]}
        </p>
      </div>

      {/* Board final state */}
      <div className="flex items-center justify-center gap-8 flex-shrink-0 mb-3">
        <div className="text-center">
          <p className="text-liberal font-heading text-2xl">{state.board.liberalPolicies}</p>
          <p className="text-text-muted font-body text-xs uppercase tracking-wider">Liberal</p>
        </div>
        <div className="w-px h-6 bg-text-muted/30" />
        <div className="text-center">
          <p className="text-fascist font-heading text-2xl">{state.board.fascistPolicies}</p>
          <p className="text-text-muted font-body text-xs uppercase tracking-wider">Fascist</p>
        </div>
      </div>

      {/* All roles revealed — scrollable */}
      <div className="flex-1 overflow-y-auto min-h-0 w-full max-w-md mx-auto mb-3">
        <p className="text-text-muted font-body text-xs uppercase tracking-widest mb-2 text-center sticky top-0 bg-bg-dark py-1">
          All Roles Revealed
        </p>
        <div className="space-y-1.5">
          {sortedPlayers.map((player) => {
            const badge = getRoleBadge(player.role);
            const isDead = !player.isAlive;

            return (
              <div
                key={player.id}
                className={[
                  "flex items-center gap-3 bg-bg-card rounded-[var(--radius-button)] px-3 py-2 fade-in",
                  isDead && "opacity-50",
                ].join(" ")}
              >
                {/* Portrait */}
                <div
                  className={[
                    "w-9 h-9 rounded-full overflow-hidden border-2 flex-shrink-0",
                    player.role === Role.Hitler
                      ? "border-fascist-deep"
                      : player.role === Role.Fascist
                        ? "border-fascist/60"
                        : "border-liberal/60",
                    isDead && "grayscale",
                  ].join(" ")}
                >
                  <img
                    src={PORTRAITS[player.portraitIndex]?.src}
                    alt={player.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Name */}
                <span
                  className={[
                    "flex-1 font-body font-medium text-sm",
                    isDead ? "text-text-muted line-through" : "text-text-primary",
                  ].join(" ")}
                >
                  {player.name}
                  {isDead && <span className="text-fascist text-xs ml-2 no-underline">(dead)</span>}
                </span>

                {/* Role badge */}
                <span
                  className={[
                    "px-2.5 py-0.5 rounded-full text-xs font-body font-semibold uppercase tracking-wider",
                    badge.className,
                  ].join(" ")}
                >
                  {badge.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Victory footer image */}
      <div className="w-full max-w-md mx-auto flex-shrink-0 mb-3">
        <img
          src={footerImg.src}
          alt=""
          className="w-full h-auto block rounded-b-[var(--radius-card)] opacity-80"
          draggable={false}
        />
      </div>

      {/* New Game button */}
      <button
        type="button"
        onClick={() => dispatch({ type: "NEW_GAME" })}
        className="flex-shrink-0 w-full max-w-md mx-auto py-3 rounded-[var(--radius-button)] font-heading text-xl tracking-wide bg-fascist text-text-primary shadow-[0_6px_0_var(--color-fascist-dark),var(--shadow-card)] hover:bg-fascist-hover active:shadow-[0_2px_0_var(--color-fascist-dark)] active:translate-y-[4px] transition-all duration-[var(--transition-normal)] cursor-pointer"
      >
        New Game
      </button>
    </div>
  );
}
