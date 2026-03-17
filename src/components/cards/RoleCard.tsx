/**
 * RoleCard — Displays a player's secret role card with dramatic reveal.
 *
 * Supports all three roles: liberal, fascist, and hitler.
 * Uses indexed role card assets for variety among liberals and fascists.
 */

import roleHitlerImg from "@assets/roles/role-hitler.png";
import roleFascist1Img from "@assets/roles/role-fascist-1.png";
import roleFascist2Img from "@assets/roles/role-fascist-2.png";
import roleFascist3Img from "@assets/roles/role-fascist-3.png";
import roleLiberal1Img from "@assets/roles/role-liberal-1.png";
import roleLiberal2Img from "@assets/roles/role-liberal-2.png";
import roleLiberal3Img from "@assets/roles/role-liberal-3.png";
import roleLiberal4Img from "@assets/roles/role-liberal-4.png";
import roleLiberal5Img from "@assets/roles/role-liberal-5.png";
import roleLiberal6Img from "@assets/roles/role-liberal-6.png";
import { useOptimizedAsset } from "@components/game/OptimizedAssets";

const LIBERAL_CARDS = [
  roleLiberal1Img,
  roleLiberal2Img,
  roleLiberal3Img,
  roleLiberal4Img,
  roleLiberal5Img,
  roleLiberal6Img,
];

const FASCIST_CARDS = [roleFascist1Img, roleFascist2Img, roleFascist3Img];

interface RoleCardProps {
  role: "liberal" | "fascist" | "hitler";
  /** Index to pick a specific variant (1-based). Random if omitted. */
  variantIndex?: number;
  className?: string;
}

function getRoleImage(
  role: "liberal" | "fascist" | "hitler",
  assetMap: Record<string, string>,
  variantIndex?: number,
): { src: string; alt: string } {
  if (role === "hitler") {
    return {
      src: assetMap["roles/role-hitler.png"] ?? roleHitlerImg.src,
      alt: "Secret Role: Hitler",
    };
  }

  const pool = role === "fascist" ? FASCIST_CARDS : LIBERAL_CARDS;
  const poolKeys = role === "fascist"
    ? [
        "roles/role-fascist-1.png",
        "roles/role-fascist-2.png",
        "roles/role-fascist-3.png",
      ]
    : [
        "roles/role-liberal-1.png",
        "roles/role-liberal-2.png",
        "roles/role-liberal-3.png",
        "roles/role-liberal-4.png",
        "roles/role-liberal-5.png",
        "roles/role-liberal-6.png",
      ];

  // Determine index: use provided (1-based), fall back to a stable random pick
  let idx: number;
  if (variantIndex !== undefined) {
    idx = (((variantIndex - 1) % pool.length) + pool.length) % pool.length;
  } else {
    idx = Math.floor(Math.random() * pool.length);
  }

  return {
    src: assetMap[poolKeys[idx]] ?? pool[idx].src,
    alt: `Secret Role: ${role}`,
  };
}

export function RoleCard({ role, variantIndex, className = "" }: RoleCardProps) {
  const assetMap = {
    "roles/role-hitler.png": useOptimizedAsset("roles/role-hitler.png", roleHitlerImg.src),
    "roles/role-fascist-1.png": useOptimizedAsset("roles/role-fascist-1.png", roleFascist1Img.src),
    "roles/role-fascist-2.png": useOptimizedAsset("roles/role-fascist-2.png", roleFascist2Img.src),
    "roles/role-fascist-3.png": useOptimizedAsset("roles/role-fascist-3.png", roleFascist3Img.src),
    "roles/role-liberal-1.png": useOptimizedAsset("roles/role-liberal-1.png", roleLiberal1Img.src),
    "roles/role-liberal-2.png": useOptimizedAsset("roles/role-liberal-2.png", roleLiberal2Img.src),
    "roles/role-liberal-3.png": useOptimizedAsset("roles/role-liberal-3.png", roleLiberal3Img.src),
    "roles/role-liberal-4.png": useOptimizedAsset("roles/role-liberal-4.png", roleLiberal4Img.src),
    "roles/role-liberal-5.png": useOptimizedAsset("roles/role-liberal-5.png", roleLiberal5Img.src),
    "roles/role-liberal-6.png": useOptimizedAsset("roles/role-liberal-6.png", roleLiberal6Img.src),
  };
  const { src, alt } = getRoleImage(role, assetMap, variantIndex);

  const glowClass =
    role === "liberal"
      ? "shadow-[0_0_30px_rgba(90,155,166,0.5)]"
      : "shadow-[0_0_30px_rgba(224,91,43,0.5)]";

  return (
    <div
      className={[
        "relative w-[220px] rounded-[var(--radius-card)] overflow-hidden",
        "scale-pop",
        glowClass,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <img src={src} alt={alt} className="w-full h-auto block select-none" draggable={false} />
    </div>
  );
}
