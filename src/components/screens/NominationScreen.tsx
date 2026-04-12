/**
 * NominationScreen — President nominates a Chancellor.
 *
 * Compact layout: fits in the remaining viewport height after header+board.
 * Player grid with ineligibility reasons, confirm button pinned to bottom.
 */

import type { TargetedEvent } from "preact";

import { PORTRAITS } from "@/engine/constants";
import type { GameState, GameAction } from "@/engine/types";
import { useI18n } from "@/i18n";

interface ScreenProps {
	state: GameState;
	dispatch: (action: GameAction) => void;
}
type NominationScreenProps = ScreenProps & { eligibleIds: number[] };

function getIneligibleReason(state: GameState, playerId: number): "dead" | "president" | "termLimit" | null {
	const player = state.players.find((p) => p.id === playerId);
	if (!player) return null;
	if (!player.isAlive) return "dead";
	if (playerId === state.players[state.presidentIndex]?.id) return "president";
	if (playerId === state.lastElectedChancellorId) return "termLimit";
	if (playerId === state.lastElectedPresidentId) return "termLimit";
	return null;
}

export function NominationScreen({ state, dispatch, eligibleIds }: NominationScreenProps) {
	const { headingText, messages } = useI18n();
	const president = state.players[state.presidentIndex];

	if (!president) return null;

	const eligibleSet = new Set(eligibleIds);

	function handleSubmit(event: TargetedEvent<HTMLFormElement>) {
		event.preventDefault();

		const formData = new FormData(event.currentTarget);
		const rawSelectedId = formData.get("chancellor");
		const selectedId = typeof rawSelectedId === "string" ? Number(rawSelectedId) : Number.NaN;

		if (!Number.isInteger(selectedId)) return;

		dispatch({ type: "NOMINATE_CHANCELLOR", playerId: selectedId });
	}

	return (
		<form className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-0.5 py-1.5 md:gap-5 md:px-1 md:py-5" onSubmit={handleSubmit}>
			<div className="flex-shrink-0 text-center">
				<p className="section-label mb-1">{messages.nomination.governmentFormation}</p>
				<h2 className="font-heading text-gold text-xl leading-tight md:text-4xl">
					{headingText(messages.nomination.title)}
				</h2>
				<p className="text-text-secondary mt-0.5 text-[11px] md:mt-1 md:text-base">
					{messages.nomination.instructions(president.name)}
				</p>
			</div>

			<div
				className="grid content-start gap-2 md:gap-4"
				style={{ gridTemplateColumns: "repeat(auto-fit, minmax(118px, 1fr))" }}
			>
				{state.players.map((player) => {
					const isEligible = eligibleSet.has(player.id);
					const reason = !isEligible ? getIneligibleReason(state, player.id) : null;

					return (
						<label
							key={player.id}
							className={[
								"relative overflow-hidden rounded-[var(--radius-panel)] border transition-all duration-150",
								isEligible
									? "border-white/8 bg-bg-card/80 cursor-pointer hover:border-gold/35 has-[:checked]:border-gold/45 has-[:checked]:bg-gold/8 has-[:checked]:shadow-[0_0_0_1px_rgba(255,202,97,0.24)]"
									: "border-transparent bg-bg-card/40 opacity-45 cursor-not-allowed",
							].join(" ")}
						>
							<input
								type="radio"
								name="chancellor"
								value={player.id}
								disabled={!isEligible}
								className="peer sr-only"
								required
							/>
							<div className="via-gold/35 absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent to-transparent opacity-0 transition-opacity duration-150 peer-checked:opacity-100" />
							<div className="flex min-h-[64px] items-center gap-2 p-2 md:min-h-[96px] md:gap-3 md:p-3.5">
								<div
									className={[
										"h-9 w-9 rounded-full overflow-hidden border-2 flex-shrink-0 shadow-[0_8px_16px_rgba(0,0,0,0.22)] md:h-14 md:w-14",
										"border-text-muted/30 peer-checked:border-gold",
										!isEligible && "grayscale",
									].join(" ")}
								>
									<img
										src={PORTRAITS[player.portraitIndex]?.src}
										alt={player.name}
										className="h-full w-full object-cover"
										draggable={false}
									/>
								</div>
								<div className="min-w-0 flex-1">
									<span
										className={[
											"block truncate text-left text-[11px] font-medium leading-tight md:text-base",
											"text-text-primary peer-checked:text-gold",
											!isEligible && "text-text-muted",
										].join(" ")}
									>
										{player.name}
									</span>
									<span className="label-text mt-0.5 block text-left md:mt-1">
										{isEligible
											? messages.nomination.eligible
											: reason
												? messages.nomination.ineligibleReasons[reason]
												: messages.nomination.unavailable}
									</span>
								</div>
							</div>
							{reason && (
								<span className="border-text-muted/20 bg-bg-darker/90 text-text-muted absolute top-1.5 right-1.5 hidden rounded-[var(--radius-button)] border px-1.5 py-0.5 text-[9px] font-medium whitespace-nowrap sm:block md:top-2 md:right-2 md:px-2 md:text-[10px]">
									{messages.nomination.ineligibleReasons[reason]}
								</span>
							)}
						</label>
					);
				})}
			</div>

			<div className="phase-action-bar flex flex-shrink-0 justify-center pt-1 md:pt-4">
				<button type="submit" className="btn-primary w-full max-w-2xl py-2.5 text-lg md:py-3 md:text-xl">
					{headingText(messages.nomination.confirm)}
				</button>
			</div>
		</form>
	);
}
