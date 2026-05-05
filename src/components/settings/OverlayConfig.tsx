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
  "rounded-lg border bg-bg-base px-2.5 py-2 text-xs text-text-primary placeholder:text-text-muted transition-all duration-200",
  "border-border-subtle focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20",
  "hover:border-border-highlight",
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
      showMmr: false,
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
          showMmr: appSettings.overlayShowMmr ?? false,
        });
      } catch {
        addToast({ type: "error", title: "Error", message: "No se pudo cargar la config del overlay" });
      } finally {
        setLoading(false);
      }
    })();
  }, [addToast, reset]);

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
        overlayShowMmr: data.showMmr,
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
      <div className="rounded-xl border border-border-subtle bg-bg-surface/60 p-5 text-sm text-text-muted">
        Cargando configuracion...
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="rounded-xl border border-border-subtle bg-bg-surface/60 p-5 space-y-5">
      {/* ── Header with toggle ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
            watched.enabled ? "bg-accent-secondary-subtle" : "bg-bg-elevated"
          )}>
            {watched.enabled ? (
              <Monitor size={18} className="text-accent-secondary" />
            ) : (
              <MonitorOff size={18} className="text-text-muted" />
            )}
          </div>
          <div>
            <h4 className="text-sm font-semibold text-text-primary">Overlay in-game</h4>
            <p className="text-xs text-text-muted">Datos en tiempo real sobre Rocket League</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleToggleEnabled}
          role="switch"
          aria-checked={watched.enabled}
          className={cn(
            "relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 active:scale-95",
            watched.enabled ? "bg-accent-secondary shadow-[0_0_8px_rgba(249,115,22,0.4)]" : "bg-border-highlight"
          )}
        >
          <span
            className={cn(
              "inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-all duration-200",
              watched.enabled ? "translate-x-6" : "translate-x-1"
            )}
          />
        </button>
      </div>

      {!watched.enabled && (
        <div className="rounded-lg border border-dashed border-border-subtle bg-bg-base/50 px-4 py-3">
          <p className="text-xs text-text-muted">
            Activa el overlay para mostrar datos en tiempo real sobre Rocket League.
            Los clicks atraviesan el overlay y llegan al juego.
          </p>
        </div>
      )}

      {watched.enabled && (
        <>
          {/* ── Position + Size grid ── */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Position */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-bg-elevated">
                  <Move size={12} className="text-text-tertiary" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Posicion</span>
              </div>
              {/* Position preset grid - visual representation */}
              <div className="grid grid-cols-5 gap-1.5">
                {(["top-left", "top-right", "bottom-left", "bottom-right", "custom"] as const).map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handlePresetChange(preset)}
                    className={cn(
                      "rounded-lg border px-2 py-2 text-[10px] font-medium transition-all duration-200 active:scale-95",
                      watched.positionPreset === preset
                        ? "border-accent-primary bg-accent-primary/10 text-accent-primary shadow-[0_0_8px_rgba(59,130,246,0.2)]"
                        : "border-border-subtle text-text-tertiary hover:text-text-secondary hover:bg-bg-elevated"
                    )}
                  >
                    {preset === "top-left" ? "↖ Arr-Izq"
                     : preset === "top-right" ? "↗ Arr-Der"
                     : preset === "bottom-left" ? "↙ Abj-Izq"
                     : preset === "bottom-right" ? "↘ Abj-Der"
                     : "✎ Custom"}
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

            {/* Size */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-bg-elevated">
                  <Grip size={12} className="text-text-tertiary" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Tamano</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-medium text-text-muted block mb-1.5">Ancho (px)</label>
                  <input type="number" min={280} max={800} {...register("width", { valueAsNumber: true })} className={cn(inputClass, "text-center")} />
                </div>
                <div>
                  <label className="text-[10px] font-medium text-text-muted block mb-1.5">Alto (px)</label>
                  <input type="number" min={200} max={600} {...register("height", { valueAsNumber: true })} className={cn(inputClass, "text-center")} />
                </div>
              </div>
            </div>
          </div>

          {/* ── Opacity slider ── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-bg-elevated">
                  <Eye size={12} className="text-text-tertiary" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Opacidad</span>
              </div>
              <span className="rounded-md bg-bg-elevated px-2 py-1 text-xs font-mono font-medium text-accent-primary">
                {Math.round(watched.opacity * 100)}%
              </span>
            </div>
            <div className="relative">
              <input
                type="range"
                min={10}
                max={100}
                value={Math.round(watched.opacity * 100)}
                onChange={(e) => setValue("opacity", Number(e.target.value) / 100)}
                className="w-full h-2 bg-border-highlight rounded-lg appearance-none cursor-pointer accent-accent-primary"
              />
              <div className="flex justify-between mt-1">
                <span className="text-[9px] text-text-muted">10%</span>
                <span className="text-[9px] text-text-muted">100%</span>
              </div>
            </div>
          </div>

          {/* ── Player Scope ── */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-bg-elevated">
                <Users size={12} className="text-text-tertiary" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Jugadores a mostrar</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(["all", "team"] as const).map((scope) => (
                <button
                  key={scope}
                  type="button"
                  onClick={() => setValue("playerScope", scope)}
                  className={cn(
                    "rounded-lg border px-3 py-2.5 text-xs font-medium transition-all duration-200 flex items-center justify-center gap-2 active:scale-95",
                    watched.playerScope === scope
                      ? "border-accent-primary bg-accent-primary/10 text-accent-primary shadow-[0_0_8px_rgba(59,130,246,0.2)]"
                      : "border-border-subtle text-text-tertiary hover:text-text-secondary hover:bg-bg-elevated"
                  )}
                >
                  {scope === "all" ? <><UsersRound size={14} /> Todos</> : <><User size={14} /> Solo mi equipo</>}
                </button>
              ))}
            </div>
          </div>

          {/* ── Visible data checkboxes ── */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-bg-elevated">
                <Settings2 size={12} className="text-text-tertiary" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Datos visibles</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: "showScore", label: "Marcador" },
                { key: "showTimer", label: "Tiempo & Arena" },
                { key: "showPlayers", label: "Jugadores" },
                { key: "showStats", label: "Estadisticas (G/A/S)" },
                { key: "showNames", label: "Nombres" },
                { key: "showPlayerScore", label: "Puntos" },
                { key: "showBoost", label: "Boost" },
                { key: "showMmr", label: "MMR" },
              ].map(({ key, label }) => (
                <label
                  key={key}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg border px-3 py-2.5 cursor-pointer transition-all duration-200",
                    "border-border-subtle hover:bg-bg-elevated"
                  )}
                >
                  <input type="checkbox" className="h-4 w-4 rounded border-border-highlight bg-bg-base accent-accent-primary transition-colors" {...register(key as keyof OverlayConfigForm)} />
                  <span className="text-xs text-text-secondary">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* ── Font Scale ── */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-bg-elevated">
                <Type size={12} className="text-text-tertiary" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Tamano de fuente</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(["small", "medium", "large"] as const).map((scale) => (
                <button
                  key={scale}
                  type="button"
                  onClick={() => setValue("fontScale", scale)}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-xs font-medium transition-all duration-200 active:scale-95",
                    watched.fontScale === scale
                      ? "border-accent-primary bg-accent-primary/10 text-accent-primary shadow-[0_0_8px_rgba(59,130,246,0.2)]"
                      : "border-border-subtle text-text-tertiary hover:text-text-secondary hover:bg-bg-elevated"
                  )}
                >
                  {scale === "small" ? "Chico" : scale === "medium" ? "Mediano" : "Grande"}
                </button>
              ))}
            </div>
          </div>

          {/* ── Click-through toggle ── */}
          <div className="flex items-center justify-between rounded-lg border border-border-subtle bg-bg-base px-4 py-3">
            <div>
              <p className="text-xs font-semibold text-text-secondary">Click-through</p>
              <p className="text-[11px] text-text-muted">
                {watched.clickthrough
                  ? "Los clicks pasan al juego."
                  : "El overlay captura clicks."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setValue("clickthrough", !watched.clickthrough)}
              role="switch"
              aria-checked={watched.clickthrough}
              className={cn(
                "relative inline-flex h-5 w-9 items-center rounded-full transition-all duration-200 active:scale-95",
                watched.clickthrough ? "bg-accent-secondary" : "bg-accent-warning"
              )}
            >
              <span
                className={cn(
                  "inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-all duration-200",
                  watched.clickthrough ? "translate-x-4" : "translate-x-0.5"
                )}
              />
            </button>
          </div>

          {/* ── Action buttons ── */}
          <div className="flex gap-2 pt-2">
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
