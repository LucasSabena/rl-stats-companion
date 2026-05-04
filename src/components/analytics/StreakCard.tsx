import { memo } from "react";
import { Card } from "@/components/ui/Card";
import { Flame, Trophy } from "lucide-react";

interface StreakCardProps {
  bestStreak: number;
  currentStreak: number;
}

export const StreakCard = memo(function StreakCard({ bestStreak, currentStreak }: StreakCardProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Card className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-warning-subtle text-accent-warning">
          <Flame size={24} />
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">Racha actual</p>
          <p className="mt-0.5 font-mono text-2xl font-bold tracking-tight text-text-primary">{currentStreak}</p>
        </div>
      </Card>

      <Card className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-purple-subtle text-accent-purple">
          <Trophy size={24} />
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">Mejor racha</p>
          <p className="mt-0.5 font-mono text-2xl font-bold tracking-tight text-text-primary">{bestStreak}</p>
        </div>
      </Card>
    </div>
  );
});
