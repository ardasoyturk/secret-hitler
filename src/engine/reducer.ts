/**
 * Secret Hitler — State Machine / Game Reducer
 *
 * Pure function: (state, action) → newState
 *
 * Every transition is guarded by phase checks and rule validations.
 * No side effects. All randomness is contained in deck operations.
 *
 * GAME FLOW (per official rules):
 * 1. Setup → NightRound → NightReveal (per player)
 * 2. ChancellorNomination → Election → VoteCast (per player) → VoteResult
 *    - Vote passes → check Hitler chancellor win →
 *      PresidentLegislation → ChancellorLegislation → PolicyEnacted →
 *      check victory → executive power or next round
 *    - Vote fails → advance tracker → check chaos → next round
 * 3. Executive powers: Investigate / Peek / Special Election / Execution
 * 4. GameOver
 */

import {
	CHANCELLOR_HAND_SIZE,
	MAX_PLAYERS,
	MIN_PLAYERS,
	VETO_UNLOCK_FASCIST_POLICY_COUNT,
	getExecutivePower,
} from "./constants";
import {
	createDeck,
	discardPolicy,
	drawCards,
	reshuffleIfNeeded,
	peekCards,
} from "./deck";
import { doesElectionPass, shouldChaosOccur } from "./election";
import {
	getNextPresidentIndex,
	isEligibleChancellor,
	canInvestigate,
} from "./eligibility";
import { assignRoles } from "./roles";
import {
	ExecutivePower,
	GamePhase,
	PartyMembership,
	PolicyType,
	Role,
	type GameAction,
	type GameState,
	type LogEntry,
	type Player,
	PLAYER_COLORS,
} from "./types";
import {
	checkExecutionVictory,
	checkHitlerChancellorVictory,
	checkPolicyVictory,
} from "./victory";

// ─── Initial State ──────────────────────────────────────────────────

export function createInitialState(): GameState {
	return {
		phase: GamePhase.Setup,
		players: [],
		deck: { drawPile: [], discardPile: [] },
		board: { liberalPolicies: 0, fascistPolicies: 0 },
		electionTracker: { failedElections: 0 },
		presidentIndex: 0,
		chancellorNomineeId: null,
		lastElectedPresidentId: null,
		lastElectedChancellorId: null,
		votes: [],
		currentVoterIndex: 0,
		presidentHand: [],
		chancellorHand: [],
		lastEnactedPolicy: null,
		vetoUnlocked: false,
		governmentHistory: [],
		round: 0,
		nightRoundPlayerIndex: 0,
		specialElectionCallerIndex: null,
		winner: null,
		victoryReason: null,
		investigatedPlayerIds: [],
		investigationTargetId: null,
		peekedPolicies: [],
		executedPlayerId: null,
		specialElectionPresidentId: null,
		log: [],
	};
}

// ─── Helpers ────────────────────────────────────────────────────────

function addLog(state: GameState, message: string): LogEntry {
	return {
		round: state.round,
		phase: state.phase,
		message,
		timestamp: Date.now(),
	};
}

function advanceToNextRound(state: GameState): GameState {
	const nextPresidentIndex = getNextPresidentIndex(state);
	return {
		...state,
		phase: GamePhase.ChancellorNomination,
		presidentIndex: nextPresidentIndex,
		chancellorNomineeId: null,
		votes: [],
		currentVoterIndex: 0,
		presidentHand: [],
		chancellorHand: [],
		lastEnactedPolicy: null,
		round: state.round + 1,
		specialElectionCallerIndex: null,
		investigationTargetId: null,
		peekedPolicies: [],
		executedPlayerId: null,
		specialElectionPresidentId: null,
	};
}

function enactPolicy(state: GameState, policy: PolicyType): GameState {
	const newBoard = { ...state.board };
	if (policy === PolicyType.Liberal) {
		newBoard.liberalPolicies += 1;
	} else {
		newBoard.fascistPolicies += 1;
	}

	const vetoUnlocked =
		state.vetoUnlocked ||
		newBoard.fascistPolicies >= VETO_UNLOCK_FASCIST_POLICY_COUNT;

	return {
		...state,
		board: newBoard,
		lastEnactedPolicy: policy,
		vetoUnlocked,
	};
}

// ─── The Reducer ────────────────────────────────────────────────────

export function gameReducer(state: GameState, action: GameAction): GameState {
	switch (action.type) {
		// ── SETUP ─────────────────────────────────────────────────────
		case "ADD_PLAYER": {
			if (state.phase !== GamePhase.Setup) return state;
			if (state.players.length >= MAX_PLAYERS) return state;
			if (state.players.some((p) => p.name === action.name)) return state;

			const newPlayer: Player = {
				id: state.players.length,
				name: action.name,
				portraitIndex: action.portraitIndex,
				color: PLAYER_COLORS[
					state.players.length % PLAYER_COLORS.length
				],
				role: Role.Liberal, // placeholder, assigned on START_GAME
				isAlive: true,
				hasBeenInvestigated: false,
			};

			return {
				...state,
				players: [...state.players, newPlayer],
				log: [
					...state.log,
					addLog(state, `${action.name} joined the game.`),
				],
			};
		}

		case "REMOVE_PLAYER": {
			if (state.phase !== GamePhase.Setup) return state;
			const filtered = state.players.filter(
				(p) => p.id !== action.playerId,
			);
			// Re-index IDs and colors
			const reindexed = filtered.map((p, i) => ({
				...p,
				id: i,
				color: PLAYER_COLORS[i % PLAYER_COLORS.length],
			}));
			return {
				...state,
				players: reindexed,
			};
		}

		case "REORDER_PLAYER": {
			if (state.phase !== GamePhase.Setup) return state;
			const idx = state.players.findIndex(
				(p) => p.id === action.playerId,
			);
			if (idx === -1) return state;
			const newPlayers = [...state.players];
			if (action.direction === "up" && idx > 0) {
				[newPlayers[idx - 1], newPlayers[idx]] = [
					newPlayers[idx],
					newPlayers[idx - 1],
				];
			} else if (
				action.direction === "down" &&
				idx < newPlayers.length - 1
			) {
				[newPlayers[idx], newPlayers[idx + 1]] = [
					newPlayers[idx + 1],
					newPlayers[idx],
				];
			} else {
				return state;
			}
			// Re-index IDs and colors after reorder
			const reordered = newPlayers.map((p, i) => ({
				...p,
				id: i,
				color: PLAYER_COLORS[i % PLAYER_COLORS.length],
			}));
			return { ...state, players: reordered };
		}

		case "START_GAME": {
			if (state.phase !== GamePhase.Setup) return state;
			if (state.players.length < MIN_PLAYERS) return state;
			if (state.players.length > MAX_PLAYERS) return state;

			const roles = assignRoles(state.players.length);
			const playersWithRoles = state.players.map((p, i) => ({
				...p,
				role: roles[i],
			}));

			const deck = createDeck();
			// Randomly pick first presidential candidate
			const firstPresidentIndex = Math.floor(
				Math.random() * state.players.length,
			);

			return {
				...state,
				phase: GamePhase.NightRound,
				players: playersWithRoles,
				deck,
				presidentIndex: firstPresidentIndex,
				nightRoundPlayerIndex: 0,
				round: 1,
				log: [
					...state.log,
					addLog(
						state,
						`Game started with ${state.players.length} players.`,
					),
				],
			};
		}

		// ── NIGHT ROUND (role reveal) ─────────────────────────────────
		case "ACKNOWLEDGE_NIGHT": {
			if (
				state.phase !== GamePhase.NightRound &&
				state.phase !== GamePhase.NightReveal
			)
				return state;

			// If we're on the NightRound phase for a specific player
			if (state.phase === GamePhase.NightRound) {
				// Show this player's role
				return {
					...state,
					phase: GamePhase.NightReveal,
					nightRoundPlayerIndex: action.playerIndex,
				};
			}

			// After viewing, move to next player or start game
			const nextPlayerIndex = state.nightRoundPlayerIndex + 1;
			if (nextPlayerIndex >= state.players.length) {
				// All players have seen their roles, start the game
				return {
					...state,
					phase: GamePhase.ChancellorNomination,
					nightRoundPlayerIndex: 0,
				};
			}

			return {
				...state,
				phase: GamePhase.NightRound,
				nightRoundPlayerIndex: nextPlayerIndex,
			};
		}

		// ── CHANCELLOR NOMINATION ─────────────────────────────────────
		case "NOMINATE_CHANCELLOR":
			if (state.phase !== GamePhase.ChancellorNomination) return state;
			if (!isEligibleChancellor(state, action.playerId)) return state;

			return {
				...state,
				phase: GamePhase.Election,
				chancellorNomineeId: action.playerId,
				votes: [],
				currentVoterIndex: 0,
				log: [
					...state.log,
					addLog(
						state,
						`President ${state.players[state.presidentIndex].name} nominated ${state.players.find((p) => p.id === action.playerId)?.name} as Chancellor.`,
					),
				],
			};

		// ── ELECTION / VOTING ─────────────────────────────────────────
		case "CAST_VOTE": {
			if (
				state.phase !== GamePhase.Election &&
				state.phase !== GamePhase.VoteCast
			)
				return state;

			const voter = state.players.find((p) => p.id === action.playerId);
			if (!voter || !voter.isAlive) return state;

			// Prevent double voting
			if (state.votes.some((v) => v.playerId === action.playerId))
				return state;

			const newVotes = [
				...state.votes,
				{ playerId: action.playerId, vote: action.vote },
			];

			const alivePlayers = state.players.filter((p) => p.isAlive);

			// Check if all alive players have voted
			if (newVotes.length >= alivePlayers.length) {
				// All votes are in — move to vote result
				return {
					...state,
					phase: GamePhase.VoteResult,
					votes: newVotes,
				};
			}

			// More votes needed — find the next alive voter
			let nextVoterIdx = state.currentVoterIndex + 1;
			while (
				nextVoterIdx < state.players.length &&
				!state.players[nextVoterIdx].isAlive
			) {
				nextVoterIdx++;
			}

			return {
				...state,
				phase: GamePhase.VoteCast,
				votes: newVotes,
				currentVoterIndex: nextVoterIdx,
			};
		}

		case "ACKNOWLEDGE_VOTE_RESULT": {
			if (state.phase !== GamePhase.VoteResult) return state;

			const electionPasses = doesElectionPass(state.votes);

			if (electionPasses) {
				// Successful election
				const chancellorPlayer = state.players.find(
					(p) => p.id === state.chancellorNomineeId,
				);

				if (!chancellorPlayer) return state;

				// Check Hitler chancellor victory
				const hitlerCheck = checkHitlerChancellorVictory(
					state.board,
					chancellorPlayer,
				);
				if (hitlerCheck.isGameOver) {
					return {
						...state,
						phase: GamePhase.GameOver,
						winner: hitlerCheck.winner,
						victoryReason: hitlerCheck.reason,
						lastElectedPresidentId:
							state.players[state.presidentIndex].id,
						lastElectedChancellorId: state.chancellorNomineeId,
						log: [
							...state.log,
							addLog(
								state,
								"Hitler was elected Chancellor! Fascists win!",
							),
						],
					};
				}

				// Election passed — move to legislative session
				// Reshuffle if needed, then draw 3 cards
				let deck = reshuffleIfNeeded(state.deck);
				const { drawn, deck: deckAfterDraw } = drawCards(deck);

				return {
					...state,
					phase: GamePhase.PresidentLegislation,
					deck: deckAfterDraw,
					presidentHand: drawn,
					lastElectedPresidentId:
						state.players[state.presidentIndex].id,
					lastElectedChancellorId: state.chancellorNomineeId,
					electionTracker: { failedElections: 0 },
					log: [
						...state.log,
						addLog(
							state,
							`Election passed! ${state.players[state.presidentIndex].name} is President, ${chancellorPlayer.name} is Chancellor.`,
						),
					],
				};
			}
			// Election failed
			const newFailedElections =
				state.electionTracker.failedElections + 1;

			if (shouldChaosOccur(newFailedElections)) {
				// CHAOS: top policy enacted, tracker resets, term limits cleared
				let deck = reshuffleIfNeeded(state.deck);
				const topPolicy = deck.drawPile[0];
				if (!topPolicy) return state;

				const deckAfterDraw = {
					drawPile: deck.drawPile.slice(1),
					discardPile: deck.discardPile,
				};

				const stateWithPolicy = enactPolicy(
					{
						...state,
						deck: deckAfterDraw,
					},
					topPolicy,
				);

				// Check victory after chaos policy
				const victoryCheck = checkPolicyVictory(stateWithPolicy.board);
				if (victoryCheck.isGameOver) {
					return {
						...stateWithPolicy,
						phase: GamePhase.GameOver,
						winner: victoryCheck.winner,
						victoryReason: victoryCheck.reason,
						electionTracker: { failedElections: 0 },
						lastElectedPresidentId: null,
						lastElectedChancellorId: null,
						log: [
							...state.log,
							addLog(
								state,
								`Chaos! Country in turmoil. A ${topPolicy} policy was enacted.`,
							),
						],
					};
				}

				return {
					...stateWithPolicy,
					phase: GamePhase.ChaosPolicy,
					electionTracker: { failedElections: 0 },
					// Term limits reset on chaos
					lastElectedPresidentId: null,
					lastElectedChancellorId: null,
					log: [
						...state.log,
						addLog(
							state,
							`Chaos! Country in turmoil. A ${topPolicy} policy was enacted.`,
						),
					],
				};
			}

			// Normal failed election — advance tracker, move to next president
			const nextState = advanceToNextRound({
				...state,
				electionTracker: { failedElections: newFailedElections },
				log: [...state.log, addLog(state, "Election failed.")],
			});

			return nextState;
		}

		// ── LEGISLATIVE SESSION ───────────────────────────────────────
		case "PRESIDENT_DISCARD": {
			if (state.phase !== GamePhase.PresidentLegislation) return state;
			if (
				action.policyIndex < 0 ||
				action.policyIndex >= state.presidentHand.length
			)
				return state;

			const discarded = state.presidentHand[action.policyIndex];
			const remaining = state.presidentHand.filter(
				(_, i) => i !== action.policyIndex,
			);

			// Should always result in 2 cards for chancellor
			if (remaining.length !== CHANCELLOR_HAND_SIZE) return state;

			return {
				...state,
				phase: GamePhase.ChancellorLegislation,
				presidentHand: [],
				chancellorHand: remaining,
				deck: discardPolicy(state.deck, discarded),
				log: [
					...state.log,
					addLog(state, "President discarded a policy."),
				],
			};
		}

		case "CHANCELLOR_ENACT": {
			if (state.phase !== GamePhase.ChancellorLegislation) return state;
			if (
				action.policyIndex < 0 ||
				action.policyIndex >= state.chancellorHand.length
			)
				return state;

			const enacted = state.chancellorHand[action.policyIndex];
			const discarded = state.chancellorHand[1 - action.policyIndex];

			const stateWithPolicy = enactPolicy(state, enacted);
			const deckAfterDiscard = discardPolicy(
				stateWithPolicy.deck,
				discarded,
			);

			// Check victory
			const victoryCheck = checkPolicyVictory(stateWithPolicy.board);
			if (victoryCheck.isGameOver) {
				return {
					...stateWithPolicy,
					phase: GamePhase.GameOver,
					deck: deckAfterDiscard,
					chancellorHand: [],
					winner: victoryCheck.winner,
					victoryReason: victoryCheck.reason,
					log: [
						...state.log,
						addLog(state, `A ${enacted} policy was enacted!`),
					],
				};
			}

			return {
				...stateWithPolicy,
				phase: GamePhase.PolicyEnacted,
				deck: deckAfterDiscard,
				chancellorHand: [],
				governmentHistory: [
					...state.governmentHistory,
					{
						round: state.round,
						presidentId: state.players[state.presidentIndex].id,
						chancellorId: state.chancellorNomineeId!,
						policyEnacted: enacted,
					},
				],
				log: [
					...state.log,
					addLog(state, `A ${enacted} policy was enacted!`),
				],
			};
		}

		// ── VETO ──────────────────────────────────────────────────────
		case "REQUEST_VETO":
			if (state.phase !== GamePhase.ChancellorLegislation) return state;
			if (!state.vetoUnlocked) return state;

			return {
				...state,
				phase: GamePhase.VetoRequested,
				log: [
					...state.log,
					addLog(state, "Chancellor requested a veto!"),
				],
			};

		case "APPROVE_VETO": {
			if (state.phase !== GamePhase.VetoRequested) return state;

			// Both policies are discarded, election tracker advances
			const discardedDeck = state.chancellorHand.reduce(
				(d, policy) => discardPolicy(d, policy),
				state.deck,
			);

			const newFailedElections =
				state.electionTracker.failedElections + 1;

			// Check chaos after veto
			if (shouldChaosOccur(newFailedElections)) {
				let deck = reshuffleIfNeeded(discardedDeck);
				const topPolicy = deck.drawPile[0];
				if (!topPolicy) return state;

				const deckAfterChaos = {
					drawPile: deck.drawPile.slice(1),
					discardPile: deck.discardPile,
				};

				const stateWithPolicy = enactPolicy(
					{ ...state, deck: deckAfterChaos },
					topPolicy,
				);

				const victoryCheck = checkPolicyVictory(stateWithPolicy.board);
				if (victoryCheck.isGameOver) {
					return {
						...stateWithPolicy,
						phase: GamePhase.GameOver,
						chancellorHand: [],
						winner: victoryCheck.winner,
						victoryReason: victoryCheck.reason,
						electionTracker: { failedElections: 0 },
						lastElectedPresidentId: null,
						lastElectedChancellorId: null,
						log: [
							...state.log,
							addLog(
								state,
								"Veto approved! Chaos ensues — a policy is enacted.",
							),
						],
					};
				}

				return {
					...stateWithPolicy,
					phase: GamePhase.ChaosPolicy,
					chancellorHand: [],
					electionTracker: { failedElections: 0 },
					lastElectedPresidentId: null,
					lastElectedChancellorId: null,
					log: [
						...state.log,
						addLog(
							state,
							"Veto approved! Chaos ensues — a policy is enacted.",
						),
					],
				};
			}

			return advanceToNextRound({
				...state,
				deck: discardedDeck,
				chancellorHand: [],
				electionTracker: { failedElections: newFailedElections },
				log: [
					...state.log,
					addLog(state, "Veto approved! Both policies discarded."),
				],
			});
		}

		case "REJECT_VETO":
			if (state.phase !== GamePhase.VetoRequested) return state;

			// Chancellor must enact one of the two policies
			return {
				...state,
				phase: GamePhase.ChancellorLegislation,
				log: [
					...state.log,
					addLog(
						state,
						"President rejected the veto. Chancellor must enact a policy.",
					),
				],
			};

		// ── POLICY ENACTED (acknowledge + check executive power) ──────
		case "ACKNOWLEDGE_POLICY":
			if (
				state.phase !== GamePhase.PolicyEnacted &&
				state.phase !== GamePhase.ChaosPolicy
			)
				return state;

			// If this was a chaos policy, skip executive powers per rules
			if (state.phase === GamePhase.ChaosPolicy) {
				return advanceToNextRound(state);
			}

			// Check for executive power (only on fascist policies)
			if (state.lastEnactedPolicy === PolicyType.Fascist) {
				const power = getExecutivePower(
					state.board.fascistPolicies,
					state.players.length,
				);

				switch (power) {
					case ExecutivePower.InvestigateLoyalty:
						return {
							...state,
							phase: GamePhase.ExecutiveInvestigate,
						};
					case ExecutivePower.PolicyPeek: {
						const deck = reshuffleIfNeeded(state.deck);
						const peeked = peekCards(deck);
						return {
							...state,
							phase: GamePhase.ExecutivePeek,
							deck,
							peekedPolicies: peeked,
						};
					}
					case ExecutivePower.SpecialElection:
						return {
							...state,
							phase: GamePhase.ExecutiveSpecialElection,
						};
					case ExecutivePower.Execution:
						return {
							...state,
							phase: GamePhase.ExecutiveExecution,
						};
					case ExecutivePower.None:
					default:
						return advanceToNextRound(state);
				}
			}

			// Liberal policy — no executive power
			return advanceToNextRound(state);

		case "ACKNOWLEDGE_CHAOS":
			if (state.phase !== GamePhase.ChaosPolicy) return state;
			return advanceToNextRound(state);

		// ── EXECUTIVE: INVESTIGATE ────────────────────────────────────
		case "INVESTIGATE_PLAYER":
			if (state.phase !== GamePhase.ExecutiveInvestigate) return state;
			if (!canInvestigate(state, action.playerId)) return state;

			return {
				...state,
				phase: GamePhase.InvestigationResult,
				investigationTargetId: action.playerId,
				investigatedPlayerIds: [
					...state.investigatedPlayerIds,
					action.playerId,
				],
				log: [
					...state.log,
					addLog(
						state,
						`President investigated ${state.players.find((p) => p.id === action.playerId)?.name}.`,
					),
				],
			};

		case "ACKNOWLEDGE_INVESTIGATION":
			if (state.phase !== GamePhase.InvestigationResult) return state;
			return advanceToNextRound({
				...state,
				investigationTargetId: null,
			});

		// ── EXECUTIVE: PEEK ───────────────────────────────────────────
		case "ACKNOWLEDGE_PEEK":
			if (state.phase !== GamePhase.ExecutivePeek) return state;
			return advanceToNextRound({
				...state,
				peekedPolicies: [],
			});

		// ── EXECUTIVE: SPECIAL ELECTION ───────────────────────────────
		case "SELECT_SPECIAL_ELECTION": {
			if (state.phase !== GamePhase.ExecutiveSpecialElection)
				return state;

			const targetPlayer = state.players.find(
				(p) => p.id === action.playerId,
			);
			if (!targetPlayer || !targetPlayer.isAlive) return state;
			if (action.playerId === state.players[state.presidentIndex].id)
				return state;

			const targetIndex = state.players.findIndex(
				(p) => p.id === action.playerId,
			);

			return {
				...state,
				phase: GamePhase.ChancellorNomination,
				// Remember who called the special election so we can resume
				// rotation from the next player after them
				specialElectionCallerIndex: state.presidentIndex,
				presidentIndex: targetIndex,
				chancellorNomineeId: null,
				votes: [],
				currentVoterIndex: 0,
				presidentHand: [],
				chancellorHand: [],
				lastEnactedPolicy: null,
				round: state.round + 1,
				investigationTargetId: null,
				peekedPolicies: [],
				executedPlayerId: null,
				specialElectionPresidentId: action.playerId,
				log: [
					...state.log,
					addLog(
						state,
						`President called a Special Election! ${targetPlayer.name} is the next Presidential Candidate.`,
					),
				],
			};
		}

		// ── EXECUTIVE: EXECUTION ──────────────────────────────────────
		case "EXECUTE_PLAYER": {
			if (state.phase !== GamePhase.ExecutiveExecution) return state;

			const targetPlayer = state.players.find(
				(p) => p.id === action.playerId,
			);
			if (!targetPlayer || !targetPlayer.isAlive) return state;
			if (action.playerId === state.players[state.presidentIndex].id)
				return state;

			// Kill the player
			const updatedPlayers = state.players.map((p) =>
				p.id === action.playerId ? { ...p, isAlive: false } : p,
			);

			// Check if Hitler was executed
			const hitlerCheck = checkExecutionVictory(targetPlayer);
			if (hitlerCheck.isGameOver) {
				return {
					...state,
					phase: GamePhase.GameOver,
					players: updatedPlayers,
					executedPlayerId: action.playerId,
					winner: hitlerCheck.winner,
					victoryReason: hitlerCheck.reason,
					log: [
						...state.log,
						addLog(
							state,
							`${targetPlayer.name} was executed. They were Hitler! Liberals win!`,
						),
					],
				};
			}

			// Not Hitler — continue the game
			return advanceToNextRound({
				...state,
				players: updatedPlayers,
				executedPlayerId: action.playerId,
				log: [
					...state.log,
					addLog(
						state,
						`${targetPlayer.name} was executed. They were not Hitler.`,
					),
				],
			});
		}

		// ── NEW GAME ──────────────────────────────────────────────────
		case "NEW_GAME":
			return createInitialState();

		default:
			return state;
	}
}

// ─── Selectors ──────────────────────────────────────────────────────

/**
 * Get the party membership of a player for investigation.
 * Hitler shows as Fascist per the rules.
 */
export function getPartyMembership(player: Player): PartyMembership {
	if (player.role === Role.Liberal) return PartyMembership.Liberal;
	return PartyMembership.Fascist; // both Fascist and Hitler
}

/**
 * Get the current president player.
 */
export function getCurrentPresident(state: GameState): Player | undefined {
	return state.players[state.presidentIndex];
}

/**
 * Get the nominated/elected chancellor player.
 */
export function getChancellor(state: GameState): Player | undefined {
	return state.players.find((p) => p.id === state.chancellorNomineeId);
}
