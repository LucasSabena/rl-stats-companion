import { useEffect, useState } from "react";
import { getConnectionStatus } from "@/lib/api";
import type { ConnectionStatus } from "@/lib/types";

export function useConnection() {
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");

  useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    async function pollStatus() {
      try {
        const s = await getConnectionStatus();
        if (!cancelled) setStatus(s);
      } catch {
        if (!cancelled) setStatus("disconnected");
      } finally {
        if (!cancelled) {
          timeoutId = setTimeout(() => {
            void pollStatus();
          }, 5000);
        }
      }
    }

    void pollStatus();

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  return status;
}
