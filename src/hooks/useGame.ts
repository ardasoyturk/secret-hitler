/**
 * useGame — Core game state hook.
 *
 * Wraps the pure reducer with React state management.
 * Provides dispatch and derived selectors.
 * Accepts an optional initial state for resuming saved games.
 */

import { HITLER_KNOWS_FASCISTS_MAX_PLAYERS } from "@engine/constants";
import {
	getEligibleChancellorIds,
	getInvestigablePlayerIds,
	getSpecialElectionEligibleIds,
	getExecutionEligibleIds,
	getAlivePlayers,
	getAlivePlayerCount,
} from "@engine/eligibility";
import {
	gameReducer,
	createInitialState,
	getCurrentPresident,
	getChancellor,
	getPartyMembership,
} from "@engine/reducer";
import type { GameState, GameAction } from "@engine/types";
import { Role } from "@engine/types";
import { useMemo, useRef, useState } from "react";

import { syncGameState } from "./useGamePersistence";

interface UseGameReturn {
	state: GameState;
	dispatch: (action: GameAction) => void;

	// Derived selectors
	president: ReturnType<typeof getCurrentPresident>;
	chancellor: ReturnType<typeof getChancellor>;
	alivePlayers: ReturnType<typeof getAlivePlayers>;
	aliveCount: number;
	eligibleChancellorIds: number[];
	investigablePlayerIds: number[];
	specialElectionEligibleIds: number[];
	executionEligibleIds: number[];

	// Helpers
	getPartyMembership: typeof getPartyMembership;
	hitlerKnowsFascists: boolean;
}

export function useGame(initialState?: GameState): UseGameReturn {
	const [state, setState] = useState(() => initialState ?? createInitialState());
	const stateRef = useRef(state);
	stateRef.current = state;

	const dispatch = useMemo(
		() => (action: GameAction) => {
			const nextState = gameReducer(stateRef.current, action);
			stateRef.current = nextState;
			syncGameState(nextState);
			setState(nextState);
		},
		[],
	);

	const president = useMemo(() => getCurrentPresident(state), [state]);
	const chancellor = useMemo(() => getChancellor(state), [state]);
	const alivePlayers = useMemo(() => getAlivePlayers(state), [state]);
	const aliveCount = useMemo(() => getAlivePlayerCount(state), [state]);
	const eligibleChancellorIds = useMemo(() => getEligibleChancellorIds(state), [state]);
	const investigablePlayerIds = useMemo(() => getInvestigablePlayerIds(state), [state]);
	const specialElectionEligibleIds = useMemo(() => getSpecialElectionEligibleIds(state), [state]);
	const executionEligibleIds = useMemo(() => getExecutionEligibleIds(state), [state]);
	const hitlerKnowsFascists = useMemo(
		() => state.players.length <= HITLER_KNOWS_FASCISTS_MAX_PLAYERS,
		[state.players.length],
	);

	return {
		state,
		dispatch,
		president,
		chancellor,
		alivePlayers,
		aliveCount,
		eligibleChancellorIds,
		investigablePlayerIds,
		specialElectionEligibleIds,
		executionEligibleIds,
		getPartyMembership,
		hitlerKnowsFascists,
	};
}

/**
 * Get the fascist teammates visible to a player during the night phase.
 */
export function getNightInfo(
	state: GameState,
	playerIndex: number,
): { teammates: string[]; isHitler: boolean; knowsFascists: boolean } {
	const player = state.players[playerIndex];
	const hitlerKnows = state.players.length <= HITLER_KNOWS_FASCISTS_MAX_PLAYERS;

	if (player.role === Role.Liberal) {
		return { teammates: [], isHitler: false, knowsFascists: false };
	}

	if (player.role === Role.Hitler) {
		if (hitlerKnows) {
			const fascists = state.players.filter((p) => p.role === Role.Fascist).map((p) => p.name);
			return { teammates: fascists, isHitler: true, knowsFascists: true };
		}
		return { teammates: [], isHitler: true, knowsFascists: false };
	}

	// Regular fascist — always knows Hitler and other fascists
	const teammates = state.players
		.filter((p) => p.id !== player.id && (p.role === Role.Fascist || p.role === Role.Hitler))
		.map((p) => `${p.name}${p.role === Role.Hitler ? " (Hitler)" : " (Fascist)"}`);

	return { teammates, isHitler: false, knowsFascists: true };
}
