/**
 * Header — Top bar showing round, phase, and current government info.
 *
 * Compact dark bar that stays at the top of the game screen.
 */

import { GamePhase } from "@engine/types";
import { memo } from "react";

const PHASE_LABELS: Record<GamePhase, string> = {
	[GamePhase.Setup]: "Setting Up",
	[GamePhase.NightRound]: "Night Round",
	[GamePhase.NightReveal]: "Viewing Role",
	[GamePhase.ChancellorNomination]: "Nominate Chancellor",
	[GamePhase.Election]: "Election",
	[GamePhase.VoteCast]: "Cast Your Vote",
	[GamePhase.VoteResult]: "Vote Results",
	[GamePhase.PresidentLegislation]: "President Legislates",
	[GamePhase.ChancellorLegislation]: "Chancellor Legislates",
	[GamePhase.VetoRequested]: "Veto Requested",
	[GamePhase.PolicyEnacted]: "Policy Enacted",
	[GamePhase.ExecutiveInvestigate]: "Investigation",
	[GamePhase.InvestigationResult]: "Investigation Result",
	[GamePhase.ExecutivePeek]: "Policy Peek",
	[GamePhase.ExecutiveSpecialElection]: "Special Election",
	[GamePhase.ExecutiveExecution]: "Execution",
	[GamePhase.ChaosPolicy]: "Chaos!",
	[GamePhase.GameOver]: "Game Over",
};

interface HeaderProps {
	round: number;
	phase: GamePhase;
	presidentName?: string;
	chancellorName?: string;
	className?: string;
}

export const Header = memo(function Header({
	round,
	phase,
	presidentName,
	chancellorName,
	className = "",
}: HeaderProps) {
	const phaseLabel = PHASE_LABELS[phase] ?? phase;
	const showGovernment = presidentName && phase !== GamePhase.Setup && phase !== GamePhase.GameOver;

	return (
		<header
			className={[
				"w-full px-4 py-3 md:px-6",
				"border-b border-white/6 bg-bg-board-rail/80 backdrop-blur-md",
				"font-body text-text-primary select-none",
				"fade-in",
				className,
			]
				.filter(Boolean)
				.join(" ")}
		>
			<div className="mx-auto flex w-full max-w-7xl items-center gap-3">
				<div className="status-chip shrink-0 rounded-full px-4 py-2">
					<span className="font-heading text-gold text-xl tracking-wide">Round {round}</span>
				</div>

				<div className="min-w-0 flex-1 text-center">
					<span
						className={[
							"inline-block max-w-full truncate px-4 text-[12px] font-semibold uppercase tracking-[0.28em] md:text-sm",
							phase === GamePhase.GameOver
								? "text-fascist"
								: phase === GamePhase.ChaosPolicy
									? "text-fascist pulse"
									: "text-text-secondary",
						].join(" ")}
					>
						{phaseLabel}
					</span>
				</div>

				{showGovernment && (
					<div className="flex min-w-0 items-center justify-end gap-2 md:gap-3">
						{presidentName && (
							<div className="status-chip min-w-[170px] rounded-2xl px-3.5 py-2 text-center md:min-w-[190px]">
								<p className="text-gold/90 text-[11px] font-semibold tracking-[0.24em] uppercase">President</p>
								<p className="font-heading text-text-primary truncate text-[34px] leading-[0.95]">{presidentName}</p>
							</div>
						)}
						{chancellorName && (
							<div className="status-chip min-w-[170px] rounded-2xl px-3.5 py-2 text-center md:min-w-[190px]">
								<p className="text-gold/90 text-[11px] font-semibold tracking-[0.24em] uppercase">Chancellor</p>
								<p className="font-heading text-text-primary truncate text-[34px] leading-[0.95]">{chancellorName}</p>
							</div>
						)}
					</div>
				)}
			</div>
		</header>
	);
});
