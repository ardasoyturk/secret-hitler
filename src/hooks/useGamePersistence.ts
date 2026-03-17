/**
 * useGamePersistence — localStorage persistence for game state.
 *
 * Saves game state on every change and restores on mount.
 * Uses a versioned schema to handle future migrations.
 */

import { useEffect } from "react";
import type { GameState } from "@engine/types";
import { GamePhase } from "@engine/types";

const STORAGE_KEY = "secret-hitler-game";
const SCHEMA_VERSION = 1;

interface PersistedData {
	version: number;
	state: GameState;
	savedAt: number;
}

/**
 * Save game state to localStorage.
 */
export function saveGameState(state: GameState): void {
	try {
		const data: PersistedData = {
			version: SCHEMA_VERSION,
			state,
			savedAt: Date.now(),
		};
		localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
	} catch {
		// localStorage might be full or unavailable — silently fail
	}
}

/**
 * Load game state from localStorage.
 * Returns null if no saved state or if the schema version doesn't match.
 */
export function loadGameState(): GameState | null {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return null;

		const data: PersistedData = JSON.parse(raw);

		// Version check — reject old schemas
		if (data.version !== SCHEMA_VERSION) {
			clearGameState();
			return null;
		}

		// Don't restore if the game is in Setup or GameOver
		if (
			data.state.phase === GamePhase.Setup ||
			data.state.phase === GamePhase.GameOver
		) {
			return null;
		}

		return data.state;
	} catch {
		clearGameState();
		return null;
	}
}

/**
 * Clear saved game state.
 */
export function clearGameState(): void {
	try {
		localStorage.removeItem(STORAGE_KEY);
	} catch {
		// silently fail
	}
}

/**
 * Hook that auto-saves game state on every change.
 */
export function useGamePersistence(state: GameState): void {
	useEffect(() => {
		// Only persist active games
		if (state.phase !== GamePhase.Setup) {
			saveGameState(state);
		}

		// Clear on game over or new game
		if (
			state.phase === GamePhase.GameOver ||
			state.phase === GamePhase.Setup
		) {
			clearGameState();
		}
	}, [state]);
}

/**
 * Check if there is a saved game.
 */
export function hasSavedGame(): boolean {
	return loadGameState() !== null;
}
