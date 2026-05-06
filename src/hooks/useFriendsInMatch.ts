import { useMemo } from "react";
import type { FriendRecord, PlayerStats, SessionMatchPlayer } from "@/lib/types";

export function useFriendsInMatch(
  friends: FriendRecord[] | undefined,
  players: PlayerStats[] | SessionMatchPlayer[] | undefined
) {
  return useMemo(() => {
    if (!friends || !players) return [];
    const friendSet = new Set(friends.map((f) => f.primary_id));
    return players
      .filter((p) => friendSet.has("id" in p ? p.id : p.primary_id))
      .map((p) => p.name);
  }, [friends, players]);
}

export function useFriendsInSession(
  friends: FriendRecord[] | undefined,
  sessionPlayers: SessionMatchPlayer[][] | undefined
) {
  return useMemo(() => {
    if (!friends || !sessionPlayers) return [];
    const friendSet = new Set(friends.map((f) => f.primary_id));
    const seen = new Set<string>();
    for (const matchPlayers of sessionPlayers) {
      for (const p of matchPlayers) {
        if (friendSet.has(p.primary_id)) seen.add(p.name);
      }
    }
    return Array.from(seen);
  }, [friends, sessionPlayers]);
}
