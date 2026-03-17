/**
 * VotingScreen — Pass-and-play voting flow.
 *
 * Three sub-states:
 * - Election: Privacy gate for the first voter.
 * - VoteCast: Show vote cards (Ja/Nein) for the current voter.
 * - VoteResult: Reveal all votes, show pass/fail.
 *
 * Layout: flex flex-col h-full — fits inside Game layout (no min-h-dvh).
 * Privacy gates use .privacy-screen (fixed overlay).
 */

import { useState } from "react";
import type { GameState, GameAction } from "@engine/types";
import { GamePhase, Vote } from "@engine/types";
import { VoteCard } from "@components/cards/VoteCard";

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

interface ScreenProps {
  state: GameState;
  dispatch: (action: GameAction) => void;
}

function PrivacyGate({ playerName, onReady }: { playerName: string; onReady: () => void }) {
  return (
    <div className="privacy-screen">
      <div className="text-center px-6">
        <h2 className="font-heading text-3xl text-gold mb-4">Pass the Device</h2>
        <p className="text-text-secondary text-base font-body mb-1">Hand the device to</p>
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

export function VotingScreen({ state, dispatch }: ScreenProps) {
  const [showPrivacy, setShowPrivacy] = useState(true);

  const president = state.players[state.presidentIndex];
  const chancellor = state.players.find((p) => p.id === state.chancellorNomineeId);

  // ── Election phase: privacy gate for first voter ─────────────────
  if (state.phase === GamePhase.Election) {
    const firstAliveIndex = state.players.findIndex((p) => p.isAlive);
    const firstVoter = state.players[firstAliveIndex];

    if (!firstVoter) return null;

    if (showPrivacy) {
      return <PrivacyGate playerName={firstVoter.name} onReady={() => setShowPrivacy(false)} />;
    }

    return (
      <VoteCastView
        state={state}
        dispatch={dispatch}
        voter={firstVoter}
        presidentName={president?.name ?? ""}
        chancellorName={chancellor?.name ?? ""}
        onVoted={() => setShowPrivacy(true)}
      />
    );
  }

  // ── VoteCast phase: each subsequent voter ────────────────────────
  if (state.phase === GamePhase.VoteCast) {
    const voter = state.players[state.currentVoterIndex];

    if (!voter) return null;

    if (showPrivacy) {
      return <PrivacyGate playerName={voter.name} onReady={() => setShowPrivacy(false)} />;
    }

    return (
      <VoteCastView
        state={state}
        dispatch={dispatch}
        voter={voter}
        presidentName={president?.name ?? ""}
        chancellorName={chancellor?.name ?? ""}
        onVoted={() => setShowPrivacy(true)}
      />
    );
  }

  // ── VoteResult phase: reveal all votes ───────────────────────────
  if (state.phase === GamePhase.VoteResult) {
    const jaCount = state.votes.filter((v) => v.vote === Vote.Ja).length;
    const neinCount = state.votes.filter((v) => v.vote === Vote.Nein).length;
    const passed = jaCount > neinCount;

    return (
      <div className="flex flex-col h-full px-4 py-3 gap-3">
        {/* Result header */}
        <div className="text-center flex-shrink-0 slide-up">
          <p className="text-text-secondary font-body text-xs uppercase tracking-widest mb-1">
            Election Result
          </p>
          <h2
            className={[
              "font-heading text-3xl mb-1",
              passed ? "text-liberal" : "text-fascist",
            ].join(" ")}
          >
            {passed ? "JA! Election Passes" : "NEIN! Election Fails"}
          </h2>
          <p className="text-text-secondary font-body text-sm">
            {jaCount} Ja — {neinCount} Nein
          </p>
        </div>

        {/* Government row */}
        <div className="flex items-center justify-center gap-6 flex-shrink-0">
          {president && (
            <div className="text-center">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gold mx-auto mb-1">
                <img
                  src={PORTRAITS[president.portraitIndex]?.src}
                  alt={president.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="font-body text-xs text-text-secondary">President</p>
              <p className="font-body text-xs font-medium text-text-primary">{president.name}</p>
            </div>
          )}
          <span className="text-text-muted font-heading text-xl">&amp;</span>
          {chancellor && (
            <div className="text-center">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gold mx-auto mb-1">
                <img
                  src={PORTRAITS[chancellor.portraitIndex]?.src}
                  alt={chancellor.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="font-body text-xs text-text-secondary">Chancellor</p>
              <p className="font-body text-xs font-medium text-text-primary">{chancellor.name}</p>
            </div>
          )}
        </div>

        {/* Individual votes — scrollable */}
        <div className="flex-1 overflow-y-auto min-h-0 space-y-1.5">
          {state.votes.map((voteRecord) => {
            const player = state.players.find((p) => p.id === voteRecord.playerId);
            if (!player) return null;
            const isJa = voteRecord.vote === Vote.Ja;
            return (
              <div
                key={voteRecord.playerId}
                className="flex items-center gap-3 bg-bg-card rounded-[var(--radius-button)] px-3 py-2 fade-in"
              >
                <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0">
                  <img
                    src={PORTRAITS[player.portraitIndex]?.src}
                    alt={player.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="flex-1 font-body text-sm text-text-primary">{player.name}</span>
                <span
                  className={["font-heading text-base", isJa ? "text-liberal" : "text-fascist"].join(" ")}
                >
                  {isJa ? "JA" : "NEIN"}
                </span>
              </div>
            );
          })}
        </div>

        {/* Election tracker (on fail) */}
        {!passed && (
          <p className="text-text-muted font-body text-xs text-center flex-shrink-0">
            Failed elections:{" "}
            <span className="text-fascist font-semibold">
              {state.electionTracker.failedElections}
            </span>{" "}
            / 3
          </p>
        )}

        {/* Continue button */}
        <button
          type="button"
          onClick={() => dispatch({ type: "ACKNOWLEDGE_VOTE_RESULT" })}
          className="flex-shrink-0 w-full py-3 rounded-[var(--radius-button)] font-heading text-lg bg-fascist text-text-primary shadow-[0_6px_0_var(--color-fascist-dark),var(--shadow-card)] hover:bg-fascist-hover active:shadow-[0_2px_0_var(--color-fascist-dark)] active:translate-y-[4px] transition-all duration-[var(--transition-normal)] cursor-pointer"
        >
          Continue
        </button>
      </div>
    );
  }

  return null;
}

// ── Sub-component: Vote casting UI ──────────────────────────────────

function VoteCastView({
  state,
  dispatch,
  voter,
  presidentName,
  chancellorName,
  onVoted,
}: {
  state: GameState;
  dispatch: (action: GameAction) => void;
  voter: { id: number; name: string; portraitIndex: number };
  presidentName: string;
  chancellorName: string;
  onVoted: () => void;
}) {
  function handleVote(vote: Vote) {
    dispatch({ type: "CAST_VOTE", playerId: voter.id, vote });
    onVoted();
  }

  return (
    <div className="flex flex-col items-center justify-center h-full px-4 py-4 gap-6">
      <div className="text-center slide-up">
        <p className="text-text-muted font-body text-xs uppercase tracking-widest mb-3">
          {voter.name}&apos;s Vote
        </p>
        <h2 className="font-heading text-2xl text-text-primary mb-1">
          Vote on the Government
        </h2>
        <p className="text-text-secondary font-body text-sm">
          President <span className="text-gold font-semibold">{presidentName}</span>
          {" + "}
          Chancellor <span className="text-gold font-semibold">{chancellorName}</span>
        </p>
        <p className="text-text-muted font-body text-xs mt-2">
          Failed elections: {state.electionTracker.failedElections} / 3
        </p>
      </div>

      {/* Vote cards */}
      <div className="flex items-center gap-8">
        <VoteCard vote="ja" size="lg" onClick={() => handleVote(Vote.Ja)} />
        <VoteCard vote="nein" size="lg" onClick={() => handleVote(Vote.Nein)} />
      </div>
    </div>
  );
}
