import { Plug2 } from 'lucide-react'

interface StepProps { onNext: () => void; onBack: () => void }

export default function Step2({ onNext, onBack }: StepProps) {
  return (
    <div className="text-center">
      <Plug2 className="w-16 h-16 text-green-500 mx-auto mb-8" />
      <h2 className="text-2xl font-bold text-white mb-4">Conexión Local</h2>
      <p className="text-gray-400 max-w-md mx-auto mb-8 leading-relaxed">
        La app se conecta directamente al stream de datos de Rocket League en tu PC
        mediante una conexión TCP local en el puerto <span className="text-blue-400 font-mono">49123</span>.
      </p>
      <div className="bg-gray-900 rounded-lg p-6 max-w-md mx-auto mb-12 text-left border border-gray-800">
        <h3 className="text-sm font-semibold text-gray-300 uppercase mb-3">Cómo funciona</h3>
        <ul className="space-y-3 text-sm text-gray-400">
          <li className="flex items-start gap-2">
            <span className="text-green-400 mt-0.5">&#10003;</span>
            Rocket League envía eventos en tiempo real por el puerto 49123.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-400 mt-0.5">&#10003;</span>
            La app escucha estos eventos y los procesa localmente.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-400 mt-0.5">&#10003;</span>
            Todos los datos se almacenan solo en tu PC — nada sale a internet.
          </li>
        </ul>
      </div>
      <div className="flex justify-center gap-4">
        <button onClick={onBack} className="px-6 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
          Atrás
        </button>
        <button onClick={onNext} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-lg font-medium transition-colors">
          Entendido
        </button>
      </div>
    </div>
  )
}
