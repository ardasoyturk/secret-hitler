import { describe, test, expect } from "bun:test";
import {
  shuffle,
  createDeck,
  reshuffleIfNeeded,
  drawCards,
  discardPolicy,
  peekCards,
} from "../src/engine/deck";
import { PolicyType } from "../src/engine/types";
import {
  FASCIST_POLICY_COUNT,
  LIBERAL_POLICY_COUNT,
  TOTAL_POLICY_COUNT,
  MIN_DRAW_PILE_SIZE,
} from "../src/engine/constants";

describe("Deck Module", () => {
  test("shuffle produces array of same length", () => {
    const arr = [1, 2, 3, 4, 5];
    const shuffled = shuffle(arr);
    expect(shuffled).toHaveLength(arr.length);
    expect(shuffled.sort()).toEqual(arr.sort());
  });

  test("shuffle does not mutate original array", () => {
    const arr = [1, 2, 3, 4, 5];
    const copy = [...arr];
    shuffle(arr);
    expect(arr).toEqual(copy);
  });

  test("createDeck has correct composition: 11 fascist + 6 liberal = 17", () => {
    const deck = createDeck();
    expect(deck.drawPile).toHaveLength(TOTAL_POLICY_COUNT);
    expect(deck.discardPile).toHaveLength(0);

    const fascist = deck.drawPile.filter((p) => p === PolicyType.Fascist);
    const liberal = deck.drawPile.filter((p) => p === PolicyType.Liberal);
    expect(fascist).toHaveLength(FASCIST_POLICY_COUNT);
    expect(liberal).toHaveLength(LIBERAL_POLICY_COUNT);
  });

  test("drawCards removes cards from draw pile", () => {
    const deck = createDeck();
    const { drawn, deck: newDeck } = drawCards(deck, 3);
    expect(drawn).toHaveLength(3);
    expect(newDeck.drawPile).toHaveLength(TOTAL_POLICY_COUNT - 3);
  });

  test("drawCards returns cards from the top (front) of the pile", () => {
    const deck = {
      drawPile: [PolicyType.Liberal, PolicyType.Fascist, PolicyType.Liberal, PolicyType.Fascist],
      discardPile: [],
    };
    const { drawn } = drawCards(deck, 3);
    expect(drawn).toEqual([PolicyType.Liberal, PolicyType.Fascist, PolicyType.Liberal]);
  });

  test("discardPolicy adds to discard pile", () => {
    const deck = createDeck();
    const newDeck = discardPolicy(deck, PolicyType.Fascist);
    expect(newDeck.discardPile).toHaveLength(1);
    expect(newDeck.discardPile[0]).toBe(PolicyType.Fascist);
    expect(newDeck.drawPile).toHaveLength(TOTAL_POLICY_COUNT);
  });

  test("reshuffleIfNeeded triggers when draw pile < 3", () => {
    const deck = {
      drawPile: [PolicyType.Fascist, PolicyType.Liberal],
      discardPile: [PolicyType.Fascist, PolicyType.Fascist, PolicyType.Liberal],
    };
    expect(deck.drawPile.length).toBeLessThan(MIN_DRAW_PILE_SIZE);

    const reshuffled = reshuffleIfNeeded(deck);
    expect(reshuffled.drawPile).toHaveLength(5);
    expect(reshuffled.discardPile).toHaveLength(0);
  });

  test("reshuffleIfNeeded does NOT trigger when draw pile >= 3", () => {
    const deck = {
      drawPile: [PolicyType.Fascist, PolicyType.Liberal, PolicyType.Fascist],
      discardPile: [PolicyType.Fascist],
    };
    const result = reshuffleIfNeeded(deck);
    // Should return as-is (not reshuffled)
    expect(result.drawPile).toHaveLength(3);
    expect(result.discardPile).toHaveLength(1);
  });

  test("peekCards does not modify draw pile", () => {
    const deck = createDeck();
    const peeked = peekCards(deck, 3);
    expect(peeked).toHaveLength(3);
    expect(deck.drawPile).toHaveLength(TOTAL_POLICY_COUNT);
    expect(peeked).toEqual(deck.drawPile.slice(0, 3));
  });
});
