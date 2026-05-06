import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation("settings");

  return (
    <PageContainer>
      <div className="space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-border-subtle">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-primary-subtle">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent-primary"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-text-primary">{t("pageTitle")}</h2>
            <p className="text-xs text-text-tertiary">{t("pageDescription")}</p>
          </div>
        </div>

        <div className="columns-1 gap-6 lg:columns-2">
          <section className="mb-6 break-inside-avoid">
            <div className="mb-3 flex items-center gap-2">
              <div className="h-px flex-1 bg-border-subtle" />
              <h3 className="text-xs font-semibold uppercase tracking-widest text-text-tertiary">{t("pageSections.profiles")}</h3>
              <div className="h-px flex-1 bg-border-subtle" />
            </div>
            <ProfileManagement />
          </section>

          <section className="mb-6 break-inside-avoid">
            <div className="mb-3 flex items-center gap-2">
              <div className="h-px flex-1 bg-border-subtle" />
              <h3 className="text-xs font-semibold uppercase tracking-widest text-text-tertiary">{t("pageSections.streamingOBS")}</h3>
              <div className="h-px flex-1 bg-border-subtle" />
            </div>
            <OverlayStreaming />
          </section>

          <section className="mb-6 break-inside-avoid">
            <div className="mb-3 flex items-center gap-2">
              <div className="h-px flex-1 bg-border-subtle" />
              <h3 className="text-xs font-semibold uppercase tracking-widest text-text-tertiary">{t("pageSections.overlayInGame")}</h3>
              <div className="h-px flex-1 bg-border-subtle" />
            </div>
            <OverlayConfig />
          </section>

          <section className="mb-6 break-inside-avoid">
            <div className="mb-3 flex items-center gap-2">
              <div className="h-px flex-1 bg-border-subtle" />
              <h3 className="text-xs font-semibold uppercase tracking-widest text-text-tertiary">{t("pageSections.general")}</h3>
              <div className="h-px flex-1 bg-border-subtle" />
            </div>
            <SettingsPanel />
          </section>

          <section className="mb-6 break-inside-avoid">
            <div className="mb-3 flex items-center gap-2">
              <div className="h-px flex-1 bg-border-subtle" />
              <h3 className="text-xs font-semibold uppercase tracking-widest text-text-tertiary">{t("pageSections.game")}</h3>
              <div className="h-px flex-1 bg-border-subtle" />
            </div>
            <IniHelper />
          </section>

          <section className="mb-6 break-inside-avoid">
            <div className="mb-3 flex items-center gap-2">
              <div className="h-px flex-1 bg-border-subtle" />
              <h3 className="text-xs font-semibold uppercase tracking-widest text-text-tertiary">{t("pageSections.trackerNetwork")}</h3>
              <div className="h-px flex-1 bg-border-subtle" />
            </div>
            <TrackerSetup />
          </section>

          <section className="mb-6 break-inside-avoid">
            <div className="mb-3 flex items-center gap-2">
              <div className="h-px flex-1 bg-border-subtle" />
              <h3 className="text-xs font-semibold uppercase tracking-widest text-text-tertiary">{t("pageSections.data")}</h3>
              <div className="h-px flex-1 bg-border-subtle" />
            </div>
            <DataManagement />
          </section>

          <section className="mb-6 break-inside-avoid">
            <div className="mb-3 flex items-center gap-2">
              <div className="h-px flex-1 bg-border-subtle" />
              <h3 className="text-xs font-semibold uppercase tracking-widest text-text-tertiary">{t("pageSections.updates")}</h3>
              <div className="h-px flex-1 bg-border-subtle" />
            </div>
            <UpdateChecker />
          </section>
        </div>
      </div>
    </PageContainer>
  );
}