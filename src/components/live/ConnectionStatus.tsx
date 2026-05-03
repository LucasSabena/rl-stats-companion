import { memo } from "react";
import { cn } from "@/lib/utils";
import { MonitorOff } from "lucide-react";
import type { ConnectionStatus as ConnStatus } from "@/lib/types";

interface ConnectionStatusProps {
  status: ConnStatus;
}

export const ConnectionStatus = memo(function ConnectionStatus({ status }: ConnectionStatusProps) {
  const config: Record<ConnStatus, { label: string; color: string }> = {
    connected: { label: "Conectado", color: "bg-accent-secondary" },
    connecting: { label: "Conectando...", color: "bg-accent-warning" },
    disconnected: { label: "Desconectado", color: "bg-accent-danger" },
    game_not_running: { label: "Juego cerrado", color: "bg-amber-500" },
  };

  const { label, color } = config[status];

  if (status === "game_not_running") {
    return (
      <div className="flex items-center gap-2 rounded-md bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 text-sm">
        <MonitorOff className="h-3.5 w-3.5 text-amber-400" />
        <span className="text-amber-400">{label}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-md bg-bg-secondary px-3 py-1.5 text-sm">
      <span className={cn("h-2 w-2 rounded-full", color, status === "connecting" && "animate-pulse")} />
      <span className="text-text-secondary">{label}</span>
    </div>
  );
});
