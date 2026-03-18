/**
 * VetoScreen — President approves or rejects a veto request.
 *
 * Shown when the Chancellor requests a veto during the
 * ChancellorLegislation phase (after 5 fascist policies enacted).
 */

import type { GameState, GameAction } from "@engine/types";

import { useI18n } from "@/i18n";

interface ScreenProps {
	state: GameState;
	dispatch: (action: GameAction) => void;
}

export function VetoScreen({ state, dispatch }: ScreenProps) {
	const { headingText, messages } = useI18n();
	const president = state.players[state.presidentIndex];
	const chancellor = state.players.find((p) => p.id === state.chancellorNomineeId);

	if (!president || !chancellor) return null;

	return (
		<div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-6 px-1 py-3 md:gap-7 md:py-5">
			<div className="slide-up text-center">
				<p className="text-text-muted mb-3 text-[11px] font-semibold tracking-[0.28em] uppercase">{messages.veto.title}</p>

				<div className="border-fascist/30 bg-fascist/10 mx-auto mb-5 max-w-lg rounded-[22px] border px-6 py-5 shadow-[var(--shadow-card)]">
					<h2 className="font-heading text-fascist mb-2 text-3xl">{headingText(messages.veto.vetoCallout)}</h2>
					<p className="text-text-secondary text-sm md:text-base">{messages.veto.requestDescription(chancellor.name)}</p>
				</div>

				<p className="text-text-secondary mb-1 text-sm md:text-base">{messages.veto.consentPrompt(president.name)}</p>
				<p className="text-text-muted mx-auto max-w-md text-xs italic">{messages.veto.explanation}</p>
			</div>

			<div className="phase-action-bar max-w-2xl space-y-3">
				<button
					type="button"
					onClick={() => dispatch({ type: "APPROVE_VETO" })}
					className="bg-btn-alt font-heading text-text-primary hover:bg-btn-alt-hover w-full cursor-pointer rounded-[18px] py-3 text-xl tracking-wide shadow-[0_6px_0_var(--color-btn-alt-shadow),var(--shadow-card)] transition-all duration-[var(--transition-normal)] active:translate-y-[4px] active:shadow-[0_2px_0_var(--color-btn-alt-shadow)]"
				>
					{headingText(messages.veto.approve)}
				</button>

				<button
					type="button"
					onClick={() => dispatch({ type: "REJECT_VETO" })}
					className="bg-fascist font-heading text-text-primary hover:bg-fascist-hover w-full cursor-pointer rounded-[18px] py-3 text-xl tracking-wide shadow-[0_6px_0_var(--color-fascist-dark),var(--shadow-card)] transition-all duration-[var(--transition-normal)] active:translate-y-[4px] active:shadow-[0_2px_0_var(--color-fascist-dark)]"
				>
					{headingText(messages.veto.reject)}
				</button>
			</div>
		</div>
	);
}
