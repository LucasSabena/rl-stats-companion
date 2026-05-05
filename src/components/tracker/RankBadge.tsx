import type { RankInfo } from "@/lib/types";

const RANK_COLORS: Record<string, string> = {
  Unranked: "bg-bg-panel text-text-tertiary",
  Bronze: "bg-amber-900/30 text-amber-400",
  Silver: "bg-gray-400/20 text-gray-300",
  Gold: "bg-yellow-500/20 text-yellow-400",
  Platinum: "bg-cyan-500/20 text-cyan-400",
  Diamond: "bg-team-blue-bg text-team-blue",
  Champion: "bg-accent-purple-subtle text-accent-purple",
  "Grand Champion": "bg-accent-danger-subtle text-accent-danger",
  SSL: "bg-accent-secondary-subtle text-accent-secondary",
};

const RANK_BORDER: Record<string, string> = {
  Unranked: "border-border-subtle",
  Bronze: "border-amber-900/50",
  Silver: "border-gray-400/40",
  Gold: "border-yellow-500/50",
  Platinum: "border-cyan-500/50",
  Diamond: "border-team-blue/40",
  Champion: "border-accent-purple/40",
  "Grand Champion": "border-accent-danger/40",
  SSL: "border-accent-secondary/50",
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
    <div className={`inline-flex items-center gap-1.5 rounded-lg border ${borderColor} ${tierColor} ${sizeClasses}`}>
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
