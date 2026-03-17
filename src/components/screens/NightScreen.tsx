/**
 * NightScreen — Each player privately views their secret role.
 *
 * Two sub-states:
 * - NightRound: Privacy gate — "Hand the device to [playerName]."
 * - NightReveal: Show the player's role card, team info, and teammates.
 */

import type { GameState, GameAction } from "@engine/types";
import { GamePhase, Role } from "@engine/types";
import { getNightInfo } from "@/hooks/useGame";

import roleFascist1 from "@assets/roles/role-fascist-1.png";
import roleFascist2 from "@assets/roles/role-fascist-2.png";
import roleFascist3 from "@assets/roles/role-fascist-3.png";
import roleHitler from "@assets/roles/role-hitler.png";
import roleLiberal1 from "@assets/roles/role-liberal-1.png";
import roleLiberal2 from "@assets/roles/role-liberal-2.png";
import roleLiberal3 from "@assets/roles/role-liberal-3.png";
import roleLiberal4 from "@assets/roles/role-liberal-4.png";
import roleLiberal5 from "@assets/roles/role-liberal-5.png";
import roleLiberal6 from "@assets/roles/role-liberal-6.png";

const LIBERAL_ROLE_IMAGES = [
  roleLiberal1,
  roleLiberal2,
  roleLiberal3,
  roleLiberal4,
  roleLiberal5,
  roleLiberal6,
];

const FASCIST_ROLE_IMAGES = [roleFascist1, roleFascist2, roleFascist3];

/** Get a deterministic role card image based on player index */
function getRoleImage(role: Role, playerIndex: number) {
  if (role === Role.Hitler) return roleHitler;
  if (role === Role.Fascist) {
    return FASCIST_ROLE_IMAGES[playerIndex % FASCIST_ROLE_IMAGES.length];
  }
  return LIBERAL_ROLE_IMAGES[playerIndex % LIBERAL_ROLE_IMAGES.length];
}

interface ScreenProps {
  state: GameState;
  dispatch: (action: GameAction) => void;
}

export function NightScreen({ state, dispatch }: ScreenProps) {
  const playerIndex = state.nightRoundPlayerIndex;
  const player = state.players[playerIndex];

  if (!player) return null;

  // Privacy gate — hand the device to the next player
  if (state.phase === GamePhase.NightRound) {
    return (
      <div className="privacy-screen">
        <div className="text-center px-6">
          <h2 className="font-heading text-3xl text-gold mb-6">Pass the Device</h2>
          <p className="text-text-secondary text-lg font-body mb-2">Hand the device to</p>
          <p className="font-heading text-4xl text-text-primary mb-4">{player.name}</p>
          <p className="text-text-muted text-sm font-body mb-12">
            Player {playerIndex + 1} of {state.players.length}
          </p>
          <button
            type="button"
            onClick={() =>
              dispatch({
                type: "ACKNOWLEDGE_NIGHT",
                playerIndex,
              })
            }
            className="px-10 py-4 bg-btn-primary text-text-primary font-heading text-xl rounded-[var(--radius-button)] shadow-[var(--shadow-button)] hover:bg-btn-primary-hover active:shadow-none active:translate-y-[2px] transition-all duration-[var(--transition-fast)] cursor-pointer"
          >
            I&apos;m Ready
          </button>
        </div>
      </div>
    );
  }

  // Role reveal
  if (state.phase === GamePhase.NightReveal) {
    const info = getNightInfo(state, playerIndex);
    const roleImage = getRoleImage(player.role, playerIndex);

    const roleLabel =
      player.role === Role.Hitler ? "HITLER" : player.role === Role.Fascist ? "FASCIST" : "LIBERAL";

    const teamColor = player.role === Role.Liberal ? "text-liberal" : "text-fascist";

    const teamGlow = player.role === Role.Liberal ? "glow-liberal" : "glow-fascist";

    return (
      <div className="privacy-screen overflow-y-auto">
        <div className="flex flex-col items-center text-center px-6 py-10">
          {/* Role card */}
          <div
            className={[
              "w-48 sm:w-56 rounded-[var(--radius-card)] overflow-hidden mb-6 scale-pop",
              teamGlow,
            ].join(" ")}
          >
            <img
              src={roleImage.src}
              alt={`${roleLabel} role card`}
              className="w-full h-auto block"
              draggable={false}
            />
          </div>

          {/* Role declaration */}
          <p className="text-text-secondary font-body text-sm mb-1 uppercase tracking-widest">
            You are a
          </p>
          <h2
            className={["font-heading text-4xl sm:text-5xl mb-6 tracking-wide", teamColor].join(
              " ",
            )}
          >
            {roleLabel}
          </h2>

          {/* Team description */}
          {player.role === Role.Liberal && (
            <p className="text-text-secondary font-body text-sm max-w-xs mb-8">
              You must work to enact 5 Liberal policies or find and execute Hitler. Trust no one.
            </p>
          )}

          {player.role === Role.Fascist && (
            <div className="mb-8">
              <p className="text-text-secondary font-body text-sm max-w-xs mb-4">
                You must sabotage the government and help enact 6 Fascist policies — or get Hitler
                elected Chancellor after 3 Fascist policies.
              </p>
              {info.teammates.length > 0 && (
                <div className="bg-bg-card rounded-[var(--radius-card)] p-4 border border-fascist/30">
                  <p className="text-fascist font-body text-xs uppercase tracking-widest mb-2">
                    Your Teammates
                  </p>
                  {info.teammates.map((t) => (
                    <p key={t} className="font-heading text-lg text-text-primary">
                      {t}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}

          {player.role === Role.Hitler && (
            <div className="mb-8">
              <p className="text-text-secondary font-body text-sm max-w-xs mb-4">
                You are on the Fascist team, but you must stay hidden. If you are executed, the
                Liberals win.
              </p>
              {info.knowsFascists && info.teammates.length > 0 ? (
                <div className="bg-bg-card rounded-[var(--radius-card)] p-4 border border-fascist/30">
                  <p className="text-fascist font-body text-xs uppercase tracking-widest mb-2">
                    Your Fascist Ally
                  </p>
                  {info.teammates.map((t) => (
                    <p key={t} className="font-heading text-lg text-text-primary">
                      {t}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-text-muted font-flavor text-sm italic">
                  You do not know who the other Fascists are.
                </p>
              )}
            </div>
          )}

          {/* Confirm button */}
          <button
            type="button"
            onClick={() =>
              dispatch({
                type: "ACKNOWLEDGE_NIGHT",
                playerIndex,
              })
            }
            className="px-10 py-4 bg-btn-primary text-text-primary font-heading text-xl rounded-[var(--radius-button)] shadow-[var(--shadow-button)] hover:bg-btn-primary-hover active:shadow-none active:translate-y-[2px] transition-all duration-[var(--transition-fast)] cursor-pointer"
          >
            Got It
          </button>
        </div>
      </div>
    );
  }

  return null;
}
