import { describe, test, expect } from "bun:test";

import {
	gameReducer,
	createInitialState,
	getPartyMembership,
	getCurrentPresident,
	getChancellor,
} from "../src/engine/reducer";
import {
	GamePhase,
	PolicyType,
	Role,
	Team,
	Vote,
	VictoryReason,
	PartyMembership,
	PLAYER_COLORS,
	type GameState,
	type Player,
} from "../src/engine/types";

function makePlayers(count: number): Player[] {
	return Array.from({ length: count }, (_, i) => ({
		id: i,
		name: `Player ${i}`,
		portraitIndex: i,
		color: PLAYER_COLORS[i % PLAYER_COLORS.length],
		role: Role.Liberal,
		isAlive: true,
		hasBeenInvestigated: false,
	}));
}

/** Create a state that has passed through setup and night round, ready for nomination. */
function makeGameReadyState(playerCount: number = 5, overrides: Partial<GameState> = {}): GameState {
	const players = makePlayers(playerCount);
	// Assign roles: player 0 = Hitler, player 1 = Fascist, rest = Liberal
	players[0].role = Role.Hitler;
	players[1].role = Role.Fascist;

	return {
		...createInitialState(),
		phase: GamePhase.ChancellorNomination,
		players,
		deck: {
			drawPile: [
				PolicyType.Fascist,
				PolicyType.Liberal,
				PolicyType.Fascist,
				PolicyType.Liberal,
				PolicyType.Fascist,
				PolicyType.Fascist,
				PolicyType.Liberal,
				PolicyType.Fascist,
				PolicyType.Fascist,
				PolicyType.Liberal,
				PolicyType.Fascist,
				PolicyType.Liberal,
				PolicyType.Fascist,
				PolicyType.Fascist,
				PolicyType.Liberal,
				PolicyType.Fascist,
				PolicyType.Fascist,
			],
			discardPile: [],
		},
		presidentIndex: 2,
		round: 1,
		...overrides,
	};
}

/** Cast all alive players' votes. */
function castAllVotes(state: GameState, voteValue: Vote): GameState {
	const alivePlayers = state.players.filter((p) => p.isAlive);
	let current = state;
	for (const player of alivePlayers) {
		current = gameReducer(current, {
			type: "CAST_VOTE",
			playerId: player.id,
			vote: voteValue,
		});
	}
	return current;
}

describe("Game Reducer", () => {
	describe("Setup Phase", () => {
		test("initial state is in Setup phase", () => {
			const state = createInitialState();
			expect(state.phase).toBe(GamePhase.Setup);
			expect(state.players).toHaveLength(0);
		});

		test("ADD_PLAYER adds a player", () => {
			let state = createInitialState();
			state = gameReducer(state, {
				type: "ADD_PLAYER",
				name: "Alice",
				portraitIndex: 0,
			});
			expect(state.players).toHaveLength(1);
			expect(state.players[0].name).toBe("Alice");
			expect(state.players[0].id).toBe(0);
		});

		test("ADD_PLAYER rejects duplicate names", () => {
			let state = createInitialState();
			state = gameReducer(state, {
				type: "ADD_PLAYER",
				name: "Alice",
				portraitIndex: 0,
			});
			state = gameReducer(state, {
				type: "ADD_PLAYER",
				name: "Alice",
				portraitIndex: 1,
			});
			expect(state.players).toHaveLength(1);
		});

		test("ADD_PLAYER caps at 10 players", () => {
			let state = createInitialState();
			for (let i = 0; i < 12; i++) {
				state = gameReducer(state, {
					type: "ADD_PLAYER",
					name: `P${i}`,
					portraitIndex: i,
				});
			}
			expect(state.players).toHaveLength(10);
		});

		test("REMOVE_PLAYER removes and reindexes", () => {
			let state = createInitialState();
			for (let i = 0; i < 3; i++) {
				state = gameReducer(state, {
					type: "ADD_PLAYER",
					name: `P${i}`,
					portraitIndex: i,
				});
			}
			state = gameReducer(state, { type: "REMOVE_PLAYER", playerId: 1 });
			expect(state.players).toHaveLength(2);
			expect(state.players[0].id).toBe(0);
			expect(state.players[1].id).toBe(1);
			expect(state.players[1].name).toBe("P2");
		});

		test("START_GAME requires at least 5 players", () => {
			let state = createInitialState();
			for (let i = 0; i < 4; i++) {
				state = gameReducer(state, {
					type: "ADD_PLAYER",
					name: `P${i}`,
					portraitIndex: i,
				});
			}
			const result = gameReducer(state, { type: "START_GAME" });
			expect(result.phase).toBe(GamePhase.Setup); // unchanged
		});

		test("START_GAME with 5 players transitions to NightRound", () => {
			let state = createInitialState();
			for (let i = 0; i < 5; i++) {
				state = gameReducer(state, {
					type: "ADD_PLAYER",
					name: `P${i}`,
					portraitIndex: i,
				});
			}
			const result = gameReducer(state, { type: "START_GAME" });
			expect(result.phase).toBe(GamePhase.NightRound);
			expect(result.round).toBe(1);
			// Roles should be assigned
			const roles = result.players.map((p) => p.role);
			expect(roles.filter((r) => r === Role.Hitler)).toHaveLength(1);
			expect(roles.filter((r) => r === Role.Fascist)).toHaveLength(1);
			expect(roles.filter((r) => r === Role.Liberal)).toHaveLength(3);
		});
	});

	describe("Night Round", () => {
		test("ACKNOWLEDGE_NIGHT cycles through all players", () => {
			let state = makeGameReadyState();
			state = {
				...state,
				phase: GamePhase.NightRound,
				nightRoundPlayerIndex: 0,
			};

			// First acknowledge: NightRound → NightReveal (show player 0's role)
			state = gameReducer(state, {
				type: "ACKNOWLEDGE_NIGHT",
				playerIndex: 0,
			});
			expect(state.phase).toBe(GamePhase.NightReveal);

			// Second acknowledge: NightReveal → NightRound (move to player 1)
			state = gameReducer(state, {
				type: "ACKNOWLEDGE_NIGHT",
				playerIndex: 0,
			});
			expect(state.phase).toBe(GamePhase.NightRound);
			expect(state.nightRoundPlayerIndex).toBe(1);
		});

		test("last player acknowledging NightReveal transitions to ChancellorNomination", () => {
			let state = makeGameReadyState(5);
			state = {
				...state,
				phase: GamePhase.NightReveal,
				nightRoundPlayerIndex: 4, // last player (index 4 for 5 players)
			};
			state = gameReducer(state, {
				type: "ACKNOWLEDGE_NIGHT",
				playerIndex: 4,
			});
			expect(state.phase).toBe(GamePhase.ChancellorNomination);
		});
	});

	describe("Chancellor Nomination", () => {
		test("NOMINATE_CHANCELLOR transitions to Election", () => {
			const state = makeGameReadyState();
			const result = gameReducer(state, {
				type: "NOMINATE_CHANCELLOR",
				playerId: 3,
			});
			expect(result.phase).toBe(GamePhase.Election);
			expect(result.chancellorNomineeId).toBe(3);
		});

		test("cannot nominate ineligible player", () => {
			const state = makeGameReadyState(5, {
				presidentIndex: 2,
				lastElectedChancellorId: 3,
			});
			const result = gameReducer(state, {
				type: "NOMINATE_CHANCELLOR",
				playerId: 3, // term-limited
			});
			expect(result.phase).toBe(GamePhase.ChancellorNomination); // unchanged
		});

		test("cannot nominate the president themselves", () => {
			const state = makeGameReadyState(5, { presidentIndex: 2 });
			const result = gameReducer(state, {
				type: "NOMINATE_CHANCELLOR",
				playerId: 2,
			});
			expect(result.phase).toBe(GamePhase.ChancellorNomination);
		});
	});

	describe("Voting", () => {
		test("all Ja votes pass the election", () => {
			let state = makeGameReadyState();
			state = gameReducer(state, {
				type: "NOMINATE_CHANCELLOR",
				playerId: 3,
			});
			state = castAllVotes(state, Vote.Ja);
			expect(state.phase).toBe(GamePhase.VoteResult);

			state = gameReducer(state, { type: "ACKNOWLEDGE_VOTE_RESULT" });
			expect(state.phase).toBe(GamePhase.PresidentLegislation);
		});

		test("all Nein votes fail the election", () => {
			let state = makeGameReadyState();
			state = gameReducer(state, {
				type: "NOMINATE_CHANCELLOR",
				playerId: 3,
			});
			state = castAllVotes(state, Vote.Nein);
			expect(state.phase).toBe(GamePhase.VoteResult);

			state = gameReducer(state, { type: "ACKNOWLEDGE_VOTE_RESULT" });
			// Failed election → advance to next round
			expect(state.phase).toBe(GamePhase.ChancellorNomination);
			expect(state.electionTracker.failedElections).toBe(1);
		});

		test("tie vote fails (strict majority)", () => {
			// 6 players: 3 Ja, 3 Nein → tie → fails
			let state = makeGameReadyState(6);
			state = gameReducer(state, {
				type: "NOMINATE_CHANCELLOR",
				playerId: 3,
			});

			// Cast 3 Ja and 3 Nein
			for (let i = 0; i < 6; i++) {
				state = gameReducer(state, {
					type: "CAST_VOTE",
					playerId: i,
					vote: i < 3 ? Vote.Ja : Vote.Nein,
				});
			}

			expect(state.phase).toBe(GamePhase.VoteResult);
			state = gameReducer(state, { type: "ACKNOWLEDGE_VOTE_RESULT" });
			expect(state.phase).toBe(GamePhase.ChancellorNomination);
			expect(state.electionTracker.failedElections).toBe(1);
		});

		test("prevents duplicate votes from same player", () => {
			let state = makeGameReadyState();
			state = gameReducer(state, {
				type: "NOMINATE_CHANCELLOR",
				playerId: 3,
			});

			// Cast first vote
			state = gameReducer(state, {
				type: "CAST_VOTE",
				playerId: 0,
				vote: Vote.Ja,
			});
			const votesAfterFirst = state.votes.length;

			// Try duplicate
			state = gameReducer(state, {
				type: "CAST_VOTE",
				playerId: 0,
				vote: Vote.Nein,
			});
			expect(state.votes.length).toBe(votesAfterFirst);
		});

		test("shortcut from Election records unanimous Ja votes and moves to vote result", () => {
			let state = makeGameReadyState();
			state = gameReducer(state, {
				type: "NOMINATE_CHANCELLOR",
				playerId: 3,
			});

			state = gameReducer(state, { type: "PASS_ELECTION_UNANIMOUSLY" });

			expect(state.phase).toBe(GamePhase.VoteResult);
			expect(state.votes).toHaveLength(5);
			expect(state.votes.every((voteRecord) => voteRecord.vote === Vote.Ja)).toBe(true);
			expect(state.votes.map((voteRecord) => voteRecord.playerId)).toEqual([0, 1, 2, 3, 4]);
		});

		test("shortcut from VoteCast overwrites partial votes with unanimous Ja votes", () => {
			let state = makeGameReadyState();
			state = gameReducer(state, {
				type: "NOMINATE_CHANCELLOR",
				playerId: 3,
			});

			state = gameReducer(state, {
				type: "CAST_VOTE",
				playerId: 0,
				vote: Vote.Nein,
			});
			expect(state.phase).toBe(GamePhase.VoteCast);

			state = gameReducer(state, { type: "PASS_ELECTION_UNANIMOUSLY" });

			expect(state.phase).toBe(GamePhase.VoteResult);
			expect(state.votes).toHaveLength(5);
			expect(state.votes.every((voteRecord) => voteRecord.vote === Vote.Ja)).toBe(true);
		});

		test("shortcut excludes dead players and still follows normal successful election flow", () => {
			let state = makeGameReadyState(6);
			state.players[4].isAlive = false;

			state = gameReducer(state, {
				type: "NOMINATE_CHANCELLOR",
				playerId: 3,
			});

			state = gameReducer(state, { type: "PASS_ELECTION_UNANIMOUSLY" });

			expect(state.phase).toBe(GamePhase.VoteResult);
			expect(state.votes).toHaveLength(5);
			expect(state.votes.some((voteRecord) => voteRecord.playerId === 4)).toBe(false);

			state = gameReducer(state, { type: "ACKNOWLEDGE_VOTE_RESULT" });

			expect(state.phase).toBe(GamePhase.PresidentLegislation);
			expect(state.electionTracker.failedElections).toBe(0);
		});

		test("shortcut is a no-op outside election voting phases", () => {
			const state = makeGameReadyState();
			const result = gameReducer(state, {
				type: "PASS_ELECTION_UNANIMOUSLY",
			});

			expect(result).toBe(state);
		});
	});

	describe("Chaos (3 failed elections)", () => {
		test("3 failed elections trigger chaos — top policy enacted", () => {
			let state = makeGameReadyState(5, {
				electionTracker: { failedElections: 2 },
			});

			// Set up a known draw pile
			const topPolicy = state.deck.drawPile[0];

			state = gameReducer(state, {
				type: "NOMINATE_CHANCELLOR",
				playerId: 3,
			});
			state = castAllVotes(state, Vote.Nein);
			state = gameReducer(state, { type: "ACKNOWLEDGE_VOTE_RESULT" });

			// Should be in ChaosPolicy phase (or GameOver if it won)
			expect(state.phase === GamePhase.ChaosPolicy || state.phase === GamePhase.GameOver).toBe(true);

			if (state.phase === GamePhase.ChaosPolicy) {
				// Term limits should be cleared
				expect(state.lastElectedPresidentId).toBeNull();
				expect(state.lastElectedChancellorId).toBeNull();
				expect(state.electionTracker.failedElections).toBe(0);

				// The policy should have been enacted
				if (topPolicy === PolicyType.Fascist) {
					expect(state.board.fascistPolicies).toBeGreaterThan(0);
				} else {
					expect(state.board.liberalPolicies).toBeGreaterThan(0);
				}
			}
		});
	});

	describe("Legislative Session", () => {
		test("president discards 1 of 3 policies, chancellor gets 2", () => {
			let state = makeGameReadyState();
			state = gameReducer(state, {
				type: "NOMINATE_CHANCELLOR",
				playerId: 3,
			});
			state = castAllVotes(state, Vote.Ja);
			state = gameReducer(state, { type: "ACKNOWLEDGE_VOTE_RESULT" });

			expect(state.phase).toBe(GamePhase.PresidentLegislation);
			expect(state.presidentHand).toHaveLength(3);

			// President discards first card
			state = gameReducer(state, {
				type: "PRESIDENT_DISCARD",
				policyIndex: 0,
			});
			expect(state.phase).toBe(GamePhase.ChancellorLegislation);
			expect(state.chancellorHand).toHaveLength(2);
			expect(state.presidentHand).toHaveLength(0);
		});

		test("chancellor enacts a policy", () => {
			let state = makeGameReadyState();
			state = gameReducer(state, {
				type: "NOMINATE_CHANCELLOR",
				playerId: 3,
			});
			state = castAllVotes(state, Vote.Ja);
			state = gameReducer(state, { type: "ACKNOWLEDGE_VOTE_RESULT" });

			// President discards
			state = gameReducer(state, {
				type: "PRESIDENT_DISCARD",
				policyIndex: 0,
			});

			const enacted = state.chancellorHand[0];
			state = gameReducer(state, {
				type: "CHANCELLOR_ENACT",
				policyIndex: 0,
			});

			// Should be PolicyEnacted or GameOver
			expect(state.phase === GamePhase.PolicyEnacted || state.phase === GamePhase.GameOver).toBe(true);

			if (state.phase === GamePhase.PolicyEnacted) {
				expect(state.lastEnactedPolicy).toBe(enacted);
				if (enacted === PolicyType.Liberal) {
					expect(state.board.liberalPolicies).toBe(1);
				} else {
					expect(state.board.fascistPolicies).toBe(1);
				}
			}
		});

		test("invalid discard index is rejected", () => {
			let state = makeGameReadyState();
			state = gameReducer(state, {
				type: "NOMINATE_CHANCELLOR",
				playerId: 3,
			});
			state = castAllVotes(state, Vote.Ja);
			state = gameReducer(state, { type: "ACKNOWLEDGE_VOTE_RESULT" });

			const result = gameReducer(state, {
				type: "PRESIDENT_DISCARD",
				policyIndex: 5,
			});
			expect(result.phase).toBe(GamePhase.PresidentLegislation); // unchanged
		});
	});

	describe("Veto Power", () => {
		test("veto is not available before 5th fascist policy", () => {
			let state = makeGameReadyState(5, {
				board: { liberalPolicies: 0, fascistPolicies: 4 },
				vetoUnlocked: false,
				phase: GamePhase.ChancellorLegislation,
				chancellorHand: [PolicyType.Fascist, PolicyType.Liberal],
			});

			const result = gameReducer(state, { type: "REQUEST_VETO" });
			expect(result.phase).toBe(GamePhase.ChancellorLegislation); // unchanged
		});

		test("veto request transitions to VetoRequested when unlocked", () => {
			let state = makeGameReadyState(5, {
				board: { liberalPolicies: 0, fascistPolicies: 5 },
				vetoUnlocked: true,
				phase: GamePhase.ChancellorLegislation,
				chancellorHand: [PolicyType.Fascist, PolicyType.Liberal],
			});

			const result = gameReducer(state, { type: "REQUEST_VETO" });
			expect(result.phase).toBe(GamePhase.VetoRequested);
		});

		test("president can reject veto — returns to chancellor legislation", () => {
			let state = makeGameReadyState(5, {
				vetoUnlocked: true,
				phase: GamePhase.VetoRequested,
				chancellorHand: [PolicyType.Fascist, PolicyType.Liberal],
			});

			const result = gameReducer(state, { type: "REJECT_VETO" });
			expect(result.phase).toBe(GamePhase.ChancellorLegislation);
		});

		test("president approves veto — policies discarded, election tracker advances", () => {
			let state = makeGameReadyState(5, {
				vetoUnlocked: true,
				phase: GamePhase.VetoRequested,
				chancellorHand: [PolicyType.Fascist, PolicyType.Liberal],
				electionTracker: { failedElections: 0 },
			});

			const result = gameReducer(state, { type: "APPROVE_VETO" });
			// Should advance to next round with tracker incremented
			expect(result.phase).toBe(GamePhase.ChancellorNomination);
			expect(result.electionTracker.failedElections).toBe(1);
			expect(result.chancellorHand).toHaveLength(0);
		});
	});

	describe("Executive Powers", () => {
		test("fascist policy with investigation power → ExecutiveInvestigate", () => {
			// 7-8 player game, 2nd fascist policy = Investigate
			let state = makeGameReadyState(7, {
				board: { liberalPolicies: 0, fascistPolicies: 2 },
				lastEnactedPolicy: PolicyType.Fascist,
				phase: GamePhase.PolicyEnacted,
			});

			const result = gameReducer(state, { type: "ACKNOWLEDGE_POLICY" });
			expect(result.phase).toBe(GamePhase.ExecutiveInvestigate);
		});

		test("investigation shows party membership and advances", () => {
			let state = makeGameReadyState(7, {
				phase: GamePhase.ExecutiveInvestigate,
				presidentIndex: 2,
			});

			state = gameReducer(state, {
				type: "INVESTIGATE_PLAYER",
				playerId: 0,
			});
			expect(state.phase).toBe(GamePhase.InvestigationResult);
			expect(state.investigationTargetId).toBe(0);
			expect(state.investigatedPlayerIds).toContain(0);

			state = gameReducer(state, { type: "ACKNOWLEDGE_INVESTIGATION" });
			expect(state.phase).toBe(GamePhase.ChancellorNomination);
		});

		test("cannot investigate same player twice", () => {
			let state = makeGameReadyState(7, {
				phase: GamePhase.ExecutiveInvestigate,
				presidentIndex: 2,
				investigatedPlayerIds: [3],
			});

			const result = gameReducer(state, {
				type: "INVESTIGATE_PLAYER",
				playerId: 3,
			});
			expect(result.phase).toBe(GamePhase.ExecutiveInvestigate); // unchanged
		});

		test("policy peek shows top 3 cards and advances", () => {
			// 5-6 player game, 3rd fascist policy = Peek
			let state = makeGameReadyState(5, {
				board: { liberalPolicies: 0, fascistPolicies: 3 },
				lastEnactedPolicy: PolicyType.Fascist,
				phase: GamePhase.PolicyEnacted,
			});

			state = gameReducer(state, { type: "ACKNOWLEDGE_POLICY" });
			expect(state.phase).toBe(GamePhase.ExecutivePeek);
			expect(state.peekedPolicies).toHaveLength(3);

			state = gameReducer(state, { type: "ACKNOWLEDGE_PEEK" });
			expect(state.phase).toBe(GamePhase.ChancellorNomination);
			expect(state.peekedPolicies).toHaveLength(0);
		});

		test("special election transitions correctly", () => {
			// 7-8 player game, 3rd fascist policy = Special Election
			let state = makeGameReadyState(7, {
				board: { liberalPolicies: 0, fascistPolicies: 3 },
				lastEnactedPolicy: PolicyType.Fascist,
				phase: GamePhase.PolicyEnacted,
				presidentIndex: 2,
			});

			state = gameReducer(state, { type: "ACKNOWLEDGE_POLICY" });
			expect(state.phase).toBe(GamePhase.ExecutiveSpecialElection);

			state = gameReducer(state, {
				type: "SELECT_SPECIAL_ELECTION",
				playerId: 5,
			});
			expect(state.phase).toBe(GamePhase.ChancellorNomination);
			expect(state.presidentIndex).toBe(5);
			expect(state.specialElectionCallerIndex).toBe(2);
		});

		test("execution kills a player and advances", () => {
			let state = makeGameReadyState(7, {
				board: { liberalPolicies: 0, fascistPolicies: 4 },
				lastEnactedPolicy: PolicyType.Fascist,
				phase: GamePhase.PolicyEnacted,
				presidentIndex: 2,
			});

			state = gameReducer(state, { type: "ACKNOWLEDGE_POLICY" });
			expect(state.phase).toBe(GamePhase.ExecutiveExecution);

			// Execute a non-Hitler player
			state = gameReducer(state, {
				type: "EXECUTE_PLAYER",
				playerId: 3,
			});
			expect(state.players[3].isAlive).toBe(false);
			expect(state.phase).toBe(GamePhase.ChancellorNomination);
		});

		test("executing Hitler ends the game — liberals win", () => {
			let state = makeGameReadyState(7, {
				phase: GamePhase.ExecutiveExecution,
				presidentIndex: 2,
			});

			// Player 0 is Hitler
			state = gameReducer(state, {
				type: "EXECUTE_PLAYER",
				playerId: 0,
			});
			expect(state.phase).toBe(GamePhase.GameOver);
			expect(state.winner).toBe(Team.Liberal);
			expect(state.victoryReason).toBe(VictoryReason.HitlerExecuted);
		});
	});

	describe("Victory Conditions", () => {
		test("5 liberal policies enacted → liberal win", () => {
			let state = makeGameReadyState(5, {
				board: { liberalPolicies: 4, fascistPolicies: 0 },
				phase: GamePhase.ChancellorLegislation,
				chancellorHand: [PolicyType.Liberal, PolicyType.Fascist],
			});

			state = gameReducer(state, {
				type: "CHANCELLOR_ENACT",
				policyIndex: 0,
			});
			expect(state.phase).toBe(GamePhase.GameOver);
			expect(state.winner).toBe(Team.Liberal);
			expect(state.victoryReason).toBe(VictoryReason.LiberalPolicies);
		});

		test("6 fascist policies enacted → fascist win", () => {
			let state = makeGameReadyState(5, {
				board: { liberalPolicies: 0, fascistPolicies: 5 },
				phase: GamePhase.ChancellorLegislation,
				chancellorHand: [PolicyType.Fascist, PolicyType.Liberal],
				vetoUnlocked: true,
			});

			state = gameReducer(state, {
				type: "CHANCELLOR_ENACT",
				policyIndex: 0,
			});
			expect(state.phase).toBe(GamePhase.GameOver);
			expect(state.winner).toBe(Team.Fascist);
			expect(state.victoryReason).toBe(VictoryReason.FascistPolicies);
		});

		test("Hitler elected chancellor after 3+ fascist policies → fascist win", () => {
			let state = makeGameReadyState(5, {
				board: { liberalPolicies: 0, fascistPolicies: 3 },
				chancellorNomineeId: 0, // Hitler
				phase: GamePhase.VoteResult,
				votes: [
					{ playerId: 0, vote: Vote.Ja },
					{ playerId: 1, vote: Vote.Ja },
					{ playerId: 2, vote: Vote.Ja },
					{ playerId: 3, vote: Vote.Ja },
					{ playerId: 4, vote: Vote.Nein },
				],
			});

			state = gameReducer(state, { type: "ACKNOWLEDGE_VOTE_RESULT" });
			expect(state.phase).toBe(GamePhase.GameOver);
			expect(state.winner).toBe(Team.Fascist);
			expect(state.victoryReason).toBe(VictoryReason.HitlerElectedChancellor);
		});
	});

	describe("Selectors", () => {
		test("getPartyMembership returns Liberal for liberals", () => {
			const player = makePlayers(1)[0];
			player.role = Role.Liberal;
			expect(getPartyMembership(player)).toBe(PartyMembership.Liberal);
		});

		test("getPartyMembership returns Fascist for fascists", () => {
			const player = makePlayers(1)[0];
			player.role = Role.Fascist;
			expect(getPartyMembership(player)).toBe(PartyMembership.Fascist);
		});

		test("getPartyMembership returns Fascist for Hitler", () => {
			const player = makePlayers(1)[0];
			player.role = Role.Hitler;
			expect(getPartyMembership(player)).toBe(PartyMembership.Fascist);
		});

		test("getCurrentPresident returns the current president", () => {
			const state = makeGameReadyState(5, { presidentIndex: 2 });
			const president = getCurrentPresident(state);
			expect(president).toBeDefined();
			expect(president?.id).toBe(2);
		});

		test("getChancellor returns the nominated chancellor", () => {
			const state = makeGameReadyState(5, { chancellorNomineeId: 3 });
			const chancellor = getChancellor(state);
			expect(chancellor).toBeDefined();
			expect(chancellor?.id).toBe(3);
		});
	});

	describe("NEW_GAME", () => {
		test("resets to initial state", () => {
			const state = makeGameReadyState(5, {
				board: { liberalPolicies: 3, fascistPolicies: 2 },
				round: 5,
			});

			const result = gameReducer(state, { type: "NEW_GAME" });
			expect(result.phase).toBe(GamePhase.Setup);
			expect(result.players).toHaveLength(0);
			expect(result.board.liberalPolicies).toBe(0);
			expect(result.board.fascistPolicies).toBe(0);
			expect(result.round).toBe(0);
		});
	});

	describe("Phase Guards", () => {
		test("actions in wrong phase are no-ops", () => {
			const state = makeGameReadyState(5);

			// Try voting during nomination phase
			const result = gameReducer(state, {
				type: "CAST_VOTE",
				playerId: 0,
				vote: Vote.Ja,
			});
			expect(result).toBe(state); // should return exact same reference

			// Try president discard during nomination
			const result2 = gameReducer(state, {
				type: "PRESIDENT_DISCARD",
				policyIndex: 0,
			});
			expect(result2).toBe(state);
		});
	});
});
