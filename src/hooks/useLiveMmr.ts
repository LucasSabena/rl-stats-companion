import { useEffect, useMemo, useCallback, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { listen } from "@tauri-apps/api/event";
import { fetchLiveMmrSnapshot, setSessionMmrSnapshot } from "@/lib/api";
import { useLiveStore } from "@/stores/liveStore";
import type { LiveMmrSnapshot } from "@/lib/types";

export function useLiveMmr() {
  const currentMatch = useLiveStore((state) => state.currentMatch);
  const matchGuid = currentMatch?.matchGuid ?? "no-match";

  const playerIds = useMemo(() => {
    return (currentMatch?.players ?? []).map((player) => player.id).sort();
  }, [currentMatch?.players]);

  const query = useQuery<LiveMmrSnapshot, Error>({
    queryKey: ["live-mmr", matchGuid, playerIds],
    queryFn: () => fetchLiveMmrSnapshot(false),
    enabled:
      Boolean(currentMatch?.players.length) &&
      currentMatch?.matchType === "online" &&
      playerIds.length > 1,
    staleTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (query.data) {
      const mmrMap: Record<string, number | null> = {};
      for (const player of query.data.players) {
        mmrMap[player.primaryId] = player.mmr;
      }
      void setSessionMmrSnapshot(mmrMap).catch(() => {});
    }
  }, [query.data]);

  const prevMatchGuidRef = useRef(matchGuid);

  useEffect(() => {
    let disposed = false;

    const attach = async () => {
      const unlisten = await listen("match-started", () => {
        void query.refetch();
      });

      if (disposed) {
        unlisten();
      }

      return unlisten;
    };

    const unlistenPromise = attach();

    return () => {
      disposed = true;
      void unlistenPromise.then((unlisten) => unlisten());
    };
  }, [query]);

  useEffect(() => {
    if (matchGuid !== prevMatchGuidRef.current) {
      prevMatchGuidRef.current = matchGuid;
      void query.refetch();
    }
  }, [matchGuid, query]);

  const forceRefresh = useCallback(() => {
    void query.refetch({ cancelRefetch: true });
  }, [query]);

  return { ...query, forceRefresh };
}
