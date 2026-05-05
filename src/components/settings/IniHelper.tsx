import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { configureRlIni } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { useUIStore } from "@/stores/uiStore";
import { useSettings } from "@/hooks/useSettings";
import { FileJson } from "lucide-react";
import { cn } from "@/lib/utils";
import { iniSettingsSchema, type IniSettingsFormValues } from "@/lib/schemas";

export function IniHelper() {
  const addToast = useUIStore((state) => state.addToast);
  const { data: settings } = useSettings();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<IniSettingsFormValues>({
    resolver: zodResolver(iniSettingsSchema),
    defaultValues: {
      port: 49123,
      enabled: true,
    },
  });

  const onSubmit = async (data: IniSettingsFormValues) => {
    try {
      if (!settings?.rlPath) {
        throw new Error("Primero configura la ruta de Rocket League en Ajustes.");
      }

      await configureRlIni(settings.rlPath, data.port);
      addToast({
        type: "success",
        title: "Configuración aplicada",
        message: `El archivo RL se ha configurado en el puerto ${data.port}.`,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo configurar el archivo RL.";
      addToast({ type: "error", title: "Error", message });
    }
  };

  const inputClass = cn(
    "w-full rounded-md border bg-bg-surface px-3 py-2 text-sm text-text-primary",
    "border-border-subtle focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary/50"
  );

  const errorClass = "mt-1 text-xs text-accent-danger";

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="rounded-lg border border-border-subtle bg-bg-surface p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-info/10 text-accent-info">
            <FileJson size={20} />
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-text-primary">
                Configurar Stats API
              </h3>
              <p className="mt-1 text-xs text-text-secondary">
                Activa automáticamente la API de estadísticas de Rocket League
                editando el archivo de configuración del juego.
              </p>
            </div>

            {/* Port field */}
            <div className="space-y-1">
              <label
                htmlFor="ini-port"
                className="text-xs font-medium text-text-secondary"
              >
                Puerto
              </label>
              <input
                id="ini-port"
                type="number"
                min={1}
                max={65535}
                {...register("port", { valueAsNumber: true })}
                className={inputClass}
              />
              {errors.port && (
                <p className={errorClass}>{errors.port.message}</p>
              )}
            </div>

            {/* Enabled checkbox */}
            <div className="flex items-center gap-3">
              <input
                id="ini-enabled"
                type="checkbox"
                {...register("enabled")}
                className="h-4 w-4 rounded border-border-highlight bg-bg-surface text-accent-primary focus:ring-accent-primary"
              />
              <label
                htmlFor="ini-enabled"
                className="text-sm text-text-secondary"
              >
                Habilitar Stats API
              </label>
            </div>

            <Button
              type="submit"
              variant="secondary"
              size="sm"
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              Configurar RL.ini
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
