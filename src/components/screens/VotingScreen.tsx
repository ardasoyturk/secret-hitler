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

import { memo, useState } from "preact/compat";

import { PrivacyGate } from "@/components/cards/PrivacyGate";
import { VoteCard } from "@/components/cards/VoteCard";
import { PORTRAITS } from "@/engine/constants";
import type { GameState, GameAction } from "@/engine/types";
import { GamePhase, Vote } from "@/engine/types";
import { useI18n } from "@/i18n";

interface ScreenProps {
	state: GameState;
	dispatch: (action: GameAction) => void;
}

export function VotingScreen({ state, dispatch }: ScreenProps) {
	const { headingText, messages } = useI18n();
	const [showPrivacy, setShowPrivacy] = useState(true);

	const president = state.players[state.presidentIndex];
	const chancellor = state.players.find((p) => p.id === state.chancellorNomineeId);

	if (state.phase === GamePhase.Election) {
		const firstAliveIndex = state.players.findIndex((p) => p.isAlive);
		const firstVoter = state.players[firstAliveIndex];

		if (!firstVoter) return null;

		if (showPrivacy) {
			return <PrivacyGate playerName={firstVoter.name} onReady={() => setShowPrivacy(false)} />;
		}

		return (
			<VoteCastView
				dispatch={dispatch}
				voter={firstVoter}
				presidentName={president?.name ?? ""}
				chancellorName={chancellor?.name ?? ""}
				onVoted={() => setShowPrivacy(true)}
			/>
		);
	}

	if (state.phase === GamePhase.VoteCast) {
		const voter = state.players[state.currentVoterIndex];

		if (!voter) return null;

		if (showPrivacy) {
			return <PrivacyGate playerName={voter.name} onReady={() => setShowPrivacy(false)} />;
		}

		return (
			<VoteCastView
				dispatch={dispatch}
				voter={voter}
				presidentName={president?.name ?? ""}
				chancellorName={chancellor?.name ?? ""}
				onVoted={() => setShowPrivacy(true)}
			/>
		);
	}

	if (state.phase === GamePhase.VoteResult) {
		const jaCount = state.votes.filter((v) => v.vote === Vote.Ja).length;
		const neinCount = state.votes.filter((v) => v.vote === Vote.Nein).length;
		const passed = jaCount > neinCount;

		return (
			<div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-1 py-2 md:gap-5 md:py-5">
				<div className="slide-up flex-shrink-0 text-center">
					<p className="section-label mb-1">{messages.voting.electionResult}</p>
					<h2
						className={["mb-1 font-heading text-2xl md:text-4xl", passed ? "text-liberal" : "text-fascist"].join(" ")}
					>
						{headingText(passed ? messages.voting.electionPasses : messages.voting.electionFails)}
					</h2>
					<p className="text-text-secondary text-xs md:text-base">{messages.voting.voteCount(jaCount, neinCount)}</p>
				</div>

				<div className="bg-bg-card/70 grid flex-shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-[var(--radius-panel)] border border-white/8 px-3 py-2.5 shadow-[var(--shadow-card)] md:gap-5 md:px-4 md:py-3">
					{president && (
						<div className="text-center">
							<div className="border-gold mx-auto mb-1 h-14 w-14 overflow-hidden rounded-full border-2">
								<img
									src={PORTRAITS[president.portraitIndex]?.src}
									alt={president.name}
									className="h-full w-full object-cover"
								/>
							</div>
							<p className="label-text">{messages.common.president}</p>
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
							<p className="label-text">{messages.common.chancellor}</p>
							<p className="text-text-primary text-sm font-medium">{chancellor.name}</p>
						</div>
					)}
				</div>

				<div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto md:space-y-2">
					{state.votes.map((voteRecord) => {
						const player = state.players.find((p) => p.id === voteRecord.playerId);
						if (!player) return null;
						const isJa = voteRecord.vote === Vote.Ja;
						return (
							<div
								key={voteRecord.playerId}
							className="fade-in bg-bg-card/70 flex items-center gap-2.5 rounded-[var(--radius-panel)] border border-white/6 px-3 py-2.5 md:gap-3 md:px-4 md:py-3"
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
									{headingText(isJa ? messages.enums.votes.ja.toUpperCase() : messages.enums.votes.nein.toUpperCase())}
								</span>
							</div>
						);
					})}
				</div>

				{/* Continue button */}
				<div className="phase-action-bar pt-2 md:pt-4">
					<button
						type="button"
						onClick={() => dispatch({ type: "ACKNOWLEDGE_VOTE_RESULT" })}
						className="btn-primary w-full flex-shrink-0"
					>
						{headingText(messages.common.continue)}
					</button>
				</div>
			</div>
		);
	}

	return null;
}

const VoteCastView = memo(function VoteCastView({
	dispatch,
	voter,
	presidentName,
	chancellorName,
	onVoted,
}: {
	dispatch: (action: GameAction) => void;
	voter: { id: number; name: string; portraitIndex: number };
	presidentName: string;
	chancellorName: string;
	onVoted: () => void;
}) {
	const { headingText, messages } = useI18n();

	function handleVote(vote: Vote) {
		dispatch({ type: "CAST_VOTE", playerId: voter.id, vote });
		onVoted();
	}

	function handlePassElection() {
		dispatch({ type: "PASS_ELECTION_UNANIMOUSLY" });
	}

	return (
		<div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-4 px-1 py-2 md:gap-7 md:py-5">
			<div className="slide-up text-center">
				<p className="section-label mb-2">{messages.voting.voterTitle(voter.name)}</p>
				<h2 className="font-heading text-text-primary mb-1 text-2xl md:text-4xl">
					{headingText(messages.voting.voteOnGovernment)}
				</h2>
				<p className="text-text-secondary text-xs md:text-base">
					{messages.voting.governmentSummary(presidentName, chancellorName)}
				</p>
			</div>

			<div className="mobile-card-strip flex w-full items-center justify-center gap-4 md:flex-wrap md:justify-center md:gap-10">
				<VoteCard vote="ja" size="lg" onClick={() => handleVote(Vote.Ja)} />
				<VoteCard vote="nein" size="lg" onClick={() => handleVote(Vote.Nein)} />
			</div>

			<div className="bg-bg-card/70 w-full max-w-2xl rounded-[var(--radius-panel)] border border-white/8 px-3 py-3 text-center shadow-[var(--shadow-card)] md:px-4 md:py-4">
				<p className="section-label">{messages.voting.tableShortcut}</p>
				<p className="text-text-secondary mt-1.5 text-xs md:mt-2 md:text-base">{messages.voting.tableShortcutDescription}</p>
				<div className="mt-4">
					<button
						type="button"
						onClick={handlePassElection}
						className="btn-ghost border-liberal/35 text-liberal hover:bg-liberal/10 hover:text-liberal w-full"
					>
						{headingText(messages.voting.passElectionAsAllJa)}
					</button>
				</div>
			</div>
		</div>
	);
});
