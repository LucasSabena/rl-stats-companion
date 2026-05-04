import { useQuery } from "@tanstack/react-query";
import { getAnalytics, getDailyRollups, getSessions, getSessionMatches, getInsights } from "@/lib/api";
import type { AnalyticsData, AnalyticsPeriod, DailyRollup, MatchSession, InsightsData } from "@/lib/types";
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

export function useSessionMatches(startTime?: string, endTime?: string) {
  return useQuery({
    queryKey: ["sessionMatches", startTime, endTime],
    queryFn: () => getSessionMatches(startTime!, endTime!),
    enabled: !!startTime && !!endTime,
    staleTime: QUERY_STALE_TIME.analytics,
  });
}

export function useInsights(period: AnalyticsPeriod) {
  return useQuery<InsightsData>({
    queryKey: ["insights", period],
    queryFn: () => getInsights(period),
    staleTime: QUERY_STALE_TIME.analytics,
  });
}
