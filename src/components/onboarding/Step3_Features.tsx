import { Activity, Clock, BarChart3 } from 'lucide-react'

interface StepProps { onNext: () => void; onBack: () => void }

const features = [
  { icon: Activity, title: 'Dashboard en Vivo', desc: 'Monitorea cada partida en tiempo real.' },
  { icon: Clock, title: 'Historial de Partidas', desc: 'Accede a tus resultados y estadísticas pasadas.' },
  { icon: BarChart3, title: 'Analíticas de Rendimiento', desc: 'Visualiza tendencias y patrones en tu juego.' },
]

export default function Step3({ onNext, onBack }: StepProps) {
  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-white mb-10">¿Qué ofrece RL Stats Companion?</h2>
      <div className="grid grid-cols-1 gap-6 max-w-md mx-auto mb-12">
        {features.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="flex items-start gap-4 text-left p-4 rounded-lg bg-[#12121a] border border-gray-800">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
              <Icon className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-white font-medium mb-1">{title}</h3>
              <p className="text-sm text-gray-500">{desc}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-4">
        <button onClick={onBack} className="px-6 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
          Atrás
        </button>
        <button onClick={onNext} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-lg font-medium transition-colors">
          Siguiente
        </button>
      </div>
    </div>
  )
}
