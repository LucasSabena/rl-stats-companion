import { useRef, useState } from "react";
import { exportDataJson, importDataJson, getStorageStats, clearAllData } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useUIStore } from "@/stores/uiStore";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, Upload, Trash2, Database, FolderOpen } from "lucide-react";

async function invalidateDataQueries(queryClient: ReturnType<typeof useQueryClient>) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ["matches"] }),
    queryClient.invalidateQueries({ queryKey: ["match-detail"] }),
    queryClient.invalidateQueries({ queryKey: ["analytics"] }),
    queryClient.invalidateQueries({ queryKey: ["sessions"] }),
    queryClient.invalidateQueries({ queryKey: ["rollups"] }),
    queryClient.invalidateQueries({ queryKey: ["insights"] }),
    queryClient.invalidateQueries({ queryKey: ["storageStats"] }),
    queryClient.invalidateQueries({ queryKey: ["tracker-profile"] }),
  ]);
}

export function DataManagement() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const addToast = useUIStore((state) => state.addToast);
  const queryClient = useQueryClient();

  const { data: stats } = useQuery({
    queryKey: ["storageStats"],
    queryFn: getStorageStats,
  });

  async function handleExport() {
    try {
      const json = await exportDataJson();
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const stamp = new Date().toISOString().replace(/[:.]/g, "-");
      link.href = url;
      link.download = `rl-stats-backup-${stamp}.json`;
      link.click();
      URL.revokeObjectURL(url);
      addToast({ type: "success", title: "Exportación completada", message: "Se descargó un backup JSON." });
    } catch {
      addToast({ type: "error", title: "Error al exportar" });
    }
  }

  async function handleImportFile(file: File) {
    try {
      setIsImporting(true);
      const content = await file.text();
      await importDataJson(content);
      addToast({ type: "success", title: "Importación completada", message: `Archivo: ${file.name}` });
      await invalidateDataQueries(queryClient);
    } catch {
      addToast({ type: "error", title: "Error al importar" });
    } finally {
      setIsImporting(false);
    }
  }

  async function handleClear() {
    try {
      await clearAllData();
      addToast({ type: "success", title: "Datos eliminados" });
      await invalidateDataQueries(queryClient);
      setConfirmOpen(false);
    } catch {
      addToast({ type: "error", title: "Error al eliminar datos" });
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border-subtle bg-bg-surface p-4">
        <div className="flex items-center gap-3">
          <Database size={20} className="text-text-tertiary" />
          <div>
            <p className="text-sm font-medium text-text-primary">Almacenamiento</p>
            <p className="text-xs text-text-secondary">
              {stats
                ? `${stats.totalMatches} partidas · ${(stats.databaseSizeBytes / 1024 / 1024).toFixed(1)} MB`
                : "Cargando..."}
            </p>
            {stats?.dbPath && (
              <p className="mt-1 break-all text-[11px] text-text-tertiary">
                Base de datos: {stats.dbPath}
              </p>
            )}
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            void handleImportFile(file);
          }
          event.target.value = "";
        }}
      />

      <div className="flex flex-wrap gap-3">
        <Button variant="secondary" leftIcon={Download} onClick={handleExport}>
          Exportar datos
        </Button>
        <Button variant="secondary" leftIcon={Upload} onClick={() => fileInputRef.current?.click()} isLoading={isImporting}>
          Importar datos
        </Button>
        {stats?.dbPath && (
          <Button
            variant="ghost"
            leftIcon={FolderOpen}
            onClick={() => navigator.clipboard.writeText(stats.dbPath ?? "")}
          >
            Copiar ruta DB
          </Button>
        )}
        <Button variant="danger" leftIcon={Trash2} onClick={() => setConfirmOpen(true)}>
          Borrar todo
        </Button>
      </div>

      <Modal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="¿Borrar todos los datos?"
        description="Esta acción no se puede deshacer. Se eliminarán todas las partidas y estadísticas."
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleClear}>
              Borrar todo
            </Button>
          </div>
        }
      >
        <p className="text-sm text-text-secondary">Asegúrate de haber exportado tus datos si quieres conservarlos.</p>
      </Modal>
    </div>
  );
}
