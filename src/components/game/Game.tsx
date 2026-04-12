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

import { useEffect, useState } from "preact/compat";

import { OptimizedAssetsProvider, type OptimizedAssetMap } from "@/components/game/OptimizedAssets";
import { BoardTrack } from "@/components/layout/BoardTrack";
// Layout
import { Header } from "@/components/layout/Header";
import { ExecutiveScreen } from "@/components/screens/ExecutiveScreen";
import { GameOverScreen } from "@/components/screens/GameOverScreen";
import { LegislativeScreen } from "@/components/screens/LegislativeScreen";
import { NightScreen } from "@/components/screens/NightScreen";
import { NominationScreen } from "@/components/screens/NominationScreen";
import { PolicyEnactedScreen } from "@/components/screens/PolicyEnactedScreen";
// Screens
import { SetupScreen } from "@/components/screens/SetupScreen";
import { VetoScreen } from "@/components/screens/VetoScreen";
import { VotingScreen } from "@/components/screens/VotingScreen";
import { GamePhase } from "@/engine/types";
import type { GameState } from "@/engine/types";
import { useGame } from "@/hooks/useGame";
import { clearGameState, loadGameState } from "@/hooks/useGamePersistence";
import { I18nProvider, useI18n } from "@/i18n";

export function Game({ optimizedAssets = {} }: { optimizedAssets?: OptimizedAssetMap }) {
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
	const [isCompactMobile, setIsCompactMobile] = useState(false);
	const [isLandscape, setIsLandscape] = useState(true);

	useEffect(() => {
		if (typeof window === "undefined") return;

		const narrowPhoneMediaQuery = window.matchMedia("(max-width: 767px)");
		const shortTouchViewportMediaQuery = window.matchMedia("(max-height: 560px) and (pointer: coarse)");
		const landscapeMediaQuery = window.matchMedia("(orientation: landscape)");

		const syncViewportFlags = () => {
			setIsCompactMobile(narrowPhoneMediaQuery.matches || shortTouchViewportMediaQuery.matches);
			setIsLandscape(landscapeMediaQuery.matches);
		};

		syncViewportFlags();

		narrowPhoneMediaQuery.addEventListener("change", syncViewportFlags);
		shortTouchViewportMediaQuery.addEventListener("change", syncViewportFlags);
		landscapeMediaQuery.addEventListener("change", syncViewportFlags);
		window.addEventListener("resize", syncViewportFlags);

		return () => {
			narrowPhoneMediaQuery.removeEventListener("change", syncViewportFlags);
			shortTouchViewportMediaQuery.removeEventListener("change", syncViewportFlags);
			landscapeMediaQuery.removeEventListener("change", syncViewportFlags);
			window.removeEventListener("resize", syncViewportFlags);
		};
	}, []);

	const isSetup = state.phase === GamePhase.Setup;
	const isGameOver = state.phase === GamePhase.GameOver;
	const isNight = state.phase === GamePhase.NightRound || state.phase === GamePhase.NightReveal;
	const isFullscreen = isSetup || isGameOver || isNight;
	const needsLandscape = isCompactMobile && !isSetup && !isLandscape;
	const shouldShowBoardTrack = !isFullscreen && (!isCompactMobile || shouldShowBoardOnPhone(state.phase));

	// During active play (not setup/gameover/night):
	// the layout is: Header (shrink-0) + BoardTrack (shrink-0) + Screen (flex-1 overflow auto)
	// Everything must fit in 100dvh.

	if (isFullscreen) {
		// These screens manage their own full-viewport layout
		return (
			<div className="h-dvh w-full overflow-hidden">
				<PhaseRouter phase={state.phase} game={game} />
				{needsLandscape && <RotateForMobileOverlay />}
			</div>
		);
	}

	const president = state.players[state.presidentIndex];
	const chancellor = state.players.find((p) => p.id === state.chancellorNomineeId);
	const trackerPosition =
		state.phase === GamePhase.ChaosPolicy ? 4 : Math.max(0, Math.min(3, state.electionTracker.failedElections)) + 1;

	return (
		<div className="game-shell relative h-dvh w-full overflow-x-hidden overflow-y-auto select-none">
			<div className="relative z-10 min-h-full px-2.5 pb-3 md:px-5 md:pb-6">
				<div
					className={[
						"game-sticky-stage z-30 -mx-2.5 px-2.5 pb-2 md:-mx-5 md:px-5 md:pb-4",
						isCompactMobile ? "relative" : "sticky top-0",
					].join(" ")}
				>
					<Header
						round={state.round}
						phase={state.phase}
						presidentName={president?.name}
						chancellorName={chancellor?.name}
					/>

					{shouldShowBoardTrack && (
						<div className="pt-1.5 md:pt-3">
							<div className="tabletop-stage mx-auto w-full max-w-7xl rounded-[var(--radius-panel)] px-2 py-2 md:px-6 md:py-5">
								<BoardTrack
									board={state.board}
									electionTracker={state.electionTracker}
									playerCount={state.players.length}
									trackerPosition={trackerPosition}
									vetoUnlocked={state.vetoUnlocked}
									compact={isCompactMobile}
								/>
							</div>
						</div>
					)}
				</div>

				<div className="pt-0.5 md:pt-2">
					<div className="gameplay-panel mx-auto w-full max-w-7xl px-2.5 py-2.5 md:px-6 md:py-6">
						<PhaseRouter phase={state.phase} game={game} />
					</div>
				</div>
			</div>
			{needsLandscape && <RotateForMobileOverlay />}
		</div>
	);
}

function shouldShowBoardOnPhone(phase: GamePhase): boolean {
	switch (phase) {
		case GamePhase.ChancellorNomination:
		case GamePhase.Election:
		case GamePhase.VoteCast:
		case GamePhase.VoteResult:
		case GamePhase.PresidentLegislation:
		case GamePhase.ChancellorLegislation:
		case GamePhase.VetoRequested:
		case GamePhase.ExecutiveInvestigate:
		case GamePhase.InvestigationResult:
		case GamePhase.ExecutivePeek:
		case GamePhase.ExecutiveSpecialElection:
		case GamePhase.ExecutiveExecution:
		case GamePhase.PolicyEnacted:
		case GamePhase.ChaosPolicy:
			return true;
		default:
			return false;
	}
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
				<button type="button" onClick={onResume} className="btn-primary w-full py-4">
					{headingText(messages.common.resumeGame)}
				</button>
				<button type="button" onClick={onNewGame} className="btn-ghost w-full py-4">
					{headingText(messages.common.newGame)}
				</button>
			</div>
		</div>
	);
}

function RotateForMobileOverlay() {
	const { headingText, messages } = useI18n();

	return (
		<div className="mobile-rotate-overlay">
			<div className="mobile-rotate-dialog">
				<h2 className="font-heading text-gold text-4xl leading-none">{headingText(messages.mobile.rotateTitle)}</h2>
				<p className="text-text-secondary mt-3 text-center text-sm">{messages.mobile.rotateDescription}</p>
				<p className="text-text-muted mt-2 text-center text-xs">{messages.mobile.setupPortraitHint}</p>
			</div>
		</div>
	);
}
