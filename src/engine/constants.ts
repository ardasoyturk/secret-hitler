/**
 * Secret Hitler — Game Constants
 *
 * All values derived directly from the official rules and the
 * executive power board configurations for 5-6, 7-8, and 9-10 players.
 */

import { ExecutivePower, PolicyType } from "./types";

// ─── Deck Composition ───────────────────────────────────────────────

/** The initial deck contains 11 fascist and 6 liberal policy tiles */
export const FASCIST_POLICY_COUNT = 11;
export const LIBERAL_POLICY_COUNT = 6;
export const TOTAL_POLICY_COUNT = FASCIST_POLICY_COUNT + LIBERAL_POLICY_COUNT; // 17

// ─── Victory Thresholds ─────────────────────────────────────────────

/** Liberals win by enacting 5 liberal policies */
export const LIBERAL_POLICIES_TO_WIN = 5;

/** Fascists win by enacting 6 fascist policies */
export const FASCIST_POLICIES_TO_WIN = 6;

/**
 * After 3 or more fascist policies are enacted, if Hitler is elected
 * chancellor, the fascists win immediately.
 */
export const MIN_FASCIST_POLICIES_FOR_HITLER_CHANCELLOR_WIN = 3;

// ─── Elections ──────────────────────────────────────────────────────

/**
 * After 3 consecutive failed elections, the top policy is
 * enacted automatically ("chaos"). The election tracker resets,
 * all term limits are cleared, and any executive power is skipped.
 */
export const MAX_FAILED_ELECTIONS = 3;

// ─── Deck Management ────────────────────────────────────────────────

/**
 * If fewer than 3 cards remain in the draw pile before a president
 * draws, shuffle the discard pile back into the draw pile.
 */
export const MIN_DRAW_PILE_SIZE = 3;

/** The president draws 3 policy tiles at the start of a legislative session */
export const PRESIDENT_DRAW_COUNT = 3;

/** The president passes 2 policies to the chancellor */
export const CHANCELLOR_HAND_SIZE = 2;

// ─── Player Count Limits ────────────────────────────────────────────

export const MIN_PLAYERS = 5;
export const MAX_PLAYERS = 10;

// ─── Role Distribution ─────────────────────────────────────────────

/**
 * Number of fascist roles (NOT including Hitler) by player count.
 * Hitler is always 1 additional fascist-team player.
 *
 * Per official rules:
 * - 5-6 players: 1 regular fascist + Hitler
 * - 7-8 players: 2 regular fascists + Hitler
 * - 9-10 players: 3 regular fascists + Hitler
 */
export const FASCIST_COUNT_BY_PLAYERS: Record<number, number> = {
	5: 1,
	6: 1,
	7: 2,
	8: 2,
	9: 3,
	10: 3,
};

/**
 * In games with 5-6 players, Hitler knows who the fascists are.
 * In games with 7+ players, Hitler does NOT know.
 */
export const HITLER_KNOWS_FASCISTS_MAX_PLAYERS = 6;

// ─── Term Limits ────────────────────────────────────────────────────

/**
 * The last elected chancellor is ALWAYS ineligible for the next
 * chancellor nomination. The last elected president is ONLY
 * ineligible if there are MORE than 5 players alive.
 */
export const PRESIDENT_TERM_LIMIT_MIN_ALIVE = 6;

// ─── Executive Power Tables ────────────────────────────────────────

/**
 * Executive powers granted when a fascist policy is enacted.
 * Indexed by [fascist policy number (1-6)].
 *
 * After the 5th fascist policy, veto power is always unlocked
 * regardless of player count.
 *
 * Note: The 6th fascist policy means fascists win — no power is granted.
 */
export const EXECUTIVE_POWERS: Record<string, Record<number, ExecutivePower>> = {
	/** 5-6 players */
	"5-6": {
		1: ExecutivePower.None,
		2: ExecutivePower.None,
		3: ExecutivePower.PolicyPeek,
		4: ExecutivePower.Execution,
		5: ExecutivePower.Execution, // + veto unlocked
		6: ExecutivePower.None, // game over (fascist win)
	},
	/** 7-8 players */
	"7-8": {
		1: ExecutivePower.None,
		2: ExecutivePower.InvestigateLoyalty,
		3: ExecutivePower.SpecialElection,
		4: ExecutivePower.Execution,
		5: ExecutivePower.Execution, // + veto unlocked
		6: ExecutivePower.None, // game over (fascist win)
	},
	/** 9-10 players */
	"9-10": {
		1: ExecutivePower.InvestigateLoyalty,
		2: ExecutivePower.InvestigateLoyalty,
		3: ExecutivePower.SpecialElection,
		4: ExecutivePower.Execution,
		5: ExecutivePower.Execution, // + veto unlocked
		6: ExecutivePower.None, // game over (fascist win)
	},
};

/**
 * Get the player count bracket key for executive power lookup.
 */
export function getPlayerCountBracket(playerCount: number): string {
	if (playerCount <= 6) return "5-6";
	if (playerCount <= 8) return "7-8";
	return "9-10";
}

/**
 * Get the executive power for a given fascist policy count and player count.
 */
export function getExecutivePower(fascistPolicyCount: number, playerCount: number): ExecutivePower {
	const bracket = getPlayerCountBracket(playerCount);
	return EXECUTIVE_POWERS[bracket][fascistPolicyCount] ?? ExecutivePower.None;
}

/**
 * Veto power unlocks after the 5th fascist policy is enacted.
 */
export const VETO_UNLOCK_FASCIST_POLICY_COUNT = 5;

// ─── Initial Deck ───────────────────────────────────────────────────

/**
 * Create the initial unshuffled policy deck:
 * 11 fascist + 6 liberal = 17 tiles.
 */
export function createInitialDeck(): PolicyType[] {
	const deck: PolicyType[] = [];
	for (let i = 0; i < FASCIST_POLICY_COUNT; i++) {
		deck.push(PolicyType.Fascist);
	}
	for (let i = 0; i < LIBERAL_POLICY_COUNT; i++) {
		deck.push(PolicyType.Liberal);
	}
	return deck;
}
