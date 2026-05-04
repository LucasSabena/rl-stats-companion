import { useNavigate } from "react-router-dom";
import { useLiveStore } from "@/stores/liveStore";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Radio, Settings } from "lucide-react";

export function Header() {
  const navigate = useNavigate();
  const connectionStatus = useLiveStore((state) => state.connectionStatus);
  const currentMatch = useLiveStore((state) => state.currentMatch);

  const isLive = connectionStatus === "connected" && currentMatch !== null;

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border-subtle bg-bg-primary/80 px-6 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <h1 className="font-display text-base font-bold tracking-tight text-text-primary">
          RL Stats Companion
        </h1>
        {isLive ? (
          <Badge variant="live">
            <span className="relative mr-1.5 flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-success opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent-success" />
            </span>
            En directo
          </Badge>
        ) : (
          <Badge variant="default">
            <Radio size={10} className="mr-1" />
            Esperando
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => navigate("/settings")}
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition-all duration-200",
            "hover:bg-surface-hover hover:text-text-primary"
          )}
          aria-label="Ajustes"
        >
          <Settings size={18} />
        </button>
      </div>
    </header>
  );
}
