/**
 * Secret Hitler — Victory Conditions Module
 *
 * Four ways to end the game:
 *
 * LIBERAL WINS:
 * 1. Five liberal policies are enacted.
 * 2. Hitler is executed.
 *
 * FASCIST WINS:
 * 3. Six fascist policies are enacted.
 * 4. Hitler is elected chancellor after 3+ fascist policies are on the board.
 */

import {
  FASCIST_POLICIES_TO_WIN,
  LIBERAL_POLICIES_TO_WIN,
  MIN_FASCIST_POLICIES_FOR_HITLER_CHANCELLOR_WIN,
} from "./constants";
import { Role, Team, VictoryReason, type Board, type Player } from "./types";

interface VictoryCheck {
  isGameOver: boolean;
  winner: Team | null;
  reason: VictoryReason | null;
}

/**
 * Check if the game is over due to policy enactment.
 */
export function checkPolicyVictory(board: Board): VictoryCheck {
  if (board.liberalPolicies >= LIBERAL_POLICIES_TO_WIN) {
    return {
      isGameOver: true,
      winner: Team.Liberal,
      reason: VictoryReason.LiberalPolicies,
    };
  }

  if (board.fascistPolicies >= FASCIST_POLICIES_TO_WIN) {
    return {
      isGameOver: true,
      winner: Team.Fascist,
      reason: VictoryReason.FascistPolicies,
    };
  }

  return { isGameOver: false, winner: null, reason: null };
}

/**
 * Check if Hitler being elected chancellor triggers a fascist win.
 *
 * Per rules: "If three or more Fascist Policies have been enacted
 * and a player who is Hitler is elected Chancellor, the game is
 * immediately over and the Fascist team wins."
 */
export function checkHitlerChancellorVictory(board: Board, chancellorPlayer: Player): VictoryCheck {
  if (
    board.fascistPolicies >= MIN_FASCIST_POLICIES_FOR_HITLER_CHANCELLOR_WIN &&
    chancellorPlayer.role === Role.Hitler
  ) {
    return {
      isGameOver: true,
      winner: Team.Fascist,
      reason: VictoryReason.HitlerElectedChancellor,
    };
  }

  return { isGameOver: false, winner: null, reason: null };
}

/**
 * Check if executing a player ends the game (Hitler executed).
 *
 * Per rules: "If that player is Hitler, the game is over and the
 * Liberals win."
 */
export function checkExecutionVictory(executedPlayer: Player): VictoryCheck {
  if (executedPlayer.role === Role.Hitler) {
    return {
      isGameOver: true,
      winner: Team.Liberal,
      reason: VictoryReason.HitlerExecuted,
    };
  }

  return { isGameOver: false, winner: null, reason: null };
}
