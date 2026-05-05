import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSettings, useUpdateSettings } from "@/hooks/useSettings";
import { detectRlPath } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useUIStore } from "@/stores/uiStore";
import { cn } from "@/lib/utils";
import { AlertTriangle, FolderSearch, MonitorUp } from "lucide-react";
import { settingsSchema, type SettingsFormInput, type SettingsFormValues } from "@/lib/schemas";

const inputClass = cn(
  "w-full rounded-lg border bg-bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted transition-colors",
  "border-border-subtle focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-[var(--color-ring)]"
);

export function SettingsPanel() {
  const { data: settings, isLoading, isError, refetch } = useSettings();
  const updateSettings = useUpdateSettings();
  const addToast = useUIStore((state) => state.addToast);
  const [isDetecting, setIsDetecting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<SettingsFormInput, unknown, SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      playerName: "",
      autoStart: false,
      rlPath: null,
      platform: null,
      defaultMatchType: "ranked",
      sessionGapMinutes: 30,
    },
  });

  useEffect(() => {
    if (settings) {
      reset({
        autoStart: settings.autoStart,
        playerName: settings.playerName ?? "",
        rlPath: settings.rlPath ?? null,
        platform: settings.platform as "steam" | "epic" | null,
        defaultMatchType: settings.defaultMatchType ?? "ranked",
        sessionGapMinutes: settings.sessionGapMinutes ?? 30,
      });
    }
  }, [settings, reset]);

  const onSubmit = (data: SettingsFormValues) => {
    updateSettings.mutate({
      ...settings,
      playerName: data.playerName.trim(),
      autoStart: data.autoStart,
      rlPath: data.rlPath,
      platform: data.platform,
      defaultMatchType: data.defaultMatchType,
      sessionGapMinutes: data.sessionGapMinutes,
    }, {
      onSuccess: () =>
        addToast({ type: "success", title: "Ajustes guardados", message: "Los cambios se aplicaron correctamente." }),
      onError: (err) =>
        addToast({ type: "error", title: "Error al guardar", message: err.message || "No se pudieron guardar los ajustes." }),
    });
  };

  const handleDetectPath = async () => {
    setIsDetecting(true);
    try {
      const platform = settings?.platform ?? null;
      const results = await detectRlPath(platform);
      const valid = results.find((r) => r.valid) ?? results[0];
      if (valid) {
        setValue("rlPath", valid.path);
        setValue("platform", valid.platform);
        addToast({
          type: "success",
          title: "Instalación encontrada",
          message: `${valid.platform === "steam" ? "Steam" : "Epic Games"}: ${valid.path}`,
        });
      } else {
        addToast({ type: "warning", title: "No encontrado", message: "No se detectó Rocket League. Verificá que esté instalado." });
      }
    } catch {
      addToast({ type: "error", title: "Error", message: "Error al detectar la ruta." });
    } finally {
      setIsDetecting(false);
    }
  };

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-8 w-1/3" /><Skeleton className="h-24 w-full" /></div>;
  if (isError || !settings) return <EmptyState icon={AlertTriangle} title="Error cargando ajustes" description="No se pudieron cargar los ajustes." actionLabel="Reintentar" onAction={() => refetch()} />;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <section className="rounded-lg border border-border-subtle bg-bg-surface/50 p-5">
        <div className="mb-4 flex items-center gap-2">
          <FolderSearch className="h-4 w-4 text-accent-primary" />
          <h3 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">Rocket League</h3>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary">Nombre dentro del juego</label>
            <input
              type="text"
              {...register("playerName")}
              className={inputClass}
              placeholder="Ej: Si Locura"
            />
            {errors.playerName && <p className="text-xs text-accent-danger">{errors.playerName.message}</p>}
            <p className="text-xs text-text-muted">
              Lo usamos para identificarte la primera vez y guardar tu `PrimaryId` automaticamente.
            </p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary">Ruta de instalacion</label>
            <div className="flex gap-2">
              <input type="text" {...register("rlPath")} className={inputClass} placeholder="Se detecta automaticamente..." />
              <Button type="button" variant="secondary" size="sm" onClick={handleDetectPath} isLoading={isDetecting} disabled={isDetecting}>Buscar</Button>
            </div>
            {errors.rlPath && <p className="text-xs text-accent-danger">{errors.rlPath.message}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary">Plataforma</label>
            <select {...register("platform")} className={cn(inputClass, "cursor-pointer")}>
              <option value="">Detectar automaticamente</option>
              <option value="steam">Steam</option>
              <option value="epic">Epic Games</option>
            </select>
            {errors.platform && <p className="text-xs text-accent-danger">{errors.platform.message}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary">Tipo de partida por defecto</label>
            <div className="flex flex-wrap gap-1.5">
              {(["ranked", "casual", "tournament", "other"] as const).map((type) => (
                <Controller key={type} name="defaultMatchType" control={control}
                  render={({ field }) => (
                    <button type="button" onClick={() => field.onChange(type)}
                      className={cn("rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
                        field.value === type ? "bg-accent-primary text-white" : "bg-bg-base text-text-tertiary hover:text-text-secondary border border-border-subtle")}>
                      {type === "ranked" ? "Ranked" : type === "casual" ? "Casual" : type === "tournament" ? "Torneo" : "Otro"}
                    </button>
                  )} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-border-subtle bg-bg-surface/50 p-5">
        <div className="mb-4 flex items-center gap-2">
          <MonitorUp className="h-4 w-4 text-accent-primary" />
          <h3 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">Sistema</h3>
        </div>
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <Controller name="autoStart" control={control}
              render={({ field }) => (
                <input id="autoStart" type="checkbox" checked={field.value} onChange={(e) => field.onChange(e.target.checked)}
                  className="h-4 w-4 rounded border-border-highlight bg-bg-surface text-accent-primary focus:ring-accent-primary" />
              )} />
            <label htmlFor="autoStart" className="text-sm text-text-secondary">Iniciar con Windows</label>
          </div>
          <div className="space-y-2">
            <label htmlFor="sessionGapMinutes" className="text-sm font-medium text-text-secondary">
              Brecha entre sesiones (minutos)
            </label>
            <Controller name="sessionGapMinutes" control={control}
              render={({ field }) => (
                <input
                  id="sessionGapMinutes"
                  type="number"
                  min={5}
                  max={120}
                  value={field.value}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  className={cn(inputClass, "w-24 text-center")}
                />
              )} />
            <p className="text-xs text-text-muted">
              Minutos entre partidas para considerarlas la misma sesion (5-120, por defecto 30).
            </p>
            {errors.sessionGapMinutes && (
              <p className="text-xs text-accent-danger">{errors.sessionGapMinutes.message}</p>
            )}
          </div>
        </div>
      </section>

      <Button type="submit" isLoading={updateSettings.isPending} disabled={updateSettings.isPending}>Guardar ajustes</Button>
    </form>
  );
}
