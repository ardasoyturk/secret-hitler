/**
 * SetupScreen — Pre-game lobby.
 *
 * Layout: full dvh, two-column on landscape (form left, player list right).
 * Features: name input, portrait picker, add/remove, reorder (↑↓).
 * Everything fits in the viewport with no outer scroll.
 */

import { useState } from "react";
import type { GameState, GameAction } from "@engine/types";
import { MIN_PLAYERS, MAX_PLAYERS } from "@engine/constants";

import portrait1 from "@assets/portraits/player-portrait-1.svg";
import portrait2 from "@assets/portraits/player-portrait-2.svg";
import portrait3 from "@assets/portraits/player-portrait-3.svg";
import portrait4 from "@assets/portraits/player-portrait-4.svg";
import portrait5 from "@assets/portraits/player-portrait-5.svg";
import portrait6 from "@assets/portraits/player-portrait-6.svg";
import portrait7 from "@assets/portraits/player-portrait-7.svg";
import portrait8 from "@assets/portraits/player-portrait-8.svg";
import portrait9 from "@assets/portraits/player-portrait-9.svg";
import portrait10 from "@assets/portraits/player-portrait-10.svg";
import portrait11 from "@assets/portraits/player-portrait-11.svg";
import portrait12 from "@assets/portraits/player-portrait-12.svg";
import portrait13 from "@assets/portraits/player-portrait-13.svg";
import portrait14 from "@assets/portraits/player-portrait-14.svg";
import portrait15 from "@assets/portraits/player-portrait-15.svg";
import portrait16 from "@assets/portraits/player-portrait-16.svg";
import portrait17 from "@assets/portraits/player-portrait-17.svg";
import portrait18 from "@assets/portraits/player-portrait-18.svg";
import portrait19 from "@assets/portraits/player-portrait-19.svg";
import portrait20 from "@assets/portraits/player-portrait-20.svg";

const PORTRAITS = [
  portrait1, portrait2, portrait3, portrait4, portrait5,
  portrait6, portrait7, portrait8, portrait9, portrait10,
  portrait11, portrait12, portrait13, portrait14, portrait15,
  portrait16, portrait17, portrait18, portrait19, portrait20,
];

const PLAYER_COLOR_STYLES: Record<string, string> = {
  red: "border-player-red",
  blue: "border-player-blue",
  green: "border-player-green",
  yellow: "border-player-yellow",
  purple: "border-player-purple",
  orange: "border-player-orange",
  pink: "border-player-pink",
  teal: "border-player-teal",
  brown: "border-player-brown",
  gray: "border-player-gray",
};

interface ScreenProps {
  state: GameState;
  dispatch: (action: GameAction) => void;
}

export function SetupScreen({ state, dispatch }: ScreenProps) {
  const [name, setName] = useState("");
  const [selectedPortrait, setSelectedPortrait] = useState(0);
  const [showPortraitPicker, setShowPortraitPicker] = useState(false);

  const playerCount = state.players.length;
  const trimmedName = name.trim();
  const isDuplicate = state.players.some(
    (p) => p.name.toLowerCase() === trimmedName.toLowerCase(),
  );
  const canAdd = trimmedName.length > 0 && !isDuplicate && playerCount < MAX_PLAYERS;
  const canStart = playerCount >= MIN_PLAYERS && playerCount <= MAX_PLAYERS;

  function handleAddPlayer() {
    if (!canAdd) return;
    dispatch({ type: "ADD_PLAYER", name: trimmedName, portraitIndex: selectedPortrait });
    setName("");
    setShowPortraitPicker(false);
    // Advance to next unused portrait
    const usedIndices = new Set([...state.players.map((p) => p.portraitIndex), selectedPortrait]);
    const next = PORTRAITS.findIndex((_, i) => !usedIndices.has(i));
    setSelectedPortrait(next >= 0 ? next : 0);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleAddPlayer();
  }

  return (
    <div className="h-dvh w-full flex flex-col overflow-hidden bg-bg-darker">
      {/* ── Title bar ── */}
      <div className="flex-shrink-0 text-center pt-4 pb-2 px-4">
        <h1 className="font-heading text-4xl sm:text-5xl text-fascist tracking-wide leading-none">
          SECRET HITLER
        </h1>
        <p className="font-flavor text-text-muted text-xs mt-0.5">Pass &amp; Play Edition</p>
      </div>

      {/* ── Main content: left form + right player list ── */}
      <div className="flex-1 flex min-h-0 gap-0">

        {/* Left column: form */}
        <div className="flex flex-col min-h-0 w-full max-w-sm mx-auto lg:mx-0 px-4 py-2 gap-3 lg:border-r lg:border-white/10">

          {/* Portrait + Name row */}
          <div className="flex items-center gap-3">
            {/* Portrait button */}
            <button
              type="button"
              onClick={() => setShowPortraitPicker((v) => !v)}
              className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-gold flex-shrink-0 hover:border-select-hover transition-colors cursor-pointer"
              aria-label="Choose portrait"
            >
              <img
                src={PORTRAITS[selectedPortrait].src}
                alt="Selected portrait"
                className="w-full h-full object-cover"
              />
              <span className="absolute inset-0 flex items-end justify-center pb-0.5 bg-gradient-to-t from-black/60 to-transparent">
                <span className="text-[9px] font-body font-semibold text-white uppercase tracking-wide">
                  Pick
                </span>
              </span>
            </button>

            {/* Name input + Add */}
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Player name"
                maxLength={20}
                className="flex-1 bg-bg-card border border-text-muted/30 rounded-lg px-3 py-2.5 text-text-primary font-body text-sm placeholder:text-text-muted focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-colors"
              />
              <button
                type="button"
                onClick={handleAddPlayer}
                disabled={!canAdd}
                className={[
                  "px-4 py-2.5 rounded-lg font-body font-semibold text-sm transition-all duration-150",
                  canAdd
                    ? "bg-fascist text-white shadow-[0_3px_0_var(--color-fascist-dark)] hover:bg-fascist-hover active:shadow-none active:translate-y-[2px] cursor-pointer"
                    : "bg-btn-disabled text-text-muted cursor-not-allowed",
                ].join(" ")}
              >
                Add
              </button>
            </div>
          </div>

          {/* Validation */}
          {trimmedName.length > 0 && isDuplicate && (
            <p className="text-fascist text-xs font-body -mt-1">Name already taken.</p>
          )}

          {/* Portrait picker grid */}
          {showPortraitPicker && (
            <div className="bg-bg-card rounded-xl p-3 border border-text-muted/20 slide-up">
              <p className="text-text-muted text-[10px] font-body uppercase tracking-wider mb-2">
                Choose a portrait
              </p>
              <div className="grid grid-cols-10 gap-1.5">
                {PORTRAITS.map((portrait, index) => {
                  const isUsed = state.players.some((p) => p.portraitIndex === index);
                  const isSelected = selectedPortrait === index;
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        setSelectedPortrait(index);
                        setShowPortraitPicker(false);
                      }}
                      disabled={isUsed}
                      className={[
                        "w-full aspect-square rounded-full overflow-hidden border-2 transition-all duration-150",
                        isSelected && !isUsed
                          ? "border-gold ring-1 ring-gold/40 scale-110"
                          : "border-transparent",
                        isUsed
                          ? "opacity-30 grayscale cursor-not-allowed"
                          : "hover:border-text-secondary cursor-pointer hover:scale-105",
                      ].join(" ")}
                    >
                      <img src={portrait.src} alt={`Portrait ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Player count + Start button */}
          <div className="mt-auto pt-2 space-y-2">
            <div className="flex items-center justify-between text-xs font-body">
              <span className="text-text-muted">
                {playerCount} / {MIN_PLAYERS}–{MAX_PLAYERS} players
              </span>
              {!canStart && playerCount > 0 && playerCount < MIN_PLAYERS && (
                <span className="text-text-muted">
                  Need {MIN_PLAYERS - playerCount} more
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => dispatch({ type: "START_GAME" })}
              disabled={!canStart}
              className={[
                "w-full py-3 rounded-lg font-heading text-xl tracking-wide transition-all duration-200",
                canStart
                  ? "bg-fascist text-white shadow-[0_5px_0_var(--color-fascist-dark)] hover:bg-fascist-hover active:shadow-[0_2px_0_var(--color-fascist-dark)] active:translate-y-[3px] cursor-pointer"
                  : "bg-btn-disabled text-text-muted cursor-not-allowed",
              ].join(" ")}
            >
              {canStart ? "Start Game" : "Start Game"}
            </button>
          </div>
        </div>

        {/* Right column: player list with reorder */}
        {playerCount > 0 && (
          <div className="hidden lg:flex flex-col flex-1 min-h-0 px-4 py-2">
            <p className="text-text-muted text-xs font-body uppercase tracking-wider mb-2 flex-shrink-0">
              Seating Order (First player becomes first President)
            </p>
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
              {state.players.map((player, idx) => (
                <div
                  key={player.id}
                  className={[
                    "flex items-center gap-2.5 bg-bg-card rounded-lg px-3 py-2 border-l-4 fade-in",
                    PLAYER_COLOR_STYLES[player.color] ?? "border-text-muted",
                  ].join(" ")}
                >
                  {/* Seat number */}
                  <span className="text-text-muted text-xs font-body w-4 text-right flex-shrink-0">
                    {idx + 1}
                  </span>
                  {/* Portrait */}
                  <img
                    src={PORTRAITS[player.portraitIndex]?.src}
                    alt={player.name}
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                  />
                  {/* Name */}
                  <span className="flex-1 font-body font-medium text-text-primary text-sm truncate">
                    {player.name}
                  </span>
                  {/* Reorder buttons */}
                  <div className="flex flex-col gap-0.5 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => dispatch({ type: "REORDER_PLAYER", playerId: player.id, direction: "up" })}
                      disabled={idx === 0}
                      className="w-5 h-5 flex items-center justify-center rounded text-text-muted hover:text-text-primary disabled:opacity-20 disabled:cursor-not-allowed transition-colors cursor-pointer text-xs leading-none"
                      aria-label={`Move ${player.name} up`}
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      onClick={() => dispatch({ type: "REORDER_PLAYER", playerId: player.id, direction: "down" })}
                      disabled={idx === playerCount - 1}
                      className="w-5 h-5 flex items-center justify-center rounded text-text-muted hover:text-text-primary disabled:opacity-20 disabled:cursor-not-allowed transition-colors cursor-pointer text-xs leading-none"
                      aria-label={`Move ${player.name} down`}
                    >
                      ▼
                    </button>
                  </div>
                  {/* Remove */}
                  <button
                    type="button"
                    onClick={() => dispatch({ type: "REMOVE_PLAYER", playerId: player.id })}
                    className="text-text-muted hover:text-fascist transition-colors p-0.5 cursor-pointer flex-shrink-0"
                    aria-label={`Remove ${player.name}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                      <path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mobile player list (below form on small screens) */}
      {playerCount > 0 && (
        <div className="lg:hidden flex-shrink-0 px-4 pb-2 max-h-[35vh] overflow-y-auto">
          <p className="text-text-muted text-[10px] font-body uppercase tracking-wider mb-1.5">
            Players — tap ▲▼ to reorder
          </p>
          <div className="space-y-1">
            {state.players.map((player, idx) => (
              <div
                key={player.id}
                className={[
                  "flex items-center gap-2 bg-bg-card rounded-lg px-2.5 py-1.5 border-l-4 fade-in",
                  PLAYER_COLOR_STYLES[player.color] ?? "border-text-muted",
                ].join(" ")}
              >
                <span className="text-text-muted text-xs w-3.5 text-right flex-shrink-0">{idx + 1}</span>
                <img
                  src={PORTRAITS[player.portraitIndex]?.src}
                  alt={player.name}
                  className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                />
                <span className="flex-1 font-body font-medium text-text-primary text-xs truncate">
                  {player.name}
                </span>
                <div className="flex gap-0.5 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => dispatch({ type: "REORDER_PLAYER", playerId: player.id, direction: "up" })}
                    disabled={idx === 0}
                    className="w-5 h-5 flex items-center justify-center rounded text-text-muted hover:text-text-primary disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer text-[10px]"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    onClick={() => dispatch({ type: "REORDER_PLAYER", playerId: player.id, direction: "down" })}
                    disabled={idx === playerCount - 1}
                    className="w-5 h-5 flex items-center justify-center rounded text-text-muted hover:text-text-primary disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer text-[10px]"
                  >
                    ▼
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => dispatch({ type: "REMOVE_PLAYER", playerId: player.id })}
                  className="text-text-muted hover:text-fascist transition-colors cursor-pointer flex-shrink-0"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                    <path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
