/**
 * PolicyEnactedScreen — Dramatic reveal of the enacted policy.
 *
 * Also handles the ChaosPolicy phase (3 failed elections → auto-enacted).
 */

import { PolicyCard } from "@/components/cards/PolicyCard";
import type { GameState, GameAction } from "@/engine/types";
import { GamePhase, PolicyType } from "@/engine/types";

import { useI18n } from "@/i18n";

interface ScreenProps {
	state: GameState;
	dispatch: (action: GameAction) => void;
}

export function PolicyEnactedScreen({ state, dispatch }: ScreenProps) {
	const { headingText, messages } = useI18n();
	const policy = state.lastEnactedPolicy;
	const isChaos = state.phase === GamePhase.ChaosPolicy;

	if (!policy) return null;

	const isLiberal = policy === PolicyType.Liberal;
	const teamLabel = messages.enums.policyTypes[policy];
	const teamColor = isLiberal ? "text-liberal" : "text-fascist";
	const glowClass = isLiberal ? "glow-liberal" : "glow-fascist";
	const bgAccent = isLiberal ? "bg-liberal-deep/20" : "bg-fascist-deep/20";

	return (
		<div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-5 px-1 py-3 md:gap-6 md:py-5">
			{isChaos && (
				<div className="slide-up flex-shrink-0 text-center">
					<h3 className="font-heading text-fascist mb-1 text-2xl">{headingText(messages.policyEnacted.chaosTitle)}</h3>
					<p className="text-text-secondary max-w-md text-sm">{messages.policyEnacted.chaosDescription}</p>
				</div>
			)}

			<div
				className={[
					"w-full max-w-3xl rounded-[24px] px-6 py-6 flex-shrink-0 border border-white/8 shadow-[var(--shadow-card)]",
					bgAccent,
				].join(" ")}
			>
				<p className="text-text-secondary mb-5 text-center text-[11px] font-semibold tracking-[0.28em] uppercase">
					{isChaos ? messages.policyEnacted.chaosPolicy : messages.policyEnacted.policyEnacted}
				</p>

				<div className="flex flex-col items-center gap-4 md:flex-row md:items-center md:justify-center md:gap-7">
					<div className={["stamp", glowClass].join(" ")}>
						<PolicyCard type={policy} size="md" revealed />
					</div>

					<div className="text-center md:text-left">
						<h2 className={["mb-1 font-heading text-4xl", teamColor].join(" ")}>
							{headingText(messages.policyEnacted.policyTitle(teamLabel))}
						</h2>
						<p className="text-text-secondary text-base">{messages.policyEnacted.hasBeenEnacted}</p>
					</div>
				</div>
			</div>

			<div className="bg-bg-card/70 flex flex-shrink-0 items-center gap-8 rounded-full border border-white/8 px-8 py-3">
				<div className="text-center">
					<p className="text-liberal font-heading text-2xl">{state.board.liberalPolicies}</p>
					<p className="text-text-muted font-body text-xs tracking-wider uppercase">{messages.enums.teams.liberal}</p>
				</div>
				<div className="bg-text-muted/30 h-6 w-px" />
				<div className="text-center">
					<p className="text-fascist font-heading text-2xl">{state.board.fascistPolicies}</p>
					<p className="text-text-muted font-body text-xs tracking-wider uppercase">{messages.enums.teams.fascist}</p>
				</div>
			</div>

			{/* Veto power notification */}
			{state.vetoUnlocked && state.board.fascistPolicies === 5 && !isChaos && (
				<div className="bg-fascist/10 border-fascist/30 max-w-sm flex-shrink-0 rounded-[var(--radius-button)] border px-4 py-2.5 text-center">
					<p className="text-fascist font-body text-sm font-semibold">{messages.policyEnacted.vetoUnlocked}</p>
					<p className="text-text-muted font-body mt-0.5 text-xs">{messages.policyEnacted.vetoUnlockedDescription}</p>
				</div>
			)}

			<div className="phase-action-bar max-w-2xl">
				<button
					type="button"
					onClick={() =>
						dispatch({
							type: isChaos ? "ACKNOWLEDGE_CHAOS" : "ACKNOWLEDGE_POLICY",
						})
					}
					className="bg-fascist font-heading text-text-primary hover:bg-fascist-hover w-full flex-shrink-0 cursor-pointer rounded-[18px] py-3 text-xl shadow-[0_6px_0_var(--color-fascist-dark),var(--shadow-card)] transition-all duration-[var(--transition-normal)] active:translate-y-[4px] active:shadow-[0_2px_0_var(--color-fascist-dark)]"
				>
					{headingText(messages.common.continue)}
				</button>
			</div>
		</div>
	);
}
