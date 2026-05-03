import { useQuery } from "@tanstack/react-query";
import { getAnalytics, getDailyRollups, getSessions } from "@/lib/api";
import type { AnalyticsData, AnalyticsPeriod, MatchSession } from "@/lib/types";
import { QUERY_STALE_TIME } from "@/lib/constants";

export function useAnalytics(period: AnalyticsPeriod) {
  return useQuery({
    queryKey: ["analytics", period],
    queryFn: async () => {
      const raw = await getAnalytics(period);

      if (period === "session") {
        const response = raw as { sessions: MatchSession[]; summary: AnalyticsData };
        return {
          ...response.summary,
          period: "session" as const,
        } as AnalyticsData;
      }

      return raw as AnalyticsData;
    },
    staleTime: QUERY_STALE_TIME.analytics,
  });
}

export function useSessions(gapMinutes?: number) {
  return useQuery({
    queryKey: ["sessions", gapMinutes],
    queryFn: () => getSessions(gapMinutes),
    staleTime: QUERY_STALE_TIME.analytics,
  });
}

export function useDailyRollups(period: AnalyticsPeriod) {
  return useQuery({
    queryKey: ["rollups", period],
    queryFn: () => getDailyRollups(period),
    staleTime: QUERY_STALE_TIME.analytics,
    enabled: period !== "session",
  });
}