/**
 * Secret Hitler — Election Module
 *
 * Handles voting logic with strict majority (>50%).
 *
 * RULES:
 * - All alive players vote Ja or Nein.
 * - A strict majority (more than half) of Ja votes is required.
 * - Ties FAIL (not strict majority).
 * - If the vote fails, the election tracker advances by 1.
 * - If the tracker reaches 3, chaos occurs: top policy auto-enacted,
 *   tracker resets, and all term limits are cleared.
 * - If the vote passes and 3+ fascist policies are enacted,
 *   check if Hitler was just elected chancellor → fascists win.
 */

import { MAX_FAILED_ELECTIONS } from "./constants";
import { Vote, type VoteRecord } from "./types";

/**
 * Determine if an election passes based on strict majority.
 *
 * Per rules: "If the vote is a tie, or if a majority of players
 * vote no, the vote fails."
 *
 * This means: passes only if ja > (total / 2), i.e., strictly more
 * than half.
 */
export function doesElectionPass(votes: VoteRecord[]): boolean {
	const totalVotes = votes.length;
	if (totalVotes === 0) return false;

	const jaCount = votes.filter((v) => v.vote === Vote.Ja).length;

	// Strict majority: more than half
	return jaCount > totalVotes / 2;
}

/**
 * Count the votes.
 */
export function countVotes(votes: VoteRecord[]): {
	ja: number;
	nein: number;
	total: number;
} {
	const ja = votes.filter((v) => v.vote === Vote.Ja).length;
	const nein = votes.filter((v) => v.vote === Vote.Nein).length;
	return { ja, nein, total: votes.length };
}

/**
 * Check if chaos should occur (election tracker reached max).
 */
export function shouldChaosOccur(failedElections: number): boolean {
	return failedElections >= MAX_FAILED_ELECTIONS;
}
