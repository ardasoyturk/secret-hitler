/**
 * NominationScreen — President nominates a Chancellor.
 *
 * Compact layout: fits in the remaining viewport height after header+board.
 * Player grid with ineligibility reasons, confirm button pinned to bottom.
 */

import type { GameState, GameAction } from "@engine/types";

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

interface ScreenProps { state: GameState; dispatch: (action: GameAction) => void }
type NominationScreenProps = ScreenProps & { eligibleIds: number[] };

function getIneligibleReason(state: GameState, playerId: number): string | null {
  const player = state.players.find((p) => p.id === playerId);
  if (!player) return null;
  if (!player.isAlive) return "Dead";
  if (playerId === state.players[state.presidentIndex]?.id) return "President";
  if (playerId === state.lastElectedChancellorId) return "Term limit";
  if (playerId === state.lastElectedPresidentId) return "Term limit";
  return null;
}

export function NominationScreen({ state, dispatch, eligibleIds }: NominationScreenProps) {
  const president = state.players[state.presidentIndex];

  if (!president) return null;

  const eligibleSet = new Set(eligibleIds);

  // Determine column count for grid
  const totalPlayers = state.players.length;
  const cols = totalPlayers <= 6 ? 3 : totalPlayers <= 8 ? 4 : 5;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const rawSelectedId = formData.get("chancellor");
    const selectedId = typeof rawSelectedId === "string" ? Number(rawSelectedId) : Number.NaN;

    if (!Number.isInteger(selectedId)) return;

    dispatch({ type: "NOMINATE_CHANCELLOR", playerId: selectedId });
  }

  return (
    <form className="flex flex-col h-full px-3 py-3 gap-3" onSubmit={handleSubmit}>
      {/* Compact header */}
      <div className="flex-shrink-0 text-center">
        <h2 className="font-heading text-2xl text-gold leading-tight">Chancellor Nomination</h2>
        <p className="text-text-secondary font-body text-xs mt-0.5">
          President <span className="text-text-primary font-semibold">{president.name}</span>, nominate a Chancellor
        </p>
      </div>

      {/* Player grid — scrollable if needed */}
      <div
        className="flex-1 overflow-y-auto min-h-0"
        style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gap: "8px", alignContent: "start" }}
      >
        {state.players.map((player) => {
          const isEligible = eligibleSet.has(player.id);
          const reason = !isEligible ? getIneligibleReason(state, player.id) : null;

          return (
            <label
              key={player.id}
              className={[
                "relative rounded-xl border-2 transition-all duration-150",
                isEligible
                  ? "border-text-muted/20 bg-bg-card cursor-pointer hover:border-text-secondary has-[:checked]:border-gold has-[:checked]:bg-gold/10 has-[:checked]:ring-1 has-[:checked]:ring-gold/30 has-[:checked]:scale-[1.02]"
                  : "border-transparent bg-bg-card/40 opacity-40 cursor-not-allowed",
              ].join(" ")}
            >
              <input
                type="radio"
                name="chancellor"
                value={player.id}
                disabled={!isEligible}
                className="sr-only peer"
                required
              />
              <div className="flex flex-col items-center gap-1.5 p-2.5">
                <div className={["w-12 h-12 rounded-full overflow-hidden border-2 flex-shrink-0", "border-text-muted/30 peer-checked:border-gold", !isEligible && "grayscale"].join(" ")}>
                  <img src={PORTRAITS[player.portraitIndex]?.src} alt={player.name} className="w-full h-full object-cover" draggable={false} />
                </div>
                <span className={["font-body text-xs font-medium truncate w-full text-center leading-tight", "text-text-primary peer-checked:text-gold", !isEligible && "text-text-muted"].join(" ")}>
                  {player.name}
                </span>
              </div>
              {reason && (
                <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 bg-bg-darker text-text-muted text-[9px] font-body px-1.5 py-0.5 rounded-full border border-text-muted/20 whitespace-nowrap">
                  {reason}
                </span>
              )}
            </label>
          );
        })}
      </div>

      {/* Confirm — pinned to bottom */}
      <div className="flex-shrink-0">
        <button
          type="submit"
          className="w-full py-3 rounded-lg font-heading text-lg tracking-wide transition-all duration-200 bg-fascist text-white shadow-[0_4px_0_var(--color-fascist-dark)] hover:bg-fascist-hover active:shadow-[0_2px_0_var(--color-fascist-dark)] active:translate-y-[2px] cursor-pointer"
        >
          Confirm Nomination
        </button>
      </div>
    </form>
  );
}
