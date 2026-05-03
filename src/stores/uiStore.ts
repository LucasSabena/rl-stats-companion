import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { ToastItem } from "@/lib/types";

interface UIState {
  sidebarExpanded: boolean;
  activePage: string;
  toastQueue: ToastItem[];

  toggleSidebar: () => void;
  setSidebarExpanded: (expanded: boolean) => void;
  setActivePage: (page: string) => void;
  addToast: (toast: Omit<ToastItem, "id">) => void;
  removeToast: (id: string) => void;
}

let toastId = 0;

export const useUIStore = create<UIState>()(
  immer((set) => ({
    sidebarExpanded: false,
    activePage: "/",
    toastQueue: [],

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
  }))
);
