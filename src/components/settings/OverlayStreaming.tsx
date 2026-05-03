import { useState, useEffect, useCallback, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Button } from "@/components/ui/Button";
import { Tooltip } from "@/components/ui/Tooltip";
import { useUIStore } from "@/stores/uiStore";
import { cn } from "@/lib/utils";
import { RadioTower, Wifi, WifiOff, Copy, Check, Monitor, ExternalLink } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface OverlayServerStatus {
  running: boolean;
  port: number;
  connected_clients: number;
}

interface OverlayUrl {
  name: string;
  url: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_PORT = 9528;
const POLL_INTERVAL_MS = 3000;
const COPY_FEEDBACK_MS = 2000;

const inputClass = cn(
  "rounded-md border bg-bg-secondary px-3 py-2 text-sm text-text-primary placeholder:text-text-muted",
  "border-border-subtle focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary/50"
);

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function OverlayStreaming() {
  const addToast = useUIStore((s) => s.addToast);

  const [status, setStatus] = useState<OverlayServerStatus | null>(null);
  const [urls, setUrls] = useState<OverlayUrl[]>([]);
  const [port, setPort] = useState<number>(DEFAULT_PORT);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [isToggling, setIsToggling] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isRunning = status?.running ?? false;

  // -----------------------------------------------------------------------
  // Fetch helpers
  // -----------------------------------------------------------------------

  const fetchStatus = useCallback(async () => {
    try {
      const current = await invoke<OverlayServerStatus>("get_overlay_server_status");
      setStatus(current);
      return current;
    } catch {
      // Server may not be responding — not an error worth surfacing as a toast
      return null;
    }
  }, []);

  const fetchUrls = useCallback(async () => {
    try {
      const list = await invoke<OverlayUrl[]>("get_overlay_urls");
      setUrls(list);
    } catch {
      // Silently ignore — overlay URLs aren't critical
    }
  }, []);

  // -----------------------------------------------------------------------
  // Polling
  // -----------------------------------------------------------------------

  useEffect(() => {
    // Initial fetch
    const init = async () => {
      const current = await fetchStatus();
      if (current?.running) {
        await fetchUrls();
      }
      setInitialLoadDone(true);
    };
    init();

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isRunning && initialLoadDone) {
      // Start polling while server is running
      pollRef.current = setInterval(async () => {
        const current = await fetchStatus();
        if (current?.running) {
          await fetchUrls();
        }
      }, POLL_INTERVAL_MS);
    } else {
      // Stop polling when server is stopped
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    }

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [isRunning, initialLoadDone, fetchStatus, fetchUrls]);

  // Clean up copy timer on unmount
  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  // -----------------------------------------------------------------------
  // Handlers
  // -----------------------------------------------------------------------

  const handleStart = useCallback(async () => {
    setIsToggling(true);
    try {
      const result = await invoke<OverlayServerStatus>("start_overlay_server", { port });
      setStatus(result);
      await fetchUrls();
      addToast({ type: "success", title: "Streaming iniciado", message: `Servidor overlay activo en el puerto ${port}.` });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : typeof err === "string" ? err : "Error desconocido";
      addToast({ type: "error", title: "Error al iniciar", message });
    } finally {
      setIsToggling(false);
    }
  }, [port, addToast, fetchUrls]);

  const handleStop = useCallback(async () => {
    setIsToggling(true);
    try {
      await invoke("stop_overlay_server");
      setStatus(null);
      setUrls([]);
      addToast({ type: "success", title: "Streaming detenido", message: "Servidor overlay detenido correctamente." });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : typeof err === "string" ? err : "Error desconocido";
      addToast({ type: "error", title: "Error al detener", message });
    } finally {
      setIsToggling(false);
    }
  }, [addToast]);

  const handleCopy = useCallback(async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);

      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopiedUrl(null), COPY_FEEDBACK_MS);
    } catch {
      addToast({ type: "error", title: "Error al copiar", message: "No se pudo copiar al portapapeles." });
    }
  }, [addToast]);

  const handlePortChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    const parsed = raw === "" ? DEFAULT_PORT : Number(raw);
    // Clamp to valid port range
    setPort(Math.max(1, Math.min(65535, parsed)));
  }, []);

  // -----------------------------------------------------------------------
  // Derived state
  // -----------------------------------------------------------------------

  const connectedClients = status?.connected_clients ?? 0;
  const activePort = status?.port ?? port;

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return (
    <div className="rounded-lg border border-border-subtle bg-bg-tertiary p-4">
      {/* ---- Header ---- */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {/* Status dot */}
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span
                className={cn(
                  "absolute inline-flex h-full w-full rounded-full",
                  isRunning ? "bg-accent-primary" : "bg-text-muted"
                )}
              />
              {isRunning && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-primary opacity-75" />
              )}
            </span>

            <RadioTower size={18} className={isRunning ? "text-accent-primary" : "text-text-secondary"} />
            <h4 className="text-sm font-semibold text-text-primary">
              {isRunning ? "Streaming activo" : "Streaming OBS"}
            </h4>

            {/* Tooltip */}
            <Tooltip content="Transmite datos en vivo a OBS Studio mediante overlays de navegador locales.">
              <Monitor size={14} className="cursor-help text-text-muted hover:text-text-secondary transition-colors" />
            </Tooltip>
          </div>

          <p className="mt-1 text-xs text-text-tertiary">
            {isRunning
              ? `Servidor overlay corriendo en el puerto ${activePort}. ${connectedClients > 0 ? `${connectedClients} cliente(s) conectado(s).` : "Esperando conexiones..."}`
              : "Inicia el servidor local para que OBS Studio capture los datos de tus partidas en tiempo real."}
          </p>
        </div>

        {/* Toggle button */}
        <Button
          variant={isRunning ? "secondary" : "primary"}
          size="sm"
          onClick={isRunning ? handleStop : handleStart}
          isLoading={isToggling}
          disabled={isToggling}
          leftIcon={isRunning ? WifiOff : Wifi}
          className="shrink-0"
        >
          {isRunning ? "Detener" : "Iniciar streaming"}
        </Button>
      </div>

      {/* ---- Port input (shown when stopped) ---- */}
      {!isRunning && (
        <div className="mt-3 flex items-center gap-2">
          <label htmlFor="overlay-port" className="text-xs font-medium text-text-secondary shrink-0">
            Puerto:
          </label>
          <input
            id="overlay-port"
            type="text"
            inputMode="numeric"
            value={port}
            onChange={handlePortChange}
            disabled={isToggling}
            className={cn(inputClass, "w-24 text-center")}
            placeholder="9528"
          />
          <p className="text-xs text-text-muted">Puerto del servidor local (por defecto 9528)</p>
        </div>
      )}

      {/* ---- Connected clients + URLs (shown when running) ---- */}
      {isRunning && (
        <div className="mt-4 space-y-3">
          {/* Client count */}
          <div className="flex items-center gap-2">
            <Wifi
              size={14}
              className={cn(connectedClients > 0 ? "text-accent-primary" : "text-text-muted")}
            />
            <span className="text-xs text-text-secondary">
              Clientes conectados:{" "}
              <span className={cn("font-semibold", connectedClients > 0 ? "text-accent-primary" : "text-text-tertiary")}>
                {connectedClients}
              </span>
            </span>
          </div>

          {/* URL list */}
          {urls.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-text-secondary">URLs de overlay</p>
              <div className="space-y-1.5">
                {urls.map((item) => {
                  const isCopied = copiedUrl === item.url;
                  return (
                    <div
                      key={item.url}
                      className="flex items-center gap-2 rounded-md border border-border-subtle bg-bg-secondary px-3 py-2"
                    >
                      <span className="flex-1 min-w-0 text-xs font-medium text-text-secondary truncate">
                        {item.name}
                      </span>
                      <code className="max-w-[240px] truncate text-xs text-text-tertiary select-all">
                        {item.url}
                      </code>
                      <Tooltip content={isCopied ? "Copiado!" : "Copiar URL"}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(item.url)}
                          leftIcon={isCopied ? Check : Copy}
                          className={cn(
                            "h-7 px-2 shrink-0",
                            isCopied && "text-accent-primary"
                          )}
                        >
                          {isCopied ? "Copiado!" : "Copiar"}
                        </Button>
                      </Tooltip>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Fallback when no URLs yet */}
          {urls.length === 0 && (
            <p className="text-xs text-text-muted italic">Cargando URLs de overlay...</p>
          )}
        </div>
      )}

      {/* ---- Info box: how to use with OBS ---- */}
      <div className="mt-4 rounded-md bg-bg-secondary p-3 text-xs text-text-secondary">
        <div className="flex items-center gap-1.5 mb-1">
          <ExternalLink size={12} className="text-accent-info shrink-0" />
          <p className="font-medium text-accent-info">Como usar con OBS Studio:</p>
        </div>
        <ol className="list-decimal pl-4 space-y-0.5 text-text-tertiary">
          <li>Inicia el servidor de streaming con el boton de arriba.</li>
          <li>Abre OBS Studio y agrega una nueva fuente de tipo <strong>Navegador</strong>.</li>
          <li>Copia la URL del overlay que quieras mostrar y pegala en el campo <strong>URL</strong> de la fuente.</li>
          <li>Ajusta la anchura y altura segun el diseno del overlay.</li>
          <li>Asegurate de que el puerto ({activePort}) no este bloqueado por tu firewall local.</li>
        </ol>
      </div>
    </div>
  );
}
