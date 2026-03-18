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

import { useEffect, useState } from "react";
import { useGame } from "@/hooks/useGame";
import { useGamePersistence, loadGameState, clearGameState } from "@/hooks/useGamePersistence";
import { GamePhase } from "@engine/types";
import type { GameState } from "@engine/types";

// Screens
import { SetupScreen } from "@components/screens/SetupScreen";
import { NightScreen } from "@components/screens/NightScreen";
import { NominationScreen } from "@components/screens/NominationScreen";
import { VotingScreen } from "@components/screens/VotingScreen";
import { LegislativeScreen } from "@components/screens/LegislativeScreen";
import { PolicyEnactedScreen } from "@components/screens/PolicyEnactedScreen";
import { ExecutiveScreen } from "@components/screens/ExecutiveScreen";
import { VetoScreen } from "@components/screens/VetoScreen";
import { GameOverScreen } from "@components/screens/GameOverScreen";

// Layout
import { Header } from "@components/layout/Header";
import { BoardTrack } from "@components/layout/BoardTrack";
import {
  OptimizedAssetsProvider,
} from "@components/game/OptimizedAssets";
import type { OptimizedAssetMap } from "@components/game/OptimizedAssets";

export function Game({
  optimizedAssets = {},
}: {
  optimizedAssets?: OptimizedAssetMap;
}) {
  const [appState, setAppState] = useState<
    | { status: "checking" }
    | { status: "prompting"; savedState: GameState }
    | { status: "playing"; initialState: GameState | undefined }
  >({ status: "checking" });

  useEffect(() => {
    if (appState.status === "checking") {
      const saved = loadGameState();
      if (saved) {
        setAppState({ status: "prompting", savedState: saved });
      } else {
        setAppState({ status: "playing", initialState: undefined });
      }
    }
  }, [appState.status]);

  if (appState.status === "checking") {
    return null;
  }

  if (appState.status === "prompting") {
    return (
      <OptimizedAssetsProvider assets={optimizedAssets}>
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
      </OptimizedAssetsProvider>
    );
  }

  return (
    <OptimizedAssetsProvider assets={optimizedAssets}>
      <GameInner initialState={appState.initialState} />
    </OptimizedAssetsProvider>
  );
}

function GameInner({ initialState }: { initialState: GameState | undefined }) {
  const game = useGame(initialState);
  const { state } = game;

  useGamePersistence(state);

  const isSetup = state.phase === GamePhase.Setup;
  const isGameOver = state.phase === GamePhase.GameOver;
  const isNight =
    state.phase === GamePhase.NightRound || state.phase === GamePhase.NightReveal;
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

  return (
    <div className="game-shell relative h-dvh w-full overflow-y-auto overflow-x-hidden select-none">
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

  switch (phase) {
    case GamePhase.Setup:
      return <SetupScreen state={state} dispatch={dispatch} />;

    case GamePhase.NightRound:
    case GamePhase.NightReveal:
      return <NightScreen state={state} dispatch={dispatch} />;

    case GamePhase.ChancellorNomination:
      return (
        <NominationScreen
          state={state}
          dispatch={dispatch}
          eligibleIds={game.eligibleChancellorIds}
        />
      );

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
      return (
        <ExecutiveScreen
          state={state}
          dispatch={dispatch}
          investigableIds={game.investigablePlayerIds}
        />
      );

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
      return (
        <ExecutiveScreen
          state={state}
          dispatch={dispatch}
          executionEligibleIds={game.executionEligibleIds}
        />
      );

    case GamePhase.GameOver:
      return <GameOverScreen state={state} dispatch={dispatch} />;

    default:
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-text-muted">Unknown phase: {phase}</p>
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
  return (
    <div className="h-dvh w-full flex flex-col items-center justify-center p-8 bg-bg-darker">
      <h1 className="font-heading text-4xl text-fascist mb-3">Game in Progress</h1>
      <p className="text-text-secondary mb-1">A saved game was found:</p>
      <p className="text-text-primary text-xl mb-8 font-semibold">
        {savedState.players.length} players &middot; Round {savedState.round}
      </p>
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button
          type="button"
          onClick={onResume}
          className="w-full py-4 px-6 rounded-lg font-bold text-lg text-white
            bg-fascist hover:bg-fascist-hover active:translate-y-0.5
            shadow-[0_4px_0_var(--color-fascist-dark)] active:shadow-[0_2px_0_var(--color-fascist-dark)]
            transition-all duration-150 cursor-pointer"
        >
          Resume Game
        </button>
        <button
          type="button"
          onClick={onNewGame}
          className="w-full py-4 px-6 rounded-lg font-bold text-lg text-white
            bg-bg-card hover:bg-bg-primary active:translate-y-0.5
            shadow-[0_4px_0_var(--color-bg-darker)] active:shadow-[0_2px_0_var(--color-bg-darker)]
            transition-all duration-150 border border-text-muted/30 cursor-pointer"
        >
          New Game
        </button>
      </div>
    </div>
  );
}
