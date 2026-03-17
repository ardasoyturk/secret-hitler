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
import { Crown, Shield } from "lucide-react";
import { ViewportOverlay } from "@components/layout/ViewportOverlay";

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
import { useOptimizedAsset } from "@components/game/OptimizedAssets";

const LIBERAL_ROLE_IMAGES = [
  { image: roleLiberal1, key: "roles/role-liberal-1.png" },
  { image: roleLiberal2, key: "roles/role-liberal-2.png" },
  { image: roleLiberal3, key: "roles/role-liberal-3.png" },
  { image: roleLiberal4, key: "roles/role-liberal-4.png" },
  { image: roleLiberal5, key: "roles/role-liberal-5.png" },
  { image: roleLiberal6, key: "roles/role-liberal-6.png" },
];

const FASCIST_ROLE_IMAGES = [
  { image: roleFascist1, key: "roles/role-fascist-1.png" },
  { image: roleFascist2, key: "roles/role-fascist-2.png" },
  { image: roleFascist3, key: "roles/role-fascist-3.png" },
];

/** Get a deterministic role card image based on player index */
function getRoleImage(
  role: Role,
  playerIndex: number,
  optimizedAssets: Record<string, string>,
) {
  if (role === Role.Hitler) {
    return optimizedAssets["roles/role-hitler.png"] ?? roleHitler.src;
  }
  if (role === Role.Fascist) {
    const card = FASCIST_ROLE_IMAGES[playerIndex % FASCIST_ROLE_IMAGES.length];
    return optimizedAssets[card.key] ?? card.image.src;
  }
  const card = LIBERAL_ROLE_IMAGES[playerIndex % LIBERAL_ROLE_IMAGES.length];
  return optimizedAssets[card.key] ?? card.image.src;
}

interface ScreenProps {
  state: GameState;
  dispatch: (action: GameAction) => void;
}

function parseTeammateLabel(label: string) {
  if (label.endsWith(" (Hitler)")) {
    return { name: label.replace(" (Hitler)", ""), role: "Hitler" as const };
  }
  if (label.endsWith(" (Fascist)")) {
    return { name: label.replace(" (Fascist)", ""), role: "Fascist" as const };
  }
  return { name: label, role: "Fascist" as const };
}

export function NightScreen({ state, dispatch }: ScreenProps) {
  const playerIndex = state.nightRoundPlayerIndex;
  const player = state.players[playerIndex];
  const optimizedRoleAssets = {
    "roles/role-hitler.png": useOptimizedAsset("roles/role-hitler.png", roleHitler.src),
    "roles/role-fascist-1.png": useOptimizedAsset("roles/role-fascist-1.png", roleFascist1.src),
    "roles/role-fascist-2.png": useOptimizedAsset("roles/role-fascist-2.png", roleFascist2.src),
    "roles/role-fascist-3.png": useOptimizedAsset("roles/role-fascist-3.png", roleFascist3.src),
    "roles/role-liberal-1.png": useOptimizedAsset("roles/role-liberal-1.png", roleLiberal1.src),
    "roles/role-liberal-2.png": useOptimizedAsset("roles/role-liberal-2.png", roleLiberal2.src),
    "roles/role-liberal-3.png": useOptimizedAsset("roles/role-liberal-3.png", roleLiberal3.src),
    "roles/role-liberal-4.png": useOptimizedAsset("roles/role-liberal-4.png", roleLiberal4.src),
    "roles/role-liberal-5.png": useOptimizedAsset("roles/role-liberal-5.png", roleLiberal5.src),
    "roles/role-liberal-6.png": useOptimizedAsset("roles/role-liberal-6.png", roleLiberal6.src),
  };

  if (!player) return null;

  // Privacy gate — hand the device to the next player
  if (state.phase === GamePhase.NightRound) {
    return (
      <ViewportOverlay>
        <div className="privacy-screen">
          <div className="privacy-dialog text-center">
            <h2 className="privacy-title mb-6 text-3xl">Pass the Device</h2>
            <p className="privacy-subtitle mb-2 text-lg">Hand the device to</p>
            <p className="privacy-name mb-4 text-4xl">{player.name}</p>
            <p className="mb-12 text-sm text-text-muted">
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
              className="primary-action-button"
            >
              I&apos;m Ready
            </button>
          </div>
        </div>
      </ViewportOverlay>
    );
  }

  // Role reveal
  if (state.phase === GamePhase.NightReveal) {
    const info = getNightInfo(state, playerIndex);
    const roleImage = getRoleImage(player.role, playerIndex, optimizedRoleAssets);

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
              src={roleImage}
              alt={`${roleLabel} role card`}
              className="w-full h-auto block"
              draggable={false}
            />
          </div>

          {/* Role declaration */}
          <p className="mx-auto mb-1 text-sm font-body uppercase tracking-widest text-text-secondary">
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
            <p className="night-role-description max-w-xs mb-8">
              You must work to enact 5 Liberal policies or find and execute Hitler. Trust no one.
            </p>
          )}

          {player.role === Role.Fascist && (
            <div className="mb-8">
              <p className="night-role-description max-w-xs mb-4">
                You must sabotage the government and help enact 6 Fascist policies — or get Hitler
                elected Chancellor after 3 Fascist policies.
              </p>
              {info.teammates.length > 0 && (
                <div className="night-team-card night-team-card-fascist">
                  <p className="night-team-card-title text-fascist">
                    <Shield className="h-4 w-4" strokeWidth={2.1} />
                    Your Teammates
                  </p>
                  <div className="night-team-list">
                    {info.teammates.map((teammateLabel) => {
                      const teammate = parseTeammateLabel(teammateLabel);
                      const isHitler = teammate.role === "Hitler";

                      return (
                        <div key={teammateLabel} className="night-team-member">
                          <span className="night-team-member-name">{teammate.name}</span>
                          <span
                            className={[
                              "night-team-member-badge",
                              isHitler
                                ? "night-team-member-badge-hitler"
                                : "night-team-member-badge-fascist",
                            ].join(" ")}
                          >
                            {isHitler ? (
                              <Crown className="h-3.5 w-3.5" strokeWidth={2.1} />
                            ) : (
                              <Shield className="h-3.5 w-3.5" strokeWidth={2.1} />
                            )}
                            {teammate.role}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {player.role === Role.Hitler && (
            <div className="mb-8">
              <p className="night-role-description max-w-xs mb-4">
                You are on the Fascist team, but you must stay hidden. If you are executed, the
                Liberals win.
              </p>
              {info.knowsFascists && info.teammates.length > 0 ? (
                <div className="night-team-card night-team-card-hitler">
                  <p className="night-team-card-title text-gold">
                    <Shield className="h-4 w-4" strokeWidth={2.1} />
                    Your Fascist Ally
                  </p>
                  <div className="night-team-list">
                    {info.teammates.map((teammateName) => (
                      <div key={teammateName} className="night-team-member">
                        <span className="night-team-member-name">{teammateName}</span>
                        <span className="night-team-member-badge night-team-member-badge-fascist">
                          <Shield className="h-3.5 w-3.5" strokeWidth={2.1} />
                          Fascist
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="night-role-note max-w-sm">
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
            className="primary-action-button"
          >
            Got It
          </button>
        </div>
      </div>
    );
  }

  return null;
}
