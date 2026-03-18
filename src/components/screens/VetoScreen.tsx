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
		<div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-6 px-1 py-3 md:gap-7 md:py-5">
			<div className="slide-up text-center">
				<p className="text-text-muted mb-3 text-[11px] font-semibold tracking-[0.28em] uppercase">Veto Requested</p>

				<div className="border-fascist/30 bg-fascist/10 mx-auto mb-5 max-w-lg rounded-[22px] border px-6 py-5 shadow-[var(--shadow-card)]">
					<h2 className="font-heading text-fascist mb-2 text-3xl">Veto!</h2>
					<p className="text-text-secondary text-sm md:text-base">
						Chancellor <span className="text-text-primary font-semibold">{chancellor.name}</span> has requested to veto
						the entire agenda.
					</p>
				</div>

				<p className="text-text-secondary mb-1 text-sm md:text-base">
					President <span className="text-gold font-semibold">{president.name}</span>, do you consent?
				</p>
				<p className="text-text-muted mx-auto max-w-md text-xs italic">
					If approved, both policies are discarded and the election tracker advances. If rejected, the Chancellor must
					enact a policy.
				</p>
			</div>

			<div className="phase-action-bar max-w-2xl space-y-3">
				<button
					type="button"
					onClick={() => dispatch({ type: "APPROVE_VETO" })}
					className="bg-btn-alt font-heading text-text-primary hover:bg-btn-alt-hover w-full cursor-pointer rounded-[18px] py-3 text-xl tracking-wide shadow-[0_6px_0_var(--color-btn-alt-shadow),var(--shadow-card)] transition-all duration-[var(--transition-normal)] active:translate-y-[4px] active:shadow-[0_2px_0_var(--color-btn-alt-shadow)]"
				>
					Approve Veto
				</button>

				<button
					type="button"
					onClick={() => dispatch({ type: "REJECT_VETO" })}
					className="bg-fascist font-heading text-text-primary hover:bg-fascist-hover w-full cursor-pointer rounded-[18px] py-3 text-xl tracking-wide shadow-[0_6px_0_var(--color-fascist-dark),var(--shadow-card)] transition-all duration-[var(--transition-normal)] active:translate-y-[4px] active:shadow-[0_2px_0_var(--color-fascist-dark)]"
				>
					Reject Veto
				</button>
			</div>
		</div>
	);
}
