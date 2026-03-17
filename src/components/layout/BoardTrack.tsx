import type { Board, ElectionTracker } from "@engine/types";
import { ExecutivePower } from "@engine/types";
import {
  getPlayerCountBracket,
  EXECUTIVE_POWERS,
} from "@engine/constants";
import type { ReactNode } from "react";

import boardLiberalImg from "@assets/boards/board-liberal.svg";
import boardFascist56Img from "@assets/boards/board-fascist-5-6.svg";
import boardFascist78Img from "@assets/boards/board-fascist-7-8.svg";
import boardFascist910Img from "@assets/boards/board-fascist-9-10.svg";
import policyLiberalImg from "@assets/boards/board-policy-liberal.png";
import policyFascistImg from "@assets/boards/board-policy-fascist.png";
import trackerMarkerImg from "@assets/boards/board-tracker.png";
import { useOptimizedAsset } from "@components/game/OptimizedAssets";

import boardLiberalRaw from "@assets/boards/board-liberal.svg?raw";
import boardFascist56Raw from "@assets/boards/board-fascist-5-6.svg?raw";
import boardFascist78Raw from "@assets/boards/board-fascist-7-8.svg?raw";
import boardFascist910Raw from "@assets/boards/board-fascist-9-10.svg?raw";

type AssetRef = string | { src: string };

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

const POLICY_SLOT_SIZE = { width: 194.3, height: 268 };
const TRACKER_SLOT_SIZE = { width: 42, height: 46 };
const POLICY_SIZE_TOLERANCE = 1.5;
const TRACKER_SIZE_TOLERANCE = 0.6;

const FASCIST_BOARD_MAP: Record<string, { src: AssetRef; layout: SvgLayout }> = {
  "5-6": { src: boardFascist56Img, layout: parseSvgLayout(boardFascist56Raw) },
  "7-8": { src: boardFascist78Img, layout: parseSvgLayout(boardFascist78Raw) },
  "9-10": { src: boardFascist910Img, layout: parseSvgLayout(boardFascist910Raw) },
};

const EXECUTIVE_POWER_ICONS: Record<ExecutivePower, string> = {
  [ExecutivePower.None]: "",
  [ExecutivePower.InvestigateLoyalty]: "Investigate",
  [ExecutivePower.PolicyPeek]: "Peek",
  [ExecutivePower.SpecialElection]: "Election",
  [ExecutivePower.Execution]: "Execution",
};

const LIBERAL_LAYOUT = parseSvgLayout(boardLiberalRaw);

function parseSvgLayout(svgRaw: string): SvgLayout {
  const viewBox = svgRaw.match(/viewBox="([^"]+)"/)?.[1]?.split(/\s+/).map(Number);
  if (!viewBox || viewBox.length !== 4) {
    throw new Error("Board SVG is missing a valid viewBox.");
  }

  const [, , viewWidth, viewHeight] = viewBox;
  const rectPattern = /<rect\b([^>]*)\/?>/g;
  const rects: { x: number; y: number; width: number; height: number }[] = [];

  let match = rectPattern.exec(svgRaw);
  while (match) {
    const attrs = match[1];
    const xAttr = attrs.match(/\bx="([^"]+)"/)?.[1];
    const yAttr = attrs.match(/\by="([^"]+)"/)?.[1];
    const widthAttr = attrs.match(/\bwidth="([^"]+)"/)?.[1];
    const heightAttr = attrs.match(/\bheight="([^"]+)"/)?.[1];

    if (xAttr && yAttr && widthAttr && heightAttr) {
      rects.push({
        x: Number(xAttr),
        y: Number(yAttr),
        width: Number(widthAttr),
        height: Number(heightAttr),
      });
    }

    match = rectPattern.exec(svgRaw);
  }

  const normalizedRects = rects
    .filter((rect) => Number.isFinite(rect.x) && Number.isFinite(rect.y))
    .map((rect) => ({
      x: rect.x / viewWidth,
      y: rect.y / viewHeight,
      width: rect.width / viewWidth,
      height: rect.height / viewHeight,
      rawWidth: rect.width,
      rawHeight: rect.height,
    }))
    .sort((a, b) => a.x - b.x);

  return {
    policySlots: normalizedRects
      .filter((rect) => {
        const widthMatches = Math.abs(rect.rawWidth - POLICY_SLOT_SIZE.width) <= POLICY_SIZE_TOLERANCE
          || Math.abs(rect.rawWidth - 194) <= POLICY_SIZE_TOLERANCE;
        const heightMatches = Math.abs(rect.rawHeight - POLICY_SLOT_SIZE.height) <= POLICY_SIZE_TOLERANCE;
        return widthMatches && heightMatches;
      })
      .map(({ x, y, width, height }) => ({ x, y, width, height })),
    trackerSlots: normalizedRects
      .filter(
        (rect) =>
          Math.abs(rect.rawWidth - TRACKER_SLOT_SIZE.width) <= TRACKER_SIZE_TOLERANCE
          && Math.abs(rect.rawHeight - TRACKER_SLOT_SIZE.height) <= TRACKER_SIZE_TOLERANCE,
      )
      .map(({ x, y, width, height }) => ({ x, y, width, height })),
  };
}

interface BoardTrackProps {
  board: Board;
  electionTracker: ElectionTracker;
  playerCount: number;
  vetoUnlocked: boolean;
  className?: string;
}

function PolicySlots({
  count,
  slots,
  imageSrc,
  altPrefix,
}: {
  count: number;
  slots: SlotRect[];
  imageSrc: AssetRef;
  altPrefix: string;
}) {
  return (
    <>
      {slots.map((slot, index) => (
        <div
          key={index}
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
              src={assetSrc(imageSrc)}
              alt={`${altPrefix} ${index + 1}`}
              className="h-full w-full object-contain drop-shadow-[0_10px_12px_rgba(0,0,0,0.24)] scale-pop"
              draggable={false}
            />
          )}
        </div>
      ))}
    </>
  );
}

function TrackerSlots({
  count,
  slots,
  imageSrc,
  altPrefix,
}: {
  count: number;
  slots: SlotRect[];
  imageSrc: AssetRef;
  altPrefix: string;
}) {
  return (
    <>
      {slots.slice(0, 3).map((slot, index) => (
        <div
          key={index}
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
              src={assetSrc(imageSrc)}
              alt={`${altPrefix} ${index + 1}`}
              className="h-full w-full object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.32)] scale-pop"
              draggable={false}
            />
          )}
        </div>
      ))}
    </>
  );
}

function BoardPanel({
  title,
  imageSrc,
  imageAlt,
  accentClass,
  children,
  aspectClass,
}: {
  title: string;
  imageSrc: AssetRef;
  imageAlt: string;
  accentClass: string;
  children: ReactNode;
  aspectClass?: string;
}) {
  return (
    <section className="min-w-0 flex-1">
      <div className="mb-2 flex items-center justify-center gap-3">
        <span className={["h-px w-8 bg-gradient-to-r from-transparent to-current opacity-55", accentClass].join(" ")} />
        <p className={["font-heading text-xl tracking-[0.12em]", accentClass].join(" ")}>{title}</p>
        <span className={["h-px w-8 bg-gradient-to-l from-transparent to-current opacity-55", accentClass].join(" ")} />
      </div>
      <div className="relative overflow-hidden rounded-[20px] border border-white/8 bg-[#1a120d] p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_18px_34px_rgba(0,0,0,0.28)]">
        <div className={["relative overflow-hidden rounded-[16px]", aspectClass ?? "aspect-[1683/650]"].join(" ")}>
          <img src={assetSrc(imageSrc)} alt={imageAlt} className="h-full w-full object-cover" draggable={false} />
          <div className="absolute inset-0">{children}</div>
        </div>
      </div>
    </section>
  );
}

function assetSrc(asset: AssetRef): string {
  return typeof asset === "string" ? asset : asset.src;
}

export function BoardTrack({
  board,
  electionTracker,
  playerCount,
  vetoUnlocked,
  className = "",
}: BoardTrackProps) {
  const bracket = getPlayerCountBracket(playerCount);
  const fascistBoard = FASCIST_BOARD_MAP[bracket] ?? FASCIST_BOARD_MAP["5-6"];
  const executivePowers = EXECUTIVE_POWERS[bracket];
  const failedElections = Math.max(0, Math.min(3, electionTracker.failedElections));
  const liberalPolicySrc = useOptimizedAsset(
    "boards/board-policy-liberal.png",
    assetSrc(policyLiberalImg),
  );
  const fascistPolicySrc = useOptimizedAsset(
    "boards/board-policy-fascist.png",
    assetSrc(policyFascistImg),
  );
  const trackerSrc = useOptimizedAsset("boards/board-tracker.png", assetSrc(trackerMarkerImg));

  return (
    <div className={["mx-auto w-full max-w-6xl", className].filter(Boolean).join(" ")}>
      <div className="grid items-center gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <BoardPanel
          title="Liberal Board"
          imageSrc={boardLiberalImg}
          imageAlt="Liberal policy board"
          accentClass="text-liberal"
        >
          <PolicySlots
            count={board.liberalPolicies}
            slots={LIBERAL_LAYOUT.policySlots}
            imageSrc={liberalPolicySrc}
            altPrefix="Liberal policy"
          />
          <TrackerSlots
            count={failedElections}
            slots={LIBERAL_LAYOUT.trackerSlots}
            imageSrc={trackerSrc}
            altPrefix="Failed election marker"
          />
        </BoardPanel>

        <BoardPanel
          title="Fascist Board"
          imageSrc={fascistBoard.src}
          imageAlt="Fascist policy board"
          accentClass="text-fascist"
        >
          <PolicySlots
            count={board.fascistPolicies}
            slots={fascistBoard.layout.policySlots}
            imageSrc={fascistPolicySrc}
            altPrefix="Fascist policy"
          />
          {fascistBoard.layout.policySlots.map((slot, index) => {
            const power = executivePowers[index + 1];
            if (!power || power === ExecutivePower.None || index < board.fascistPolicies) {
              return null;
            }

            return (
              <span
                key={`power-${index}`}
                className="absolute rounded-full bg-black/52 px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-[0.18em] text-text-secondary"
                style={{
                  left: `${(slot.x + slot.width / 2) * 100}%`,
                  top: `${(slot.y + slot.height / 2) * 100 + 18.2}%`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                {EXECUTIVE_POWER_ICONS[power]}
              </span>
            );
          })}
          {vetoUnlocked && fascistBoard.layout.policySlots[4] && (
            <span
              className="absolute rounded-full border border-gold/30 bg-black/62 px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.2em] text-gold"
              style={{
                left: `${(fascistBoard.layout.policySlots[4].x + fascistBoard.layout.policySlots[4].width / 2) * 100}%`,
                top: `${(fascistBoard.layout.policySlots[4].y + fascistBoard.layout.policySlots[4].height / 2) * 100 - 18.8}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              Veto
            </span>
          )}
        </BoardPanel>
      </div>
    </div>
  );
}
