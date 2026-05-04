import { Activity, Clock, BarChart3 } from "lucide-react";

interface StepProps { onNext: () => void; onBack: () => void }

const features = [
  { icon: Activity, title: "Dashboard en Vivo", desc: "Monitorea cada partida en tiempo real." },
  { icon: Clock, title: "Historial de Partidas", desc: "Accede a tus resultados y estadisticas pasadas." },
  { icon: BarChart3, title: "Analiticas de Rendimiento", desc: "Visualiza tendencias y patrones en tu juego." },
];

export default function Step3({ onNext, onBack }: StepProps) {
  return (
    <div className="text-center animate-fade-in">
      <h2 className="font-display text-2xl font-bold text-text-primary mb-10">Que ofrece RL Stats?</h2>
      <div className="grid grid-cols-1 gap-4 max-w-md mx-auto mb-12">
        {features.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="flex items-start gap-4 text-left p-4 rounded-xl bg-bg-tertiary border border-border-subtle">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-primary-subtle">
              <Icon className="h-5 w-5 text-accent-primary" />
            </div>
            <div>
              <h3 className="text-text-primary font-semibold mb-1">{title}</h3>
              <p className="text-sm text-text-tertiary">{desc}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-3">
        <button
          onClick={onBack}
          className="px-6 py-2.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors font-medium"
        >
          Atras
        </button>
        <button
          onClick={onNext}
          className="bg-accent-primary hover:bg-accent-primary-hover text-white px-8 py-2.5 rounded-lg font-semibold transition-all duration-200"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
