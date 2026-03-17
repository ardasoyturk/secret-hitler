/**
 * ExecutiveScreen — All executive power actions in a single component.
 *
 * Switches on the current phase to render the appropriate UI:
 * - ExecutiveInvestigate: Pick a player to investigate
 * - InvestigationResult: See the investigated player's party membership
 * - ExecutivePeek: See the top 3 policies in the deck
 * - ExecutiveSpecialElection: Pick the next president
 * - ExecutiveExecution: Pick a player to execute
 *
 * Layout: flex flex-col h-full — fits inside Game layout (no min-h-dvh).
 */

import { useState } from "react";
import type { GameState, GameAction } from "@engine/types";
import { GamePhase, PartyMembership } from "@engine/types";
import { getPartyMembership } from "@engine/reducer";
import { PolicyCard } from "@components/cards/PolicyCard";

import partyFascistImg from "@assets/cards/party-membership-fascist.png";
import partyLiberalImg from "@assets/cards/party-membership-liberal.png";

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
  portrait1, portrait2, portrait3, portrait4, portrait5,
  portrait6, portrait7, portrait8, portrait9, portrait10,
  portrait11, portrait12, portrait13, portrait14, portrait15,
  portrait16, portrait17, portrait18, portrait19, portrait20,
];

interface ScreenProps {
  state: GameState;
  dispatch: (action: GameAction) => void;
}

type ExecutiveScreenProps = ScreenProps & {
  investigableIds?: number[];
  specialElectionEligibleIds?: number[];
  executionEligibleIds?: number[];
};

// ── Shared player selection grid ────────────────────────────────────

function PlayerSelectionGrid({
  state,
  eligibleIds,
  selectedId,
  onSelect,
  onConfirm,
  confirmLabel,
  dangerConfirm,
}: {
  state: GameState;
  eligibleIds: number[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onConfirm: () => void;
  confirmLabel: string;
  dangerConfirm?: boolean;
}) {
  const eligibleSet = new Set(eligibleIds);
  const alivePlayers = state.players.filter((p) => p.isAlive);
  // Scale columns: ≤4 alive → 2 cols, 5-6 → 3 cols, 7+ → 4 cols
  const colClass =
    alivePlayers.length <= 4
      ? "grid-cols-2"
      : alivePlayers.length <= 6
        ? "grid-cols-3"
        : "grid-cols-4";

  return (
    <>
      <div className={`w-full max-w-4xl grid ${colClass} gap-3 md:gap-4 flex-1 overflow-y-auto min-h-0`}>
        {alivePlayers.map((player) => {
          const isEligible = eligibleSet.has(player.id);
          const isSelected = selectedId === player.id;

          return (
            <button
              key={player.id}
              type="button"
              onClick={() => isEligible && onSelect(player.id)}
              disabled={!isEligible}
              className={[
                "flex min-h-[118px] flex-col items-center justify-center gap-2 rounded-[20px] border-2 p-3 transition-all duration-[var(--transition-fast)]",
                isSelected
                  ? dangerConfirm
                    ? "border-fascist bg-fascist/10 ring-2 ring-fascist/30 scale-[1.03]"
                    : "border-gold bg-gold/10 ring-2 ring-gold/30 scale-[1.03]"
                  : isEligible
                    ? "border-text-muted/20 bg-bg-card hover:border-text-secondary cursor-pointer"
                    : "border-transparent bg-bg-card/40 opacity-40 cursor-not-allowed",
              ].join(" ")}
            >
              <div
                className={[
                  "w-12 h-12 rounded-full overflow-hidden border-2",
                  isSelected
                    ? dangerConfirm
                      ? "border-fascist"
                      : "border-gold"
                    : "border-text-muted/30",
                ].join(" ")}
              >
                <img
                  src={PORTRAITS[player.portraitIndex]?.src}
                  alt={player.name}
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              </div>
              <span
                className={[
                  "font-body text-xs font-medium text-center leading-tight",
                  isSelected
                    ? dangerConfirm
                      ? "text-fascist"
                      : "text-gold"
                    : "text-text-primary",
                ].join(" ")}
              >
                {player.name}
              </span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onConfirm}
        disabled={selectedId === null}
        className={[
          "flex-shrink-0 w-full max-w-2xl rounded-[18px] py-3 font-heading text-xl tracking-wide transition-all duration-[var(--transition-normal)]",
          selectedId !== null
            ? dangerConfirm
              ? "bg-fascist text-text-primary shadow-[0_6px_0_var(--color-fascist-dark),var(--shadow-card)] hover:bg-fascist-hover active:shadow-[0_2px_0_var(--color-fascist-dark)] active:translate-y-[4px] cursor-pointer"
              : "bg-btn-alt text-text-primary shadow-[0_6px_0_var(--color-btn-alt-shadow),var(--shadow-card)] hover:bg-btn-alt-hover active:shadow-[0_2px_0_var(--color-btn-alt-shadow)] active:translate-y-[4px] cursor-pointer"
            : "bg-btn-disabled text-text-muted cursor-not-allowed",
        ].join(" ")}
      >
        {selectedId !== null ? confirmLabel : "Select a Player"}
      </button>
    </>
  );
}

export function ExecutiveScreen({
  state,
  dispatch,
  investigableIds = [],
  specialElectionEligibleIds = [],
  executionEligibleIds = [],
}: ExecutiveScreenProps) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const president = state.players[state.presidentIndex];

  if (!president) return null;

  // ── INVESTIGATE ───────────────────────────────────────────────────
  if (state.phase === GamePhase.ExecutiveInvestigate) {
    return (
      <div className="mx-auto flex h-full w-full max-w-5xl flex-col items-center gap-4">
        <div className="text-center flex-shrink-0 slide-up">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-text-muted">
            Executive Power
          </p>
          <h2 className="mb-1 font-heading text-3xl text-gold">Investigate Loyalty</h2>
          <p className="text-sm text-text-secondary md:text-base">
            President <span className="text-text-primary font-semibold">{president.name}</span>,
            choose a player to investigate their party membership.
          </p>
        </div>

        <PlayerSelectionGrid
          state={state}
          eligibleIds={investigableIds}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onConfirm={() => {
            if (selectedId !== null) {
              dispatch({ type: "INVESTIGATE_PLAYER", playerId: selectedId });
              setSelectedId(null);
            }
          }}
          confirmLabel={`Investigate ${state.players.find((p) => p.id === selectedId)?.name ?? ""}`}
        />
      </div>
    );
  }

  // ── INVESTIGATION RESULT ──────────────────────────────────────────
  if (state.phase === GamePhase.InvestigationResult) {
    const target = state.players.find((p) => p.id === state.investigationTargetId);
    if (!target) return null;

    const membership = getPartyMembership(target);
    const isLiberal = membership === PartyMembership.Liberal;
    const membershipImg = isLiberal ? partyLiberalImg : partyFascistImg;

    return (
      <div className="mx-auto flex h-full w-full max-w-4xl flex-col items-center justify-center gap-5">
        <div className="text-center flex-shrink-0 slide-up">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-text-muted">
            Investigation Result
          </p>
          <h2 className="mb-0.5 font-heading text-3xl text-text-primary">{target.name}</h2>
          <p className="text-sm text-text-secondary md:text-base">is a member of the...</p>
        </div>

        {/* Party membership card */}
        <div
          className={[
            "w-40 sm:w-48 rounded-[var(--radius-card)] overflow-hidden flex-shrink-0 stamp",
            isLiberal ? "glow-liberal" : "glow-fascist",
          ].join(" ")}
        >
          <img
            src={membershipImg.src}
            alt={`${membership} party membership`}
            className="w-full h-auto block"
            draggable={false}
          />
        </div>

        <h3
          className={[
            "font-heading text-3xl flex-shrink-0",
            isLiberal ? "text-liberal" : "text-fascist",
          ].join(" ")}
        >
          {isLiberal ? "Liberal" : "Fascist"} Party
        </h3>

        <p className="text-text-muted font-flavor text-xs italic max-w-xs text-center flex-shrink-0">
          Only the President knows this information. Use it wisely — or lie about it.
        </p>

        <button
          type="button"
          onClick={() => dispatch({ type: "ACKNOWLEDGE_INVESTIGATION" })}
          className="flex-shrink-0 w-full max-w-2xl rounded-[18px] bg-fascist py-3 font-heading text-xl text-text-primary shadow-[0_6px_0_var(--color-fascist-dark),var(--shadow-card)] transition-all duration-[var(--transition-normal)] hover:bg-fascist-hover active:translate-y-[4px] active:shadow-[0_2px_0_var(--color-fascist-dark)] cursor-pointer"
        >
          Understood
        </button>
      </div>
    );
  }

  // ── POLICY PEEK ───────────────────────────────────────────────────
  if (state.phase === GamePhase.ExecutivePeek) {
    return (
      <div className="mx-auto flex h-full w-full max-w-5xl flex-col items-center justify-center gap-5">
        <div className="text-center flex-shrink-0 slide-up">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-text-muted">
            Executive Power
          </p>
          <h2 className="mb-1 font-heading text-3xl text-gold">Policy Peek</h2>
          <p className="text-sm text-text-secondary md:text-base">
            President <span className="text-text-primary font-semibold">{president.name}</span>,
            here are the top 3 policies in the deck.
          </p>
        </div>

        {/* Peeked policy cards */}
        <div className="flex items-end gap-4 sm:gap-6 flex-shrink-0">
          {state.peekedPolicies.map((policy, index) => (
            <div key={index} className="flex flex-col items-center gap-1.5">
              <PolicyCard type={policy} size="lg" revealed />
              <span className="text-text-muted font-body text-xs">
                {index === 0 ? "Next" : index === 1 ? "2nd" : "3rd"}
              </span>
            </div>
          ))}
        </div>

        <p className="text-text-muted font-flavor text-xs italic max-w-xs text-center flex-shrink-0">
          Only the President knows this. You may share this information — or deceive.
        </p>

        <button
          type="button"
          onClick={() => dispatch({ type: "ACKNOWLEDGE_PEEK" })}
          className="flex-shrink-0 w-full max-w-2xl rounded-[18px] bg-fascist py-3 font-heading text-xl text-text-primary shadow-[0_6px_0_var(--color-fascist-dark),var(--shadow-card)] transition-all duration-[var(--transition-normal)] hover:bg-fascist-hover active:translate-y-[4px] active:shadow-[0_2px_0_var(--color-fascist-dark)] cursor-pointer"
        >
          Understood
        </button>
      </div>
    );
  }

  // ── SPECIAL ELECTION ──────────────────────────────────────────────
  if (state.phase === GamePhase.ExecutiveSpecialElection) {
    return (
      <div className="mx-auto flex h-full w-full max-w-5xl flex-col items-center gap-4">
        <div className="text-center flex-shrink-0 slide-up">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-text-muted">
            Executive Power
          </p>
          <h2 className="mb-1 font-heading text-3xl text-gold">Special Election</h2>
          <p className="text-sm text-text-secondary md:text-base">
            President <span className="text-text-primary font-semibold">{president.name}</span>,
            choose the next Presidential Candidate.
          </p>
        </div>

        <PlayerSelectionGrid
          state={state}
          eligibleIds={specialElectionEligibleIds}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onConfirm={() => {
            if (selectedId !== null) {
              dispatch({ type: "SELECT_SPECIAL_ELECTION", playerId: selectedId });
              setSelectedId(null);
            }
          }}
          confirmLabel={`Appoint ${state.players.find((p) => p.id === selectedId)?.name ?? ""}`}
        />
      </div>
    );
  }

  // ── EXECUTION ─────────────────────────────────────────────────────
  if (state.phase === GamePhase.ExecutiveExecution) {
    return (
      <div className="mx-auto flex h-full w-full max-w-5xl flex-col items-center gap-4">
        <div className="text-center flex-shrink-0 slide-up">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-text-muted">
            Executive Power
          </p>
          <h2 className="mb-1 font-heading text-3xl text-fascist">Execution</h2>
          <p className="text-sm text-text-secondary md:text-base">
            President <span className="text-text-primary font-semibold">{president.name}</span>,
            choose a player to execute.
          </p>
          <p className="text-text-muted font-flavor text-xs italic mt-1">
            This action is irreversible.
          </p>
        </div>

        <PlayerSelectionGrid
          state={state}
          eligibleIds={executionEligibleIds}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onConfirm={() => {
            if (selectedId !== null) {
              dispatch({ type: "EXECUTE_PLAYER", playerId: selectedId });
              setSelectedId(null);
            }
          }}
          confirmLabel={`Execute ${state.players.find((p) => p.id === selectedId)?.name ?? ""}`}
          dangerConfirm
        />
      </div>
    );
  }

  return null;
}
