import { Rocket } from "lucide-react";

interface StepProps { onNext: () => void }

export default function Step1({ onNext }: StepProps) {
  return (
    <div className="text-center animate-fade-in">
      <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)]">
        <Rocket className="h-10 w-10 text-white" />
      </div>
      <h1 className="font-display text-3xl font-bold text-text-primary mb-4">
        Bienvenido a RL Stats Companion
      </h1>
      <p className="text-text-secondary text-lg max-w-md mx-auto mb-12 leading-relaxed">
        Tu terminal de rendimiento personal para Rocket League.
        Analiza tus partidas en tiempo real y descubre patrones en tu desempeño.
      </p>
      <button
        onClick={onNext}
        className="bg-accent-primary hover:bg-accent-primary-hover text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 shadow-level-1 hover:shadow-glow-blue"
      >
        Comenzar
      </button>
    </div>
  );
}
