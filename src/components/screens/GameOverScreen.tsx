/**
 * GameOverScreen — Victory screen showing the winning team,
 * victory reason, and all player roles revealed.
 */

import { useOptimizedAsset } from "@/components/game/OptimizedAssets";
import { PORTRAITS } from "@/engine/constants";
import type { GameState, GameAction } from "@/engine/types";
import { Team, Role } from "@/engine/types";
import { useI18n } from "@/i18n";

function getRoleBadge(role: Role, roleLabels: Record<Role, string>) {
	switch (role) {
		case Role.Hitler:
			return {
				label: roleLabels[Role.Hitler],
				className: "bg-fascist-deep text-text-primary",
			};
		case Role.Fascist:
			return {
				label: roleLabels[Role.Fascist],
				className: "bg-fascist/80 text-text-primary",
			};
		case Role.Liberal:
			return {
				label: roleLabels[Role.Liberal],
				className: "bg-liberal/80 text-text-primary",
			};
	}
}

interface ScreenProps {
	state: GameState;
	dispatch: (action: GameAction) => void;
}

export function GameOverScreen({ state, dispatch }: ScreenProps) {
	const { headingText, messages } = useI18n();
	const winner = state.winner;
	const reason = state.victoryReason;
	const liberalHeaderSrc = useOptimizedAsset("victory/victory-liberal-header.png");
	const liberalFooterSrc = useOptimizedAsset("victory/victory-liberal-footer.png");
	const fascistHeaderSrc = useOptimizedAsset("victory/victory-fascist-header.png");
	const fascistFooterSrc = useOptimizedAsset("victory/victory-fascist-footer.png");

	if (!winner || !reason) return null;

	const isLiberalWin = winner === Team.Liberal;
	const headerImg = isLiberalWin ? liberalHeaderSrc : fascistHeaderSrc;
	const footerImg = isLiberalWin ? liberalFooterSrc : fascistFooterSrc;
	const teamColor = isLiberalWin ? "text-liberal" : "text-fascist";
	const glowClass = isLiberalWin ? "glow-liberal" : "glow-fascist";

	// Sort players: winning team first, then losing team
	const sortedPlayers = [...state.players].sort((a, b) => {
		const aIsWinner = (isLiberalWin && a.role === Role.Liberal) || (!isLiberalWin && a.role !== Role.Liberal);
		const bIsWinner = (isLiberalWin && b.role === Role.Liberal) || (!isLiberalWin && b.role !== Role.Liberal);
		if (aIsWinner && !bIsWinner) return -1;
		if (!aIsWinner && bIsWinner) return 1;
		// Within the same team, put Hitler last
		if (a.role === Role.Hitler) return 1;
		if (b.role === Role.Hitler) return -1;
		return 0;
	});

	return (
		<div className="flex h-dvh w-full flex-col overflow-hidden px-4 py-4">
			{/* Victory header image */}
			<div className={["w-full max-w-md mx-auto flex-shrink-0 stamp mb-3", glowClass].join(" ")}>
				<img
					src={headerImg}
					alt={messages.gameOver.victoryBannerAlt(messages.enums.teams[winner])}
					className="block h-auto w-full rounded-t-[var(--radius-card)]"
					draggable={false}
				/>
			</div>

			{/* Victory title */}
			<div className="mb-3 flex-shrink-0 text-center">
				<h1 className={["font-heading text-3xl sm:text-4xl tracking-wide mb-1", teamColor].join(" ")}>
					{headingText(isLiberalWin ? messages.gameOver.liberalsWin : messages.gameOver.fascistsWin)}
				</h1>
				<p className="text-text-secondary font-body mx-auto max-w-sm text-xs">
					{messages.enums.victoryReasons[reason]}
				</p>
			</div>

			{/* Board final state */}
			<div className="mb-3 flex flex-shrink-0 items-center justify-center gap-8">
				<div className="text-center">
					<p className="text-liberal font-heading text-2xl">{state.board.liberalPolicies}</p>
					<p className="label-text">{messages.enums.teams.liberal}</p>
				</div>
				<div className="bg-text-muted/30 h-6 w-px" />
				<div className="text-center">
					<p className="text-fascist font-heading text-2xl">{state.board.fascistPolicies}</p>
					<p className="label-text">{messages.enums.teams.fascist}</p>
				</div>
			</div>

			{/* All roles revealed — scrollable */}
			<div className="mx-auto mb-3 min-h-0 w-full max-w-md flex-1 overflow-y-auto">
				<p className="section-label bg-bg-dark sticky top-0 mb-2 py-1 text-center">
					{messages.gameOver.allRolesRevealed}
				</p>
				<div className="space-y-1.5">
					{sortedPlayers.map((player) => {
						const badge = getRoleBadge(player.role, messages.enums.roles);
						const isDead = !player.isAlive;

						return (
							<div
								key={player.id}
								className={[
									"flex items-center gap-3 bg-bg-card rounded-[var(--radius-button)] px-3 py-2 fade-in",
									isDead && "opacity-50",
								].join(" ")}
							>
								{/* Portrait */}
								<div
									className={[
										"w-9 h-9 rounded-full overflow-hidden border-2 flex-shrink-0",
										player.role === Role.Hitler
											? "border-fascist-deep"
											: player.role === Role.Fascist
												? "border-fascist/60"
												: "border-liberal/60",
										isDead && "grayscale",
									].join(" ")}
								>
									<img
										src={PORTRAITS[player.portraitIndex]?.src}
										alt={player.name}
										className="h-full w-full object-cover"
									/>
								</div>

								{/* Name */}
								<span
									className={[
										"flex-1 font-body font-medium text-sm",
										isDead ? "text-text-muted line-through" : "text-text-primary",
									].join(" ")}
								>
									{player.name}
									{isDead && <span className="text-fascist ml-2 text-xs no-underline">{messages.gameOver.dead}</span>}
								</span>

								{/* Role badge */}
								<span
									className={[
										"px-2.5 py-0.5 rounded-[var(--radius-button)] text-xs font-body font-semibold uppercase tracking-wider",
										badge.className,
									].join(" ")}
								>
									{badge.label}
								</span>
							</div>
						);
					})}
				</div>
			</div>

			{/* Victory footer image */}
			<div className="mx-auto mb-3 w-full max-w-md flex-shrink-0">
				<img
					src={footerImg}
					alt=""
					className="block h-auto w-full rounded-b-[var(--radius-card)] opacity-80"
					draggable={false}
				/>
			</div>

			{/* New Game button */}
			<button
				type="button"
				onClick={() => dispatch({ type: "NEW_GAME" })}
				className="btn-primary mx-auto w-full max-w-md flex-shrink-0"
			>
				{headingText(messages.common.newGame)}
			</button>
		</div>
	);
}
