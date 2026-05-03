import { Rocket } from 'lucide-react'

interface StepProps { onNext: () => void }

export default function Step1({ onNext }: StepProps) {
  return (
    <div className="text-center">
      <Rocket className="w-16 h-16 text-blue-500 mx-auto mb-8" />
      <h1 className="text-3xl font-bold text-white mb-4">
        Bienvenido a RL Stats Companion
      </h1>
      <p className="text-gray-400 text-lg max-w-md mx-auto mb-12">
        Tu terminal de rendimiento personal para Rocket League. 
        Analiza tus partidas en tiempo real y descubre patrones en tu desempeño.
      </p>
      <button onClick={onNext} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors">
        Comenzar
      </button>
    </div>
  )
}
