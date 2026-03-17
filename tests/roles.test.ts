import { describe, test, expect } from "bun:test";
import { assignRoles, getLiberalCount, getFascistTeamCount } from "../src/engine/roles";
import { Role } from "../src/engine/types";
import { FASCIST_COUNT_BY_PLAYERS } from "../src/engine/constants";

describe("Role Assignment Module", () => {
  test.each([5, 6, 7, 8, 9, 10])("assigns correct roles for %d players", (count) => {
    const roles = assignRoles(count);
    expect(roles).toHaveLength(count);

    const hitlerCount = roles.filter((r) => r === Role.Hitler).length;
    const fascistCount = roles.filter((r) => r === Role.Fascist).length;
    const liberalCount = roles.filter((r) => r === Role.Liberal).length;

    expect(hitlerCount).toBe(1);
    expect(fascistCount).toBe(FASCIST_COUNT_BY_PLAYERS[count]);
    expect(liberalCount).toBe(count - FASCIST_COUNT_BY_PLAYERS[count] - 1);
  });

  test("throws for invalid player counts", () => {
    expect(() => assignRoles(4)).toThrow();
    expect(() => assignRoles(11)).toThrow();
    expect(() => assignRoles(0)).toThrow();
  });

  test("roles are shuffled (not always in the same order)", () => {
    // Run many times and check that the first role varies
    const firstRoles = new Set<Role>();
    for (let i = 0; i < 50; i++) {
      const roles = assignRoles(5);
      firstRoles.add(roles[0]);
    }
    // With 50 runs, we should see at least 2 different roles in position 0
    expect(firstRoles.size).toBeGreaterThan(1);
  });

  test("getLiberalCount returns correct values", () => {
    expect(getLiberalCount(5)).toBe(3);
    expect(getLiberalCount(6)).toBe(4);
    expect(getLiberalCount(7)).toBe(4);
    expect(getLiberalCount(8)).toBe(5);
    expect(getLiberalCount(9)).toBe(5);
    expect(getLiberalCount(10)).toBe(6);
  });

  test("getFascistTeamCount includes Hitler", () => {
    expect(getFascistTeamCount(5)).toBe(2); // 1 fascist + Hitler
    expect(getFascistTeamCount(6)).toBe(2);
    expect(getFascistTeamCount(7)).toBe(3);
    expect(getFascistTeamCount(8)).toBe(3);
    expect(getFascistTeamCount(9)).toBe(4);
    expect(getFascistTeamCount(10)).toBe(4);
  });
});
