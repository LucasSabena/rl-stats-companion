import { memo } from "react";
import { Card } from "@/components/ui/Card";
import { Flame } from "lucide-react";

interface StreakCardProps {
  bestStreak: number;
  currentStreak: number;
}

export const StreakCard = memo(function StreakCard({ bestStreak, currentStreak }: StreakCardProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Card className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-warning/20 text-accent-warning">
          <Flame size={24} />
        </div>
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-text-tertiary">Racha actual</p>
          <p className="font-mono text-2xl font-bold text-text-primary">{currentStreak}</p>
        </div>
      </Card>

      <Card className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-purple/20 text-accent-purple">
          <Flame size={24} />
        </div>
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-text-tertiary">Mejor racha</p>
          <p className="font-mono text-2xl font-bold text-text-primary">{bestStreak}</p>
        </div>
      </Card>
    </div>
  );
});
