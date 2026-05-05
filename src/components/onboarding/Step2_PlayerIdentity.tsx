import { useState } from "react";
import { User } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { useUpdateSettings } from "@/hooks/useSettings";
import { useSettingsStore } from "@/stores/settingsStore";

interface StepProps { onNext: () => void; onBack: () => void }

export default function Step2PlayerIdentity({ onNext, onBack }: StepProps) {
  const { data: settings } = useSettings();
  const updateSettings = useUpdateSettings();
  const storedPlayerName = useSettingsStore((s) => s.playerName);
  const setPlayerName = useSettingsStore((s) => s.setPlayerName);
  const [playerName, setLocalPlayerName] = useState(storedPlayerName || settings?.playerName || "");
  const [error, setError] = useState("");

  async function handleNext() {
    const trimmed = playerName.trim();
    if (!trimmed) {
      setError("Ingresa tu nombre exacto dentro de Rocket League.");
      return;
    }

    setError("");
    setPlayerName(trimmed);

    await updateSettings.mutateAsync({
      ...(settings ?? {}),
      playerName: trimmed,
      localPrimaryId: settings?.localPrimaryId ?? null,
      autoStart: settings?.autoStart ?? true,
      rlPath: settings?.rlPath ?? null,
      platform: settings?.platform ?? null,
      defaultMatchType: settings?.defaultMatchType ?? "ranked",
      trackerApiKey: settings?.trackerApiKey ?? null,
      trackerPlatform: settings?.trackerPlatform ?? null,
      trackerUsername: settings?.trackerUsername ?? null,
      trackerAutoRefresh: settings?.trackerAutoRefresh ?? true,
      trackerRefreshIntervalMin: settings?.trackerRefreshIntervalMin ?? 5,
    });

    onNext();
  }

  return (
    <div className="text-center animate-fade-in">
      <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-accent-primary-subtle">
        <User className="h-10 w-10 text-accent-primary" />
      </div>
      <h2 className="font-display text-2xl font-bold text-text-primary mb-4">Quien sos dentro del juego?</h2>
      <p className="text-text-secondary max-w-md mx-auto mb-8 leading-relaxed">
        Necesitamos tu nombre exacto en Rocket League para identificarte una vez y luego fijar tu PrimaryId automaticamente.
      </p>

      <div className="max-w-md mx-auto mb-8 text-left">
        <label className="mb-2 block text-sm font-medium text-text-primary">Nombre dentro del juego</label>
        <input
          type="text"
          value={playerName}
          onChange={(e) => setLocalPlayerName(e.target.value)}
          placeholder="Ej: Si Locura"
          className="w-full rounded-lg border border-border-subtle bg-bg-panel px-4 py-3 text-text-primary placeholder:text-text-muted focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-[var(--color-ring)] transition-colors"
        />
        <p className="mt-2 text-xs text-text-tertiary">
          Si mas adelante cambias de nick, podras actualizarlo desde Ajustes.
        </p>
        {error && <p className="mt-2 text-sm text-accent-danger">{error}</p>}
      </div>

      <div className="flex justify-center gap-3">
        <button
          onClick={onBack}
          className="px-6 py-2.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors font-medium"
        >
          Atras
        </button>
        <button
          onClick={handleNext}
          disabled={updateSettings.isPending}
          className="bg-accent-primary hover:bg-accent-primary-hover disabled:bg-bg-panel disabled:text-text-muted text-white px-8 py-2.5 rounded-lg font-semibold transition-all duration-200"
        >
          {updateSettings.isPending ? "Guardando..." : "Siguiente"}
        </button>
      </div>
    </div>
  );
}
