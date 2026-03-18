import { describe, test, expect } from "bun:test";

import {
	getEligibleChancellorIds,
	isEligibleChancellor,
	getNextPresidentIndex,
	canInvestigate,
	getInvestigablePlayerIds,
	getSpecialElectionEligibleIds,
	getExecutionEligibleIds,
	getAlivePlayers,
	getAlivePlayerCount,
} from "../src/engine/eligibility";
import { createInitialState } from "../src/engine/reducer";
import { GamePhase, Role, type GameState, type Player, PLAYER_COLORS } from "../src/engine/types";

function makePlayers(count: number): Player[] {
	return Array.from({ length: count }, (_, i) => ({
		id: i,
		name: `Player ${i}`,
		portraitIndex: i,
		color: PLAYER_COLORS[i % PLAYER_COLORS.length],
		role: i === 0 ? Role.Hitler : i === 1 ? Role.Fascist : Role.Liberal,
		isAlive: true,
		hasBeenInvestigated: false,
	}));
}

function makeState(overrides: Partial<GameState> = {}): GameState {
	return {
		...createInitialState(),
		players: makePlayers(7),
		phase: GamePhase.ChancellorNomination,
		presidentIndex: 0,
		...overrides,
	};
}

describe("Eligibility Module", () => {
	describe("getEligibleChancellorIds", () => {
		test("excludes the current president", () => {
			const state = makeState({ presidentIndex: 2 });
			const eligible = getEligibleChancellorIds(state);
			expect(eligible).not.toContain(2);
		});

		test("excludes the last elected chancellor (always)", () => {
			const state = makeState({ lastElectedChancellorId: 3 });
			const eligible = getEligibleChancellorIds(state);
			expect(eligible).not.toContain(3);
		});

		test("excludes last elected president when >5 players alive (7 alive)", () => {
			const state = makeState({ lastElectedPresidentId: 4, presidentIndex: 0 });
			const eligible = getEligibleChancellorIds(state);
			// 7 alive > 5, so president term limit applies
			expect(eligible).not.toContain(4);
		});

		test("does NOT exclude last elected president when <=5 players alive", () => {
			const players = makePlayers(7);
			// Kill 2 players to bring alive count to 5
			players[5].isAlive = false;
			players[6].isAlive = false;
			const state = makeState({
				players,
				presidentIndex: 0,
				lastElectedPresidentId: 4,
			});
			const eligible = getEligibleChancellorIds(state);
			// Only 5 alive, so president term limit does NOT apply
			expect(eligible).toContain(4);
		});

		test("excludes dead players", () => {
			const players = makePlayers(7);
			players[3].isAlive = false;
			const state = makeState({ players, presidentIndex: 0 });
			const eligible = getEligibleChancellorIds(state);
			expect(eligible).not.toContain(3);
		});

		test("correct eligible count for 7-player game with no term limits", () => {
			const state = makeState({
				presidentIndex: 0,
				lastElectedChancellorId: null,
				lastElectedPresidentId: null,
			});
			const eligible = getEligibleChancellorIds(state);
			// 7 players total, president (id 0) excluded → 6 eligible
			expect(eligible).toHaveLength(6);
		});

		test("correct eligible count with both term limits active", () => {
			const state = makeState({
				presidentIndex: 0,
				lastElectedChancellorId: 1,
				lastElectedPresidentId: 2,
			});
			const eligible = getEligibleChancellorIds(state);
			// 7 alive > 5 → both term limits apply
			// 7 total minus president(0) minus chancellor(1) minus president(2) = 4
			expect(eligible).toHaveLength(4);
		});
	});

	describe("isEligibleChancellor", () => {
		test("returns true for eligible player", () => {
			const state = makeState({ presidentIndex: 0 });
			expect(isEligibleChancellor(state, 3)).toBe(true);
		});

		test("returns false for the current president", () => {
			const state = makeState({ presidentIndex: 0 });
			expect(isEligibleChancellor(state, 0)).toBe(false);
		});
	});

	describe("getNextPresidentIndex", () => {
		test("advances to the next player in clockwise order", () => {
			const state = makeState({ presidentIndex: 2 });
			expect(getNextPresidentIndex(state)).toBe(3);
		});

		test("wraps around at the end of the player array", () => {
			const state = makeState({ presidentIndex: 6 });
			expect(getNextPresidentIndex(state)).toBe(0);
		});

		test("skips dead players", () => {
			const players = makePlayers(7);
			players[3].isAlive = false;
			const state = makeState({ players, presidentIndex: 2 });
			// Player 3 is dead, so next alive is player 4
			expect(getNextPresidentIndex(state)).toBe(4);
		});

		test("after special election, resumes from player after the caller", () => {
			const state = makeState({
				presidentIndex: 5, // special election president
				specialElectionCallerIndex: 2, // player 2 called the special election
			});
			// Should resume to player 3 (next after caller at index 2)
			expect(getNextPresidentIndex(state)).toBe(3);
		});

		test("after special election, skips dead player after caller", () => {
			const players = makePlayers(7);
			players[3].isAlive = false;
			const state = makeState({
				players,
				presidentIndex: 5,
				specialElectionCallerIndex: 2,
			});
			// Player 3 is dead, so next alive after caller(2) is player 4
			expect(getNextPresidentIndex(state)).toBe(4);
		});
	});

	describe("canInvestigate", () => {
		test("allows investigating a valid player", () => {
			const state = makeState({ presidentIndex: 0 });
			expect(canInvestigate(state, 3)).toBe(true);
		});

		test("cannot investigate the current president", () => {
			const state = makeState({ presidentIndex: 0 });
			expect(canInvestigate(state, 0)).toBe(false);
		});

		test("cannot investigate a dead player", () => {
			const players = makePlayers(7);
			players[3].isAlive = false;
			const state = makeState({ players, presidentIndex: 0 });
			expect(canInvestigate(state, 3)).toBe(false);
		});

		test("cannot investigate a player who was already investigated", () => {
			const state = makeState({
				presidentIndex: 0,
				investigatedPlayerIds: [3],
			});
			expect(canInvestigate(state, 3)).toBe(false);
		});

		test("cannot investigate a nonexistent player", () => {
			const state = makeState({ presidentIndex: 0 });
			expect(canInvestigate(state, 99)).toBe(false);
		});
	});

	describe("getInvestigablePlayerIds", () => {
		test("returns all alive non-president non-investigated players", () => {
			const state = makeState({
				presidentIndex: 0,
				investigatedPlayerIds: [1],
			});
			const ids = getInvestigablePlayerIds(state);
			expect(ids).not.toContain(0); // president
			expect(ids).not.toContain(1); // already investigated
			expect(ids).toHaveLength(5); // 7 - president - investigated = 5
		});
	});

	describe("getSpecialElectionEligibleIds", () => {
		test("returns all alive players except the current president", () => {
			const state = makeState({ presidentIndex: 0 });
			const ids = getSpecialElectionEligibleIds(state);
			expect(ids).not.toContain(0);
			expect(ids).toHaveLength(6);
		});
	});

	describe("getExecutionEligibleIds", () => {
		test("returns all alive players except the current president", () => {
			const state = makeState({ presidentIndex: 0 });
			const ids = getExecutionEligibleIds(state);
			expect(ids).not.toContain(0);
			expect(ids).toHaveLength(6);
		});
	});

	describe("getAlivePlayers / getAlivePlayerCount", () => {
		test("counts alive players correctly", () => {
			const players = makePlayers(7);
			players[2].isAlive = false;
			players[5].isAlive = false;
			const state = makeState({ players });
			expect(getAlivePlayerCount(state)).toBe(5);
			expect(getAlivePlayers(state)).toHaveLength(5);
		});
	});
});
