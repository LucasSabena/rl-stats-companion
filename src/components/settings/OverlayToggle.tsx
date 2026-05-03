import { Button } from "@/components/ui/Button";
import { useToggleOverlay } from "@/hooks/useToggleOverlay";
import { Monitor, MonitorOff } from "lucide-react";

export function OverlayToggle() {
  const { overlayMode, toggle } = useToggleOverlay();

  return (
    <div className="rounded-lg border border-border-subtle bg-bg-tertiary p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {overlayMode ? <MonitorOff size={18} className="text-accent-primary" /> : <Monitor size={18} className="text-text-secondary" />}
            <h4 className="text-sm font-semibold text-text-primary">
              {overlayMode ? "Modo overlay activado" : "Modo normal"}
            </h4>
          </div>
          <p className="mt-1 text-xs text-text-tertiary">
            {overlayMode
              ? "El widget se muestra siempre visible sobre Rocket League. Haz clic en \"Desactivar\" para volver a la ventana completa."
              : "Activa el modo overlay para mostrar un widget compacto y semitransparente siempre encima de Rocket League."}
          </p>
        </div>
        <Button
          variant={overlayMode ? "secondary" : "primary"}
          size="sm"
          onClick={toggle}
          className="shrink-0"
        >
          {overlayMode ? "Desactivar modo overlay" : "Activar modo overlay"}
        </Button>
      </div>

      {overlayMode && (
        <div className="mt-3 rounded-md bg-bg-secondary p-3 text-xs text-text-secondary">
          <p className="font-medium text-accent-info">Consejo:</p>
          <ul className="mt-1 list-disc pl-4 space-y-0.5 text-text-tertiary">
            <li>Pasa el ratón sobre la esquina superior derecha del widget para mostrar el botón de salida.</li>
            <li>El widget oculta la barra de tareas y no se puede minimizar — está diseñado para usarse durante la partida.</li>
            <li>Vuelve a la ventana de ajustes en modo normal para gestionar datos, historial y análisis.</li>
          </ul>
        </div>
      )}
    </div>
  );
}
