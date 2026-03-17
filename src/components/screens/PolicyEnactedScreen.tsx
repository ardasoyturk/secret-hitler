/**
 * PolicyEnactedScreen — Dramatic reveal of the enacted policy.
 *
 * Also handles the ChaosPolicy phase (3 failed elections → auto-enacted).
 */

import type { GameState, GameAction } from "@engine/types";
import { GamePhase, PolicyType } from "@engine/types";
import { PolicyCard } from "@components/cards/PolicyCard";

interface ScreenProps {
  state: GameState;
  dispatch: (action: GameAction) => void;
}

export function PolicyEnactedScreen({ state, dispatch }: ScreenProps) {
  const policy = state.lastEnactedPolicy;
  const isChaos = state.phase === GamePhase.ChaosPolicy;

  if (!policy) return null;

  const isLiberal = policy === PolicyType.Liberal;
  const teamLabel = isLiberal ? "Liberal" : "Fascist";
  const teamColor = isLiberal ? "text-liberal" : "text-fascist";
  const glowClass = isLiberal ? "glow-liberal" : "glow-fascist";
  const bgAccent = isLiberal ? "bg-liberal-deep/20" : "bg-fascist-deep/20";

  return (
    <div className="mx-auto flex h-full w-full max-w-4xl flex-col items-center justify-center gap-5">
      {isChaos && (
        <div className="text-center flex-shrink-0 slide-up">
          <h3 className="mb-1 font-heading text-2xl text-fascist">The Country Is in Chaos!</h3>
          <p className="max-w-md text-sm text-text-secondary">
            3 elections failed in a row. A policy was enacted automatically from the top of the
            deck.
          </p>
        </div>
      )}

      <div
        className={[
          "w-full max-w-3xl rounded-[24px] px-6 py-6 flex-shrink-0 border border-white/8 shadow-[var(--shadow-card)]",
          bgAccent,
        ].join(" ")}
      >
        <p className="mb-5 text-center text-[11px] font-semibold uppercase tracking-[0.28em] text-text-secondary">
          {isChaos ? "Chaos Policy" : "Policy Enacted"}
        </p>

        <div className="flex flex-col items-center gap-4 md:flex-row md:items-center md:justify-center md:gap-7">
          <div className={["stamp", glowClass].join(" ")}>
            <PolicyCard type={policy} size="md" revealed />
          </div>

          <div className="text-center md:text-left">
            <h2 className={["mb-1 font-heading text-4xl", teamColor].join(" ")}>
              A {teamLabel} Policy
            </h2>
            <p className="text-base text-text-secondary">has been enacted!</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-8 rounded-full border border-white/8 bg-bg-card/70 px-8 py-3 flex-shrink-0">
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

      {/* Veto power notification */}
      {state.vetoUnlocked && state.board.fascistPolicies === 5 && !isChaos && (
        <div className="bg-fascist/10 border border-fascist/30 rounded-[var(--radius-button)] px-4 py-2.5 max-w-sm text-center flex-shrink-0">
          <p className="text-fascist font-body text-sm font-semibold">Veto Power Unlocked!</p>
          <p className="text-text-muted font-body text-xs mt-0.5">
            The Chancellor may now propose to veto the agenda.
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={() =>
          dispatch({
            type: isChaos ? "ACKNOWLEDGE_CHAOS" : "ACKNOWLEDGE_POLICY",
          })
        }
        className="flex-shrink-0 w-full max-w-2xl rounded-[18px] bg-fascist py-3 font-heading text-xl text-text-primary shadow-[0_6px_0_var(--color-fascist-dark),var(--shadow-card)] transition-all duration-[var(--transition-normal)] hover:bg-fascist-hover active:translate-y-[4px] active:shadow-[0_2px_0_var(--color-fascist-dark)] cursor-pointer"
      >
        Continue
      </button>
    </div>
  );
}
