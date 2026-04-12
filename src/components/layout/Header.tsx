/**
 * Header — Top bar showing round, phase, and current government info.
 *
 * Compact dark bar that stays at the top of the game screen.
 */

import { memo } from "preact/compat";

import { GamePhase } from "@/engine/types";
import { useI18n } from "@/i18n";

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
	const { headingText, messages } = useI18n();
	const phaseLabel = messages.enums.phases[phase] ?? phase;
	const showGovernment = presidentName && phase !== GamePhase.Setup && phase !== GamePhase.GameOver;

	return (
		<header
			className={[
				"w-full px-3 py-2 md:px-6 md:py-3",
				"border-b border-white/6 bg-bg-board-rail/80 backdrop-blur-md",
				"font-body text-text-primary select-none",
				"fade-in",
				className,
			]
				.filter(Boolean)
				.join(" ")}
		>
			<div className="mx-auto flex w-full max-w-7xl items-center gap-2 md:gap-3">
				<div className="status-chip shrink-0 rounded-full px-3 py-1.5 md:px-4 md:py-2">
					<span className="font-heading text-gold text-lg tracking-wide md:text-xl">
						{headingText(messages.common.round(round))}
					</span>
				</div>

				<div className="min-w-0 flex-1 text-center">
					<span
						className={[
							"inline-block max-w-full truncate px-2 text-[11px] font-semibold tracking-wide md:px-4 md:text-sm",
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
					<div className="flex min-w-0 items-center justify-end gap-1.5 md:gap-3">
						{presidentName && (
							<div className="status-chip min-w-[92px] rounded-2xl px-2.5 py-1.5 text-center md:min-w-[190px] md:px-3.5 md:py-2">
								<p className="text-gold/90 text-[9px] font-semibold tracking-[0.18em] uppercase md:text-[11px] md:tracking-[0.24em]">
									{messages.header.president}
								</p>
								<p className="font-heading text-text-primary truncate text-xl leading-[0.95] md:text-[34px]">
									{headingText(presidentName)}
								</p>
							</div>
						)}
						{chancellorName && (
							<div className="status-chip min-w-[92px] rounded-2xl px-2.5 py-1.5 text-center md:min-w-[190px] md:px-3.5 md:py-2">
								<p className="text-gold/90 text-[9px] font-semibold tracking-[0.18em] uppercase md:text-[11px] md:tracking-[0.24em]">
									{messages.header.chancellor}
								</p>
								<p className="font-heading text-text-primary truncate text-xl leading-[0.95] md:text-[34px]">
									{headingText(chancellorName)}
								</p>
							</div>
						)}
					</div>
				)}
			</div>
		</header>
	);
});
