import { NavLink } from "react-router-dom";
import { useUIStore } from "@/stores/uiStore";
import { useLiveStore } from "@/stores/liveStore";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Radio, List, BarChart3, Settings, User, Gamepad2 } from "lucide-react";

const navItems = [
  { path: "/", label: "En directo", icon: Radio },
  { path: "/history", label: "Historial", icon: List },
  { path: "/analytics", label: "Analisis", icon: BarChart3 },
  { path: "/pro-configs", label: "Pro Configs", icon: Gamepad2 },
  { path: "/profile", label: "Perfil (Próximamente)", icon: User },
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
        "flex shrink-0 flex-col border-r border-border-subtle bg-bg-primary transition-all duration-300 ease-out",
        expanded ? "w-56" : "w-[68px]"
      )}
    >
      {/* Logo / Brand */}
      <div className="flex h-16 items-center border-b border-border-subtle px-3">
        <button
          onClick={toggleSidebar}
          className={cn(
            "group flex items-center gap-3 rounded-lg px-2 py-2 transition-all duration-200",
            "hover:bg-surface-hover",
            !expanded && "w-full justify-center"
          )}
          aria-label={expanded ? "Colapsar sidebar" : "Expandir sidebar"}
        >
          {/* App Icon */}
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg">
            <img
              src="/src-tauri/icons/128x128.png"
              alt="RL Stats"
              className="h-full w-full object-cover"
              onError={(e) => {
                // Fallback to gradient icon if image not found
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
                const parent = target.parentElement;
                if (parent) {
                  parent.classList.add(
                    "bg-gradient-to-br",
                    "from-[var(--color-accent-primary)]",
                    "to-[var(--color-accent-secondary)]"
                  );
                  parent.innerHTML = `<span class="text-sm font-bold text-white tracking-tight">RL</span>`;
                }
              }}
            />
          </div>
          {expanded && (
            <div className="flex flex-col items-start">
              <span className="text-sm font-bold text-text-primary tracking-tight">
                RL Stats
              </span>
              <span className="text-[10px] font-medium text-text-tertiary uppercase tracking-widest">
                Companion
              </span>
            </div>
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-0.5 px-2 py-3">
        {navItems.map((item) => {
          const isLiveItem = item.path === "/";
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200",
                  isActive
                    ? "bg-accent-primary-subtle text-accent-primary"
                    : "text-text-secondary hover:bg-surface-hover hover:text-text-primary",
                  !expanded && "justify-center px-2"
                )
              }
              aria-label={item.label}
            >
              {({ isActive }) => (
                <>
                  <div className="relative flex h-5 w-5 items-center justify-center">
                    <item.icon
                      size={20}
                      className={cn(
                        "transition-transform duration-200",
                        isActive && "scale-110"
                      )}
                    />
                    {isLiveItem && isLive && (
                      <span className="absolute -right-1.5 -top-1.5 flex h-2.5 w-2.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-success opacity-75" />
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent-success" />
                      </span>
                    )}
                  </div>
                  {expanded && (
                    <span
                      className={cn(
                        "text-sm font-medium transition-colors",
                        isActive ? "text-accent-primary" : ""
                      )}
                    >
                      {item.label}
                    </span>
                  )}
                  {/* Active indicator pill */}
                  {!expanded && isActive && (
                    <span className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-accent-primary" />
                  )}
                  {expanded && isActive && (
                    <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-accent-primary" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-border-subtle px-2 py-2">
        <ThemeToggle collapsed={!expanded} />
      </div>
    </aside>
  );
}
