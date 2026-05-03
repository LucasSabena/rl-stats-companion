import { useState } from 'react'
import { User } from 'lucide-react'
import { useSettings } from '@/hooks/useSettings'
import { useUpdateSettings } from '@/hooks/useSettings'
import { useSettingsStore } from '@/stores/settingsStore'

interface StepProps { onNext: () => void; onBack: () => void }

export default function Step2PlayerIdentity({ onNext, onBack }: StepProps) {
  const { data: settings } = useSettings()
  const updateSettings = useUpdateSettings()
  const storedPlayerName = useSettingsStore((s) => s.playerName)
  const setPlayerName = useSettingsStore((s) => s.setPlayerName)
  const [playerName, setLocalPlayerName] = useState(storedPlayerName || settings?.playerName || '')
  const [error, setError] = useState('')

  async function handleNext() {
    const trimmed = playerName.trim()
    if (!trimmed) {
      setError('Ingresa tu nombre exacto dentro de Rocket League.')
      return
    }

    setError('')
    setPlayerName(trimmed)

    await updateSettings.mutateAsync({
      ...(settings ?? {}),
      playerName: trimmed,
      localPrimaryId: settings?.localPrimaryId ?? null,
      autoStart: settings?.autoStart ?? true,
      rlPath: settings?.rlPath ?? null,
      platform: settings?.platform ?? null,
      defaultMatchType: settings?.defaultMatchType ?? 'ranked',
      trackerApiKey: settings?.trackerApiKey ?? null,
      trackerPlatform: settings?.trackerPlatform ?? null,
      trackerUsername: settings?.trackerUsername ?? null,
      trackerAutoRefresh: settings?.trackerAutoRefresh ?? true,
      trackerRefreshIntervalMin: settings?.trackerRefreshIntervalMin ?? 5,
    })

    onNext()
  }

  return (
    <div className="text-center">
      <User className="w-16 h-16 text-blue-500 mx-auto mb-8" />
      <h2 className="text-2xl font-bold text-white mb-4">¿Quién sos dentro del juego?</h2>
      <p className="text-gray-400 max-w-md mx-auto mb-8 leading-relaxed">
        Necesitamos tu nombre exacto en Rocket League para identificarte una vez y luego fijar tu `PrimaryId` automaticamente.
      </p>

      <div className="max-w-md mx-auto mb-8 text-left">
        <label className="mb-2 block text-sm font-medium text-gray-300">Nombre dentro del juego</label>
        <input
          type="text"
          value={playerName}
          onChange={(e) => setLocalPlayerName(e.target.value)}
          placeholder="Ej: Si Locura"
          className="w-full rounded-lg border border-gray-800 bg-[#12121a] px-4 py-3 text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none"
        />
        <p className="mt-2 text-xs text-gray-500">
          Si mas adelante cambias de nick, podras actualizarlo desde Ajustes.
        </p>
        {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
      </div>

      <div className="flex justify-center gap-4">
        <button onClick={onBack} className="px-6 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
          Atrás
        </button>
        <button
          onClick={handleNext}
          disabled={updateSettings.isPending}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white px-8 py-2.5 rounded-lg font-medium transition-colors"
        >
          {updateSettings.isPending ? 'Guardando...' : 'Siguiente'}
        </button>
      </div>
    </div>
  )
}
