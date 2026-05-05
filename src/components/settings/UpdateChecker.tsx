import { useState } from "react";
import { check, type Update, type DownloadEvent } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";
import { Button } from "@/components/ui/Button";
import { useUIStore } from "@/stores/uiStore";
import { RefreshCw, Download } from "lucide-react";

export function UpdateChecker() {
  const [checking, setChecking] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [update, setUpdate] = useState<Update | null>(null);
  const addToast = useUIStore((state) => state.addToast);

  async function downloadAndInstall(updateObj: Update) {
    setDownloading(true);
    setDownloadProgress(0);
    try {
      let contentLength = 0;
      let downloaded = 0;
      await updateObj.downloadAndInstall((event: DownloadEvent) => {
        switch (event.event) {
          case "Started":
            contentLength = event.data.contentLength ?? 0;
            break;
          case "Progress":
            downloaded += event.data.chunkLength;
            if (contentLength > 0) {
              setDownloadProgress(Math.round((downloaded / contentLength) * 100));
            }
            break;
          case "Finished":
            setDownloadProgress(100);
            break;
        }
      });
      addToast({ type: "success", title: "Actualización instalada. Reiniciando..." });
      await relaunch();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      addToast({ type: "error", title: "Error al actualizar", message: msg });
      setDownloading(false);
    }
  }

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
        await downloadAndInstall(result);
      } else {
        addToast({ type: "success", title: "Estás en la última versión" });
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      addToast({ type: "error", title: "Error buscando actualizaciones", message: msg });
    } finally {
      setChecking(false);
    }
  }

  const isBusy = checking || downloading;
  const buttonLabel = downloading
    ? `Descargando ${downloadProgress}%`
    : "Buscar";

  return (
    <div className="rounded-lg border border-border-subtle bg-bg-surface p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-text-primary">Actualizaciones</p>
          <p className="text-xs text-text-secondary">Busca nuevas versiones de RL Stats</p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          leftIcon={downloading ? Download : RefreshCw}
          isLoading={isBusy}
          onClick={handleCheck}
          disabled={isBusy}
        >
          {buttonLabel}
        </Button>
      </div>

      {update && !isBusy && (
        <div className="mt-3 rounded-md bg-accent-primary/10 p-3">
          <p className="text-sm font-medium text-accent-primary">{update.version} disponible</p>
          {update.body && <p className="mt-1 text-xs text-text-secondary">{update.body}</p>}
          <Button
            variant="primary"
            size="sm"
            className="mt-2"
            leftIcon={Download}
            onClick={() => downloadAndInstall(update)}
          >
            Reintentar descarga
          </Button>
        </div>
      )}
    </div>
  );
}
