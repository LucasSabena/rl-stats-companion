import { memo } from "react";
import { cn } from "@/lib/utils";
import { formatDuration } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Goal, Zap, UserCheck } from "lucide-react";
import type { Goal as GoalType } from "@/lib/types";

interface GoalDetailProps {
  goals: GoalType[];
}

export const GoalDetail = memo(function GoalDetail({ goals }: GoalDetailProps) {
  if (goals.length === 0) return null;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-primary">Goles ({goals.length})</h3>
      </div>
      <div className="space-y-2">
        {goals.map((goal) => {
          const isBlue = goal.scorerTeam === 0;
          return (
            <Card
              key={goal.id}
              className="flex items-center gap-3 border-l-4 p-3"
              // Tailwind doesn't support dynamic border colors via arbitrary values easily with our setup,
              // so we use inline class mapping below
            >
              <div
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                  isBlue
                    ? "bg-team-blue/15 text-team-blue"
                    : "bg-team-orange/15 text-team-orange"
                )}
              >
                <Goal size={16} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-text-primary">
                    {goal.scorerName}
                  </span>
                  <Badge
                    variant="default"
                    className={cn(
                      isBlue
                        ? "bg-blue-500/10 text-blue-400"
                        : "bg-orange-500/10 text-orange-400"
                    )}
                  >
                    {isBlue ? "Azul" : "Naranja"}
                  </Badge>
                </div>
                {goal.assisterName && (
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-text-secondary">
                    <UserCheck size={12} className="text-text-tertiary" />
                    Asistencia: <span className="font-medium text-text-primary">{goal.assisterName}</span>
                  </p>
                )}
              </div>

              <div className="text-right">
                <p className="font-mono text-xs font-medium text-text-secondary">
                  {formatDuration(goal.time)}
                </p>
                <p className="mt-0.5 flex items-center justify-end gap-1 text-[10px] text-text-tertiary">
                  <Zap size={10} />
                  {Math.round(goal.ballSpeed)} uu/s
                </p>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
});
