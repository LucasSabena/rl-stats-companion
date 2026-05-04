import { useQuery } from "@tanstack/react-query";
import { getAnalytics, getDailyRollups, getSessions } from "@/lib/api";
import type { AnalyticsData, AnalyticsPeriod, DailyRollup, MatchSession } from "@/lib/types";
import { QUERY_STALE_TIME } from "@/lib/constants";

interface AnalyticsResult {
  data: AnalyticsData;
  rollups: DailyRollup[];
  sessions: MatchSession[];
}

export function useAnalytics(period: AnalyticsPeriod) {
  return useQuery<AnalyticsResult>({
    queryKey: ["analytics", period],
    queryFn: async () => {
      const result = await getAnalytics(period);
      return {
        data: result.data,
        rollups: result.rollups ?? [],
        sessions: result.sessions ?? [],
      };
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
