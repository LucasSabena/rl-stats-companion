import { useState } from "react";
import { useSettings, useUpdateSettings } from "@/hooks/useSettings";
import { useFetchTrackerProfile } from "@/hooks/useTrackerProfile";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CheckCircle, XCircle, RefreshCw, Link, ExternalLink, Eye, EyeOff, Info } from "lucide-react";
import type { AppSettings, TrackerPlatform } from "@/lib/types";

const PLATFORMS: { value: TrackerPlatform; label: string }[] = [
  { value: "epic", label: "Epic Games" },
  { value: "steam", label: "Steam" },
  { value: "psn", label: "PlayStation" },
  { value: "xbl", label: "Xbox Live" },
  { value: "switch", label: "Nintendo Switch" },
];

function parseProfileUrl(url: string): { platform: TrackerPlatform | null; username: string | null } {
  const trimmed = url.trim();
  const match = trimmed.match(
    /rocketleague\.tracker\.network\/rocket-league\/profile\/(epic|steam|psn|xbl|switch)\/([^/\s?#]+)/i
  );
  if (!match) return { platform: null, username: null };
  const platform = match[1].toLowerCase() as TrackerPlatform;
  const username = decodeURIComponent(match[2]);
  return { platform, username };
}

export function TrackerSetup() {
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();
  const fetchProfile = useFetchTrackerProfile();

  const [profileUrl, setProfileUrl] = useState("");
  const [localKey, setLocalKey] = useState("");
  const [localPlatform, setLocalPlatform] = useState<TrackerPlatform>("epic");
  const [localUsername, setLocalUsername] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [testStatus, setTestStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [testError, setTestError] = useState("");
  const [parsed, setParsed] = useState(false);

  if (isLoading) return null;

  const apiKey = settings?.trackerApiKey ?? "";
  const platform = (settings?.trackerPlatform as TrackerPlatform) ?? "epic";
  const username = settings?.trackerUsername ?? "";

  const profileLink = platform && username
    ? `https://rocketleague.tracker.network/rocket-league/profile/${platform}/${encodeURIComponent(username)}/overview`
    : null;

  function handleUrlChange(url: string) {
    setProfileUrl(url);
    const result = parseProfileUrl(url);
    if (result.platform && result.username) {
      setLocalPlatform(result.platform);
      setLocalUsername(result.username);
      setParsed(true);
    } else {
      setParsed(false);
    }
  }

  async function handleSave() {
    await updateSettings.mutateAsync({
      ...(settings ?? {}),
      playerName: settings?.playerName ?? "",
      autoStart: settings?.autoStart ?? true,
      rlPath: settings?.rlPath ?? null,
      platform: settings?.platform ?? null,
      defaultMatchType: settings?.defaultMatchType ?? "ranked",
      trackerApiKey: localKey || apiKey,
      trackerPlatform: localPlatform || platform,
      trackerUsername: localUsername || username,
    } as AppSettings);
  }

  async function handleTestConnection() {
    setTestStatus("loading");
    setTestError("");
    await handleSave();
    try {
      await fetchProfile.mutateAsync();
      setTestStatus("success");
    } catch (err) {
      setTestStatus("error");
      setTestError(err instanceof Error ? err.message : "Error de conexion");
    }
  }

  return (
    <div className="rounded-lg border border-border-subtle bg-bg-secondary p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-text-primary flex items-center gap-2">
            <Link size={14} className="text-text-tertiary" />
            Tracker Network
          </h4>
          <p className="mt-1 text-xs text-text-tertiary">
            Vincula tu perfil de tracker.network para ver MMR, rangos y estadisticas.
          </p>
        </div>
        {testStatus === "success" && (
          <Badge variant="live" className="gap-1 bg-accent-secondary/20 text-accent-secondary">
            <CheckCircle size={12} />
            Conectado
          </Badge>
        )}
        {testStatus === "error" && (
          <Badge variant="default" className="gap-1 bg-accent-danger/20 text-accent-danger">
            <XCircle size={12} />
            Error
          </Badge>
        )}
      </div>

      <div className="space-y-3">
        {/* Profile URL */}
        <div>
          <label className="mb-1 block text-xs font-medium text-text-tertiary">
            Link del perfil
          </label>
          <input
            type="text"
            value={profileUrl}
            onChange={(e) => handleUrlChange(e.target.value)}
            placeholder="https://rocketleague.tracker.network/rocket-league/profile/steam/tu-nombre/overview"
            className="w-full rounded-md border border-border-subtle bg-bg-primary px-3 py-2 font-mono text-xs text-text-primary placeholder:text-text-tertiary focus:border-accent-primary focus:outline-none"
          />
          <p className="mt-1 text-[10px] text-text-tertiary">
            Anda a{" "}
            <a href="https://rocketleague.tracker.network/" target="_blank" rel="noopener noreferrer" className="text-accent-primary hover:underline">
              rocketleague.tracker.network
            </a>
            , busca tu perfil, y pega el link aca.
          </p>
          {parsed && (
            <p className="mt-1 text-[10px] text-accent-secondary">
              Detectado: {localPlatform.toUpperCase()} / {localUsername}
            </p>
          )}
          {profileUrl && !parsed && (
            <p className="mt-1 text-[10px] text-accent-warning">
              No se pudo extraer plataforma y usuario. Completa abajo manualmente.
            </p>
          )}
        </div>

        {/* API Key */}
        <div>
          <label className="mb-1 block text-xs font-medium text-text-tertiary flex items-center gap-1">
            API Key
            <span className="rounded bg-accent-info/20 px-1 py-px text-[9px] text-accent-info">requerido</span>
          </label>
          <div className="relative">
            <input
              type={showKey ? "text" : "password"}
              value={localKey || apiKey}
              onChange={(e) => setLocalKey(e.target.value)}
              placeholder="XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
              className="w-full rounded-md border border-border-subtle bg-bg-primary px-3 py-2 pr-9 font-mono text-xs text-text-primary placeholder:text-text-tertiary focus:border-accent-primary focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary"
              aria-label={showKey ? "Ocultar" : "Mostrar"}
            >
              {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          <div className="mt-1.5 flex items-start gap-1.5 rounded-md bg-accent-info/10 px-2.5 py-2">
            <Info size={12} className="mt-px shrink-0 text-accent-info" />
            <div className="text-[10px] leading-relaxed text-text-tertiary">
              <p className="font-medium text-text-secondary mb-0.5">Como obtener la API Key:</p>
              <ol className="list-decimal pl-3 space-y-0.5">
                <li>Anda a{" "}
                  <a href="https://tracker.gg/developers" target="_blank" rel="noopener noreferrer" className="text-accent-primary hover:underline">
                    tracker.gg/developers
                  </a>
                </li>
                <li>Hace clic en <strong>Create an app</strong></li>
                <li>Completa nombre, descripcion y URL del proyecto</li>
                <li>Copia la API Key generada</li>
                <li><strong>Importante:</strong> si la app aparece como "not approved", editala y envia para aprobacion (es gratuito para proyectos hobby/open-source)</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-2">
          <div className="h-px flex-1 bg-border-subtle" />
          <span className="text-[10px] text-text-tertiary">o completa manual</span>
          <div className="h-px flex-1 bg-border-subtle" />
        </div>

        {/* Platform */}
        <div>
          <label className="mb-1 block text-xs font-medium text-text-tertiary">Plataforma</label>
          <select
            value={localPlatform || platform}
            onChange={(e) => setLocalPlatform(e.target.value as TrackerPlatform)}
            className="w-full rounded-md border border-border-subtle bg-bg-primary px-3 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
          >
            {PLATFORMS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>

        {/* Username */}
        <div>
          <label className="mb-1 block text-xs font-medium text-text-tertiary">Usuario</label>
          <input
            type="text"
            value={localUsername || username}
            onChange={(e) => setLocalUsername(e.target.value)}
            placeholder="Nombre exacto en el juego"
            className="w-full rounded-md border border-border-subtle bg-bg-primary px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-accent-primary focus:outline-none"
          />
        </div>

        {testError && (
          <p className="rounded-md bg-accent-danger/10 px-3 py-2 text-xs text-accent-danger whitespace-pre-wrap">
            {testError}
          </p>
        )}
        {testStatus === "success" && !testError && (
          <p className="rounded-md bg-accent-secondary/10 px-3 py-2 text-xs text-accent-secondary">
            Perfil vinculado. Tus rangos ya estan en la pagina de Perfil.
          </p>
        )}

        <div className="flex gap-2">
          <Button variant="primary" size="sm" onClick={handleTestConnection} disabled={testStatus === "loading"}>
            {testStatus === "loading" ? <><RefreshCw size={14} className="mr-1.5 animate-spin" />Buscando...</> : "Conectar"}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleSave} disabled={updateSettings.isPending}>
            Guardar
          </Button>
          {profileLink && (
            <Button variant="ghost" size="sm" onClick={() => {
              import("@tauri-apps/plugin-opener").then(({ openUrl }) => openUrl(profileLink));
            }}>
              <ExternalLink size={14} className="mr-1" />
              Abrir en navegador
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
