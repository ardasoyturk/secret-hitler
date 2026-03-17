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
    <div className="mx-auto flex h-full w-full max-w-4xl flex-col items-center justify-center gap-6">
      <div className="text-center slide-up">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-text-muted">
          Veto Requested
        </p>

        <div className="mx-auto mb-5 max-w-lg rounded-[22px] border border-fascist/30 bg-fascist/10 px-6 py-5 shadow-[var(--shadow-card)]">
          <h2 className="mb-2 font-heading text-3xl text-fascist">Veto!</h2>
          <p className="text-sm text-text-secondary md:text-base">
            Chancellor <span className="text-text-primary font-semibold">{chancellor.name}</span>{" "}
            has requested to veto the entire agenda.
          </p>
        </div>

        <p className="mb-1 text-sm text-text-secondary md:text-base">
          President <span className="text-gold font-semibold">{president.name}</span>, do you
          consent?
        </p>
        <p className="mx-auto max-w-md text-xs italic text-text-muted">
          If approved, both policies are discarded and the election tracker advances. If rejected,
          the Chancellor must enact a policy.
        </p>
      </div>

      <div className="w-full max-w-2xl space-y-3">
        <button
          type="button"
          onClick={() => dispatch({ type: "APPROVE_VETO" })}
          className="w-full rounded-[18px] bg-btn-alt py-3 font-heading text-xl tracking-wide text-text-primary shadow-[0_6px_0_var(--color-btn-alt-shadow),var(--shadow-card)] transition-all duration-[var(--transition-normal)] hover:bg-btn-alt-hover active:translate-y-[4px] active:shadow-[0_2px_0_var(--color-btn-alt-shadow)] cursor-pointer"
        >
          Approve Veto
        </button>

        <button
          type="button"
          onClick={() => dispatch({ type: "REJECT_VETO" })}
          className="w-full rounded-[18px] bg-fascist py-3 font-heading text-xl tracking-wide text-text-primary shadow-[0_6px_0_var(--color-fascist-dark),var(--shadow-card)] transition-all duration-[var(--transition-normal)] hover:bg-fascist-hover active:translate-y-[4px] active:shadow-[0_2px_0_var(--color-fascist-dark)] cursor-pointer"
        >
          Reject Veto
        </button>
      </div>
    </div>
  );
}
