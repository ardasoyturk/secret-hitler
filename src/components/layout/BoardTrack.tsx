/**
 * BoardTrack — The liberal and fascist policy boards, compact side-by-side layout.
 *
 * Designed to always be visible during active play without taking too much vertical space.
 * Uses a horizontal layout: liberal board | fascist board, with the election tracker inline.
 */

import type { Board, ElectionTracker } from "@engine/types";
import { ExecutivePower } from "@engine/types";
import {
  getPlayerCountBracket,
  EXECUTIVE_POWERS,
  LIBERAL_POLICIES_TO_WIN,
  FASCIST_POLICIES_TO_WIN,
} from "@engine/constants";

import boardLiberalImg from "@assets/boards/board-liberal.png";
import boardFascist56Img from "@assets/boards/board-fascist-5-6.png";
import boardFascist78Img from "@assets/boards/board-fascist-7-8.png";
import boardFascist910Img from "@assets/boards/board-fascist-9-10.png";
import policyLiberalImg from "@assets/boards/board-policy-liberal.png";
import policyFascistImg from "@assets/boards/board-policy-fascist.png";

const FASCIST_BOARD_MAP: Record<string, { src: string }> = {
  "5-6": boardFascist56Img,
  "7-8": boardFascist78Img,
  "9-10": boardFascist910Img,
};

const EXECUTIVE_POWER_ICONS: Record<ExecutivePower, string> = {
  [ExecutivePower.None]: "",
  [ExecutivePower.InvestigateLoyalty]: "🔍",
  [ExecutivePower.PolicyPeek]: "👁",
  [ExecutivePower.SpecialElection]: "🎯",
  [ExecutivePower.Execution]: "💀",
};

interface BoardTrackProps {
  board: Board;
  electionTracker: ElectionTracker;
  playerCount: number;
  vetoUnlocked: boolean;
  className?: string;
}

export function BoardTrack({
  board,
  electionTracker,
  playerCount,
  vetoUnlocked,
  className = "",
}: BoardTrackProps) {
  const bracket = getPlayerCountBracket(playerCount);
  const fascistBoardImg = FASCIST_BOARD_MAP[bracket] ?? FASCIST_BOARD_MAP["5-6"];
  const executivePowers = EXECUTIVE_POWERS[bracket];

  return (
    <div
      className={[
        "flex items-center gap-2 w-full max-w-3xl mx-auto",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Liberal Track */}
      <div className="relative flex-1">
        <img
          src={boardLiberalImg.src}
          alt="Liberal policy board"
          className="w-full h-auto block rounded"
          draggable={false}
        />
        {/* Policy slot overlays */}
        <div className="absolute inset-0 flex items-center">
          <div className="flex gap-[3.5%] ml-[9%]">
            {Array.from({ length: LIBERAL_POLICIES_TO_WIN }).map((_, i) => (
              <div
                key={i}
                className="w-[11.5%] aspect-[3/4] flex items-center justify-center"
              >
                {i < board.liberalPolicies && (
                  <img
                    src={policyLiberalImg.src}
                    alt={`Liberal policy ${i + 1}`}
                    className="w-full h-full object-contain scale-pop"
                    draggable={false}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fascist Track */}
      <div className="relative flex-[1.25]">
        <img
          src={fascistBoardImg.src}
          alt="Fascist policy board"
          className="w-full h-auto block rounded"
          draggable={false}
        />
        {/* Policy slot overlays */}
        <div className="absolute inset-0 flex items-center">
          <div className="flex gap-[2.4%] ml-[3.5%]">
            {Array.from({ length: FASCIST_POLICIES_TO_WIN }).map((_, i) => {
              const power = executivePowers[i + 1];
              const isVetoSlot = i === 4;

              return (
                <div
                  key={i}
                  className="relative w-[10%] aspect-[3/4] flex items-center justify-center"
                >
                  {i < board.fascistPolicies && (
                    <img
                      src={policyFascistImg.src}
                      alt={`Fascist policy ${i + 1}`}
                      className="w-full h-full object-contain scale-pop"
                      draggable={false}
                    />
                  )}
                  {/* Executive power icon */}
                  {power && power !== ExecutivePower.None && i >= board.fascistPolicies && (
                    <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-[9px] opacity-50 leading-none">
                      {EXECUTIVE_POWER_ICONS[power]}
                    </span>
                  )}
                  {/* Veto indicator */}
                  {isVetoSlot && vetoUnlocked && (
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[7px] font-body font-bold text-gold uppercase tracking-wider whitespace-nowrap">
                      VETO
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Election Tracker — compact vertical dots */}
      <div className="flex flex-col items-center gap-1 flex-shrink-0 px-1">
        <span className="text-[8px] font-body text-text-muted uppercase tracking-wider leading-none mb-0.5">
          Elect
        </span>
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className={[
              "w-3 h-3 rounded-full border transition-all duration-[var(--transition-normal)]",
              i < electionTracker.failedElections
                ? "bg-fascist border-fascist-dark shadow-[0_0_6px_rgba(224,91,43,0.6)] scale-pop"
                : "bg-transparent border-text-muted/40",
            ].join(" ")}
          />
        ))}
      </div>
    </div>
  );
}
