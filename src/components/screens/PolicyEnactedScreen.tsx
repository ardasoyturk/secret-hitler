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
    <div className="flex flex-col items-center justify-center h-full px-4 py-4 gap-4">
      {/* Chaos banner */}
      {isChaos && (
        <div className="text-center flex-shrink-0 slide-up">
          <h3 className="font-heading text-xl text-fascist mb-1">The Country Is in Chaos!</h3>
          <p className="text-text-secondary font-body text-xs max-w-sm">
            3 elections failed in a row. A policy was enacted automatically from the top of the
            deck.
          </p>
        </div>
      )}

      {/* Policy reveal */}
      <div
        className={[
          "flex flex-col items-center px-8 py-5 rounded-[var(--radius-card)] flex-shrink-0",
          bgAccent,
        ].join(" ")}
      >
        <p className="text-text-secondary font-body text-xs uppercase tracking-widest mb-4">
          {isChaos ? "Chaos Policy" : "Policy Enacted"}
        </p>

        {/* Stamp animation wrapper */}
        <div className={["stamp mb-4", glowClass].join(" ")}>
          <PolicyCard type={policy} size="lg" revealed />
        </div>

        <h2 className={["font-heading text-2xl sm:text-3xl mb-1 text-center", teamColor].join(" ")}>
          A {teamLabel} Policy
        </h2>
        <p className="text-text-secondary font-body text-sm">has been enacted!</p>
      </div>

      {/* Board state */}
      <div className="flex items-center gap-8 flex-shrink-0">
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

      {/* Continue */}
      <button
        type="button"
        onClick={() =>
          dispatch({
            type: isChaos ? "ACKNOWLEDGE_CHAOS" : "ACKNOWLEDGE_POLICY",
          })
        }
        className="flex-shrink-0 w-full max-w-md py-3 rounded-[var(--radius-button)] font-heading text-lg bg-fascist text-text-primary shadow-[0_6px_0_var(--color-fascist-dark),var(--shadow-card)] hover:bg-fascist-hover active:shadow-[0_2px_0_var(--color-fascist-dark)] active:translate-y-[4px] transition-all duration-[var(--transition-normal)] cursor-pointer"
      >
        Continue
      </button>
    </div>
  );
}
