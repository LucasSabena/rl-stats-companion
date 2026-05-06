import { Activity, Clock, BarChart3 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface StepProps { onNext: () => void; onBack: () => void }

export default function Step3({ onNext, onBack }: StepProps) {
  const { t } = useTranslation(["onboarding", "common"]);

  const features = [
    { icon: Activity, title: t('onboarding:features.liveDashboard.title'), desc: t('onboarding:features.liveDashboard.desc') },
    { icon: Clock, title: t('onboarding:features.matchHistory.title'), desc: t('onboarding:features.matchHistory.desc') },
    { icon: BarChart3, title: t('onboarding:features.analytics.title'), desc: t('onboarding:features.analytics.desc') },
  ];

  return (
    <div className="text-center animate-fade-in">
      <h2 className="font-display text-2xl font-bold text-text-primary mb-10">{t('onboarding:features.title')}</h2>
      <div className="grid grid-cols-1 gap-4 max-w-md mx-auto mb-12">
        {features.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="flex items-start gap-4 text-left p-4 rounded-xl bg-bg-panel border border-border-subtle">
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
          {t('onboarding:features.back')}
        </button>
        <button
          onClick={onNext}
          className="bg-accent-primary hover:bg-accent-primary-hover text-white px-8 py-2.5 rounded-lg font-semibold transition-all duration-200"
        >
          {t('onboarding:features.next')}
        </button>
      </div>
    </div>
  );
}