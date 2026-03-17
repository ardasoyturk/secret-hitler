/**
 * Header — Top bar showing round, phase, and current government info.
 *
 * Compact dark bar that stays at the top of the game screen.
 */

import { GamePhase } from "@engine/types";

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

export function Header({
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
        "w-full px-4 py-2 flex items-center justify-between",
        "bg-bg-darker/90 backdrop-blur-sm border-b border-text-muted/20",
        "font-body text-text-primary select-none",
        "fade-in",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Left: Round */}
      <div className="flex items-center gap-2 min-w-0">
        <span className="font-heading text-lg text-gold tracking-wide">Round {round}</span>
      </div>

      {/* Center: Phase */}
      <div className="flex-1 text-center min-w-0 px-2">
        <span
          className={[
            "text-sm font-semibold uppercase tracking-wider",
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

      {/* Right: Government */}
      <div className="flex items-center gap-3 min-w-0 text-xs text-text-secondary">
        {showGovernment && (
          <>
            {presidentName && (
              <span className="truncate max-w-[80px]">
                <span className="text-gold font-bold">P</span> {presidentName}
              </span>
            )}
            {chancellorName && (
              <span className="truncate max-w-[80px]">
                <span className="text-gold font-bold">C</span> {chancellorName}
              </span>
            )}
          </>
        )}
      </div>
    </header>
  );
}
