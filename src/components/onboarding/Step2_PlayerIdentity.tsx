import { useState } from "react";
import { User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSettings } from "@/hooks/useSettings";
import { useUpdateSettings } from "@/hooks/useSettings";
import { useSettingsStore } from "@/stores/settingsStore";

interface StepProps { onNext: () => void; onBack: () => void }

export default function Step2PlayerIdentity({ onNext, onBack }: StepProps) {
  const { t } = useTranslation(["onboarding", "common"]);
  const { data: settings } = useSettings();
  const updateSettings = useUpdateSettings();
  const storedPlayerName = useSettingsStore((s) => s.playerName);
  const setPlayerName = useSettingsStore((s) => s.setPlayerName);
  const [playerName, setLocalPlayerName] = useState(storedPlayerName || settings?.playerName || "");
  const [error, setError] = useState("");

  async function handleNext() {
    const trimmed = playerName.trim();
    if (!trimmed) {
      setError(t('onboarding:identity.error'));
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
      <h2 className="font-display text-2xl font-bold text-text-primary mb-4">{t('onboarding:identity.title')}</h2>
      <p className="text-text-secondary max-w-md mx-auto mb-8 leading-relaxed">
        {t('onboarding:identity.description')}
      </p>

      <div className="max-w-md mx-auto mb-8 text-left">
        <label className="mb-2 block text-sm font-medium text-text-primary">{t('onboarding:identity.playerNameLabel')}</label>
        <input
          type="text"
          value={playerName}
          onChange={(e) => setLocalPlayerName(e.target.value)}
          placeholder={t('onboarding:identity.playerNamePlaceholder')}
          className="w-full rounded-lg border border-border-subtle bg-bg-panel px-4 py-3 text-text-primary placeholder:text-text-muted focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-[var(--color-ring)] transition-colors"
        />
        <p className="mt-2 text-xs text-text-tertiary">
          {t('onboarding:identity.hint')}
        </p>
        {error && <p className="mt-2 text-sm text-accent-danger">{error}</p>}
      </div>

      <div className="flex justify-center gap-3">
        <button
          onClick={onBack}
          className="px-6 py-2.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors font-medium"
        >
          {t('onboarding:identity.back')}
        </button>
        <button
          onClick={handleNext}
          disabled={updateSettings.isPending}
          className="bg-accent-primary hover:bg-accent-primary-hover disabled:bg-bg-panel disabled:text-text-muted text-white px-8 py-2.5 rounded-lg font-semibold transition-all duration-200"
        >
          {updateSettings.isPending ? t('onboarding:identity.saving') : t('onboarding:identity.next')}
        </button>
      </div>
    </div>
  );
}