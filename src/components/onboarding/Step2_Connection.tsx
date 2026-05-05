import { Plug2 } from "lucide-react";

interface StepProps { onNext: () => void; onBack: () => void }

export default function Step2({ onNext, onBack }: StepProps) {
  return (
    <div className="text-center animate-fade-in">
      <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-accent-success-subtle">
        <Plug2 className="h-10 w-10 text-accent-success" />
      </div>
      <h2 className="font-display text-2xl font-bold text-text-primary mb-4">Conexion Local</h2>
      <p className="text-text-secondary max-w-md mx-auto mb-8 leading-relaxed">
        La app se conecta directamente al stream de datos de Rocket League en tu PC
        mediante una conexion TCP local en el puerto <span className="text-accent-primary font-mono font-semibold">49123</span>.
      </p>
      <div className="bg-bg-panel rounded-xl p-6 max-w-md mx-auto mb-12 text-left border border-border-subtle">
        <h3 className="font-display text-sm font-semibold text-text-primary uppercase mb-3">Como funciona</h3>
        <ul className="space-y-3 text-sm text-text-secondary">
          <li className="flex items-start gap-2">
            <span className="text-accent-success mt-0.5 font-bold">&#10003;</span>
            Rocket League envia eventos en tiempo real por el puerto 49123.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent-success mt-0.5 font-bold">&#10003;</span>
            La app escucha estos eventos y los procesa localmente.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent-success mt-0.5 font-bold">&#10003;</span>
            Todos los datos se almacenan solo en tu PC — nada sale a internet.
          </li>
        </ul>
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
          Entendido
        </button>
      </div>
    </div>
  );
}
