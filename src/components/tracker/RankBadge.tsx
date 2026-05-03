import type { RankInfo } from "@/lib/types";

const RANK_COLORS: Record<string, string> = {
  Unranked: "bg-surface-elevated text-text-tertiary",
  Bronze: "bg-amber-900/30 text-amber-400",
  Silver: "bg-gray-400/20 text-gray-300",
  Gold: "bg-yellow-500/20 text-yellow-400",
  Platinum: "bg-cyan-500/20 text-cyan-400",
  Diamond: "bg-blue-500/20 text-blue-400",
  Champion: "bg-purple-500/20 text-purple-300",
  "Grand Champion": "bg-red-600/20 text-red-400",
  SSL: "bg-pink-500/20 text-pink-300",
};

const RANK_BORDER: Record<string, string> = {
  Unranked: "border-surface-elevated",
  Bronze: "border-amber-900/50",
  Silver: "border-gray-400/40",
  Gold: "border-yellow-500/50",
  Platinum: "border-cyan-500/50",
  Diamond: "border-blue-500/50",
  Champion: "border-purple-500/50",
  "Grand Champion": "border-red-600/40",
  SSL: "border-pink-500/50",
};

function getRankTierColor(tierName: string): string {
  for (const [key, value] of Object.entries(RANK_COLORS)) {
    if (tierName.includes(key)) return value;
  }
  return RANK_COLORS.Unranked;
}

function getRankBorder(tierName: string): string {
  for (const [key, value] of Object.entries(RANK_BORDER)) {
    if (tierName.includes(key)) return value;
  }
  return RANK_BORDER.Unranked;
}

interface RankBadgeProps {
  rank: RankInfo | null;
  mmr?: number | null;
  size?: "sm" | "md" | "lg";
}

export function RankBadge({ rank, mmr, size = "md" }: RankBadgeProps) {
  if (!rank) {
    return (
      <span className="text-sm text-text-tertiary italic">Sin datos</span>
    );
  }

  const { tier, division } = rank;
  const tierColor = getRankTierColor(tier.name);
  const borderColor = getRankBorder(tier.name);

  const sizeClasses = size === "sm"
    ? "px-1.5 py-0.5 text-xs"
    : size === "lg"
      ? "px-3 py-1.5 text-sm"
      : "px-2 py-1 text-xs";

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-md border ${borderColor} ${tierColor} ${sizeClasses}`}>
      <span className="font-semibold">{tier.name}</span>
      {division.index > 0 && (
        <span className="opacity-75">Div {division.index}</span>
      )}
      {mmr != null && (
        <span className="ml-1 text-text-tertiary">{mmr}</span>
      )}
    </div>
  );
}
