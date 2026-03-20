/**
 * Game persistence helpers for localStorage.
 *
 * Kept as plain functions so the game flow can stay event-driven.
 *
 */

import type { GameState } from "@/engine/types";
import { GamePhase } from "@/engine/types";

const STORAGE_KEY = "secret-hitler-game";
const SCHEMA_VERSION = 1;

interface PersistedData {
	version: number;
	state: GameState;
	savedAt: number;
}

function saveGameState(state: GameState): void {
	try {
		const data: PersistedData = {
			version: SCHEMA_VERSION,
			state,
			savedAt: Date.now(),
		};
		localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
	} catch {
		// localStorage might be full or unavailable.
	}
}

export function loadGameState(): GameState | null {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return null;

		const data: PersistedData = JSON.parse(raw);
		if (data.version !== SCHEMA_VERSION) {
			clearGameState();
			return null;
		}

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

export function clearGameState(): void {
	try {
		localStorage.removeItem(STORAGE_KEY);
	} catch {
		// localStorage might be unavailable.
	}
}

export function syncGameState(state: GameState): void {
	if (state.phase === GamePhase.Setup || state.phase === GamePhase.GameOver) {
		clearGameState();
		return;
	}

	saveGameState(state);
}
