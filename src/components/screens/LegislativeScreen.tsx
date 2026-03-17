/**
 * LegislativeScreen — President and Chancellor legislative session.
 *
 * Two phases:
 * - PresidentLegislation: Privacy gate → President sees 3 cards, discards 1.
 * - ChancellorLegislation: Privacy gate → Chancellor sees 2 cards, enacts 1.
 *   If veto is unlocked, a "Request Veto" button is available.
 *
 * Layout: flex flex-col h-full — fits inside Game layout (no min-h-dvh).
 * Privacy gates use .privacy-screen (fixed overlay).
 */

import { useState } from "react";
import type { GameState, GameAction } from "@engine/types";
import { GamePhase } from "@engine/types";
import { PolicyCard } from "@components/cards/PolicyCard";

interface ScreenProps {
  state: GameState;
  dispatch: (action: GameAction) => void;
}

function PrivacyGate({
  playerName,
  role,
  onReady,
}: {
  playerName: string;
  role: string;
  onReady: () => void;
}) {
  return (
    <div className="privacy-screen">
      <div className="gameplay-panel w-full max-w-xl px-8 py-10 text-center">
        <h2 className="mb-4 font-heading text-4xl text-gold">Pass the Device</h2>
        <p className="mb-1 text-base text-text-secondary">Hand the device to the {role}</p>
        <p className="mb-10 font-heading text-5xl text-text-primary">{playerName}</p>
        <button
          type="button"
          onClick={onReady}
          className="px-10 py-4 bg-btn-primary text-text-primary font-heading text-xl rounded-[var(--radius-button)] shadow-[var(--shadow-button)] hover:bg-btn-primary-hover active:shadow-none active:translate-y-[2px] transition-all duration-[var(--transition-fast)] cursor-pointer"
        >
          I&apos;m Ready
        </button>
      </div>
    </div>
  );
}

export function LegislativeScreen({ state, dispatch }: ScreenProps) {
  const [showPrivacy, setShowPrivacy] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const president = state.players[state.presidentIndex];
  const chancellor = state.players.find((p) => p.id === state.chancellorNomineeId);

  // ── President Legislation ─────────────────────────────────────────
  if (state.phase === GamePhase.PresidentLegislation) {
    if (!president) return null;

    if (showPrivacy) {
      return (
        <PrivacyGate
          playerName={president.name}
          role="President"
          onReady={() => {
            setShowPrivacy(false);
            setSelectedIndex(null);
          }}
        />
      );
    }

    return (
      <div className="mx-auto flex h-full w-full max-w-5xl flex-col items-center justify-center gap-5">
        <div className="text-center flex-shrink-0 slide-up">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-text-muted">
            Legislative Session
          </p>
          <h2 className="mb-1 font-heading text-3xl text-gold">President {president.name}</h2>
          <p className="text-sm text-text-secondary md:text-base">
            Examine these 3 policies.{" "}
            <span className="text-fascist font-semibold">Discard one</span> and pass the remaining
            two to the Chancellor.
          </p>
        </div>

        <div className="flex w-full max-w-3xl items-start justify-center gap-3 md:gap-4">
          {state.presidentHand.map((policy, index) => (
            <div key={index} className="flex flex-col items-center gap-2">
              <PolicyCard
                type={policy}
                size="lg"
                onClick={() => setSelectedIndex(selectedIndex === index ? null : index)}
                selected={selectedIndex === index}
              />
              {selectedIndex === index && (
                <span className="text-fascist font-body text-xs font-semibold uppercase tracking-wider fade-in">
                  Discard
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Confirm discard */}
        <button
          type="button"
          onClick={() => {
            if (selectedIndex !== null) {
              dispatch({ type: "PRESIDENT_DISCARD", policyIndex: selectedIndex });
              setShowPrivacy(true);
              setSelectedIndex(null);
            }
          }}
          disabled={selectedIndex === null}
          className={[
            "flex-shrink-0 w-full max-w-2xl rounded-[18px] py-3 font-heading text-xl tracking-wide transition-all duration-[var(--transition-normal)]",
            selectedIndex !== null
              ? "bg-fascist text-text-primary shadow-[0_6px_0_var(--color-fascist-dark),var(--shadow-card)] hover:bg-fascist-hover active:shadow-[0_2px_0_var(--color-fascist-dark)] active:translate-y-[4px] cursor-pointer"
              : "bg-btn-disabled text-text-muted cursor-not-allowed",
          ].join(" ")}
        >
          {selectedIndex !== null ? "Discard Selected Policy" : "Tap a Policy to Discard"}
        </button>
      </div>
    );
  }

  // ── Chancellor Legislation ────────────────────────────────────────
  if (state.phase === GamePhase.ChancellorLegislation) {
    if (!chancellor) return null;

    if (showPrivacy) {
      return (
        <PrivacyGate
          playerName={chancellor.name}
          role="Chancellor"
          onReady={() => {
            setShowPrivacy(false);
            setSelectedIndex(null);
          }}
        />
      );
    }

    return (
      <div className="mx-auto flex h-full w-full max-w-5xl flex-col items-center justify-center gap-5">
        <div className="text-center flex-shrink-0 slide-up">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-text-muted">
            Legislative Session
          </p>
          <h2 className="mb-1 font-heading text-3xl text-gold">Chancellor {chancellor.name}</h2>
          <p className="text-sm text-text-secondary md:text-base">
            The President has passed you 2 policies.{" "}
            <span className="text-liberal font-semibold">Enact one</span> into law.
          </p>
        </div>

        <div className="flex w-full max-w-2xl items-start justify-center gap-4 md:gap-6">
          {state.chancellorHand.map((policy, index) => (
            <div key={index} className="flex flex-col items-center gap-2">
              <PolicyCard
                type={policy}
                size="lg"
                onClick={() => setSelectedIndex(selectedIndex === index ? null : index)}
                selected={selectedIndex === index}
              />
              {selectedIndex === index && (
                <span className="text-gold font-body text-xs font-semibold uppercase tracking-wider fade-in">
                  Enact
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="flex-shrink-0 w-full max-w-2xl space-y-3">
          <button
            type="button"
            onClick={() => {
              if (selectedIndex !== null) {
                dispatch({ type: "CHANCELLOR_ENACT", policyIndex: selectedIndex });
                setShowPrivacy(true);
                setSelectedIndex(null);
              }
            }}
            disabled={selectedIndex === null}
            className={[
              "w-full rounded-[18px] py-3 font-heading text-xl tracking-wide transition-all duration-[var(--transition-normal)]",
              selectedIndex !== null
                ? "bg-fascist text-text-primary shadow-[0_6px_0_var(--color-fascist-dark),var(--shadow-card)] hover:bg-fascist-hover active:shadow-[0_2px_0_var(--color-fascist-dark)] active:translate-y-[4px] cursor-pointer"
                : "bg-btn-disabled text-text-muted cursor-not-allowed",
            ].join(" ")}
          >
            {selectedIndex !== null ? "Enact Selected Policy" : "Tap a Policy to Enact"}
          </button>

          {/* Veto button — only when veto power is unlocked */}
          {state.vetoUnlocked && (
            <button
              type="button"
              onClick={() => dispatch({ type: "REQUEST_VETO" })}
              className="w-full rounded-[16px] border-2 border-fascist/45 bg-transparent py-3 text-base font-semibold text-fascist transition-all duration-[var(--transition-fast)] hover:bg-fascist/10 cursor-pointer"
            >
              Request Veto
            </button>
          )}
        </div>
      </div>
    );
  }

  return null;
}
