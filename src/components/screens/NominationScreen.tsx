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
    <form className="mx-auto flex h-full w-full max-w-6xl flex-col gap-4" onSubmit={handleSubmit}>
      <div className="flex-shrink-0 text-center">
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-text-muted">
          Government Formation
        </p>
        <h2 className="font-heading text-3xl text-gold leading-tight md:text-4xl">Chancellor Nomination</h2>
        <p className="mt-1 text-sm text-text-secondary md:text-base">
          President <span className="text-text-primary font-semibold">{president.name}</span>, nominate a Chancellor
        </p>
      </div>

      <div
        className="grid flex-1 min-h-0 overflow-y-auto content-start gap-3 md:gap-4"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {state.players.map((player) => {
          const isEligible = eligibleSet.has(player.id);
          const reason = !isEligible ? getIneligibleReason(state, player.id) : null;

          return (
            <label
              key={player.id}
              className={[
                "relative overflow-hidden rounded-[22px] border transition-all duration-150",
                isEligible
                  ? "border-white/8 bg-bg-card/80 cursor-pointer hover:border-gold/35 has-[:checked]:border-gold/45 has-[:checked]:bg-gold/8 has-[:checked]:shadow-[0_0_0_1px_rgba(255,202,97,0.24)]"
                  : "border-transparent bg-bg-card/40 opacity-45 cursor-not-allowed",
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
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-gold/35 to-transparent opacity-0 transition-opacity duration-150 peer-checked:opacity-100" />
              <div className="flex min-h-[120px] flex-col items-center justify-center gap-2 p-3 md:min-h-[128px]">
                <div className={["h-14 w-14 rounded-full overflow-hidden border-2 flex-shrink-0 shadow-[0_8px_16px_rgba(0,0,0,0.22)]", "border-text-muted/30 peer-checked:border-gold", !isEligible && "grayscale"].join(" ")}>
                  <img src={PORTRAITS[player.portraitIndex]?.src} alt={player.name} className="w-full h-full object-cover" draggable={false} />
                </div>
                <span className={["w-full truncate text-center text-sm font-medium leading-tight", "text-text-primary peer-checked:text-gold", !isEligible && "text-text-muted"].join(" ")}>
                  {player.name}
                </span>
              </div>
              {reason && (
                <span className="absolute left-1/2 top-2 -translate-x-1/2 whitespace-nowrap rounded-full border border-text-muted/20 bg-bg-darker/90 px-2 py-0.5 text-[10px] font-medium text-text-muted">
                  {reason}
                </span>
              )}
            </label>
          );
        })}
      </div>

      <div className="flex flex-shrink-0 justify-center pt-1">
        <button
          type="submit"
          className="w-full max-w-2xl rounded-[18px] bg-fascist px-6 py-3 font-heading text-xl tracking-wide text-white shadow-[0_6px_0_var(--color-fascist-dark),var(--shadow-card)] transition-all duration-200 hover:bg-fascist-hover active:translate-y-[3px] active:shadow-[0_3px_0_var(--color-fascist-dark)] cursor-pointer"
        >
          Confirm Nomination
        </button>
      </div>
    </form>
  );
}
