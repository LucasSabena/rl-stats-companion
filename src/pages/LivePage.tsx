import { useLiveMatch } from "@/hooks/useLiveMatch";
import { LiveDashboard } from "@/components/live/LiveDashboard";
import { PageContainer } from "@/components/layout/PageContainer";

export function LivePage() {
  useLiveMatch();

  return (
    <PageContainer>
      <h2 className="text-2xl font-bold text-text-primary">Partida en directo</h2>
      <LiveDashboard />
    </PageContainer>
  );
}
