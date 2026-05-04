import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { ToastItem } from "@/lib/types";

export type Theme = "dark" | "light";

interface UIState {
  sidebarExpanded: boolean;
  activePage: string;
  toastQueue: ToastItem[];
  theme: Theme;

  toggleSidebar: () => void;
  setSidebarExpanded: (expanded: boolean) => void;
  setActivePage: (page: string) => void;
  addToast: (toast: Omit<ToastItem, "id">) => void;
  removeToast: (id: string) => void;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

let toastId = 0;

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove("dark", "light");
  root.classList.add(theme);
  root.style.colorScheme = theme;
}

export const useUIStore = create<UIState>()(
  immer((set, get) => ({
    sidebarExpanded: false,
    activePage: "/",
    toastQueue: [],
    theme: ((): Theme => {
      const stored = localStorage.getItem("rl-theme");
      if (stored === "light" || stored === "dark") return stored;
      return "dark";
    })(),

    toggleSidebar: () =>
      set((state) => {
        state.sidebarExpanded = !state.sidebarExpanded;
      }),

    setSidebarExpanded: (expanded) =>
      set((state) => {
        state.sidebarExpanded = expanded;
      }),

    setActivePage: (page) =>
      set((state) => {
        state.activePage = page;
      }),

    addToast: (toast) =>
      set((state) => {
        const id = `toast-${++toastId}`;
        state.toastQueue.push({ ...toast, id });
      }),

    removeToast: (id) =>
      set((state) => {
        state.toastQueue = state.toastQueue.filter((t: ToastItem) => t.id !== id);
      }),

    setTheme: (theme) => {
      localStorage.setItem("rl-theme", theme);
      applyTheme(theme);
      set((state) => {
        state.theme = theme;
      });
    },

    toggleTheme: () => {
      const current = get().theme;
      const next = current === "dark" ? "light" : "dark";
      localStorage.setItem("rl-theme", next);
      applyTheme(next);
      set((state) => {
        state.theme = next;
      });
    },
  }))
);

// Apply stored theme on load
const stored = localStorage.getItem("rl-theme") as Theme | null;
applyTheme(stored === "light" ? "light" : "dark");
