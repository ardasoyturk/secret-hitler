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
      <div className="text-center px-6">
        <h2 className="font-heading text-3xl text-gold mb-4">Pass the Device</h2>
        <p className="text-text-secondary text-base font-body mb-1">Hand the device to the {role}</p>
        <p className="font-heading text-4xl text-text-primary mb-10">{playerName}</p>
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
      <div className="flex flex-col items-center justify-center h-full px-4 py-4 gap-5">
        <div className="text-center flex-shrink-0 slide-up">
          <p className="text-text-muted font-body text-xs uppercase tracking-widest mb-1">
            Legislative Session
          </p>
          <h2 className="font-heading text-2xl text-gold mb-1">President {president.name}</h2>
          <p className="text-text-secondary font-body text-sm">
            Examine these 3 policies.{" "}
            <span className="text-fascist font-semibold">Discard one</span> and pass the remaining
            two to the Chancellor.
          </p>
        </div>

        {/* Policy cards */}
        <div className="flex items-end gap-4 sm:gap-6 flex-shrink-0">
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
            "flex-shrink-0 w-full max-w-md py-3 rounded-[var(--radius-button)] font-heading text-lg tracking-wide transition-all duration-[var(--transition-normal)]",
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
      <div className="flex flex-col items-center justify-center h-full px-4 py-4 gap-5">
        <div className="text-center flex-shrink-0 slide-up">
          <p className="text-text-muted font-body text-xs uppercase tracking-widest mb-1">
            Legislative Session
          </p>
          <h2 className="font-heading text-2xl text-gold mb-1">Chancellor {chancellor.name}</h2>
          <p className="text-text-secondary font-body text-sm">
            The President has passed you 2 policies.{" "}
            <span className="text-liberal font-semibold">Enact one</span> into law.
          </p>
        </div>

        {/* Policy cards */}
        <div className="flex items-end gap-6 sm:gap-8 flex-shrink-0">
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

        {/* Action buttons */}
        <div className="flex-shrink-0 w-full max-w-md space-y-2">
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
              "w-full py-3 rounded-[var(--radius-button)] font-heading text-lg tracking-wide transition-all duration-[var(--transition-normal)]",
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
              className="w-full py-2.5 rounded-[var(--radius-button)] font-body font-semibold text-sm text-fascist border-2 border-fascist/50 bg-transparent hover:bg-fascist/10 transition-all duration-[var(--transition-fast)] cursor-pointer"
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
