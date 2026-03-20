/**
 * NominationScreen — President nominates a Chancellor.
 *
 * Compact layout: fits in the remaining viewport height after header+board.
 * Player grid with ineligibility reasons, confirm button pinned to bottom.
 */

import type { GameState, GameAction } from "@engine/types";

import { useI18n } from "@/i18n";
import { PORTRAITS } from "@/engine/constants";
import type { TargetedEvent } from "preact";

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
		<form className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-1 py-3 md:gap-5 md:py-5" onSubmit={handleSubmit}>
			<div className="flex-shrink-0 text-center">
				<p className="text-text-muted mb-1 text-[11px] font-semibold tracking-[0.28em] uppercase">
					{messages.nomination.governmentFormation}
				</p>
				<h2 className="font-heading text-gold text-3xl leading-tight md:text-4xl">
					{headingText(messages.nomination.title)}
				</h2>
				<p className="text-text-secondary mt-1 text-sm md:text-base">
					{messages.nomination.instructions(president.name)}
				</p>
			</div>

			<div
				className="grid content-start gap-3 md:gap-4"
				style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}
			>
				{state.players.map((player) => {
					const isEligible = eligibleSet.has(player.id);
					const reason = !isEligible ? getIneligibleReason(state, player.id) : null;

					return (
						<label
							key={player.id}
							className={[
								"relative overflow-hidden rounded-[22px] border transition-all duration-150",
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
							<div className="flex min-h-[92px] items-center gap-3 p-3 md:min-h-[96px] md:p-3.5">
								<div
									className={[
										"h-13 w-13 rounded-full overflow-hidden border-2 flex-shrink-0 shadow-[0_8px_16px_rgba(0,0,0,0.22)] md:h-14 md:w-14",
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
											"block truncate text-left text-sm font-medium leading-tight md:text-base",
											"text-text-primary peer-checked:text-gold",
											!isEligible && "text-text-muted",
										].join(" ")}
									>
										{player.name}
									</span>
									<span className="text-text-muted mt-1 block text-left text-[11px] tracking-[0.18em] uppercase">
										{isEligible
											? messages.nomination.eligible
											: reason
												? messages.nomination.ineligibleReasons[reason]
												: messages.nomination.unavailable}
									</span>
								</div>
							</div>
							{reason && (
								<span className="border-text-muted/20 bg-bg-darker/90 text-text-muted absolute top-2 right-2 rounded-full border px-2 py-0.5 text-[10px] font-medium whitespace-nowrap">
									{messages.nomination.ineligibleReasons[reason]}
								</span>
							)}
						</label>
					);
				})}
			</div>

			<div className="phase-action-bar flex flex-shrink-0 justify-center">
				<button
					type="submit"
					className="bg-fascist font-heading hover:bg-fascist-hover w-full max-w-2xl cursor-pointer rounded-[18px] px-6 py-3 text-xl tracking-wide text-white shadow-[0_6px_0_var(--color-fascist-dark),var(--shadow-card)] transition-all duration-200 active:translate-y-[3px] active:shadow-[0_3px_0_var(--color-fascist-dark)]"
				>
					{headingText(messages.nomination.confirm)}
				</button>
			</div>
		</form>
	);
}
