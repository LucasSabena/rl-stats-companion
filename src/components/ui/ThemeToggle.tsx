import { useUIStore } from "@/stores/uiStore";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Sun, Moon } from "lucide-react";

interface ThemeToggleProps {
  collapsed?: boolean;
}

export function ThemeToggle({ collapsed }: ThemeToggleProps) {
  const { t } = useTranslation("common");
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
      aria-label={theme === "dark" ? t("theme.switchToLight") : t("theme.switchToDark")}
      title={theme === "dark" ? t("theme.light") : t("theme.dark")}
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
          {theme === "dark" ? t("theme.light") : t("theme.dark")}
        </span>
      )}
    </button>
  );
}
