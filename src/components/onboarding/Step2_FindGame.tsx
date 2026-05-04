import { useState } from "react";
import { Search, FolderOpen, Gamepad2, Monitor, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { configureRlIni, detectRlPath } from "@/lib/api";
import { useSettings, useUpdateSettings } from "@/hooks/useSettings";
import { useSettingsStore } from "@/stores/settingsStore";

interface StepProps { onNext: () => void; onBack: () => void }

export default function Step2({ onNext, onBack }: StepProps) {
  const [detecting, setDetecting] = useState(false);
  const [detectedPath, setDetectedPath] = useState<string | null>(null);
  const [platform, setPlatform] = useState<"steam" | "epic" | "auto" | "manual" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: settings } = useSettings();
  const updateSettings = useUpdateSettings();
  const setRlPath = useSettingsStore((s) => s.setRlPath);

  async function handleAutoDetect(source: "steam" | "epic" | "auto") {
    setDetecting(true);
    setPlatform(source);
    setError(null);
    setDetectedPath(null);

    try {
      await configureRlIni();
      const paths = await detectRlPath();

      if (paths.length > 0) {
        const path = paths[0];
        setDetectedPath(path);
        setRlPath(path);
        if (settings) {
          await updateSettings.mutateAsync({
            ...settings,
            rlPath: path,
            platform: source === "steam" || source === "epic" ? source : settings.platform,
          });
        }
      } else {
        setError("No se detecto la instalacion automaticamente. Intenta buscar manualmente.");
      }
    } catch {
      setError("No se detecto la instalacion automaticamente. Intenta buscar manualmente.");
    } finally {
      setDetecting(false);
    }
  }

  const canProceed = detectedPath !== null;

  return (
    <div className="text-center animate-fade-in">
      <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-accent-primary-subtle">
        <Search className="h-10 w-10 text-accent-primary" />
      </div>
      <h2 className="font-display text-2xl font-bold text-text-primary mb-4">Encontrar Rocket League</h2>
      <p className="text-text-secondary max-w-md mx-auto mb-10 leading-relaxed">
        Buscamos tu instalacion de Rocket League para configurar automaticamente la API de estadisticas.
      </p>

      <div className="grid grid-cols-2 gap-3 max-w-md mx-auto mb-8">
        <button
          onClick={() => handleAutoDetect("steam")}
          disabled={detecting}
          className="flex flex-col items-center gap-3 p-5 rounded-xl bg-bg-tertiary border border-border-subtle hover:border-border-strong hover:bg-surface-hover transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Gamepad2 className="h-8 w-8 text-text-secondary" />
          <span className="text-sm font-semibold text-text-primary">Steam</span>
        </button>

        <button
          onClick={() => handleAutoDetect("epic")}
          disabled={detecting}
          className="flex flex-col items-center gap-3 p-5 rounded-xl bg-bg-tertiary border border-border-subtle hover:border-border-strong hover:bg-surface-hover transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Monitor className="h-8 w-8 text-text-secondary" />
          <span className="text-sm font-semibold text-text-primary">Epic Games</span>
        </button>

        <button
          onClick={() => handleAutoDetect("auto")}
          disabled={detecting}
          className="flex flex-col items-center gap-3 p-5 rounded-xl bg-accent-primary-subtle border border-accent-primary/30 hover:border-accent-primary hover:bg-accent-primary/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed relative"
        >
          {detecting && platform === "auto" ? (
            <Loader2 className="h-8 w-8 text-accent-primary animate-spin" />
          ) : (
            <Search className="h-8 w-8 text-accent-primary" />
          )}
          <span className="text-sm font-semibold text-text-primary">Auto-detectar</span>
          <span className="text-[10px] font-semibold text-accent-primary uppercase tracking-wider">Recomendado</span>
        </button>

        <button
          onClick={() => {
            setPlatform("manual");
            setError("Para configurar manualmente, asegurate de que Rocket League este instalado y ejecuta la app como administrador.");
          }}
          disabled={detecting}
          className="flex flex-col items-center gap-3 p-5 rounded-xl bg-bg-tertiary border border-border-subtle hover:border-border-strong hover:bg-surface-hover transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FolderOpen className="h-8 w-8 text-text-secondary" />
          <span className="text-sm font-semibold text-text-primary">Manual</span>
        </button>
      </div>

      {detectedPath && (
        <div className="flex items-center justify-center gap-2 mb-8 text-accent-success">
          <CheckCircle className="h-5 w-5 shrink-0" />
          <span className="truncate max-w-xs text-sm font-medium">{detectedPath}</span>
        </div>
      )}

      {error && !detectedPath && !detecting && (
        <div className="flex items-center justify-center gap-2 mb-8 text-accent-warning">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {detecting && (
        <div className="flex items-center justify-center gap-2 mb-8 text-accent-primary">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">Buscando instalacion...</span>
        </div>
      )}

      <div className="flex justify-center gap-3">
        <button
          onClick={onBack}
          className="px-6 py-2.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors font-medium"
        >
          Atras
        </button>
        <button
          onClick={onNext}
          disabled={!canProceed}
          className="bg-accent-primary hover:bg-accent-primary-hover disabled:bg-bg-tertiary disabled:text-text-muted text-white px-8 py-2.5 rounded-lg font-semibold transition-all duration-200"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
