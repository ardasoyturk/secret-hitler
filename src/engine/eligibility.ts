/**
 * Secret Hitler — Eligibility Module
 *
 * Determines which players are eligible for chancellor nomination,
 * enforcing term limits per the official rules.
 *
 * RULES:
 * - The last elected CHANCELLOR is ALWAYS ineligible.
 * - The last elected PRESIDENT is ineligible ONLY if >5 players are alive.
 * - Dead players are never eligible.
 * - The current presidential candidate is never eligible.
 * - Term limits reset after chaos (3 failed elections → top policy enacted).
 */

import { PRESIDENT_TERM_LIMIT_MIN_ALIVE } from "./constants";
import type { GameState, Player } from "./types";

/**
 * Get the list of player IDs eligible for chancellor nomination.
 */
export function getEligibleChancellorIds(state: GameState): number[] {
	const alivePlayers = state.players.filter((p) => p.isAlive);
	const aliveCount = alivePlayers.length;
	const currentPresidentId = state.players[state.presidentIndex]?.id;

	return alivePlayers
		.filter((player) => {
			// Cannot nominate self (the current president)
			if (player.id === currentPresidentId) return false;

			// Last elected chancellor is always ineligible
			if (player.id === state.lastElectedChancellorId) return false;

			// Last elected president is ineligible only if >5 alive
			if (aliveCount >= PRESIDENT_TERM_LIMIT_MIN_ALIVE && player.id === state.lastElectedPresidentId) {
				return false;
			}

			return true;
		})
		.map((p) => p.id);
}

/**
 * Check if a specific player can be nominated as chancellor.
 */
export function isEligibleChancellor(state: GameState, playerId: number): boolean {
	return getEligibleChancellorIds(state).includes(playerId);
}

/**
 * Get the next alive presidential candidate index (clockwise rotation).
 * Skips dead players.
 */
export function getNextPresidentIndex(state: GameState): number {
	const { players, presidentIndex, specialElectionCallerIndex } = state;
	const totalPlayers = players.length;

	// After a special election, return to the player after the one who
	// called the special election (not after the special election president).
	let startIndex: number;
	if (specialElectionCallerIndex !== null) {
		startIndex = specialElectionCallerIndex;
	} else {
		startIndex = presidentIndex;
	}

	// Find next alive player after startIndex
	for (let i = 1; i <= totalPlayers; i++) {
		const candidateIndex = (startIndex + i) % totalPlayers;
		if (players[candidateIndex].isAlive) {
			return candidateIndex;
		}
	}

	// Should never happen in a valid game
	return presidentIndex;
}

/**
 * Check if a player can be investigated.
 * Per rules: a player cannot be investigated twice.
 */
export function canInvestigate(state: GameState, playerId: number): boolean {
	const player = state.players.find((p) => p.id === playerId);
	if (!player) return false;
	if (!player.isAlive) return false;
	if (state.investigatedPlayerIds.includes(playerId)) return false;
	const currentPresidentId = state.players[state.presidentIndex]?.id;
	if (playerId === currentPresidentId) return false;
	return true;
}

/**
 * Get list of players eligible for investigation.
 */
export function getInvestigablePlayerIds(state: GameState): number[] {
	return state.players.filter((p) => canInvestigate(state, p.id)).map((p) => p.id);
}

/**
 * Get list of players eligible for special election.
 * Any alive player except the current president.
 */
export function getSpecialElectionEligibleIds(state: GameState): number[] {
	const currentPresidentId = state.players[state.presidentIndex]?.id;
	return state.players.filter((p) => p.isAlive && p.id !== currentPresidentId).map((p) => p.id);
}

/**
 * Get list of players eligible for execution.
 * Any alive player except the current president.
 */
export function getExecutionEligibleIds(state: GameState): number[] {
	const currentPresidentId = state.players[state.presidentIndex]?.id;
	return state.players.filter((p) => p.isAlive && p.id !== currentPresidentId).map((p) => p.id);
}

/**
 * Get all alive players.
 */
export function getAlivePlayers(state: GameState): Player[] {
	return state.players.filter((p) => p.isAlive);
}

/**
 * Get count of alive players.
 */
export function getAlivePlayerCount(state: GameState): number {
	return state.players.filter((p) => p.isAlive).length;
}
