import { useState } from 'react'
import { Search, FolderOpen, Gamepad2, Monitor, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react'
import { configureRlIni, detectRlPath } from '@/lib/api'
import { useSettings, useUpdateSettings } from '@/hooks/useSettings'
import { useSettingsStore } from '@/stores/settingsStore'

interface StepProps { onNext: () => void; onBack: () => void }

export default function Step2({ onNext, onBack }: StepProps) {
  const [detecting, setDetecting] = useState(false)
  const [detectedPath, setDetectedPath] = useState<string | null>(null)
  const [platform, setPlatform] = useState<'steam' | 'epic' | 'auto' | 'manual' | null>(null)
  const [error, setError] = useState<string | null>(null)

  const { data: settings } = useSettings()
  const updateSettings = useUpdateSettings()
  const setRlPath = useSettingsStore((s) => s.setRlPath)

  async function handleAutoDetect(source: 'steam' | 'epic' | 'auto') {
    setDetecting(true)
    setPlatform(source)
    setError(null)
    setDetectedPath(null)

    try {
      await configureRlIni()
      const paths = await detectRlPath()

      if (paths.length > 0) {
        const path = paths[0]
        setDetectedPath(path)
        setRlPath(path)
        if (settings) {
          await updateSettings.mutateAsync({
            ...settings,
            rlPath: path,
            platform: source === 'steam' || source === 'epic' ? source : settings.platform,
          })
        }
      } else {
        setError('No se detectó la instalación automáticamente. Intentá buscar manualmente.')
      }
    } catch {
      setError('No se detectó la instalación automáticamente. Intentá buscar manualmente.')
    } finally {
      setDetecting(false)
    }
  }

  const canProceed = detectedPath !== null

  return (
    <div className="text-center">
      <Search className="w-16 h-16 text-blue-500 mx-auto mb-8" />
      <h2 className="text-2xl font-bold text-white mb-4">Encontrar Rocket League</h2>
      <p className="text-gray-400 max-w-md mx-auto mb-10 leading-relaxed">
        Buscamos tu instalación de Rocket League para configurar automáticamente la API de estadísticas.
      </p>

      {/* 2x2 Grid of options */}
      <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-8">
        {/* Card 1 - Steam */}
        <button
          onClick={() => handleAutoDetect('steam')}
          disabled={detecting}
          className="flex flex-col items-center gap-3 p-5 rounded-xl bg-[#12121a] border border-gray-800 hover:border-blue-500/50 hover:bg-[#16162a] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Gamepad2 className="w-8 h-8 text-gray-300" />
          <span className="text-sm font-medium text-white">Steam</span>
        </button>

        {/* Card 2 - Epic Games */}
        <button
          onClick={() => handleAutoDetect('epic')}
          disabled={detecting}
          className="flex flex-col items-center gap-3 p-5 rounded-xl bg-[#12121a] border border-gray-800 hover:border-blue-500/50 hover:bg-[#16162a] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Monitor className="w-8 h-8 text-gray-300" />
          <span className="text-sm font-medium text-white">Epic Games</span>
        </button>

        {/* Card 3 - Auto-detect (Recommended) */}
        <button
          onClick={() => handleAutoDetect('auto')}
          disabled={detecting}
          className="flex flex-col items-center gap-3 p-5 rounded-xl bg-blue-500/10 border border-blue-500/30 hover:border-blue-500 hover:bg-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed relative"
        >
          {detecting && platform === 'auto' ? (
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
          ) : (
            <Search className="w-8 h-8 text-blue-400" />
          )}
          <span className="text-sm font-medium text-white">Auto-detectar</span>
          <span className="text-[10px] text-blue-400 uppercase tracking-wider">Recomendado</span>
        </button>

        {/* Card 4 - Manual */}
        <button
          onClick={() => {
            setPlatform('manual')
            setError('Para configurar manualmente, asegurate de que Rocket League esté instalado y ejecuta la app como administrador.')
          }}
          disabled={detecting}
          className="flex flex-col items-center gap-3 p-5 rounded-xl bg-[#12121a] border border-gray-800 hover:border-gray-600 hover:bg-[#16162a] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FolderOpen className="w-8 h-8 text-gray-300" />
          <span className="text-sm font-medium text-white">Manual</span>
        </button>
      </div>

      {/* Detected path feedback */}
      {detectedPath && (
        <div className="flex items-center justify-center gap-2 mb-8 text-green-400">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm truncate max-w-xs">{detectedPath}</span>
        </div>
      )}

      {/* Error / warning */}
      {error && !detectedPath && !detecting && (
        <div className="flex items-center justify-center gap-2 mb-8 text-orange-400">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Loading indicator */}
      {detecting && (
        <div className="flex items-center justify-center gap-2 mb-8 text-blue-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Buscando instalación...</span>
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex justify-center gap-4">
        <button
          onClick={onBack}
          className="px-6 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
        >
          Atrás
        </button>
        <button
          onClick={onNext}
          disabled={!canProceed}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white px-8 py-2.5 rounded-lg font-medium transition-colors"
        >
          Siguiente
        </button>
      </div>
    </div>
  )
}
