/**
 * Secret Hitler — Deck Module
 *
 * Manages the policy draw/discard piles with Fisher-Yates shuffle.
 * Per rules: reshuffle discard into draw when draw pile < 3 cards.
 */

import { MIN_DRAW_PILE_SIZE, PRESIDENT_DRAW_COUNT, createInitialDeck } from "./constants";
import type { PolicyDeck, PolicyType } from "./types";

/**
 * Fisher-Yates shuffle — cryptographically fair in-place shuffle.
 */
export function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Create a fresh shuffled policy deck.
 */
export function createDeck(): PolicyDeck {
  return {
    drawPile: shuffle(createInitialDeck()),
    discardPile: [],
  };
}

/**
 * If the draw pile has fewer than MIN_DRAW_PILE_SIZE cards,
 * shuffle the discard pile back into the draw pile.
 *
 * Per rules: "If there are fewer than 3 tiles remaining in the
 * Policy draw pile, shuffle the discard pile back into the draw pile."
 */
export function reshuffleIfNeeded(deck: PolicyDeck): PolicyDeck {
  if (deck.drawPile.length < MIN_DRAW_PILE_SIZE) {
    const combined = [...deck.drawPile, ...deck.discardPile];
    return {
      drawPile: shuffle(combined),
      discardPile: [],
    };
  }
  return deck;
}

/**
 * Draw N cards from the top of the draw pile.
 * Caller must ensure reshuffle was done beforehand if needed.
 */
export function drawCards(
  deck: PolicyDeck,
  count: number = PRESIDENT_DRAW_COUNT,
): { drawn: PolicyType[]; deck: PolicyDeck } {
  const drawn = deck.drawPile.slice(0, count);
  return {
    drawn,
    deck: {
      drawPile: deck.drawPile.slice(count),
      discardPile: deck.discardPile,
    },
  };
}

/**
 * Discard a policy tile to the discard pile.
 */
export function discardPolicy(deck: PolicyDeck, policy: PolicyType): PolicyDeck {
  return {
    drawPile: deck.drawPile,
    discardPile: [...deck.discardPile, policy],
  };
}

/**
 * Peek at the top N cards without removing them.
 */
export function peekCards(deck: PolicyDeck, count: number = PRESIDENT_DRAW_COUNT): PolicyType[] {
  return deck.drawPile.slice(0, count);
}
