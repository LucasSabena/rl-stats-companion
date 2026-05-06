import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addFriend, getFriends, removeFriend } from "@/lib/api";

const FRIENDS_KEY = "friends";

export function useFriends() {
  return useQuery({
    queryKey: [FRIENDS_KEY],
    queryFn: getFriends,
  });
}

export function useAddFriend() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ playerId, tag }: { playerId: number; tag?: string }) => addFriend(playerId, tag),
    onSuccess: () => qc.invalidateQueries({ queryKey: [FRIENDS_KEY] }),
  });
}

export function useRemoveFriend() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (playerId: number) => removeFriend(playerId),
    onSuccess: () => qc.invalidateQueries({ queryKey: [FRIENDS_KEY] }),
  });
}
