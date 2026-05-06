import { memo } from "react";
import { cn } from "@/lib/utils";
import { MonitorOff } from "lucide-react";
import type { ConnectionStatus as ConnStatus } from "@/lib/types";
import { useTranslation } from "react-i18next";

interface ConnectionStatusProps {
  status: ConnStatus;
}

const statusKeyMap: Record<ConnStatus, string> = {
  connected: "live:connectionStatus.connected",
  connecting: "live:connectionStatus.connecting",
  disconnected: "live:connectionStatus.disconnected",
  game_not_running: "live:connectionStatus.gameNotRunning",
};

const dotClasses: Record<ConnStatus, string> = {
  connected: "bg-accent-success shadow-[0_0_6px_var(--color-accent-success)]",
  connecting: "bg-accent-warning animate-pulse",
  disconnected: "bg-accent-danger",
  game_not_running: "bg-accent-warning",
};

const wrapperClasses: Record<ConnStatus, string> = {
  connected: "bg-accent-success-subtle border-accent-success/20",
  connecting: "bg-accent-warning-subtle border-accent-warning/20",
  disconnected: "bg-accent-danger-subtle border-accent-danger/20",
  game_not_running: "bg-accent-warning-subtle border-accent-warning/20",
};

export const ConnectionStatus = memo(function ConnectionStatus({ status }: ConnectionStatusProps) {
  const { t } = useTranslation(["live", "common"]);
  const label = t(statusKeyMap[status]);
  const dotClass = dotClasses[status];
  const wrapperClass = wrapperClasses[status];

  if (status === "game_not_running") {
    return (
      <div className={cn("flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs", wrapperClass)}>
        <MonitorOff className="h-3.5 w-3.5 text-accent-warning" />
        <span className="text-accent-warning font-medium">{label}</span>
      </div>
    );
  }

  return (
      <div className={cn("flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs", wrapperClass)}>
        <span className={cn("h-1.5 w-1.5 rounded-full", dotClass)} />
      <span className="text-text-secondary font-medium">{label}</span>
    </div>
  );
});
