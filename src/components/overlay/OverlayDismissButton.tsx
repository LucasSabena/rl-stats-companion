import { invoke } from "@tauri-apps/api/core";
import { useSettingsStore } from "@/stores/settingsStore";
import { X } from "lucide-react";

export function OverlayDismissButton() {
  const handleDismiss = async () => {
    try {
      const nowOverlay = await invoke<boolean>("toggle_overlay_mode");
      useSettingsStore.getState().setOverlayMode(nowOverlay);
    } catch {
      // Fallback: toggle in store only
      useSettingsStore.getState().setOverlayMode(false);
    }
  };

  return (
    <button
      onClick={handleDismiss}
      className="absolute right-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-white/70 backdrop-blur transition-colors hover:bg-white/20 hover:text-white"
      aria-label="Salir del modo overlay"
      title="Salir del modo overlay"
    >
      <X size={14} />
    </button>
  );
}
