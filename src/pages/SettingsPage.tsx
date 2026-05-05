import { PageContainer } from "@/components/layout/PageContainer";
import { SettingsPanel } from "@/components/settings/SettingsPanel";
import { IniHelper } from "@/components/settings/IniHelper";
import { DataManagement } from "@/components/settings/DataManagement";
import { UpdateChecker } from "@/components/settings/UpdateChecker";
import { OverlayConfig } from "@/components/settings/OverlayConfig";
import { OverlayStreaming } from "@/components/settings/OverlayStreaming";
import { TrackerSetup } from "@/components/settings/TrackerSetup";
import { ProfileManagement } from "@/components/settings/ProfileManagement";

export function SettingsPage() {
  return (
    <PageContainer>
      <div className="space-y-8">
        <section>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-tertiary">Perfiles</h3>
          <ProfileManagement />
        </section>

        <section>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-tertiary">Streaming OBS</h3>
          <OverlayStreaming />
        </section>

        <section>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-tertiary">Overlay in-game</h3>
          <OverlayConfig />
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
