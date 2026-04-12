import type { ComponentChildren } from "preact";
import { memo } from "preact/compat";

import { useOptimizedAsset } from "@/components/game/OptimizedAssets";
import { getPlayerCountBracket, EXECUTIVE_POWERS } from "@/engine/constants";
import type { Board, ElectionTracker } from "@/engine/types";
import { ExecutivePower } from "@/engine/types";
import { useI18n } from "@/i18n";

type AssetRef = string;

interface SlotRect {
	x: number;
	y: number;
	width: number;
	height: number;
}

interface SvgLayout {
	policySlots: SlotRect[];
	trackerSlots: SlotRect[];
}

const VIEWBOX_WIDTH = 1683;
const VIEWBOX_HEIGHT = 650;

function rect(x: number, y: number, width: number, height: number): SlotRect {
	return {
		x: x / VIEWBOX_WIDTH,
		y: y / VIEWBOX_HEIGHT,
		width: width / VIEWBOX_WIDTH,
		height: height / VIEWBOX_HEIGHT,
	};
}

function getSlotKey(prefix: string, slot: SlotRect): string {
	return `${prefix}-${slot.x}-${slot.y}-${slot.width}-${slot.height}`;
}

const LIBERAL_LAYOUT: SvgLayout = {
	policySlots: [
		rect(285, 182, 194, 268),
		rect(515, 182, 194, 268),
		rect(745, 182, 194, 268),
		rect(975, 182, 194, 268),
		rect(1205, 182, 194, 268),
	],
	trackerSlots: [rect(582, 495, 42, 46), rect(736, 495, 42, 46), rect(890, 495, 42, 46), rect(1044, 495, 42, 46)],
};

const FASCIST_LAYOUT: SvgLayout = {
	policySlots: [
		rect(170, 182, 194.3, 268),
		rect(400, 182, 194.3, 268),
		rect(630, 182, 194.3, 268),
		rect(860, 182, 194.3, 268),
		rect(1090, 182, 194.3, 268),
		rect(1320, 182, 194.3, 268),
	],
	trackerSlots: [],
};

const FASCIST_BOARD_MAP: Record<string, { assetKey: string; layout: SvgLayout }> = {
	"5-6": { assetKey: "boards/board-fascist-5-6.png", layout: FASCIST_LAYOUT },
	"7-8": { assetKey: "boards/board-fascist-7-8.png", layout: FASCIST_LAYOUT },
	"9-10": { assetKey: "boards/board-fascist-9-10.png", layout: FASCIST_LAYOUT },
};

const EXECUTIVE_POWER_ICONS: Record<ExecutivePower, string> = {
	[ExecutivePower.None]: "",
	[ExecutivePower.InvestigateLoyalty]: "Investigate",
	[ExecutivePower.PolicyPeek]: "Peek",
	[ExecutivePower.SpecialElection]: "Election",
	[ExecutivePower.Execution]: "Execution",
};

interface BoardTrackProps {
	board: Board;
	electionTracker: ElectionTracker;
	playerCount: number;
	trackerPosition: number;
	vetoUnlocked: boolean;
	compact?: boolean;
	className?: string;
}

function PolicySlots({
	count,
	slots,
	imageSrc,
	getAltText,
}: {
	count: number;
	slots: SlotRect[];
	imageSrc: AssetRef;
	getAltText: (position: number) => string;
}) {
	return (
		<>
			{slots.map((slot, index) => (
				<div
					key={getSlotKey(getAltText(index + 1), slot)}
					className="absolute"
					style={{
						left: `${slot.x * 100}%`,
						top: `${slot.y * 100}%`,
						width: `${slot.width * 100}%`,
						height: `${slot.height * 100}%`,
					}}
				>
					{index < count && (
						<img
							src={imageSrc}
							alt={getAltText(index + 1)}
							className="scale-pop h-full w-full object-contain drop-shadow-[0_10px_12px_rgba(0,0,0,0.24)]"
							draggable={false}
						/>
					)}
				</div>
			))}
		</>
	);
}

function TrackerSlot({ position, slots, imageSrc }: { position: number; slots: SlotRect[]; imageSrc: AssetRef }) {
	const { messages } = useI18n();
	const slot = slots[position - 1];
	if (!slot) return null;

	return (
		<div
			key={getSlotKey("tracker-position", slot)}
			className="absolute"
			style={{
				left: `${slot.x * 100}%`,
				top: `${slot.y * 100}%`,
				width: `${slot.width * 100}%`,
				height: `${slot.height * 100}%`,
			}}
		>
			<img
				src={imageSrc}
				alt={messages.board.electionTrackerPosition(position)}
				className="scale-pop h-full w-full object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.32)]"
				draggable={false}
			/>
		</div>
	);
}

function BoardPanel({
	title,
	imageSrc,
	imageAlt,
	accentClass,
	children,
	aspectClass,
	compact = false,
}: {
	title: string;
	imageSrc: AssetRef;
	imageAlt: string;
	accentClass: string;
	children: ComponentChildren;
	aspectClass?: string;
	compact?: boolean;
}) {
	const { headingText } = useI18n();

	return (
		<section className={[ "min-w-0", compact ? "snap-center" : "" ].join(" ")}>
			<div className={["mb-1.5 flex items-center justify-center gap-2 md:mb-2 md:gap-3", compact ? "md:mb-2" : ""].join(" ")}>
				<span className={["h-px w-4 bg-gradient-to-r from-transparent to-current opacity-55 md:w-8", accentClass].join(" ")} />
				<p className={["font-heading text-sm tracking-[0.1em] md:text-xl md:tracking-[0.12em]", accentClass].join(" ")}>
					{headingText(title)}
				</p>
				<span className={["h-px w-4 bg-gradient-to-l from-transparent to-current opacity-55 md:w-8", accentClass].join(" ")} />
			</div>
			<div className="relative overflow-hidden rounded-[var(--radius-panel)] border border-white/8 bg-[#1a120d] p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_12px_24px_rgba(0,0,0,0.24)] md:p-2 md:shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_18px_34px_rgba(0,0,0,0.28)]">
				<div
					className={["relative overflow-hidden rounded-[10px] md:rounded-[var(--radius-card)]", aspectClass ?? "aspect-[1683/650]"].join(
						" ",
					)}
				>
					<img src={imageSrc} alt={imageAlt} className="h-full w-full object-cover" draggable={false} />
					<div className="absolute inset-0">{children}</div>
				</div>
			</div>
		</section>
	);
}

export const BoardTrack = memo(function BoardTrack({
	board,
	playerCount,
	trackerPosition,
	vetoUnlocked,
	compact = false,
	className = "",
}: BoardTrackProps) {
	const { messages } = useI18n();
	const bracket = getPlayerCountBracket(playerCount);
	const fascistBoard = FASCIST_BOARD_MAP[bracket] ?? FASCIST_BOARD_MAP["5-6"];
	const executivePowers = EXECUTIVE_POWERS[bracket];
	const liberalBoardSrc = useOptimizedAsset("boards/board-liberal.png");
	const fascistBoardSrc = useOptimizedAsset(fascistBoard.assetKey);
	const liberalPolicySrc = useOptimizedAsset("boards/board-policy-liberal.png");
	const fascistPolicySrc = useOptimizedAsset("boards/board-policy-fascist.png");
	const trackerSrc = useOptimizedAsset("boards/board-tracker.png");

	return (
		<div className={["mx-auto w-full max-w-6xl", className].filter(Boolean).join(" ")}>
			<div
				className={[
					"grid items-start gap-2 md:gap-4",
					compact
						? "grid-flow-col auto-cols-[78%] overflow-x-auto pb-1.5 snap-x snap-mandatory [scrollbar-width:none]"
						: "mobile-board-rail lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]",
				].join(" ")}
			>
				<BoardPanel
					title={messages.board.liberalBoard}
					imageSrc={liberalBoardSrc}
					imageAlt={messages.board.liberalBoardAlt}
					accentClass="text-liberal"
					compact={compact}
				>
					<PolicySlots
						count={board.liberalPolicies}
						slots={LIBERAL_LAYOUT.policySlots}
						imageSrc={liberalPolicySrc}
						getAltText={messages.board.liberalPolicyAlt}
					/>
					<TrackerSlot position={trackerPosition} slots={LIBERAL_LAYOUT.trackerSlots} imageSrc={trackerSrc} />
				</BoardPanel>

				<BoardPanel
					title={messages.board.fascistBoard}
					imageSrc={fascistBoardSrc}
					imageAlt={messages.board.fascistBoardAlt}
					accentClass="text-fascist"
					compact={compact}
				>
					<PolicySlots
						count={board.fascistPolicies}
						slots={fascistBoard.layout.policySlots}
						imageSrc={fascistPolicySrc}
						getAltText={messages.board.fascistPolicyAlt}
					/>
					{fascistBoard.layout.policySlots.map((slot, index) => {
						const power = executivePowers[index + 1];
						if (!power || power === ExecutivePower.None || index < board.fascistPolicies) {
							return null;
						}

						return (
							<span
								key={getSlotKey(`power-${power}`, slot)}
								className="text-text-secondary absolute rounded-full bg-black/52 px-1 py-0.5 text-[6px] font-semibold tracking-[0.14em] uppercase md:px-1.5 md:text-[8px] md:tracking-[0.18em]"
								style={{
									left: `${(slot.x + slot.width / 2) * 100}%`,
									top: `${(slot.y + slot.height / 2) * 100 + 18.2}%`,
									transform: "translate(-50%, -50%)",
								}}
							>
								{messages.enums.executivePowerBadges[power] ?? EXECUTIVE_POWER_ICONS[power]}
							</span>
						);
					})}
					{vetoUnlocked && fascistBoard.layout.policySlots[4] && (
						<span
							className="border-gold/30 text-gold absolute rounded-full border bg-black/62 px-1.5 py-0.5 text-[6px] font-bold tracking-[0.16em] uppercase md:px-2 md:text-[8px] md:tracking-[0.2em]"
							style={{
								left: `${(fascistBoard.layout.policySlots[4].x + fascistBoard.layout.policySlots[4].width / 2) * 100}%`,
								top: `${(fascistBoard.layout.policySlots[4].y + fascistBoard.layout.policySlots[4].height / 2) * 100 - 18.8}%`,
								transform: "translate(-50%, -50%)",
							}}
						>
							{messages.board.veto}
						</span>
					)}
				</BoardPanel>
			</div>
		</div>
	);
}, areBoardTrackPropsEqual);

function areBoardTrackPropsEqual(previous: BoardTrackProps, next: BoardTrackProps) {
	return (
		previous.className === next.className &&
		previous.compact === next.compact &&
		previous.playerCount === next.playerCount &&
		previous.trackerPosition === next.trackerPosition &&
		previous.vetoUnlocked === next.vetoUnlocked &&
		previous.board.liberalPolicies === next.board.liberalPolicies &&
		previous.board.fascistPolicies === next.board.fascistPolicies &&
		previous.electionTracker.failedElections === next.electionTracker.failedElections
	);
}
