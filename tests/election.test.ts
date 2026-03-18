import { describe, test, expect } from "bun:test";

import { MAX_FAILED_ELECTIONS } from "../src/engine/constants";
import { doesElectionPass, countVotes, shouldChaosOccur } from "../src/engine/election";
import { Vote } from "../src/engine/types";

describe("Election Module", () => {
	describe("doesElectionPass — strict majority (>50%)", () => {
		test("all Ja votes → passes", () => {
			const votes = [
				{ playerId: 0, vote: Vote.Ja },
				{ playerId: 1, vote: Vote.Ja },
				{ playerId: 2, vote: Vote.Ja },
			];
			expect(doesElectionPass(votes)).toBe(true);
		});

		test("all Nein votes → fails", () => {
			const votes = [
				{ playerId: 0, vote: Vote.Nein },
				{ playerId: 1, vote: Vote.Nein },
				{ playerId: 2, vote: Vote.Nein },
			];
			expect(doesElectionPass(votes)).toBe(false);
		});

		test("tie (3 Ja, 3 Nein with 6 players) → fails per rules", () => {
			const votes = [
				{ playerId: 0, vote: Vote.Ja },
				{ playerId: 1, vote: Vote.Ja },
				{ playerId: 2, vote: Vote.Ja },
				{ playerId: 3, vote: Vote.Nein },
				{ playerId: 4, vote: Vote.Nein },
				{ playerId: 5, vote: Vote.Nein },
			];
			expect(doesElectionPass(votes)).toBe(false);
		});

		test("4 Ja, 3 Nein (7 players) → passes (4 > 3.5)", () => {
			const votes = [
				{ playerId: 0, vote: Vote.Ja },
				{ playerId: 1, vote: Vote.Ja },
				{ playerId: 2, vote: Vote.Ja },
				{ playerId: 3, vote: Vote.Ja },
				{ playerId: 4, vote: Vote.Nein },
				{ playerId: 5, vote: Vote.Nein },
				{ playerId: 6, vote: Vote.Nein },
			];
			expect(doesElectionPass(votes)).toBe(true);
		});

		test("3 Ja, 2 Nein (5 players) → passes (3 > 2.5)", () => {
			const votes = [
				{ playerId: 0, vote: Vote.Ja },
				{ playerId: 1, vote: Vote.Ja },
				{ playerId: 2, vote: Vote.Ja },
				{ playerId: 3, vote: Vote.Nein },
				{ playerId: 4, vote: Vote.Nein },
			];
			expect(doesElectionPass(votes)).toBe(true);
		});

		test("2 Ja, 3 Nein (5 players) → fails", () => {
			const votes = [
				{ playerId: 0, vote: Vote.Ja },
				{ playerId: 1, vote: Vote.Ja },
				{ playerId: 2, vote: Vote.Nein },
				{ playerId: 3, vote: Vote.Nein },
				{ playerId: 4, vote: Vote.Nein },
			];
			expect(doesElectionPass(votes)).toBe(false);
		});

		test("empty votes → fails", () => {
			expect(doesElectionPass([])).toBe(false);
		});
	});

	describe("countVotes", () => {
		test("counts correctly", () => {
			const votes = [
				{ playerId: 0, vote: Vote.Ja },
				{ playerId: 1, vote: Vote.Nein },
				{ playerId: 2, vote: Vote.Ja },
			];
			const result = countVotes(votes);
			expect(result.ja).toBe(2);
			expect(result.nein).toBe(1);
			expect(result.total).toBe(3);
		});
	});

	describe("shouldChaosOccur", () => {
		test("chaos at exactly 3 failed elections", () => {
			expect(shouldChaosOccur(MAX_FAILED_ELECTIONS)).toBe(true);
		});

		test("no chaos at 2 failed elections", () => {
			expect(shouldChaosOccur(2)).toBe(false);
		});

		test("chaos at > 3 (should not happen but handles edge case)", () => {
			expect(shouldChaosOccur(4)).toBe(true);
		});

		test("no chaos at 0", () => {
			expect(shouldChaosOccur(0)).toBe(false);
		});
	});
});
