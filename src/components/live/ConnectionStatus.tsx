import { memo } from "react";
import { cn } from "@/lib/utils";
import { MonitorOff } from "lucide-react";
import type { ConnectionStatus as ConnStatus } from "@/lib/types";

interface ConnectionStatusProps {
  status: ConnStatus;
}

export const ConnectionStatus = memo(function ConnectionStatus({ status }: ConnectionStatusProps) {
  const config: Record<ConnStatus, { label: string; dotClass: string; wrapperClass: string }> = {
    connected: {
      label: "Conectado",
      dotClass: "bg-accent-success shadow-[0_0_6px_var(--color-accent-success)]",
      wrapperClass: "bg-accent-success-subtle border-accent-success/20",
    },
    connecting: {
      label: "Conectando...",
      dotClass: "bg-accent-warning animate-pulse",
      wrapperClass: "bg-accent-warning-subtle border-accent-warning/20",
    },
    disconnected: {
      label: "Desconectado",
      dotClass: "bg-accent-danger",
      wrapperClass: "bg-accent-danger-subtle border-accent-danger/20",
    },
    game_not_running: {
      label: "Juego cerrado",
      dotClass: "bg-accent-warning",
      wrapperClass: "bg-accent-warning-subtle border-accent-warning/20",
    },
  };

  const { label, dotClass, wrapperClass } = config[status];

  if (status === "game_not_running") {
    return (
      <div className={cn("flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm", wrapperClass)}>
        <MonitorOff className="h-3.5 w-3.5 text-accent-warning" />
        <span className="text-accent-warning font-medium">{label}</span>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm", wrapperClass)}>
      <span className={cn("h-2 w-2 rounded-full", dotClass)} />
      <span className="text-text-secondary font-medium">{label}</span>
    </div>
  );
});
