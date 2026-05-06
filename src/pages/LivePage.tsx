import { useState, useMemo } from "react";
import { useLiveMatch } from "@/hooks/useLiveMatch";
import { LiveDashboard } from "@/components/live/LiveDashboard";
import { PageContainer } from "@/components/layout/PageContainer";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { Button } from "@/components/ui/Button";
import { ShareModal } from "@/components/share/ShareModal";
import { useFriends } from "@/hooks/useFriends";
import { useLiveStore } from "@/stores/liveStore";
import { useTranslation } from "react-i18next";
import { Share2 } from "lucide-react";
import type { ShareContext } from "@/lib/types";

function buildPlaceholderMatchContext(lastMatch: {
  match_guid: string;
  score_blue: number;
  score_orange: number;
  winner: number | null;
  players: { name: string; team_num: number; stats: Record<string, unknown> }[];
}, friends: string[]): ShareContext | null {
  if (!lastMatch) return null;
  const isWin = lastMatch.winner === 0; // Assume local team is 0 for approximation
  const title = isWin ? "Victoria" : "Derrota";
  const myPlayer = lastMatch.players.find((p) => p.team_num === 0) || lastMatch.players[0];
  const goals = (myPlayer?.stats?.goals as number) ?? 0;
  const assists = (myPlayer?.stats?.assists as number) ?? 0;
  const saves = (myPlayer?.stats?.saves as number) ?? 0;
  const shots = (myPlayer?.stats?.shots as number) ?? 0;
  const score = (myPlayer?.stats?.score as number) ?? 0;
  const demos = (myPlayer?.stats?.demos as number) ?? 0;

  return {
    type: "match",
    title,
    stats: [
      { label: "Goles", value: String(goals), highlight: true },
      { label: "Asistencias", value: String(assists) },
      { label: "Saves", value: String(saves) },
      { label: "Shots", value: String(shots) },
      { label: "Score", value: String(score), highlight: true },
      { label: "Demos", value: String(demos) },
    ],
    friendsPresent: friends,
    teamScore: lastMatch.score_blue,
    opponentScore: lastMatch.score_orange,
    win: isWin,
    dateLabel: new Date().toLocaleDateString("es-AR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  };
}

export function LivePage() {
  useLiveMatch();
  const { t } = useTranslation(["live", "common"]);

  const [shareOpen, setShareOpen] = useState(false);
  const { data: friends, isLoading: friendsLoading } = useFriends();
  const lastMatchSummary = useLiveStore((s) => s.lastMatchSummary);

  const friendsPresent = useMemo(() => friends?.map((f) => f.name) ?? [], [friends]);

  const shareContext = useMemo(() => {
    if (!lastMatchSummary) return null;
    return buildPlaceholderMatchContext(lastMatchSummary, friendsPresent);
  }, [lastMatchSummary, friendsPresent]);

  return (
    <PageContainer className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-text-primary">{t("live:page.title")}</h2>
        {lastMatchSummary && (
          <Button
            variant="ghost"
            size="sm"
            leftIcon={Share2}
            onClick={() => setShareOpen(true)}
            disabled={friendsLoading}
          >
            {t("common:buttons.share", { defaultValue: "Compartir" })}
          </Button>
        )}
      </div>
      <ErrorBoundary>
        <LiveDashboard />
      </ErrorBoundary>

      <ShareModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        context={shareContext}
      />
    </PageContainer>
  );
}
