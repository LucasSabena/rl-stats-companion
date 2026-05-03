import { getCurrentWindow } from "@tauri-apps/api/window";
import { X } from "lucide-react";

export function OverlayDismissButton() {
  const handleDismiss = async () => {
    try {
      const win = getCurrentWindow();
      await win.close();
    } catch {
      // Fallback
    }
  };

  return (
    <button
      onClick={handleDismiss}
      className="absolute right-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-white/70 backdrop-blur transition-colors hover:bg-white/20 hover:text-white"
      aria-label="Cerrar overlay"
      title="Cerrar overlay"
    >
      <X size={14} />
    </button>
  );
}
