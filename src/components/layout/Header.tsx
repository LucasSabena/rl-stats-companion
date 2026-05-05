import { useLocation } from "react-router-dom";
import { useLiveStore } from "@/stores/liveStore";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Radio, Sparkles } from "lucide-react";

const pageTitles: Record<string, string> = {
  "/": "Live Dashboard",
  "/history": "Historial de Partidas",
  "/analytics": "Análisis de Rendimiento",
  "/pro-configs": "Configuraciones Pro",
  "/settings": "Ajustes",
};

export function Header() {
  const location = useLocation();
  const connectionStatus = useLiveStore((state) => state.connectionStatus);
  const currentMatch = useLiveStore((state) => state.currentMatch);

  const isLive = connectionStatus === "connected" && currentMatch !== null;
  const title = pageTitles[location.pathname] || "RL Stats";

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border-highlight/50 surface-glass px-8 z-20 sticky top-0">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-accent-primary opacity-80" />
          <h1 className="font-display text-lg font-bold tracking-tight text-text-primary text-shadow-sm">
            {title}
          </h1>
        </div>
        
        <div className="h-4 w-[1px] bg-border-highlight/50 mx-2" />
        
        {isLive ? (
          <Badge variant="live">
            En directo
          </Badge>
        ) : (
          <Badge variant="default" className="opacity-80">
            <Radio size={10} className="mr-1.5" />
            Esperando a Rocket League...
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Connection status indicator dot */}
        <div className="flex items-center gap-2 mr-4 bg-bg-panel/50 px-3 py-1.5 rounded-full border border-border-subtle shadow-[var(--shadow-card-inner)]">
          <div className={cn(
            "h-2 w-2 rounded-full",
            connectionStatus === "connected" ? "bg-accent-success shadow-[0_0_8px_rgba(16,185,129,0.6)]" : 
            connectionStatus === "connecting" ? "bg-accent-warning animate-pulse" : 
            "bg-accent-danger"
          )} />
          <span className="text-[10px] font-mono text-text-secondary uppercase tracking-widest">
            {connectionStatus === "connected" ? "Online" : connectionStatus === "connecting" ? "Connecting" : "Offline"}
          </span>
        </div>
</div>
    </header>
  );
}
