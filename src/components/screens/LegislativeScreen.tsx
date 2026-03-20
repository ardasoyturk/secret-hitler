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

import { PolicyCard } from "@/components/cards/PolicyCard";
import { PrivacyGate } from "@/components/cards/PrivacyGate";
import type { GameState, GameAction } from "@/engine/types";
import { GamePhase } from "@/engine/types";
import { getPolicyKey } from "@/engine/utils";
import { memo, useCallback, useState } from "preact/compat";

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
			{isSelected && (
				<span className="font-body fade-in text-xs font-semibold tracking-wider uppercase">{selectionLabel}</span>
			)}
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

	// ── President Legislation ─────────────────────────────────────────
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
			<div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-5 px-1 py-3 md:gap-6 md:py-5">
				<div className="slide-up flex-shrink-0 text-center">
					<p className="text-text-muted mb-1 text-[11px] font-semibold tracking-[0.28em] uppercase">
						{messages.legislative.session}
					</p>
					<h2 className="font-heading text-gold mb-1 text-3xl">
						{headingText(messages.legislative.presidentTitle(president.name))}
					</h2>
					<p className="text-text-secondary text-sm md:text-base">{messages.legislative.presidentInstructions}</p>
				</div>

				<div className="flex w-full max-w-3xl flex-wrap items-start justify-center gap-3 md:gap-4">
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
				<div className="phase-action-bar max-w-2xl">
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
							"flex-shrink-0 w-full rounded-[18px] py-3 font-heading text-xl tracking-wide transition-all duration-[var(--transition-normal)]",
							selectedIndex !== null
								? "bg-fascist text-text-primary shadow-[0_6px_0_var(--color-fascist-dark),var(--shadow-card)] hover:bg-fascist-hover active:shadow-[0_2px_0_var(--color-fascist-dark)] active:translate-y-[4px] cursor-pointer"
								: "bg-btn-disabled text-gray-900 cursor-not-allowed",
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

	// ── Chancellor Legislation ────────────────────────────────────────
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
			<div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-5 px-1 py-3 md:gap-6 md:py-5">
				<div className="slide-up flex-shrink-0 text-center">
					<p className="text-text-muted mb-1 text-[11px] font-semibold tracking-[0.28em] uppercase">
						{messages.legislative.session}
					</p>
					<h2 className="font-heading text-gold mb-1 text-3xl">
						{headingText(messages.legislative.chancellorTitle(chancellor.name))}
					</h2>
					<p className="text-text-secondary text-sm md:text-base">{messages.legislative.chancellorInstructions}</p>
				</div>

				<div className="flex w-full max-w-2xl flex-wrap items-start justify-center gap-4 md:gap-6">
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

				<div className="phase-action-bar max-w-2xl space-y-3">
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
							"w-full rounded-[18px] py-3 font-heading text-xl tracking-wide transition-all duration-[var(--transition-normal)]",
							selectedIndex !== null
								? "bg-fascist text-text-primary shadow-[0_6px_0_var(--color-fascist-dark),var(--shadow-card)] hover:bg-fascist-hover active:shadow-[0_2px_0_var(--color-fascist-dark)] active:translate-y-[4px] cursor-pointer"
								: "bg-btn-disabled text-gray-900 cursor-not-allowed",
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
							className="border-fascist/45 text-fascist hover:bg-fascist/10 w-full cursor-pointer rounded-[16px] border-2 bg-transparent py-3 text-base font-semibold transition-all duration-[var(--transition-fast)]"
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
