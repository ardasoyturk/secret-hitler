/**
 * LegislativeScreen — President and Chancellor legislative session.
 *
 * Two phases:
 * - PresidentLegislation: Privacy gate → President sees 3 cards, discards 1.
 * - ChancellorLegislation: Privacy gate → Chancellor sees 2 cards, enacts 1.
 *   If veto is unlocked, a "Request Veto" button is available.
 *
 * Layout: flex flex-col h-full — fits inside Game layout (no min-h-dvh).
 * Privacy gates use .privacy-screen (fixed overlay).
 */

import { memo, useCallback, useState } from "preact/compat";

import { PolicyCard } from "@/components/cards/PolicyCard";
import { PrivacyGate } from "@/components/cards/PrivacyGate";
import type { GameState, GameAction } from "@/engine/types";
import { GamePhase } from "@/engine/types";
import { getPolicyKey } from "@/engine/utils";
import { useI18n } from "@/i18n";

interface ScreenProps {
	state: GameState;
	dispatch: (action: GameAction) => void;
}

const PolicyChoice = memo(function PolicyChoice({
	policy,
	index,
	isSelected,
	selectionLabel,
	onSelectIndex,
}: {
	policy: "liberal" | "fascist";
	index: number;
	isSelected: boolean;
	selectionLabel: string;
	onSelectIndex: (index: number) => void;
}) {
	return (
		<div className="flex flex-col items-center gap-2">
			<PolicyCard type={policy} size="lg" onClick={() => onSelectIndex(index)} selected={isSelected} />
			{isSelected && <span className="label-text fade-in font-semibold">{selectionLabel}</span>}
		</div>
	);
});

export function LegislativeScreen({ state, dispatch }: ScreenProps) {
	const { headingText, messages } = useI18n();
	const [showPrivacy, setShowPrivacy] = useState(true);
	const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
	const toggleSelectedIndex = useCallback((index: number) => {
		setSelectedIndex((current) => (current === index ? null : index));
	}, []);

	const president = state.players[state.presidentIndex];
	const chancellor = state.players.find((p) => p.id === state.chancellorNomineeId);

	if (state.phase === GamePhase.PresidentLegislation) {
		if (!president) return null;

		if (showPrivacy) {
			return (
				<PrivacyGate
					playerName={president.name}
					onReady={() => {
						setShowPrivacy(false);
						setSelectedIndex(null);
					}}
				/>
			);
		}

		return (
			<div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-3 px-1 py-2 md:gap-6 md:py-5">
				<div className="slide-up flex-shrink-0 text-center">
					<p className="section-label mb-1">{messages.legislative.session}</p>
					<h2 className="font-heading text-gold mb-1 text-2xl md:text-3xl">
						{headingText(messages.legislative.presidentTitle(president.name))}
					</h2>
					<p className="text-text-secondary text-xs md:text-base">{messages.legislative.presidentInstructions}</p>
				</div>

				<div className="mobile-card-strip flex w-full max-w-3xl items-start justify-center gap-3 md:flex-wrap md:justify-center md:gap-4">
					{state.presidentHand.map((policy, index) => (
						<PolicyChoice
							key={getPolicyKey(state.presidentHand, policy, index)}
							policy={policy}
							index={index}
							isSelected={selectedIndex === index}
							selectionLabel={messages.legislative.discard}
							onSelectIndex={toggleSelectedIndex}
						/>
					))}
				</div>

				{/* Confirm discard */}
				<div className="phase-action-bar max-w-2xl pt-2 md:pt-4">
					<button
						type="button"
						onClick={() => {
							if (selectedIndex !== null) {
								dispatch({ type: "PRESIDENT_DISCARD", policyIndex: selectedIndex });
								setShowPrivacy(true);
								setSelectedIndex(null);
							}
						}}
						disabled={selectedIndex === null}
						className={[
							"flex-shrink-0 w-full rounded-[var(--radius-button)] py-3 font-heading text-xl tracking-wide transition-all duration-[var(--transition-normal)]",
							selectedIndex !== null
								? "bg-fascist text-text-primary shadow-[0_6px_0_var(--color-fascist-dark),var(--shadow-card)] hover:bg-fascist-hover active:shadow-[0_2px_0_var(--color-fascist-dark)] active:translate-y-[4px] cursor-pointer"
								: "bg-btn-disabled text-text-muted cursor-not-allowed",
						].join(" ")}
					>
						{headingText(
							selectedIndex !== null
								? messages.legislative.discardSelectedPolicy
								: messages.legislative.tapPolicyToDiscard,
						)}
					</button>
				</div>
			</div>
		);
	}

	if (state.phase === GamePhase.ChancellorLegislation) {
		if (!chancellor) return null;

		if (showPrivacy) {
			return (
				<PrivacyGate
					playerName={chancellor.name}
					onReady={() => {
						setShowPrivacy(false);
						setSelectedIndex(null);
					}}
				/>
			);
		}

		return (
			<div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-3 px-1 py-2 md:gap-6 md:py-5">
				<div className="slide-up flex-shrink-0 text-center">
					<p className="section-label mb-1">{messages.legislative.session}</p>
					<h2 className="font-heading text-gold mb-1 text-2xl md:text-3xl">
						{headingText(messages.legislative.chancellorTitle(chancellor.name))}
					</h2>
					<p className="text-text-secondary text-xs md:text-base">{messages.legislative.chancellorInstructions}</p>
				</div>

				<div className="mobile-card-strip flex w-full max-w-2xl items-start justify-center gap-4 md:flex-wrap md:justify-center md:gap-6">
					{state.chancellorHand.map((policy, index) => (
						<PolicyChoice
							key={getPolicyKey(state.chancellorHand, policy, index)}
							policy={policy}
							index={index}
							isSelected={selectedIndex === index}
							selectionLabel={messages.legislative.enact}
							onSelectIndex={toggleSelectedIndex}
						/>
					))}
				</div>

				<div className="phase-action-bar max-w-2xl space-y-2.5 pt-2 md:space-y-3 md:pt-4">
					<button
						type="button"
						onClick={() => {
							if (selectedIndex !== null) {
								dispatch({ type: "CHANCELLOR_ENACT", policyIndex: selectedIndex });
								setShowPrivacy(true);
								setSelectedIndex(null);
							}
						}}
						disabled={selectedIndex === null}
						className={[
							"w-full rounded-[var(--radius-button)] py-3 font-heading text-xl tracking-wide transition-all duration-[var(--transition-normal)]",
							selectedIndex !== null
								? "bg-fascist text-text-primary shadow-[0_6px_0_var(--color-fascist-dark),var(--shadow-card)] hover:bg-fascist-hover active:shadow-[0_2px_0_var(--color-fascist-dark)] active:translate-y-[4px] cursor-pointer"
								: "bg-btn-disabled text-text-muted cursor-not-allowed",
						].join(" ")}
					>
						{headingText(
							selectedIndex !== null ? messages.legislative.enactSelectedPolicy : messages.legislative.tapPolicyToEnact,
						)}
					</button>

					{/* Veto button — only when veto power is unlocked */}
					{state.vetoUnlocked && (
						<button
							type="button"
							onClick={() => dispatch({ type: "REQUEST_VETO" })}
							className="btn-ghost border-fascist/45 text-fascist hover:bg-fascist/10 w-full"
						>
							{messages.legislative.requestVeto}
						</button>
					)}
				</div>
			</div>
		);
	}

	return null;
}
