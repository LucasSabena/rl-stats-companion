import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { useUIStore } from "@/stores/uiStore";
import {
  createOverlayWindow,
  destroyOverlayWindow,
  getOverlayWindowState,
  updateOverlayOpacity,
  updateOverlayPosition,
  updateOverlaySize,
  setOverlayClickthrough,
  setOverlayInteractive,
  notifyOverlaySettingsChanged,
  getSettings,
  setSettings,
} from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  Monitor,
  MonitorOff,
  Eye,
  Grip,
  Move,
  Settings2,
  Type,
  Users,
  UsersRound,
  User,
} from "lucide-react";
import type { OverlayWindowState, OverlayConfigForm, OverlayPositionPreset } from "@/lib/types";

const inputClass = cn(
  "rounded-md border bg-bg-secondary px-2 py-1.5 text-xs text-text-primary placeholder:text-text-muted",
  "border-border-subtle focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary/50",
  "w-full"
);

const PRESETS: Record<OverlayPositionPreset, { x: number; y: number }> = {
  "top-left": { x: 40, y: 80 },
  "top-right": { x: 1420, y: 80 },
  "bottom-left": { x: 40, y: 700 },
  "bottom-right": { x: 1420, y: 700 },
  "custom": { x: 0, y: 0 },
};

export function OverlayConfig() {
  const addToast = useUIStore((state) => state.addToast);
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState<OverlayWindowState | null>(null);
  const [saving, setSaving] = useState(false);
  const [previewing, setPreviewing] = useState(false);

  const { register, watch, setValue, handleSubmit, reset } = useForm<OverlayConfigForm>({
    defaultValues: {
      enabled: false,
      opacity: 0.75,
      positionPreset: "top-left",
      positionX: 40,
      positionY: 80,
      width: 420,
      height: 320,
      showScore: true,
      showPlayers: true,
      showStats: true,
      showTimer: true,
      fontScale: "medium",
      clickthrough: true,
      playerScope: "all",
      showNames: true,
      showPlayerScore: true,
      showBoost: false,
    },
  });

  const watched = watch();

  useEffect(() => {
    (async () => {
      try {
        const [appSettings, overlayState] = await Promise.all([
          getSettings(),
          getOverlayWindowState().catch(() => null),
        ]);
        const st = overlayState ?? { visible: false, clickthrough: true, opacity: 0.75, position_x: 40, position_y: 80, width: 420, height: 320 };
        setState(st);
        const preset = findPreset(st.position_x, st.position_y);
        reset({
          enabled: st.visible || (appSettings.overlayEnabled ?? false),
          opacity: appSettings.overlayOpacity ?? st.opacity,
          positionPreset: preset,
          positionX: st.position_x,
          positionY: st.position_y,
          width: st.width || 420,
          height: st.height || 320,
          showScore: appSettings.overlayShowScore ?? true,
          showPlayers: appSettings.overlayShowPlayers ?? true,
          showStats: appSettings.overlayShowStats ?? true,
          showTimer: appSettings.overlayShowTimer ?? true,
          fontScale: (appSettings.overlayFontScale as OverlayConfigForm["fontScale"]) ?? "medium",
          clickthrough: appSettings.overlayClickthrough ?? true,
          playerScope: (appSettings.overlayPlayerScope ?? "all") as "all" | "team",
          showNames: appSettings.overlayShowNames ?? true,
          showPlayerScore: appSettings.overlayShowPlayerScore ?? true,
          showBoost: appSettings.overlayShowBoost ?? false,
        });
      } catch {
        addToast({ type: "error", title: "Error", message: "No se pudo cargar la config del overlay" });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handlePresetChange = (preset: OverlayPositionPreset) => {
    setValue("positionPreset", preset);
    if (preset !== "custom") {
      const pos = PRESETS[preset];
      setValue("positionX", pos.x);
      setValue("positionY", pos.y);
    }
  };

  const handleToggleEnabled = async () => {
    try {
      const newEnabled = !watched.enabled;
      if (newEnabled) {
        setState(await createOverlayWindow());
        addToast({ type: "success", title: "Overlay activado" });
      } else {
        setState(await destroyOverlayWindow());
        addToast({ type: "info", title: "Overlay desactivado" });
      }
      setValue("enabled", newEnabled);
      const s = await getSettings();
      await setSettings({ ...s, overlayEnabled: newEnabled });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      addToast({ type: "error", title: "Error", message: msg });
    }
  };

  const handlePreview = async () => {
    if (!state?.visible) return;
    setPreviewing(true);
    try {
      await setOverlayInteractive(8);
      addToast({ type: "info", title: "Modo interactivo", message: "Arrastra el overlay para reposicionarlo (8 segundos)" });
      setTimeout(() => setPreviewing(false), 8000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      addToast({ type: "error", title: "Error", message: msg });
      setPreviewing(false);
    }
  };

  const onSubmit = async (data: OverlayConfigForm) => {
    setSaving(true);
    try {
      const appSettings = await getSettings();
      await setSettings({
        ...appSettings,
        overlayEnabled: data.enabled,
        overlayOpacity: data.opacity,
        overlayPositionX: data.positionX,
        overlayPositionY: data.positionY,
        overlayWidth: data.width,
        overlayHeight: data.height,
        overlayShowScore: data.showScore,
        overlayShowPlayers: data.showPlayers,
        overlayShowStats: data.showStats,
        overlayShowTimer: data.showTimer,
        overlayFontScale: data.fontScale,
        overlayClickthrough: data.clickthrough,
        overlayPlayerScope: data.playerScope,
        overlayShowNames: data.showNames,
        overlayShowPlayerScore: data.showPlayerScore,
        overlayShowBoost: data.showBoost,
      });

      if (state?.visible) {
        await updateOverlayOpacity(data.opacity);
        await updateOverlayPosition(data.positionX, data.positionY);
        await updateOverlaySize(data.width, data.height);
        await setOverlayClickthrough(data.clickthrough);
        await notifyOverlaySettingsChanged();
      }

      setState(await getOverlayWindowState().catch(() => state));
      addToast({ type: "success", title: "Configuracion guardada" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      addToast({ type: "error", title: "Error al guardar", message: msg });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-lg border border-border-subtle bg-bg-tertiary p-4 text-sm text-text-muted">
        Cargando configuracion...
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="rounded-lg border border-border-subtle bg-bg-tertiary p-4 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {watched.enabled ? (
            <Monitor size={18} className="text-accent-secondary" />
          ) : (
            <MonitorOff size={18} className="text-text-secondary" />
          )}
          <h4 className="text-sm font-semibold text-text-primary">Overlay in-game</h4>
        </div>
        <button
          type="button"
          onClick={handleToggleEnabled}
          className={cn(
            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
            watched.enabled ? "bg-accent-secondary" : "bg-border-strong"
          )}
        >
          <span
            className={cn(
              "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
              watched.enabled ? "translate-x-6" : "translate-x-1"
            )}
          />
        </button>
      </div>

      {!watched.enabled && (
        <p className="text-xs text-text-muted">
          Activa el overlay para mostrar datos en tiempo real sobre Rocket League.
          Los clicks atraviesan el overlay y llegan al juego.
        </p>
      )}

      {watched.enabled && (
        <>
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Move size={14} className="text-text-tertiary" />
              <span className="text-xs font-medium text-text-secondary">Posicion</span>
            </div>
            <div className="grid grid-cols-5 gap-1.5 mb-2">
              {(["top-left", "top-right", "bottom-left", "bottom-right", "custom"] as const).map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handlePresetChange(preset)}
                  className={cn(
                    "rounded-md border px-2 py-1.5 text-[10px] font-medium transition-colors",
                    watched.positionPreset === preset
                      ? "border-accent-primary bg-accent-primary/10 text-accent-primary"
                      : "border-border-subtle text-text-tertiary hover:text-text-secondary"
                  )}
                >
                  {preset === "top-left" ? "Arr-Izq"
                   : preset === "top-right" ? "Arr-Der"
                   : preset === "bottom-left" ? "Abj-Izq"
                   : preset === "bottom-right" ? "Abj-Der"
                   : "Custom"}
                </button>
              ))}
            </div>
            {watched.positionPreset === "custom" && (
              <div className="flex gap-2">
                <input type="number" placeholder="X" {...register("positionX", { valueAsNumber: true })} className={cn(inputClass, "w-20")} />
                <input type="number" placeholder="Y" {...register("positionY", { valueAsNumber: true })} className={cn(inputClass, "w-20")} />
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Grip size={14} className="text-text-tertiary" />
              <span className="text-xs font-medium text-text-secondary">Tamano</span>
            </div>
            <div className="flex gap-2">
              <div>
                <label className="text-[10px] text-text-muted block mb-0.5">Ancho</label>
                <input type="number" min={280} max={800} {...register("width", { valueAsNumber: true })} className={cn(inputClass, "w-20")} />
              </div>
              <div>
                <label className="text-[10px] text-text-muted block mb-0.5">Alto</label>
                <input type="number" min={200} max={600} {...register("height", { valueAsNumber: true })} className={cn(inputClass, "w-20")} />
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Eye size={14} className="text-text-tertiary" />
              <span className="text-xs font-medium text-text-secondary">
                Opacidad: {Math.round(watched.opacity * 100)}%
              </span>
            </div>
            <input
              type="range"
              min={10}
              max={100}
              value={Math.round(watched.opacity * 100)}
              onChange={(e) => setValue("opacity", Number(e.target.value) / 100)}
              className="w-full h-1.5 bg-border-strong rounded-lg appearance-none cursor-pointer accent-accent-primary"
            />
          </div>

          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Users size={14} className="text-text-tertiary" />
              <span className="text-xs font-medium text-text-secondary">Jugadores a mostrar</span>
            </div>
            <div className="flex gap-1.5">
              {(["all", "team"] as const).map((scope) => (
                <button
                  key={scope}
                  type="button"
                  onClick={() => setValue("playerScope", scope)}
                  className={cn(
                    "rounded-md border px-3 py-1.5 text-xs transition-colors flex items-center gap-1.5",
                    watched.playerScope === scope
                      ? "border-accent-primary bg-accent-primary/10 text-accent-primary"
                      : "border-border-subtle text-text-tertiary hover:text-text-secondary"
                  )}
                >
                  {scope === "all" ? <><UsersRound size={13} /> Todos</> : <><User size={13} /> Solo mi equipo</>}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Settings2 size={14} className="text-text-tertiary" />
              <span className="text-xs font-medium text-text-secondary">Datos visibles</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <label className="flex items-center gap-2 rounded-md border border-border-subtle bg-bg-secondary px-2.5 py-1.5 cursor-pointer hover:bg-surface-hover transition-colors">
                <input type="checkbox" className="h-3.5 w-3.5 rounded accent-accent-primary" {...register("showScore")} />
                <span className="text-xs text-text-secondary">Marcador</span>
              </label>
              <label className="flex items-center gap-2 rounded-md border border-border-subtle bg-bg-secondary px-2.5 py-1.5 cursor-pointer hover:bg-surface-hover transition-colors">
                <input type="checkbox" className="h-3.5 w-3.5 rounded accent-accent-primary" {...register("showTimer")} />
                <span className="text-xs text-text-secondary">Tiempo & Arena</span>
              </label>
              <label className="flex items-center gap-2 rounded-md border border-border-subtle bg-bg-secondary px-2.5 py-1.5 cursor-pointer hover:bg-surface-hover transition-colors">
                <input type="checkbox" className="h-3.5 w-3.5 rounded accent-accent-primary" {...register("showPlayers")} />
                <span className="text-xs text-text-secondary">Jugadores</span>
              </label>
              <label className="flex items-center gap-2 rounded-md border border-border-subtle bg-bg-secondary px-2.5 py-1.5 cursor-pointer hover:bg-surface-hover transition-colors">
                <input type="checkbox" className="h-3.5 w-3.5 rounded accent-accent-primary" {...register("showStats")} />
                <span className="text-xs text-text-secondary">Estadisticas (G/A/S)</span>
              </label>
              <label className="flex items-center gap-2 rounded-md border border-border-subtle bg-bg-secondary px-2.5 py-1.5 cursor-pointer hover:bg-surface-hover transition-colors">
                <input type="checkbox" className="h-3.5 w-3.5 rounded accent-accent-primary" {...register("showNames")} />
                <span className="text-xs text-text-secondary">Nombres</span>
              </label>
              <label className="flex items-center gap-2 rounded-md border border-border-subtle bg-bg-secondary px-2.5 py-1.5 cursor-pointer hover:bg-surface-hover transition-colors">
                <input type="checkbox" className="h-3.5 w-3.5 rounded accent-accent-primary" {...register("showPlayerScore")} />
                <span className="text-xs text-text-secondary">Puntos</span>
              </label>
              <label className="flex items-center gap-2 rounded-md border border-border-subtle bg-bg-secondary px-2.5 py-1.5 cursor-pointer hover:bg-surface-hover transition-colors">
                <input type="checkbox" className="h-3.5 w-3.5 rounded accent-accent-primary" {...register("showBoost")} />
                <span className="text-xs text-text-secondary">Boost</span>
              </label>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Type size={14} className="text-text-tertiary" />
              <span className="text-xs font-medium text-text-secondary">Tamano de fuente</span>
            </div>
            <div className="flex gap-1.5">
              {(["small", "medium", "large"] as const).map((scale) => (
                <button
                  key={scale}
                  type="button"
                  onClick={() => setValue("fontScale", scale)}
                  className={cn(
                    "rounded-md border px-3 py-1 text-xs transition-colors",
                    watched.fontScale === scale
                      ? "border-accent-primary bg-accent-primary/10 text-accent-primary"
                      : "border-border-subtle text-text-tertiary hover:text-text-secondary"
                  )}
                >
                  {scale === "small" ? "Chico" : scale === "medium" ? "Mediano" : "Grande"}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-text-secondary">Click-through</p>
              <p className="text-[10px] text-text-muted">
                {watched.clickthrough
                  ? "Los clicks pasan al juego."
                  : "El overlay captura clicks."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setValue("clickthrough", !watched.clickthrough)}
              className={cn(
                "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
                watched.clickthrough ? "bg-accent-secondary" : "bg-accent-warning"
              )}
            >
              <span
                className={cn(
                  "inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform",
                  watched.clickthrough ? "translate-x-4" : "translate-x-0.5"
                )}
              />
            </button>
          </div>

          <div className="flex gap-2 pt-1">
            <Button type="button" variant="secondary" size="sm" onClick={handlePreview} isLoading={previewing} disabled={previewing}>
              <Move size={14} className="mr-1" />
              Reposicionar (8s)
            </Button>
            <Button type="submit" size="sm" isLoading={saving} disabled={saving}>
              Guardar configuracion
            </Button>
          </div>
        </>
      )}
    </form>
  );
}

function findPreset(x: number, y: number): OverlayPositionPreset {
  for (const [key, pos] of Object.entries(PRESETS)) {
    if (key === "custom") continue;
    if (Math.abs(pos.x - x) < 10 && Math.abs(pos.y - y) < 10) {
      return key as OverlayPositionPreset;
    }
  }
  return "custom";
}
