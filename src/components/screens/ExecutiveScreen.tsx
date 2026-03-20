/**
 * ExecutiveScreen — All executive power actions in a single component.
 *
 * Switches on the current phase to render the appropriate UI:
 * - ExecutiveInvestigate: Pick a player to investigate
 * - InvestigationResult: See the investigated player's party membership
 * - ExecutivePeek: See the top 3 policies in the deck
 * - ExecutiveSpecialElection: Pick the next president
 * - ExecutiveExecution: Pick a player to execute
 *
 * Layout: flex flex-col h-full — fits inside Game layout (no min-h-dvh).
 */

import { memo, useCallback, useState } from "preact/compat";

import { PartyCard } from "@/components/cards/PartyCard";
import { PolicyCard } from "@/components/cards/PolicyCard";
import { PORTRAITS } from "@/engine/constants";
import { getPartyMembership } from "@/engine/reducer";
import type { GameState, GameAction } from "@/engine/types";
import { GamePhase, PartyMembership } from "@/engine/types";
import { getPolicyKey } from "@/engine/utils";
import { useI18n } from "@/i18n";

const EMPTY_IDS: number[] = [];

interface ScreenProps {
	state: GameState;
	dispatch: (action: GameAction) => void;
}

type ExecutiveScreenProps = ScreenProps & {
	investigableIds?: number[];
	specialElectionEligibleIds?: number[];
	executionEligibleIds?: number[];
};

const PlayerSelectionCard = memo(function PlayerSelectionCard({
	playerId,
	playerName,
	portraitIndex,
	isEligible,
	isSelected,
	dangerConfirm = false,
	onSelect,
}: {
	playerId: number;
	playerName: string;
	portraitIndex: number;
	isEligible: boolean;
	isSelected: boolean;
	dangerConfirm?: boolean;
	onSelect: (id: number) => void;
}) {
	return (
		<button
			type="button"
			onClick={() => isEligible && onSelect(playerId)}
			disabled={!isEligible}
			className={[
				"flex min-h-[118px] flex-col items-center justify-center gap-2 rounded-[20px] border-2 p-3 transition-all duration-[var(--transition-fast)]",
				isSelected
					? dangerConfirm
						? "border-fascist bg-fascist/10 ring-2 ring-fascist/30 scale-[1.03]"
						: "border-gold bg-gold/10 ring-2 ring-gold/30 scale-[1.03]"
					: isEligible
						? "border-text-muted/20 bg-bg-card hover:border-text-secondary cursor-pointer"
						: "border-transparent bg-bg-card/40 opacity-40 cursor-not-allowed",
			].join(" ")}
		>
			<div
				className={[
					"w-12 h-12 rounded-full overflow-hidden border-2",
					isSelected ? (dangerConfirm ? "border-fascist" : "border-gold") : "border-text-muted/30",
				].join(" ")}
			>
				<img
					src={PORTRAITS[portraitIndex]?.src}
					alt={playerName}
					className="h-full w-full object-cover"
					draggable={false}
				/>
			</div>
			<span
				className={[
					"font-body text-xs font-medium text-center leading-tight",
					isSelected ? (dangerConfirm ? "text-fascist" : "text-gold") : "text-text-primary",
				].join(" ")}
			>
				{playerName}
			</span>
		</button>
	);
});

function PlayerSelectionGrid({
	state,
	eligibleIds,
	selectedId,
	onSelect,
	onConfirm,
	confirmLabel,
	dangerConfirm,
}: {
	state: GameState;
	eligibleIds: number[];
	selectedId: number | null;
	onSelect: (id: number) => void;
	onConfirm: () => void;
	confirmLabel: string;
	dangerConfirm?: boolean;
}) {
	const { headingText, messages } = useI18n();
	const eligibleSet = new Set(eligibleIds);
	const alivePlayers = state.players.filter((p) => p.isAlive);
	// Scale columns: ≤4 alive → 2 cols, 5-6 → 3 cols, 7+ → 4 cols
	const colClass = alivePlayers.length <= 4 ? "grid-cols-2" : alivePlayers.length <= 6 ? "grid-cols-3" : "grid-cols-4";

	return (
		<>
			<div className={`grid w-full max-w-4xl ${colClass} gap-3 md:gap-4`}>
				{alivePlayers.map((player) => {
					const isEligible = eligibleSet.has(player.id);
					return (
						<PlayerSelectionCard
							key={player.id}
							playerId={player.id}
							playerName={player.name}
							portraitIndex={player.portraitIndex}
							isEligible={isEligible}
							isSelected={selectedId === player.id}
							dangerConfirm={dangerConfirm}
							onSelect={onSelect}
						/>
					);
				})}
			</div>

			<div className="phase-action-bar max-w-2xl">
				<button
					type="button"
					onClick={onConfirm}
					disabled={selectedId === null}
					className={[
						"flex-shrink-0 w-full rounded-[18px] py-3 font-heading text-xl tracking-wide transition-all duration-[var(--transition-normal)]",
						selectedId !== null
							? dangerConfirm
								? "bg-fascist text-text-primary shadow-[0_6px_0_var(--color-fascist-dark),var(--shadow-card)] hover:bg-fascist-hover active:shadow-[0_2px_0_var(--color-fascist-dark)] active:translate-y-[4px] cursor-pointer"
								: "bg-btn-alt text-text-primary shadow-[0_6px_0_var(--color-btn-alt-shadow),var(--shadow-card)] hover:bg-btn-alt-hover active:shadow-[0_2px_0_var(--color-btn-alt-shadow)] active:translate-y-[4px] cursor-pointer"
							: "bg-btn-disabled text-text-muted cursor-not-allowed",
					].join(" ")}
				>
					{selectedId !== null ? confirmLabel : headingText(messages.common.selectPlayer)}
				</button>
			</div>
		</>
	);
}

export function ExecutiveScreen({
	state,
	dispatch,
	investigableIds = EMPTY_IDS,
	specialElectionEligibleIds = EMPTY_IDS,
	executionEligibleIds = EMPTY_IDS,
}: ExecutiveScreenProps) {
	const { headingText, messages } = useI18n();
	const [selectedId, setSelectedId] = useState<number | null>(null);
	const president = state.players[state.presidentIndex];
	const resetSelectedId = useCallback(() => {
		setSelectedId(null);
	}, []);
	const investigateSelectedPlayer = useCallback(() => {
		if (selectedId !== null) {
			dispatch({ type: "INVESTIGATE_PLAYER", playerId: selectedId });
			resetSelectedId();
		}
	}, [dispatch, resetSelectedId, selectedId]);
	const chooseSpecialElectionPresident = useCallback(() => {
		if (selectedId !== null) {
			dispatch({ type: "SELECT_SPECIAL_ELECTION", playerId: selectedId });
			resetSelectedId();
		}
	}, [dispatch, resetSelectedId, selectedId]);
	const executeSelectedPlayer = useCallback(() => {
		if (selectedId !== null) {
			dispatch({ type: "EXECUTE_PLAYER", playerId: selectedId });
			resetSelectedId();
		}
	}, [dispatch, resetSelectedId, selectedId]);

	if (!president) return null;

	if (state.phase === GamePhase.ExecutiveInvestigate) {
		return (
			<div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-4 px-1 py-2 md:gap-5 md:py-4">
				<div className="slide-up flex-shrink-0 text-center">
					<p className="text-text-muted mb-1 text-[11px] font-semibold tracking-[0.28em] uppercase">
						{messages.executive.executivePower}
					</p>
					<h2 className="font-heading text-gold mb-1 text-3xl">{headingText(messages.executive.investigateTitle)}</h2>
					<p className="text-text-secondary text-sm md:text-base">
						{messages.executive.investigateInstructions(president.name)}
					</p>
				</div>

				<PlayerSelectionGrid
					state={state}
					eligibleIds={investigableIds}
					selectedId={selectedId}
					onSelect={setSelectedId}
					onConfirm={investigateSelectedPlayer}
					confirmLabel={headingText(
						messages.executive.investigateConfirm(state.players.find((p) => p.id === selectedId)?.name ?? ""),
					)}
				/>
			</div>
		);
	}

	if (state.phase === GamePhase.InvestigationResult) {
		const target = state.players.find((p) => p.id === state.investigationTargetId);
		if (!target) return null;

		const membership = getPartyMembership(target);
		const isLiberal = membership === PartyMembership.Liberal;
		return (
			<div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-5 px-1 py-3 md:py-5">
				<div className="slide-up flex-shrink-0 text-center">
					<p className="text-text-muted mb-1 text-[11px] font-semibold tracking-[0.28em] uppercase">
						{messages.executive.investigationResult}
					</p>
					<h2 className="font-heading text-text-primary mb-0.5 text-3xl">{headingText(target.name)}</h2>
					<p className="text-text-secondary text-sm md:text-base">{messages.executive.isPartyMember}</p>
				</div>

				{/* Party membership card */}
				<PartyCard party={membership} className={isLiberal ? "glow-liberal" : "glow-fascist"} />

				<h3 className={["font-heading text-3xl flex-shrink-0", isLiberal ? "text-liberal" : "text-fascist"].join(" ")}>
					{headingText(messages.executive.partyLabel(messages.enums.partyMemberships[membership]))}
				</h3>

				<p className="text-text-muted font-flavor max-w-xs flex-shrink-0 text-center text-xs italic">
					{messages.executive.investigationNote}
				</p>

				<button
					type="button"
					onClick={() => dispatch({ type: "ACKNOWLEDGE_INVESTIGATION" })}
					className="bg-fascist font-heading text-text-primary hover:bg-fascist-hover w-full max-w-2xl flex-shrink-0 cursor-pointer rounded-[18px] py-3 text-xl shadow-[0_6px_0_var(--color-fascist-dark),var(--shadow-card)] transition-all duration-[var(--transition-normal)] active:translate-y-[4px] active:shadow-[0_2px_0_var(--color-fascist-dark)]"
				>
					{headingText(messages.common.understood)}
				</button>
			</div>
		);
	}

	if (state.phase === GamePhase.ExecutivePeek) {
		return (
			<div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-5 px-1 py-3 md:py-4">
				<div className="slide-up flex-shrink-0 text-center">
					<p className="text-text-muted mb-1 text-[11px] font-semibold tracking-[0.28em] uppercase">
						{messages.executive.executivePower}
					</p>
					<h2 className="font-heading text-gold mb-1 text-3xl">{headingText(messages.executive.peekTitle)}</h2>
					<p className="text-text-secondary text-sm md:text-base">
						{messages.executive.peekInstructions(president.name)}
					</p>
				</div>

				{/* Peeked policy cards */}
				<div className="flex flex-shrink-0 items-end gap-4 sm:gap-6">
					{state.peekedPolicies.map((policy, index) => (
						<div key={getPolicyKey(state.peekedPolicies, policy, index)} className="flex flex-col items-center gap-1.5">
							<PolicyCard type={policy} size="lg" revealed />
							<span className="text-text-muted font-body text-xs">{messages.executive.peekPositions[index]}</span>
						</div>
					))}
				</div>

				<p className="text-text-muted font-flavor max-w-xs flex-shrink-0 text-center text-xs italic">
					{messages.executive.peekNote}
				</p>

				<button
					type="button"
					onClick={() => dispatch({ type: "ACKNOWLEDGE_PEEK" })}
					className="bg-fascist font-heading text-text-primary hover:bg-fascist-hover w-full max-w-2xl flex-shrink-0 cursor-pointer rounded-[18px] py-3 text-xl shadow-[0_6px_0_var(--color-fascist-dark),var(--shadow-card)] transition-all duration-[var(--transition-normal)] active:translate-y-[4px] active:shadow-[0_2px_0_var(--color-fascist-dark)]"
				>
					{headingText(messages.common.understood)}
				</button>
			</div>
		);
	}

	if (state.phase === GamePhase.ExecutiveSpecialElection) {
		return (
			<div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-4 px-1 py-2 md:gap-5 md:py-4">
				<div className="slide-up flex-shrink-0 text-center">
					<p className="text-text-muted mb-1 text-[11px] font-semibold tracking-[0.28em] uppercase">
						{messages.executive.executivePower}
					</p>
					<h2 className="font-heading text-gold mb-1 text-3xl">
						{headingText(messages.executive.specialElectionTitle)}
					</h2>
					<p className="text-text-secondary text-sm md:text-base">
						{messages.executive.specialElectionInstructions(president.name)}
					</p>
				</div>

				<PlayerSelectionGrid
					state={state}
					eligibleIds={specialElectionEligibleIds}
					selectedId={selectedId}
					onSelect={setSelectedId}
					onConfirm={chooseSpecialElectionPresident}
					confirmLabel={headingText(
						messages.executive.specialElectionConfirm(state.players.find((p) => p.id === selectedId)?.name ?? ""),
					)}
				/>
			</div>
		);
	}

	if (state.phase === GamePhase.ExecutiveExecution) {
		return (
			<div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-4 px-1 py-2 md:gap-5 md:py-4">
				<div className="slide-up flex-shrink-0 text-center">
					<p className="text-text-muted mb-1 text-[11px] font-semibold tracking-[0.28em] uppercase">
						{messages.executive.executivePower}
					</p>
					<h2 className="font-heading text-fascist mb-1 text-3xl">{headingText(messages.executive.executionTitle)}</h2>
					<p className="text-text-secondary text-sm md:text-base">
						{messages.executive.executionInstructions(president.name)}
					</p>
					<p className="text-text-muted font-flavor mt-1 text-xs italic">{messages.executive.executionWarning}</p>
				</div>

				<PlayerSelectionGrid
					state={state}
					eligibleIds={executionEligibleIds}
					selectedId={selectedId}
					onSelect={setSelectedId}
					onConfirm={executeSelectedPlayer}
					confirmLabel={headingText(
						messages.executive.executionConfirm(state.players.find((p) => p.id === selectedId)?.name ?? ""),
					)}
					dangerConfirm
				/>
			</div>
		);
	}

	return null;
}
