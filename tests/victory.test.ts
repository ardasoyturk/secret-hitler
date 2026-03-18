import { describe, test, expect } from "bun:test";

import { Role, Team, VictoryReason, type Board, type Player, PLAYER_COLORS } from "../src/engine/types";
import { checkPolicyVictory, checkHitlerChancellorVictory, checkExecutionVictory } from "../src/engine/victory";

function makePlayer(overrides: Partial<Player> = {}): Player {
	return {
		id: 0,
		name: "Test Player",
		portraitIndex: 0,
		color: PLAYER_COLORS[0],
		role: Role.Liberal,
		isAlive: true,
		hasBeenInvestigated: false,
		...overrides,
	};
}

describe("Victory Module", () => {
	describe("checkPolicyVictory", () => {
		test("liberals win with 5 liberal policies", () => {
			const board: Board = { liberalPolicies: 5, fascistPolicies: 2 };
			const result = checkPolicyVictory(board);
			expect(result.isGameOver).toBe(true);
			expect(result.winner).toBe(Team.Liberal);
			expect(result.reason).toBe(VictoryReason.LiberalPolicies);
		});

		test("fascists win with 6 fascist policies", () => {
			const board: Board = { liberalPolicies: 1, fascistPolicies: 6 };
			const result = checkPolicyVictory(board);
			expect(result.isGameOver).toBe(true);
			expect(result.winner).toBe(Team.Fascist);
			expect(result.reason).toBe(VictoryReason.FascistPolicies);
		});

		test("no winner with 4 liberal and 5 fascist policies", () => {
			const board: Board = { liberalPolicies: 4, fascistPolicies: 5 };
			const result = checkPolicyVictory(board);
			expect(result.isGameOver).toBe(false);
			expect(result.winner).toBeNull();
			expect(result.reason).toBeNull();
		});

		test("no winner with 0 policies on either side", () => {
			const board: Board = { liberalPolicies: 0, fascistPolicies: 0 };
			const result = checkPolicyVictory(board);
			expect(result.isGameOver).toBe(false);
		});

		test("liberal victory takes priority if both thresholds met", () => {
			// Edge case: shouldn't normally happen but tests priority
			const board: Board = { liberalPolicies: 5, fascistPolicies: 6 };
			const result = checkPolicyVictory(board);
			expect(result.isGameOver).toBe(true);
			expect(result.winner).toBe(Team.Liberal);
		});
	});

	describe("checkHitlerChancellorVictory", () => {
		test("fascists win when Hitler elected chancellor with 3+ fascist policies", () => {
			const board: Board = { liberalPolicies: 1, fascistPolicies: 3 };
			const hitler = makePlayer({ role: Role.Hitler });
			const result = checkHitlerChancellorVictory(board, hitler);
			expect(result.isGameOver).toBe(true);
			expect(result.winner).toBe(Team.Fascist);
			expect(result.reason).toBe(VictoryReason.HitlerElectedChancellor);
		});

		test("no win when Hitler elected chancellor with only 2 fascist policies", () => {
			const board: Board = { liberalPolicies: 2, fascistPolicies: 2 };
			const hitler = makePlayer({ role: Role.Hitler });
			const result = checkHitlerChancellorVictory(board, hitler);
			expect(result.isGameOver).toBe(false);
		});

		test("no win when non-Hitler elected chancellor with 3+ fascist policies", () => {
			const board: Board = { liberalPolicies: 0, fascistPolicies: 4 };
			const liberal = makePlayer({ role: Role.Liberal });
			const result = checkHitlerChancellorVictory(board, liberal);
			expect(result.isGameOver).toBe(false);
		});

		test("no win when regular fascist elected chancellor with 3+ fascist policies", () => {
			const board: Board = { liberalPolicies: 0, fascistPolicies: 5 };
			const fascist = makePlayer({ role: Role.Fascist });
			const result = checkHitlerChancellorVictory(board, fascist);
			expect(result.isGameOver).toBe(false);
		});

		test("win triggers at exactly 3 fascist policies", () => {
			const board: Board = { liberalPolicies: 0, fascistPolicies: 3 };
			const hitler = makePlayer({ role: Role.Hitler });
			const result = checkHitlerChancellorVictory(board, hitler);
			expect(result.isGameOver).toBe(true);
		});
	});

	describe("checkExecutionVictory", () => {
		test("liberals win when Hitler is executed", () => {
			const hitler = makePlayer({ role: Role.Hitler });
			const result = checkExecutionVictory(hitler);
			expect(result.isGameOver).toBe(true);
			expect(result.winner).toBe(Team.Liberal);
			expect(result.reason).toBe(VictoryReason.HitlerExecuted);
		});

		test("no win when a liberal is executed", () => {
			const liberal = makePlayer({ role: Role.Liberal });
			const result = checkExecutionVictory(liberal);
			expect(result.isGameOver).toBe(false);
		});

		test("no win when a regular fascist is executed", () => {
			const fascist = makePlayer({ role: Role.Fascist });
			const result = checkExecutionVictory(fascist);
			expect(result.isGameOver).toBe(false);
		});
	});
});
