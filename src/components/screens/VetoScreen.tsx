/**
 * VetoScreen — President approves or rejects a veto request.
 *
 * Shown when the Chancellor requests a veto during the
 * ChancellorLegislation phase (after 5 fascist policies enacted).
 */

import type { GameState, GameAction } from "@/engine/types";
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
		<div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-4 px-1 py-2 md:gap-7 md:py-5">
			<div className="slide-up text-center">
				<p className="section-label mb-2">{messages.veto.title}</p>

				<div className="border-fascist/30 bg-fascist/10 mx-auto mb-4 max-w-lg rounded-[var(--radius-panel)] border px-4 py-3.5 shadow-[var(--shadow-card)] md:px-6 md:py-5">
					<h2 className="font-heading text-fascist mb-1 text-2xl md:mb-2 md:text-3xl">{headingText(messages.veto.vetoCallout)}</h2>
					<p className="text-text-secondary text-xs md:text-base">
						{messages.veto.requestDescription(chancellor.name)}
					</p>
				</div>

				<p className="text-text-secondary mb-1 text-xs md:text-base">{messages.veto.consentPrompt(president.name)}</p>
				<p className="text-text-muted mx-auto max-w-md text-xs italic">{messages.veto.explanation}</p>
			</div>

			<div className="phase-action-bar max-w-2xl space-y-2.5 pt-2 md:space-y-3 md:pt-4">
				<button type="button" onClick={() => dispatch({ type: "APPROVE_VETO" })} className="btn-secondary w-full">
					{headingText(messages.veto.approve)}
				</button>

				<button type="button" onClick={() => dispatch({ type: "REJECT_VETO" })} className="btn-primary w-full">
					{headingText(messages.veto.reject)}
				</button>
			</div>
		</div>
	);
}
