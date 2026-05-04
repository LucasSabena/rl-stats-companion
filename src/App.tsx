import { lazy, Suspense, useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { AppShell } from "@/components/layout/AppShell";
import { useSettingsStore } from "@/stores/settingsStore";

const OverlayView = lazy(() => import("@/components/overlay/OverlayView").then((module) => ({ default: module.OverlayView })));
const LivePage = lazy(() => import("@/pages/LivePage").then((module) => ({ default: module.LivePage })));
const HistoryPage = lazy(() => import("@/pages/HistoryPage").then((module) => ({ default: module.HistoryPage })));
const MatchDetailPage = lazy(() => import("@/pages/MatchDetailPage").then((module) => ({ default: module.MatchDetailPage })));
const AnalyticsPage = lazy(() => import("@/pages/AnalyticsPage").then((module) => ({ default: module.AnalyticsPage })));
const SettingsPage = lazy(() => import("@/pages/SettingsPage").then((module) => ({ default: module.SettingsPage })));
const ProfilePage = lazy(() => import("@/pages/ProfilePage").then((module) => ({ default: module.ProfilePage })));
const ProConfigsPage = lazy(() => import("@/pages/ProConfigsPage").then((module) => ({ default: module.ProConfigsPage })));
const OnboardingOverlay = lazy(() => import("@/components/onboarding/OnboardingOverlay"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

function AppFallback() {
  return <div className="min-h-screen bg-bg-primary" />;
}

function AppContent() {
  const hasCompletedOnboarding = useSettingsStore((s) => s.hasCompletedOnboarding);
  const completeOnboarding = useSettingsStore((s) => s.completeOnboarding);
  const [isOverlayWindow, setIsOverlayWindow] = useState(false);
  const [detecting, setDetecting] = useState(true);

  useEffect(() => {
    try {
      const win = getCurrentWindow();
      if (win.label === "overlay") {
        setIsOverlayWindow(true);
      }
    } catch {
      // Running outside Tauri (dev mode in browser) — not an overlay window
    }
    setDetecting(false);
  }, []);

  // Show nothing while detecting window type to avoid flash
  if (detecting) return null;

  // Overlay window: render only the overlay widget (no sidebar, no routing)
  if (isOverlayWindow) {
    return (
      <Suspense fallback={<AppFallback />}>
        <OverlayView />
      </Suspense>
    );
  }

  return (
    <>
      <Suspense fallback={<AppFallback />}>
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
      </Suspense>

      {!hasCompletedOnboarding && (
        <Suspense fallback={null}>
          <OnboardingOverlay onComplete={completeOnboarding} />
        </Suspense>
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
