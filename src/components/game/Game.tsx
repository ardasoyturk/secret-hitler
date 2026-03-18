/**
 * Game — Root React component.
 *
 * Layout contract:
 * - Everything fits in 100dvh with NO scrolling on the outer shell.
 * - During active play: Header (fixed ~40px) + BoardTrack (fixed ~120px)
 *   + screen content (flex-1 overflow-y-auto) = 100dvh.
 * - During Setup / GameOver: full screen, scrollable internally if needed.
 * - Privacy screens (night, voting gates, legislative gates) are fixed overlays.
 */

import { OptimizedAssetsProvider } from "@components/game/OptimizedAssets";
import type { OptimizedAssetMap } from "@components/game/OptimizedAssets";
import { BoardTrack } from "@components/layout/BoardTrack";
// Layout
import { Header } from "@components/layout/Header";
import { ExecutiveScreen } from "@components/screens/ExecutiveScreen";
import { GameOverScreen } from "@components/screens/GameOverScreen";
import { LegislativeScreen } from "@components/screens/LegislativeScreen";
import { NightScreen } from "@components/screens/NightScreen";
import { NominationScreen } from "@components/screens/NominationScreen";
import { PolicyEnactedScreen } from "@components/screens/PolicyEnactedScreen";
// Screens
import { SetupScreen } from "@components/screens/SetupScreen";
import { VetoScreen } from "@components/screens/VetoScreen";
import { VotingScreen } from "@components/screens/VotingScreen";
import { GamePhase } from "@engine/types";
import type { GameState } from "@engine/types";
import { useState } from "react";

import { useGame } from "@/hooks/useGame";
import { clearGameState, loadGameState } from "@/hooks/useGamePersistence";
import { I18nProvider, useI18n } from "@/i18n";

const EMPTY_OPTIMIZED_ASSETS: OptimizedAssetMap = {};

export function Game({ optimizedAssets = EMPTY_OPTIMIZED_ASSETS }: { optimizedAssets?: OptimizedAssetMap }) {
	const [appState, setAppState] = useState<
		{ status: "prompting"; savedState: GameState } | { status: "playing"; initialState: GameState | undefined }
	>(() => {
		const saved = loadGameState();
		return saved ? { status: "prompting", savedState: saved } : { status: "playing", initialState: undefined };
	});

	return (
		<I18nProvider>
			<OptimizedAssetsProvider assets={optimizedAssets}>
				{appState.status === "prompting" ? (
					<ResumePrompt
						savedState={appState.savedState}
						onResume={() => {
							setAppState({ status: "playing", initialState: appState.savedState });
						}}
						onNewGame={() => {
							clearGameState();
							setAppState({ status: "playing", initialState: undefined });
						}}
					/>
				) : (
					<GameInner initialState={appState.initialState} />
				)}
			</OptimizedAssetsProvider>
		</I18nProvider>
	);
}

function GameInner({ initialState }: { initialState: GameState | undefined }) {
	const game = useGame(initialState);
	const { state } = game;

	const isSetup = state.phase === GamePhase.Setup;
	const isGameOver = state.phase === GamePhase.GameOver;
	const isNight = state.phase === GamePhase.NightRound || state.phase === GamePhase.NightReveal;
	const isFullscreen = isSetup || isGameOver || isNight;

	// During active play (not setup/gameover/night):
	// the layout is: Header (shrink-0) + BoardTrack (shrink-0) + Screen (flex-1 overflow auto)
	// Everything must fit in 100dvh.

	if (isFullscreen) {
		// These screens manage their own full-viewport layout
		return (
			<div className="h-dvh w-full overflow-hidden">
				<PhaseRouter phase={state.phase} game={game} />
			</div>
		);
	}

	const president = state.players[state.presidentIndex];
	const chancellor = state.players.find((p) => p.id === state.chancellorNomineeId);
	const trackerPosition =
		state.phase === GamePhase.ChaosPolicy ? 4 : Math.max(0, Math.min(3, state.electionTracker.failedElections)) + 1;

	return (
		<div className="game-shell relative h-dvh w-full overflow-x-hidden overflow-y-auto select-none">
			<div className="relative z-10 min-h-full px-3 pb-5 md:px-5 md:pb-6">
				<div className="game-sticky-stage sticky top-0 z-30 -mx-3 px-3 pb-3 md:-mx-5 md:px-5 md:pb-4">
					<Header
						round={state.round}
						phase={state.phase}
						presidentName={president?.name}
						chancellorName={chancellor?.name}
					/>

					<div className="pt-2 md:pt-3">
						<div className="tabletop-stage mx-auto w-full max-w-7xl rounded-[26px] px-4 py-4 md:px-6 md:py-5">
							<BoardTrack
								board={state.board}
								electionTracker={state.electionTracker}
								playerCount={state.players.length}
								trackerPosition={trackerPosition}
								vetoUnlocked={state.vetoUnlocked}
							/>
						</div>
					</div>
				</div>

				<div className="pt-1 md:pt-2">
					<div className="gameplay-panel mx-auto w-full max-w-7xl px-4 py-4 md:px-6 md:py-6">
						<PhaseRouter phase={state.phase} game={game} />
					</div>
				</div>
			</div>
		</div>
	);
}

function PhaseRouter({ phase, game }: { phase: GamePhase; game: ReturnType<typeof useGame> }) {
	const { state, dispatch } = game;
	const { messages } = useI18n();

	switch (phase) {
		case GamePhase.Setup:
			return <SetupScreen state={state} dispatch={dispatch} />;

		case GamePhase.NightRound:
		case GamePhase.NightReveal:
			return <NightScreen state={state} dispatch={dispatch} />;

		case GamePhase.ChancellorNomination:
			return <NominationScreen state={state} dispatch={dispatch} eligibleIds={game.eligibleChancellorIds} />;

		case GamePhase.Election:
		case GamePhase.VoteCast:
		case GamePhase.VoteResult:
			return <VotingScreen state={state} dispatch={dispatch} />;

		case GamePhase.PresidentLegislation:
		case GamePhase.ChancellorLegislation:
			return <LegislativeScreen state={state} dispatch={dispatch} />;

		case GamePhase.VetoRequested:
			return <VetoScreen state={state} dispatch={dispatch} />;

		case GamePhase.PolicyEnacted:
		case GamePhase.ChaosPolicy:
			return <PolicyEnactedScreen state={state} dispatch={dispatch} />;

		case GamePhase.ExecutiveInvestigate:
		case GamePhase.InvestigationResult:
			return <ExecutiveScreen state={state} dispatch={dispatch} investigableIds={game.investigablePlayerIds} />;

		case GamePhase.ExecutivePeek:
			return <ExecutiveScreen state={state} dispatch={dispatch} />;

		case GamePhase.ExecutiveSpecialElection:
			return (
				<ExecutiveScreen
					state={state}
					dispatch={dispatch}
					specialElectionEligibleIds={game.specialElectionEligibleIds}
				/>
			);

		case GamePhase.ExecutiveExecution:
			return <ExecutiveScreen state={state} dispatch={dispatch} executionEligibleIds={game.executionEligibleIds} />;

		case GamePhase.GameOver:
			return <GameOverScreen state={state} dispatch={dispatch} />;

		default:
			return (
				<div className="flex h-full items-center justify-center">
					<p className="text-text-muted">{messages.common.unknownPhase(phase)}</p>
				</div>
			);
	}
}

function ResumePrompt({
	savedState,
	onResume,
	onNewGame,
}: {
	savedState: GameState;
	onResume: () => void;
	onNewGame: () => void;
}) {
	const { headingText, messages } = useI18n();

	return (
		<div className="bg-bg-darker flex h-dvh w-full flex-col items-center justify-center p-8">
			<h1 className="font-heading text-fascist mb-3 text-4xl">{headingText(messages.resumePrompt.title)}</h1>
			<p className="text-text-secondary mb-1">{messages.resumePrompt.savedGameFound}</p>
			<p className="text-text-primary mb-8 text-xl font-semibold">
				{messages.resumePrompt.summary(savedState.players.length, savedState.round)}
			</p>
			<div className="flex w-full max-w-xs flex-col gap-3">
				<button
					type="button"
					onClick={onResume}
					className="bg-fascist hover:bg-fascist-hover w-full cursor-pointer rounded-lg px-6 py-4 text-lg font-bold text-white shadow-[0_4px_0_var(--color-fascist-dark)] transition-all duration-150 active:translate-y-0.5 active:shadow-[0_2px_0_var(--color-fascist-dark)]"
				>
					{headingText(messages.common.resumeGame)}
				</button>
				<button
					type="button"
					onClick={onNewGame}
					className="bg-bg-card hover:bg-bg-primary border-text-muted/30 w-full cursor-pointer rounded-lg border px-6 py-4 text-lg font-bold text-white shadow-[0_4px_0_var(--color-bg-darker)] transition-all duration-150 active:translate-y-0.5 active:shadow-[0_2px_0_var(--color-bg-darker)]"
				>
					{headingText(messages.common.newGame)}
				</button>
			</div>
		</div>
	);
}
