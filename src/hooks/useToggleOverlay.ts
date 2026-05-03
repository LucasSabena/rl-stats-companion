import { useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useSettingsStore } from "@/stores/settingsStore";

export function useToggleOverlay() {
  const overlayMode = useSettingsStore((s) => s.overlayMode);
  const setOverlayMode = useSettingsStore((s) => s.setOverlayMode);

  const toggle = useCallback(async () => {
    try {
      const nowOverlay = await invoke<boolean>("toggle_overlay_mode");
      setOverlayMode(nowOverlay);
    } catch (error) {
      console.error("Failed to toggle overlay mode:", error);
      // Fallback: toggle local state only
      setOverlayMode(!overlayMode);
    }
  }, [overlayMode, setOverlayMode]);

  return {
    overlayMode,
    toggle,
  };
}
