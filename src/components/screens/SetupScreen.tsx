import { useEffect, useRef, useState } from "react";
import type {
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
} from "react";
import { GripVertical, Trash2, UserPlus } from "lucide-react";
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
  const [draggingPlayerId, setDraggingPlayerId] = useState<number | null>(null);
  const [dropTargetPlayerId, setDropTargetPlayerId] = useState<number | null>(null);
  const activePointerIdRef = useRef<number | null>(null);

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

  function handleKeyDown(e: ReactKeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleAddPlayer();
  }

  function beginDrag(playerId: number, event: ReactPointerEvent<HTMLButtonElement>) {
    if (playerCount < 2) return;
    event.preventDefault();
    activePointerIdRef.current = event.pointerId;
    setDraggingPlayerId(playerId);
    setDropTargetPlayerId(playerId);
  }

  useEffect(() => {
    if (draggingPlayerId === null) return;

    function handlePointerMove(event: PointerEvent) {
      if (activePointerIdRef.current !== null && event.pointerId !== activePointerIdRef.current) {
        return;
      }
      const element = document.elementFromPoint(event.clientX, event.clientY);
      const row = element?.closest("[data-player-id]") as HTMLElement | null;
      if (!row?.dataset.playerId) return;
      const targetId = Number(row.dataset.playerId);
      if (Number.isNaN(targetId)) return;
      setDropTargetPlayerId(targetId);
    }

    function handlePointerUp(event: PointerEvent) {
      if (activePointerIdRef.current !== null && event.pointerId !== activePointerIdRef.current) {
        return;
      }

      if (
        draggingPlayerId !== null
        && dropTargetPlayerId !== null
        && draggingPlayerId !== dropTargetPlayerId
      ) {
        dispatch({
          type: "REORDER_PLAYER_TO",
          fromPlayerId: draggingPlayerId,
          toPlayerId: dropTargetPlayerId,
        });
      }

      activePointerIdRef.current = null;
      setDraggingPlayerId(null);
      setDropTargetPlayerId(null);
    }

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [dispatch, draggingPlayerId, dropTargetPlayerId]);

  return (
    <div className="h-dvh w-full overflow-hidden bg-bg-darker">
      <div className="mx-auto flex h-full w-full max-w-7xl flex-col px-4 pb-4 pt-3 md:px-6 md:pb-6">
        <div className="flex-shrink-0 text-center">
          <h1 className="font-heading text-4xl text-fascist tracking-wide leading-none md:text-5xl">
            SECRET HITLER
          </h1>
          <p className="font-flavor text-text-muted text-xs mt-1">Pass &amp; Play Edition</p>
        </div>

        <div className="mt-3 min-h-0 flex-1 overflow-hidden rounded-[24px] border border-gold/15 bg-[linear-gradient(180deg,rgba(43,31,22,0.88),rgba(25,17,12,0.9))] p-4 shadow-[0_20px_40px_rgba(0,0,0,0.34)] md:p-6">
          <div className="grid h-full min-h-0 gap-4 lg:grid-cols-[minmax(380px,520px)_minmax(260px,1fr)]">
            <section className="flex min-h-0 flex-col justify-between rounded-[20px] border border-white/8 bg-black/18 px-5 py-5 md:px-6 md:py-6">
              <div className="space-y-4">
                <p className="text-center text-[11px] font-semibold uppercase tracking-[0.24em] text-text-muted">
                  Player Initialization
                </p>

                <div className="mx-auto flex w-full max-w-[560px] items-center justify-center gap-3 px-1 md:px-2">
                  <button
                    type="button"
                    onClick={() => setShowPortraitPicker((v) => !v)}
                    className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-full border-2 border-gold shadow-[0_10px_24px_rgba(0,0,0,0.35)] transition-transform duration-200 hover:scale-[1.03] cursor-pointer"
                    aria-label="Choose portrait"
                  >
                    <img
                      src={PORTRAITS[selectedPortrait].src}
                      alt="Selected portrait"
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-gold">
                      Pick
                    </span>
                  </button>

                  <div className="flex flex-1 items-center gap-2.5">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Player name"
                      maxLength={20}
                      className="h-12 flex-1 rounded-xl border border-gold/25 bg-bg-card/80 px-4 text-base text-text-primary placeholder:text-text-muted focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
                    />
                    <button
                      type="button"
                      onClick={handleAddPlayer}
                      disabled={!canAdd}
                      className={[
                        "inline-flex h-12 min-w-28 items-center justify-center gap-1.5 rounded-xl px-4 font-semibold text-base transition-all duration-150",
                        canAdd
                          ? "bg-gold text-bg-overlay shadow-[0_4px_0_var(--color-gold-dark)] hover:brightness-105 active:translate-y-[2px] active:shadow-[0_2px_0_var(--color-gold-dark)] cursor-pointer"
                          : "bg-btn-disabled text-bg-dark/55 cursor-not-allowed",
                      ].join(" ")}
                    >
                      <UserPlus className="h-4 w-4" strokeWidth={2.2} />
                      Add
                    </button>
                  </div>
                </div>

                {trimmedName.length > 0 && isDuplicate && (
                  <p className="text-center text-sm text-fascist">Name already taken.</p>
                )}

                {showPortraitPicker && (
                  <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                    <p className="mb-2 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-text-muted">
                      Choose portrait
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
                              "aspect-square w-full overflow-hidden rounded-full border-2 transition-all duration-150",
                              isSelected && !isUsed ? "border-gold scale-110" : "border-transparent",
                              isUsed ? "opacity-30 grayscale cursor-not-allowed" : "hover:scale-105 cursor-pointer",
                            ].join(" ")}
                          >
                            <img src={portrait.src} alt={`Portrait ${index + 1}`} className="h-full w-full object-cover" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4">
                <div className="mb-3 text-center text-sm text-text-muted">
                  {playerCount} / {MAX_PLAYERS} players
                  {!canStart && playerCount > 0 && playerCount < MIN_PLAYERS ? ` • Need ${MIN_PLAYERS - playerCount} more` : ""}
                </div>
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => dispatch({ type: "START_GAME" })}
                    disabled={!canStart}
                    className={[
                      "w-full max-w-sm rounded-[16px] py-3 font-heading text-3xl tracking-[0.04em] transition-all duration-200",
                      canStart
                        ? "bg-fascist text-white shadow-[0_6px_0_var(--color-fascist-dark),0_14px_24px_rgba(0,0,0,0.28)] hover:bg-fascist-hover active:translate-y-[3px] active:shadow-[0_3px_0_var(--color-fascist-dark)] cursor-pointer"
                        : "bg-btn-disabled text-bg-dark/55 cursor-not-allowed",
                    ].join(" ")}
                  >
                    Start Game
                  </button>
                </div>
              </div>
            </section>

            <section className="flex min-h-0 flex-col rounded-[20px] border border-white/8 bg-black/18 p-4 md:p-5">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-muted">
                  Seating Order
                </p>
                <p className="text-xs text-text-muted">Drag handle to reorder</p>
              </div>

              {playerCount === 0 ? (
                <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-white/15 text-text-muted">
                  Add players to begin
                </div>
              ) : (
                <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                  <div className="space-y-2">
                    {state.players.map((player, idx) => {
                      const isDragging = draggingPlayerId === player.id;
                      const isDropTarget = dropTargetPlayerId === player.id && draggingPlayerId !== null;

                      return (
                        <div
                          key={player.id}
                          data-player-id={player.id}
                          className={[
                            "fade-in flex items-center gap-3 rounded-xl border border-white/8 bg-bg-card/70 px-3 py-3 shadow-[0_10px_16px_rgba(0,0,0,0.18)] transition-all",
                            PLAYER_COLOR_STYLES[player.color] ?? "border-text-muted",
                            isDragging ? "scale-[1.01] ring-2 ring-gold/50 opacity-85" : "",
                            isDropTarget ? "ring-2 ring-liberal/50" : "",
                          ].join(" ")}
                        >
                          <span className="w-6 text-right text-sm font-semibold text-text-muted">{idx + 1}</span>

                          <img
                            src={PORTRAITS[player.portraitIndex]?.src}
                            alt={player.name}
                            className="h-14 w-14 rounded-full object-cover ring-2 ring-white/20"
                          />

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-lg font-semibold text-text-primary">{player.name}</p>
                            <p className="text-xs uppercase tracking-[0.16em] text-text-muted">Player</p>
                          </div>

                          <button
                            type="button"
                            onPointerDown={(event) => beginDrag(player.id, event)}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gold/35 bg-black/25 text-gold touch-none cursor-grab active:cursor-grabbing"
                            aria-label={`Drag to move ${player.name}`}
                            title="Drag to reorder"
                          >
                            <GripVertical className="h-5 w-5" strokeWidth={2.2} />
                          </button>

                          <button
                            type="button"
                            onClick={() => dispatch({ type: "REMOVE_PLAYER", playerId: player.id })}
                            className="rounded-md p-2 text-text-muted transition-colors hover:text-fascist cursor-pointer"
                            aria-label={`Remove ${player.name}`}
                          >
                            <Trash2 className="h-4 w-4" strokeWidth={2.1} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
