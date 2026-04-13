import { describe, expect, test } from "bun:test";

import { GamePhase } from "../src/engine/types";
import { getDefaultPhoneBoardForPhase, isPhoneViewport } from "../src/components/game/viewport";

describe("viewport helpers", () => {
	test("classifies portrait phone viewport as phone", () => {
		expect(
			isPhoneViewport({
				width: 390,
				height: 844,
				isCoarsePointer: true,
			}),
		).toBe(true);
	});

	test("classifies landscape phone viewport as phone", () => {
		expect(
			isPhoneViewport({
				width: 844,
				height: 390,
				isCoarsePointer: true,
			}),
		).toBe(true);
	});

	test("classifies portrait tablet viewport as non-phone", () => {
		expect(
			isPhoneViewport({
				width: 768,
				height: 1024,
				isCoarsePointer: true,
			}),
		).toBe(false);
	});

	test("classifies landscape tablet viewport as non-phone", () => {
		expect(
			isPhoneViewport({
				width: 1024,
				height: 768,
				isCoarsePointer: true,
			}),
		).toBe(false);
	});
});

describe("phone board defaults", () => {
	test("uses the liberal board for election-centric phases", () => {
		expect(getDefaultPhoneBoardForPhase(GamePhase.ChancellorNomination)).toBe("liberal");
		expect(getDefaultPhoneBoardForPhase(GamePhase.Election)).toBe("liberal");
		expect(getDefaultPhoneBoardForPhase(GamePhase.VoteCast)).toBe("liberal");
		expect(getDefaultPhoneBoardForPhase(GamePhase.VoteResult)).toBe("liberal");
	});

	test("uses the fascist board for executive and veto-centric phases", () => {
		expect(getDefaultPhoneBoardForPhase(GamePhase.PresidentLegislation)).toBe("fascist");
		expect(getDefaultPhoneBoardForPhase(GamePhase.ChancellorLegislation)).toBe("fascist");
		expect(getDefaultPhoneBoardForPhase(GamePhase.VetoRequested)).toBe("fascist");
		expect(getDefaultPhoneBoardForPhase(GamePhase.ExecutiveInvestigate)).toBe("fascist");
		expect(getDefaultPhoneBoardForPhase(GamePhase.ExecutiveExecution)).toBe("fascist");
		expect(getDefaultPhoneBoardForPhase(GamePhase.PolicyEnacted)).toBe("fascist");
	});
});
