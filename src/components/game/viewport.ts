import { GamePhase } from "@/engine/types";

export interface ViewportSnapshot {
	width: number;
	height: number;
	isCoarsePointer: boolean;
}

export type BoardCarouselTarget = "liberal" | "fascist";

const PHONE_MAX_WIDTH = 767;
const SHORT_TOUCH_HEIGHT = 560;

export function isPhoneViewport({ width, height, isCoarsePointer }: ViewportSnapshot): boolean {
	return width <= PHONE_MAX_WIDTH || (height <= SHORT_TOUCH_HEIGHT && isCoarsePointer);
}

export function getDefaultPhoneBoardForPhase(phase: GamePhase): BoardCarouselTarget {
	switch (phase) {
		case GamePhase.ChancellorNomination:
		case GamePhase.Election:
		case GamePhase.VoteCast:
		case GamePhase.VoteResult:
			return "liberal";

		case GamePhase.PresidentLegislation:
		case GamePhase.ChancellorLegislation:
		case GamePhase.VetoRequested:
		case GamePhase.PolicyEnacted:
		case GamePhase.ChaosPolicy:
		case GamePhase.ExecutiveInvestigate:
		case GamePhase.InvestigationResult:
		case GamePhase.ExecutivePeek:
		case GamePhase.ExecutiveSpecialElection:
		case GamePhase.ExecutiveExecution:
			return "fascist";

		default:
			return "liberal";
	}
}
