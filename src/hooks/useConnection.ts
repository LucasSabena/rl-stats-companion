import { useEffect, useState } from "react";
import { getConnectionStatus } from "@/lib/api";
import type { ConnectionStatus } from "@/lib/types";

export function useConnection() {
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");

  useEffect(() => {
    let cancelled = false;

    async function fetchStatus() {
      try {
        const s = await getConnectionStatus();
        if (!cancelled) setStatus(s);
      } catch {
        if (!cancelled) setStatus("disconnected");
      }
    }

    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return status;
}
