import { useState } from "react";
import { check, type Update } from "@tauri-apps/plugin-updater";
import { Button } from "@/components/ui/Button";
import { useUIStore } from "@/stores/uiStore";
import { RefreshCw, Download } from "lucide-react";

export function UpdateChecker() {
  const [checking, setChecking] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [update, setUpdate] = useState<Update | null>(null);
  const addToast = useUIStore((state) => state.addToast);

  async function handleCheck() {
    setChecking(true);
    try {
      const result = await check();
      setUpdate(result);
      if (result) {
        addToast({
          type: "info",
          title: `Actualización disponible: ${result.version}`,
          message: result.body ?? "",
        });
      } else {
        addToast({ type: "success", title: "Estás en la última versión" });
      }
    } catch {
      addToast({ type: "error", title: "Error buscando actualizaciones" });
    } finally {
      setChecking(false);
    }
  }

  async function handleDownload() {
    if (!update) return;
    setDownloading(true);
    try {
      await update.downloadAndInstall();
    } catch {
      addToast({ type: "error", title: "Error descargando la actualización" });
      setDownloading(false);
    }
  }

  return (
    <div className="rounded-lg border border-border-subtle bg-bg-secondary p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-text-primary">Actualizaciones</p>
          <p className="text-xs text-text-secondary">Busca nuevas versiones de RL Stats Companion</p>
        </div>
        <Button variant="secondary" size="sm" leftIcon={RefreshCw} isLoading={checking} onClick={handleCheck}>
          Buscar
        </Button>
      </div>

      {update && (
        <div className="mt-3 rounded-md bg-accent-primary/10 p-3">
          <p className="text-sm font-medium text-accent-primary">{update.version} disponible</p>
          {update.body && <p className="mt-1 text-xs text-text-secondary">{update.body}</p>}
          <Button
            variant="primary"
            size="sm"
            className="mt-2"
            leftIcon={Download}
            isLoading={downloading}
            onClick={handleDownload}
          >
            Descargar
          </Button>
        </div>
      )}
    </div>
  );
}
