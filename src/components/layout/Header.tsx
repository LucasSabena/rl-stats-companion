import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useLiveStore } from "@/stores/liveStore";
import { useProfileStore } from "@/stores/profileStore";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Radio, Sparkles, User } from "lucide-react";

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

  const profiles = useProfileStore((state) => state.profiles);
  const activeProfile = useProfileStore((state) => state.activeProfile);
  const fetchProfiles = useProfileStore((state) => state.fetchProfiles);
  const createProfile = useProfileStore((state) => state.createProfile);
  const switchProfile = useProfileStore((state) => state.switchProfile);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const isLive = connectionStatus === "connected" && currentMatch !== null;
  const title = pageTitles[location.pathname] || "RL Stats";

  const profileOptions = profiles.map((p) => ({ value: p.id, label: p.name }));

  const handleSwitchProfile = async (id: string) => {
    if (id === activeProfile?.id) return;
    try {
      await switchProfile(id);
      window.alert("Perfil cambiado. Reinicia la app para aplicar los cambios.");
      setTimeout(() => window.location.reload(), 1500);
    } catch {
      // Error is already handled in the store
    }
  };

  const handleCreateProfile = async () => {
    const name = window.prompt("Nombre del nuevo perfil:");
    if (!name || !name.trim()) return;
    try {
      await createProfile(name.trim());
      const created = useProfileStore.getState().activeProfile;
      if (created) {
        await switchProfile(created.id);
      }
      window.alert("Perfil cambiado. Reinicia la app para aplicar los cambios.");
      setTimeout(() => window.location.reload(), 1500);
    } catch {
      // Error is already handled in the store
    }
  };

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
        {/* Profile selector */}
        <div className="flex items-center gap-2 mr-2">
          <User size={14} className="text-text-secondary shrink-0" />
          <Select
            options={profileOptions}
            value={activeProfile?.id ?? ""}
            onChange={handleSwitchProfile}
            placeholder="Seleccionar perfil"
            size="sm"
            align="right"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCreateProfile}
          >
            + Nuevo
          </Button>
        </div>

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
