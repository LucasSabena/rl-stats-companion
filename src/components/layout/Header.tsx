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
    <header className="flex h-14 items-center justify-between border-b border-border-subtle bg-bg-primary px-6">
      <div className="flex items-center gap-3">
        <h1 className="text-base font-bold text-text-primary">RL Stats Companion</h1>
        {isLive ? (
          <Badge variant="live">
            <span className="relative mr-1.5 flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-secondary opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent-secondary" />
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

      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate("/settings")}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-md text-text-secondary transition-colors",
            "hover:bg-surface-hover hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/50"
          )}
          aria-label="Ajustes"
        >
          <Settings size={18} />
        </button>
      </div>
    </header>
  );
}
