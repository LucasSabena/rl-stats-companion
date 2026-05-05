import { useState } from "react";
import { check, type Update, type DownloadEvent } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";
import { Button } from "@/components/ui/Button";
import { useUIStore } from "@/stores/uiStore";
import { RefreshCw, Download, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function UpdateChecker() {
  const [checking, setChecking] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [update, setUpdate] = useState<Update | null>(null);
  const [error, setError] = useState<string | null>(null);
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
            setDownloadProgress(0);
            break;
          case "Progress":
            downloaded += event.data.chunkLength;
            if (contentLength > 0) {
              setDownloadProgress(Math.min(Math.round((downloaded / contentLength) * 100), 99));
            } else {
              setDownloadProgress((prev) => (prev < 90 ? prev + 5 : prev));
            }
            break;
          case "Finished":
            setDownloadProgress(100);
            break;
        }
      });
      addToast({ type: "success", title: "Actualizacion instalada. Reiniciando..." });
      await relaunch();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      const friendly = msg.includes("signature")
        ? "Firma invalida. Verifica que TAURI_SIGNING_PRIVATE_KEY este configurado en CI."
        : msg.includes("404") || msg.includes("not found")
          ? "No se encontro el archivo de actualizacion. Probablemente no se genero el latest.json correctamente."
          : msg.includes("connection") || msg.includes("network") || msg.includes("fetch")
            ? "Error de conexion. Verifica tu acceso a internet."
            : msg;
      addToast({ type: "error", title: "Error al actualizar", message: friendly });
      setError(friendly);
    } finally {
      setDownloading(false);
    }
  }

  async function handleCheck() {
    setChecking(true);
    setError(null);
    try {
      const result = await check();
      setUpdate(result);
      setError(null);
      if (result) {
        addToast({
          type: "info",
          title: `Actualizacion disponible: ${result.version}`,
          message: result.body ?? "",
        });
        await downloadAndInstall(result);
      } else {
        setUpdate(null);
        addToast({ type: "success", title: "Estas en la ultima version" });
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      const friendly = msg.includes("signature")
        ? "Error de firma. La clave publica en tauri.conf.json podria no coincidir."
        : msg.includes("404") || msg.includes("not found")
          ? "No se encontro latest.json. Asegurate de haber ejecutado el release de CI."
          : msg.includes("connection") || msg.includes("network") || msg.includes("fetch")
            ? "Error de conexion. Verifica tu acceso a internet."
            : msg;
      setUpdate(null);
      setError(friendly);
      addToast({ type: "error", title: "Error buscando actualizaciones", message: friendly });
    } finally {
      setChecking(false);
    }
  }

  const isBusy = checking || downloading;
  const buttonLabel = downloading
    ? `Descargando ${downloadProgress}%`
    : checking
      ? "Buscando..."
      : "Buscar";

  return (
    <div className="group rounded-xl border border-border-subtle bg-bg-surface/60 p-5 transition-all duration-200 hover:border-border-default hover:bg-bg-surface/80">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-bg-elevated transition-colors group-hover:bg-bg-elevated/80">
            <RefreshCw size={16} className={cn("text-text-muted transition-colors", isBusy && "animate-spin text-accent-primary")} />
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary">Actualizaciones</p>
            <p className="text-xs text-text-muted">Busca nuevas versiones de RL Stats</p>
          </div>
        </div>
        <Button
          variant="secondary"
          size="sm"
          leftIcon={downloading ? Download : undefined}
          isLoading={isBusy}
          onClick={handleCheck}
          disabled={isBusy}
        >
          {buttonLabel}
        </Button>
      </div>

      {error && !isBusy && (
        <div className="mt-4 rounded-lg border border-error-border bg-error-bg p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-red-500/10">
              <AlertCircle size={14} className="text-red-500" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-red-600">Error al buscar actualizaciones</p>
              <p className="mt-1 text-xs text-text-secondary break-words">{error}</p>
              <Button
                variant="primary"
                size="sm"
                className="mt-3"
                leftIcon={RefreshCw}
                onClick={handleCheck}
              >
                Reintentar
              </Button>
            </div>
          </div>
        </div>
      )}

      {update && !isBusy && !error && (
        <div className="mt-4 rounded-lg border border-accent-primary/20 bg-accent-primary/5 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-accent-primary/10">
              <Download size={12} className="text-accent-primary" />
            </div>
            <p className="text-sm font-semibold text-accent-primary">{update.version} disponible</p>
          </div>
          {update.body && <p className="mb-3 text-xs text-text-secondary">{update.body}</p>}
          <Button
            variant="primary"
            size="sm"
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
