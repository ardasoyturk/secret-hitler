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
import { VoteCard } from "@components/cards/VoteCard";
import { ViewportOverlay } from "@components/layout/ViewportOverlay";
import type { GameState, GameAction } from "@engine/types";
import { GamePhase, Vote } from "@engine/types";
import { useState } from "react";

const PORTRAITS = [
	portrait1,
	portrait2,
	portrait3,
	portrait4,
	portrait5,
	portrait6,
	portrait7,
	portrait8,
	portrait9,
	portrait10,
	portrait11,
	portrait12,
	portrait13,
	portrait14,
	portrait15,
	portrait16,
	portrait17,
	portrait18,
	portrait19,
	portrait20,
];

interface ScreenProps {
	state: GameState;
	dispatch: (action: GameAction) => void;
}

function PrivacyGate({ playerName, onReady }: { playerName: string; onReady: () => void }) {
	return (
		<ViewportOverlay>
			<div className="privacy-screen">
				<div className="privacy-dialog text-center">
					<h2 className="privacy-title">Pass the Device</h2>
					<p className="privacy-subtitle">Hand the device to</p>
					<p className="privacy-name">{playerName}</p>
					<button type="button" onClick={onReady} className="primary-action-button">
						I&apos;m Ready
					</button>
				</div>
			</div>
		</ViewportOverlay>
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
			<div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-1 py-3 md:gap-5 md:py-5">
				<div className="slide-up flex-shrink-0 text-center">
					<p className="text-text-muted mb-1 text-[11px] font-semibold tracking-[0.28em] uppercase">Election Result</p>
					<h2
						className={["mb-1 font-heading text-3xl md:text-4xl", passed ? "text-liberal" : "text-fascist"].join(" ")}
					>
						{passed ? "JA! Election Passes" : "NEIN! Election Fails"}
					</h2>
					<p className="text-text-secondary text-sm md:text-base">
						{jaCount} Ja — {neinCount} Nein
					</p>
				</div>

				<div className="bg-bg-card/70 grid flex-shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-5 rounded-[22px] border border-white/8 px-4 py-3 shadow-[var(--shadow-card)]">
					{president && (
						<div className="text-center">
							<div className="border-gold mx-auto mb-1 h-14 w-14 overflow-hidden rounded-full border-2">
								<img
									src={PORTRAITS[president.portraitIndex]?.src}
									alt={president.name}
									className="h-full w-full object-cover"
								/>
							</div>
							<p className="text-text-muted text-xs tracking-[0.18em] uppercase">President</p>
							<p className="text-text-primary text-sm font-medium">{president.name}</p>
						</div>
					)}
					<span className="font-heading text-gold text-2xl">&amp;</span>
					{chancellor && (
						<div className="text-center">
							<div className="border-gold mx-auto mb-1 h-14 w-14 overflow-hidden rounded-full border-2">
								<img
									src={PORTRAITS[chancellor.portraitIndex]?.src}
									alt={chancellor.name}
									className="h-full w-full object-cover"
								/>
							</div>
							<p className="text-text-muted text-xs tracking-[0.18em] uppercase">Chancellor</p>
							<p className="text-text-primary text-sm font-medium">{chancellor.name}</p>
						</div>
					)}
				</div>

				<div className="min-h-0 flex-1 space-y-2 overflow-y-auto">
					{state.votes.map((voteRecord) => {
						const player = state.players.find((p) => p.id === voteRecord.playerId);
						if (!player) return null;
						const isJa = voteRecord.vote === Vote.Ja;
						return (
							<div
								key={voteRecord.playerId}
								className="fade-in bg-bg-card/70 flex items-center gap-3 rounded-[18px] border border-white/6 px-4 py-3"
							>
								<div className="h-7 w-7 flex-shrink-0 overflow-hidden rounded-full">
									<img
										src={PORTRAITS[player.portraitIndex]?.src}
										alt={player.name}
										className="h-full w-full object-cover"
									/>
								</div>
								<span className="text-text-primary flex-1 text-sm md:text-base">{player.name}</span>
								<span className={["font-heading text-lg", isJa ? "text-liberal" : "text-fascist"].join(" ")}>
									{isJa ? "JA" : "NEIN"}
								</span>
							</div>
						);
					})}
				</div>

				{/* Election tracker (on fail) */}
				{!passed && (
					<p className="text-text-muted flex-shrink-0 text-center text-xs">
						Failed elections:{" "}
						<span className="text-fascist font-semibold">{state.electionTracker.failedElections}</span> / 3
					</p>
				)}

				{/* Continue button */}
				<div className="phase-action-bar">
					<button
						type="button"
						onClick={() => dispatch({ type: "ACKNOWLEDGE_VOTE_RESULT" })}
						className="bg-fascist font-heading text-text-primary hover:bg-fascist-hover w-full flex-shrink-0 cursor-pointer rounded-[18px] py-3 text-xl shadow-[0_6px_0_var(--color-fascist-dark),var(--shadow-card)] transition-all duration-[var(--transition-normal)] active:translate-y-[4px] active:shadow-[0_2px_0_var(--color-fascist-dark)]"
					>
						Continue
					</button>
				</div>
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

	function handlePassElection() {
		dispatch({ type: "PASS_ELECTION_UNANIMOUSLY" });
	}

	return (
		<div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-6 px-1 py-3 md:gap-7 md:py-5">
			<div className="slide-up text-center">
				<p className="text-text-muted mb-2 text-[11px] font-semibold tracking-[0.28em] uppercase">
					{voter.name}&apos;s Vote
				</p>
				<h2 className="font-heading text-text-primary mb-1 text-3xl md:text-4xl">Vote on the Government</h2>
				<p className="text-text-secondary text-sm md:text-base">
					President <span className="text-gold font-semibold">{presidentName}</span>
					{" · "}
					Chancellor <span className="text-gold font-semibold">{chancellorName}</span>
				</p>
				<p className="text-text-muted mt-2 text-xs">Failed elections: {state.electionTracker.failedElections} / 3</p>
			</div>

			<div className="flex w-full flex-wrap items-center justify-center gap-6 md:gap-10">
				<VoteCard vote="ja" size="lg" onClick={() => handleVote(Vote.Ja)} />
				<VoteCard vote="nein" size="lg" onClick={() => handleVote(Vote.Nein)} />
			</div>

			<div className="bg-bg-card/70 w-full max-w-2xl rounded-[22px] border border-white/8 px-4 py-4 text-center shadow-[var(--shadow-card)]">
				<p className="text-text-muted text-[11px] font-semibold tracking-[0.24em] uppercase">Table Shortcut</p>
				<p className="text-text-secondary mt-2 text-sm md:text-base">
					If everyone agrees on <span className="text-liberal font-semibold">Ja</span>, pass this election in one tap
					and reveal the normal result.
				</p>
				<div className="mt-4">
					<button
						type="button"
						onClick={handlePassElection}
						className="border-liberal/35 bg-liberal/12 font-heading text-liberal hover:bg-liberal/18 w-full cursor-pointer rounded-[18px] border px-6 py-3 text-xl tracking-wide shadow-[0_6px_0_var(--color-liberal-dark),var(--shadow-card)] transition-all duration-200 active:translate-y-[3px] active:shadow-[0_3px_0_var(--color-liberal-dark)]"
					>
						Pass Election as All Ja
					</button>
				</div>
			</div>
		</div>
	);
}
