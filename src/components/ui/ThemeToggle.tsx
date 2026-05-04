import { useUIStore } from "@/stores/uiStore";
import { cn } from "@/lib/utils";
import { Sun, Moon } from "lucide-react";

interface ThemeToggleProps {
  collapsed?: boolean;
}

export function ThemeToggle({ collapsed }: ThemeToggleProps) {
  const theme = useUIStore((s) => s.theme);
  const toggleTheme = useUIStore((s) => s.toggleTheme);

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-text-secondary transition-all duration-200",
        "hover:bg-surface-hover hover:text-text-primary",
        collapsed && "justify-center px-2"
      )}
      aria-label={theme === "dark" ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
      title={theme === "dark" ? "Tema claro" : "Tema oscuro"}
    >
      <span className="relative flex h-5 w-5 items-center justify-center">
        <Sun
          size={18}
          className={cn(
            "absolute transition-all duration-300",
            theme === "dark"
              ? "rotate-90 scale-0 opacity-0"
              : "rotate-0 scale-100 opacity-100"
          )}
        />
        <Moon
          size={18}
          className={cn(
            "absolute transition-all duration-300",
            theme === "dark"
              ? "rotate-0 scale-100 opacity-100"
              : "-rotate-90 scale-0 opacity-0"
          )}
        />
      </span>
      {!collapsed && (
        <span className="text-sm font-medium">
          {theme === "dark" ? "Tema claro" : "Tema oscuro"}
        </span>
      )}
    </button>
  );
}
