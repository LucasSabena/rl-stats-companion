import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { OverlayView } from "@/components/overlay/OverlayView";
import { LivePage } from "@/pages/LivePage";
import { HistoryPage } from "@/pages/HistoryPage";
import { MatchDetailPage } from "@/pages/MatchDetailPage";
import { AnalyticsPage } from "@/pages/AnalyticsPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { ProConfigsPage } from "@/pages/ProConfigsPage";
import OnboardingOverlay from "@/components/onboarding/OnboardingOverlay";
import { useSettingsStore } from "@/stores/settingsStore";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  const hasCompletedOnboarding = useSettingsStore((s) => s.hasCompletedOnboarding);
  const completeOnboarding = useSettingsStore((s) => s.completeOnboarding);
  const overlayMode = useSettingsStore((s) => s.overlayMode);

  // In overlay mode, render only the overlay widget (no sidebar, no header, no routing)
  if (overlayMode) {
    return (
      <>
        <OverlayView />
        {!hasCompletedOnboarding && (
          <OnboardingOverlay onComplete={completeOnboarding} />
        )}
      </>
    );
  }

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell><Outlet /></AppShell>}>
            <Route path="/" element={<LivePage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/history/:matchId" element={<MatchDetailPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/pro-configs" element={<ProConfigsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>

      {!hasCompletedOnboarding && (
        <OnboardingOverlay onComplete={completeOnboarding} />
      )}
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;
