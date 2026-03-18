/**
 * Secret Hitler — Core Type Definitions
 *
 * All types follow the official Secret Hitler rules exactly.
 * Reference: rules.pdf
 */

// ─── Enums ──────────────────────────────────────────────────────────

/** The two teams in Secret Hitler */
export enum Team {
	Liberal = "liberal",
	Fascist = "fascist",
}

/** A player's secret role */
export enum Role {
	Liberal = "liberal",
	Fascist = "fascist",
	Hitler = "hitler",
}

/** Party membership (shown during investigation) — Hitler shows as Fascist */
export enum PartyMembership {
	Liberal = "liberal",
	Fascist = "fascist",
}

/** Policy tile type */
export enum PolicyType {
	Liberal = "liberal",
	Fascist = "fascist",
}

/** Vote ballot */
export enum Vote {
	Ja = "ja",
	Nein = "nein",
}

/**
 * Every distinct phase of the game state machine.
 * Transitions follow strictly from the official rules.
 */
export enum GamePhase {
	/** Pre-game: players are being added */
	Setup = "setup",

	/** Each player privately views their role + team info */
	NightRound = "night_round",

	/** One player is viewing their night info */
	NightReveal = "night_reveal",

	/** President nominates a chancellor candidate */
	ChancellorNomination = "chancellor_nomination",

	/** All players vote Ja/Nein on the proposed government */
	Election = "election",

	/** A single player casts their vote (pass-and-play) */
	VoteCast = "vote_cast",

	/** Vote results are revealed to all */
	VoteResult = "vote_result",

	/** President examines 3 policy tiles and discards 1 */
	PresidentLegislation = "president_legislation",

	/** Chancellor picks from 2 remaining tiles (or triggers veto) */
	ChancellorLegislation = "chancellor_legislation",

	/** Chancellor requests veto; president must approve/reject */
	VetoRequested = "veto_requested",

	/** A policy was enacted — shown to all */
	PolicyEnacted = "policy_enacted",

	/** Executive power: President investigates a player's party membership */
	ExecutiveInvestigate = "executive_investigate",

	/** Result of investigation shown to president */
	InvestigationResult = "investigation_result",

	/** Executive power: President peeks at top 3 policy tiles */
	ExecutivePeek = "executive_peek",

	/** Executive power: President calls a special election */
	ExecutiveSpecialElection = "executive_special_election",

	/** Executive power: President executes a player */
	ExecutiveExecution = "executive_execution",

	/** Chaos: election tracker hit 3, top policy auto-enacted */
	ChaosPolicy = "chaos_policy",

	/** Game over — a team has won */
	GameOver = "game_over",
}

/** Executive powers that can be triggered by fascist policy enactment */
export enum ExecutivePower {
	None = "none",
	InvestigateLoyalty = "investigate_loyalty",
	PolicyPeek = "policy_peek",
	SpecialElection = "special_election",
	Execution = "execution",
}

/** How the game was won */
export enum VictoryReason {
	/** 5 liberal policies enacted */
	LiberalPolicies = "liberal_policies",
	/** 6 fascist policies enacted */
	FascistPolicies = "fascist_policies",
	/** Hitler was executed */
	HitlerExecuted = "hitler_executed",
	/** Hitler elected chancellor after 3+ fascist policies */
	HitlerElectedChancellor = "hitler_elected_chancellor",
}

// ─── Data Structures ────────────────────────────────────────────────

export interface Player {
	readonly id: number;
	readonly name: string;
	readonly portraitIndex: number;
	readonly color: PlayerColor;
	role: Role;
	isAlive: boolean;
	hasBeenInvestigated: boolean;
}

/** Distinct player border colors for table-distance legibility */
export type PlayerColor =
	| "red"
	| "blue"
	| "green"
	| "yellow"
	| "purple"
	| "orange"
	| "pink"
	| "teal"
	| "brown"
	| "gray";

export const PLAYER_COLORS: readonly PlayerColor[] = [
	"red",
	"blue",
	"green",
	"yellow",
	"purple",
	"orange",
	"pink",
	"teal",
	"brown",
	"gray",
] as const;

export interface PolicyDeck {
	drawPile: PolicyType[];
	discardPile: PolicyType[];
}

export interface ElectionTracker {
	failedElections: number;
}

export interface Board {
	liberalPolicies: number;
	fascistPolicies: number;
}

export interface VoteRecord {
	playerId: number;
	vote: Vote;
}

export interface GovernmentRecord {
	round: number;
	presidentId: number;
	chancellorId: number;
	policyEnacted: PolicyType;
}

// ─── Game State ─────────────────────────────────────────────────────

export interface GameState {
	/** Current phase of the game */
	phase: GamePhase;

	/** All players in the game (alive and dead) */
	players: Player[];

	/** The policy deck (draw + discard piles) */
	deck: PolicyDeck;

	/** Enacted policies on the board */
	board: Board;

	/** Failed election counter (resets on successful government or chaos) */
	electionTracker: ElectionTracker;

	/** Index into players[] for the current presidential candidate */
	presidentIndex: number;

	/** The nominated chancellor's player id (null if not yet nominated) */
	chancellorNomineeId: number | null;

	/** Last successfully elected president id (for term limits) */
	lastElectedPresidentId: number | null;

	/** Last successfully elected chancellor id (for term limits) */
	lastElectedChancellorId: number | null;

	/** Votes cast in the current election */
	votes: VoteRecord[];

	/** Index of the player currently casting a vote in pass-and-play flow */
	currentVoterIndex: number;

	/** 3 policies drawn by the president for the legislative session */
	presidentHand: PolicyType[];

	/** 2 policies passed to the chancellor */
	chancellorHand: PolicyType[];

	/** The policy that was just enacted (for display in PolicyEnacted phase) */
	lastEnactedPolicy: PolicyType | null;

	/** Whether veto power is unlocked (after 5th fascist policy) */
	vetoUnlocked: boolean;

	/** History of enacted governments for game log */
	governmentHistory: GovernmentRecord[];

	/** Current round number */
	round: number;

	/** Which player is currently viewing their role in NightRound */
	nightRoundPlayerIndex: number;

	/** Special election: index of the president who called it (to resume rotation) */
	specialElectionCallerIndex: number | null;

	/** The winning team, set only when phase === GameOver */
	winner: Team | null;

	/** How the game was won */
	victoryReason: VictoryReason | null;

	/** Players already investigated (cannot be investigated again per rules) */
	investigatedPlayerIds: number[];

	/** Player id being investigated (for ExecutiveInvestigate phase) */
	investigationTargetId: number | null;

	/** Top 3 policies for peek (for ExecutivePeek phase) */
	peekedPolicies: PolicyType[];

	/** Player id of executed player (for display after ExecutiveExecution) */
	executedPlayerId: number | null;

	/** Player id selected for special election */
	specialElectionPresidentId: number | null;

	/** Game log entries for history display */
	log: LogEntry[];
}

export interface LogEntry {
	round: number;
	phase: GamePhase;
	message: string;
	timestamp: number;
}

// ─── Actions ────────────────────────────────────────────────────────

export type GameAction =
	| { type: "ADD_PLAYER"; name: string; portraitIndex: number }
	| { type: "REMOVE_PLAYER"; playerId: number }
	| { type: "REORDER_PLAYER"; playerId: number; direction: "up" | "down" }
	| { type: "REORDER_PLAYER_TO"; fromPlayerId: number; toPlayerId: number }
	| { type: "START_GAME" }
	| { type: "ACKNOWLEDGE_NIGHT"; playerIndex: number }
	| { type: "NOMINATE_CHANCELLOR"; playerId: number }
	| { type: "CAST_VOTE"; playerId: number; vote: Vote }
	| { type: "PASS_ELECTION_UNANIMOUSLY" }
	| { type: "ACKNOWLEDGE_VOTE_RESULT" }
	| { type: "PRESIDENT_DISCARD"; policyIndex: number }
	| { type: "CHANCELLOR_ENACT"; policyIndex: number }
	| { type: "REQUEST_VETO" }
	| { type: "APPROVE_VETO" }
	| { type: "REJECT_VETO" }
	| { type: "ACKNOWLEDGE_POLICY" }
	| { type: "INVESTIGATE_PLAYER"; playerId: number }
	| { type: "ACKNOWLEDGE_INVESTIGATION" }
	| { type: "ACKNOWLEDGE_PEEK" }
	| { type: "SELECT_SPECIAL_ELECTION"; playerId: number }
	| { type: "EXECUTE_PLAYER"; playerId: number }
	| { type: "ACKNOWLEDGE_CHAOS" }
	| { type: "NEW_GAME" };
