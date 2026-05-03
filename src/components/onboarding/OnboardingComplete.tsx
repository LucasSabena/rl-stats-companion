import { CheckCircle } from 'lucide-react'

interface StepProps { onComplete: () => void }

export default function Step4({ onComplete }: StepProps) {
  return (
    <div className="text-center">
      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-8" />
      <h2 className="text-2xl font-bold text-white mb-4">¡Todo listo!</h2>
      <p className="text-gray-400 max-w-md mx-auto mb-12">
        Ahora abre Rocket League y la app comenzará a detectar tus partidas automáticamente.
      </p>
      <button onClick={onComplete} className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-3 rounded-lg font-medium transition-colors">
        Empezar a explorar
      </button>
    </div>
  )
}
