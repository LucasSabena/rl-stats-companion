import { useState } from "react";
import { checkForUpdate } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { useUIStore } from "@/stores/uiStore";
import { RefreshCw, Download } from "lucide-react";

export function UpdateChecker() {
  const [checking, setChecking] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<Awaited<ReturnType<typeof checkForUpdate>> | null>(null);
  const addToast = useUIStore((state) => state.addToast);

  async function handleCheck() {
    setChecking(true);
    try {
      const info = await checkForUpdate();
      setUpdateInfo(info);
      if (info) {
        addToast({
          type: "info",
          title: `Actualización disponible: ${info.version}`,
          message: info.notes,
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

      {updateInfo && (
        <div className="mt-3 rounded-md bg-accent-primary/10 p-3">
          <p className="text-sm font-medium text-accent-primary">{updateInfo.version} disponible</p>
          <p className="mt-1 text-xs text-text-secondary">{updateInfo.notes}</p>
          <Button variant="primary" size="sm" className="mt-2" leftIcon={Download}>
            Descargar
          </Button>
        </div>
      )}
    </div>
  );
}
