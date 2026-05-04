import { CheckCircle } from "lucide-react";

interface StepProps { onComplete: () => void }

export default function Step4({ onComplete }: StepProps) {
  return (
    <div className="text-center animate-fade-in">
      <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-accent-success-subtle">
        <CheckCircle className="h-10 w-10 text-accent-success" />
      </div>
      <h2 className="font-display text-2xl font-bold text-text-primary mb-4">Todo listo!</h2>
      <p className="text-text-secondary max-w-md mx-auto mb-12 leading-relaxed">
        Ahora abre Rocket League y la app comenzara a detectar tus partidas automaticamente.
      </p>
      <button
        onClick={onComplete}
        className="bg-gradient-to-r from-accent-primary to-accent-secondary text-white px-12 py-3 rounded-lg font-semibold transition-all duration-200 shadow-level-1 hover:shadow-level-2 hover:brightness-110"
      >
        Empezar a explorar
      </button>
    </div>
  );
}
