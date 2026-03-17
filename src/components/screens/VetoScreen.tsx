/**
 * VetoScreen — President approves or rejects a veto request.
 *
 * Shown when the Chancellor requests a veto during the
 * ChancellorLegislation phase (after 5 fascist policies enacted).
 */

import type { GameState, GameAction } from "@engine/types";

interface ScreenProps {
  state: GameState;
  dispatch: (action: GameAction) => void;
}

export function VetoScreen({ state, dispatch }: ScreenProps) {
  const president = state.players[state.presidentIndex];
  const chancellor = state.players.find((p) => p.id === state.chancellorNomineeId);

  if (!president || !chancellor) return null;

  return (
    <div className="flex flex-col items-center justify-center h-full px-4 py-4">
      <div className="text-center mb-6 slide-up">
        <p className="text-text-muted font-body text-xs uppercase tracking-widest mb-3">
          Veto Requested
        </p>

        {/* Warning banner */}
        <div className="bg-fascist/10 border border-fascist/30 rounded-[var(--radius-card)] px-5 py-4 mb-5 max-w-sm mx-auto">
          <h2 className="font-heading text-2xl text-fascist mb-2">Veto!</h2>
          <p className="text-text-secondary font-body text-sm">
            Chancellor <span className="text-text-primary font-semibold">{chancellor.name}</span>{" "}
            has requested to veto the entire agenda.
          </p>
        </div>

        <p className="text-text-secondary font-body text-sm mb-1">
          President <span className="text-gold font-semibold">{president.name}</span>, do you
          consent?
        </p>
        <p className="text-text-muted font-flavor text-xs italic max-w-xs mx-auto">
          If approved, both policies are discarded and the election tracker advances. If rejected,
          the Chancellor must enact a policy.
        </p>
      </div>

      {/* Decision buttons */}
      <div className="w-full max-w-md space-y-2">
        <button
          type="button"
          onClick={() => dispatch({ type: "APPROVE_VETO" })}
          className="w-full py-3 rounded-[var(--radius-button)] font-heading text-lg tracking-wide bg-btn-alt text-text-primary shadow-[0_6px_0_var(--color-btn-alt-shadow),var(--shadow-card)] hover:bg-btn-alt-hover active:shadow-[0_2px_0_var(--color-btn-alt-shadow)] active:translate-y-[4px] transition-all duration-[var(--transition-normal)] cursor-pointer"
        >
          Approve Veto
        </button>

        <button
          type="button"
          onClick={() => dispatch({ type: "REJECT_VETO" })}
          className="w-full py-3 rounded-[var(--radius-button)] font-heading text-lg tracking-wide bg-fascist text-text-primary shadow-[0_6px_0_var(--color-fascist-dark),var(--shadow-card)] hover:bg-fascist-hover active:shadow-[0_2px_0_var(--color-fascist-dark)] active:translate-y-[4px] transition-all duration-[var(--transition-normal)] cursor-pointer"
        >
          Reject Veto
        </button>
      </div>
    </div>
  );
}
