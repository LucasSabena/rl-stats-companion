import { NavLink } from "react-router-dom";
import { useUIStore } from "@/stores/uiStore";
import { useLiveStore } from "@/stores/liveStore";
import { cn } from "@/lib/utils";
import { Radio, List, BarChart3, Settings, User } from "lucide-react";

const navItems = [
  { path: "/", label: "En directo", icon: Radio },
  { path: "/history", label: "Historial", icon: List },
  { path: "/analytics", label: "Analisis", icon: BarChart3 },
  { path: "/profile", label: "Perfil", icon: User },
  { path: "/settings", label: "Ajustes", icon: Settings },
];

export function Sidebar() {
  const expanded = useUIStore((state) => state.sidebarExpanded);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const connectionStatus = useLiveStore((state) => state.connectionStatus);
  const currentMatch = useLiveStore((state) => state.currentMatch);

  const isLive = connectionStatus === "connected" && currentMatch !== null;

  return (
    <aside
      className={cn(
        "flex shrink-0 flex-col border-r border-border-subtle bg-bg-primary transition-all duration-200",
        expanded ? "w-52" : "w-16"
      )}
    >
      <div className="flex h-14 items-center justify-center border-b border-border-subtle">
        <button
          onClick={toggleSidebar}
          className="flex h-8 w-8 items-center justify-center rounded-md text-text-secondary hover:bg-surface-hover hover:text-text-primary"
          aria-label={expanded ? "Colapsar sidebar" : "Expandir sidebar"}
        >
          <span className="text-lg font-bold text-accent-primary">{expanded ? "RL" : "R"}</span>
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-2">
        {navItems.map((item) => {
          const isLiveItem = item.path === "/";
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "relative flex items-center gap-3 rounded-md px-3 py-2.5 transition-colors",
                  isActive
                    ? "bg-accent-primary/10 text-accent-primary"
                    : "text-text-secondary hover:bg-surface-hover hover:text-text-primary",
                  !expanded && "justify-center px-2"
                )
              }
              aria-label={item.label}
            >
              {({ isActive }) => (
                <>
                  <div className="relative">
                    <item.icon size={20} />
                    {isLiveItem && isLive && (
                      <span className="absolute -right-1 -top-1 flex h-2.5 w-2.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-secondary opacity-75" />
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent-secondary" />
                      </span>
                    )}
                  </div>
                  {expanded && <span className="text-sm font-medium">{item.label}</span>}
                  {!expanded && isActive && (
                    <span className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-accent-primary" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
