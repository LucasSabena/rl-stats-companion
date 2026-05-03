import { PageContainer } from "@/components/layout/PageContainer";
import { SettingsPanel } from "@/components/settings/SettingsPanel";
import { IniHelper } from "@/components/settings/IniHelper";
import { DataManagement } from "@/components/settings/DataManagement";
import { UpdateChecker } from "@/components/settings/UpdateChecker";
import { OverlayToggle } from "@/components/settings/OverlayToggle";
import { TrackerSetup } from "@/components/settings/TrackerSetup";

export function SettingsPage() {
  return (
    <PageContainer>
      <h2 className="text-2xl font-bold text-text-primary">Ajustes</h2>

      <div className="space-y-8">
        <section>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-tertiary">Modo overlay</h3>
          <OverlayToggle />
        </section>

        <section>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-tertiary">General</h3>
          <SettingsPanel />
        </section>

        <section>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-tertiary">Juego</h3>
          <IniHelper />
        </section>

        <section>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-tertiary">Tracker Network</h3>
          <TrackerSetup />
        </section>

        <section>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-tertiary">Datos</h3>
          <DataManagement />
        </section>

        <section>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-tertiary">Actualizaciones</h3>
          <UpdateChecker />
        </section>
      </div>
    </PageContainer>
  );
}
