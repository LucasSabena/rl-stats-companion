import type { MatchSummary } from "@/lib/types";
import { MatchCard } from "./MatchCard";

interface MatchListProps {
  matches: MatchSummary[];
  onSelectMatch?: (matchId: number) => void;
  onEditMatch?: (match: MatchSummary) => void;
  onDeleteMatch?: (matchId: number) => void;
}

export function MatchList({ matches, onSelectMatch, onEditMatch, onDeleteMatch }: MatchListProps) {
  if (matches.length === 0) return null;

  return (
    <div className="space-y-3">
      {matches.map((match) => (
        <MatchCard
          key={match.id}
          match={match}
          onClick={onSelectMatch ? () => onSelectMatch(match.id) : undefined}
          onEdit={onEditMatch}
          onDelete={onDeleteMatch}
        />
      ))}
    </div>
  );
}
