/**
 * Secret Hitler — Role Assignment Module
 *
 * Assigns roles according to the official rules:
 * - Always exactly 1 Hitler
 * - Regular fascists per FASCIST_COUNT_BY_PLAYERS table
 * - Everyone else is liberal
 *
 * In 5-6 player games, Hitler knows who the fascists are.
 * In 7+ player games, Hitler does NOT know.
 */

import { FASCIST_COUNT_BY_PLAYERS } from "./constants";
import { shuffle } from "./deck";
import { Role } from "./types";

/**
 * Generate a shuffled array of roles for the given player count.
 *
 * @param playerCount - Number of players (5-10)
 * @returns Shuffled array of roles where index corresponds to player index
 * @throws If playerCount is outside 5-10
 */
export function assignRoles(playerCount: number): Role[] {
	if (playerCount < 5 || playerCount > 10) {
		throw new Error(`Invalid player count: ${playerCount}. Must be between 5 and 10.`);
	}

	const fascistCount = FASCIST_COUNT_BY_PLAYERS[playerCount];
	const liberalCount = playerCount - fascistCount - 1; // -1 for Hitler

	const roles: Role[] = [
		Role.Hitler,
		...Array(fascistCount).fill(Role.Fascist),
		...Array(liberalCount).fill(Role.Liberal),
	];

	return shuffle(roles);
}

/**
 * Get the number of liberals for a given player count.
 */
export function getLiberalCount(playerCount: number): number {
	const fascistCount = FASCIST_COUNT_BY_PLAYERS[playerCount] ?? 0;
	return playerCount - fascistCount - 1;
}

/**
 * Get the total number of fascist-team members (fascists + Hitler).
 */
export function getFascistTeamCount(playerCount: number): number {
	return (FASCIST_COUNT_BY_PLAYERS[playerCount] ?? 0) + 1;
}
