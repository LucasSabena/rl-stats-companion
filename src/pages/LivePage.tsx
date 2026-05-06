import { useLiveMatch } from "@/hooks/useLiveMatch";
import { LiveDashboard } from "@/components/live/LiveDashboard";
import { PageContainer } from "@/components/layout/PageContainer";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { useTranslation } from "react-i18next";

export function LivePage() {
  useLiveMatch();
  const { t } = useTranslation(["live", "common"]);

  return (
    <PageContainer className="space-y-3">
      <h2 className="text-lg font-bold text-text-primary">{t("live:page.title")}</h2>
      <ErrorBoundary>
        <LiveDashboard />
      </ErrorBoundary>
    </PageContainer>
  );
}
