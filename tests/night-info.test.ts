import { describe, expect, test } from "bun:test";

import { createInitialState } from "../src/engine/reducer";
import { GamePhase, PLAYER_COLORS, Role, type GameState, type Player } from "../src/engine/types";
import { getNightInfo } from "../src/hooks/useGame";

function makePlayers(roles: Role[]): Player[] {
	return roles.map((role, index) => ({
		id: index,
		name: `Player ${index}`,
		portraitIndex: index,
		color: PLAYER_COLORS[index % PLAYER_COLORS.length],
		role,
		isAlive: true,
		hasBeenInvestigated: false,
	}));
}

function makeState(players: Player[]): GameState {
	return {
		...createInitialState(),
		phase: GamePhase.NightReveal,
		players,
	};
}

describe("getNightInfo", () => {
	test("liberals see no teammates", () => {
		const state = makeState(makePlayers([Role.Hitler, Role.Fascist, Role.Liberal, Role.Liberal, Role.Liberal]));

		expect(getNightInfo(state, 2)).toEqual({
			teammates: [],
			isHitler: false,
			knowsFascists: false,
		});
	});

	test("Hitler knows the fascists in 5-6 player games", () => {
		const state = makeState(makePlayers([Role.Hitler, Role.Fascist, Role.Liberal, Role.Liberal, Role.Liberal]));

		expect(getNightInfo(state, 0)).toEqual({
			teammates: [{ name: "Player 1", role: Role.Fascist }],
			isHitler: true,
			knowsFascists: true,
		});
	});

	test("Hitler does not know the fascists in 7+ player games", () => {
		const state = makeState(
			makePlayers([Role.Hitler, Role.Fascist, Role.Fascist, Role.Liberal, Role.Liberal, Role.Liberal, Role.Liberal]),
		);

		expect(getNightInfo(state, 0)).toEqual({
			teammates: [],
			isHitler: true,
			knowsFascists: false,
		});
	});

	test("regular fascists see Hitler and the other fascists as structured teammate objects", () => {
		const state = makeState(
			makePlayers([Role.Hitler, Role.Fascist, Role.Fascist, Role.Liberal, Role.Liberal, Role.Liberal, Role.Liberal]),
		);

		expect(getNightInfo(state, 1)).toEqual({
			teammates: [
				{ name: "Player 0", role: Role.Hitler },
				{ name: "Player 2", role: Role.Fascist },
			],
			isHitler: false,
			knowsFascists: true,
		});
	});
});
