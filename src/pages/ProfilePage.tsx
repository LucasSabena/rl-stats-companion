import { useState, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { PageContainer } from "@/components/layout/PageContainer";
import { RankBadge } from "@/components/tracker/RankBadge";
import { PlaylistCard } from "@/components/tracker/PlaylistCard";
import { CareerStats } from "@/components/tracker/CareerStats";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { ShareModal } from "@/components/share/ShareModal";
import { UserPresetList } from "@/components/profile/UserPresetList";
import { UserPresetEditor } from "@/components/profile/UserPresetEditor";
import {
  useTrackerProfile,
  useRefreshTrackerProfile,
  useFetchTrackerProfile,
} from "@/hooks/useTrackerProfile";
import {
  useUserPresets,
  useSaveUserPreset,
  useDeleteUserPreset,
  useExportPreset,
  useImportPreset,
} from "@/hooks/useUserPresets";
import { cn } from "@/lib/utils";
import { User, RefreshCw, Trophy, Users, Plus, Upload } from "lucide-react";
import type { UserPreset, UserPresetInput, ShareContext, ShareStat } from "@/lib/types";

type TabValue = "profile" | "configs";

export function ProfilePage() {
  const { t, i18n } = useTranslation(["profiles", "presets", "common"]);
  const { data: profile, isLoading } = useTrackerProfile();
  const refreshMutation = useRefreshTrackerProfile();
  const fetchMutation = useFetchTrackerProfile();

  const { data: presets = [], isLoading: presetsLoading } = useUserPresets();
  const savePreset = useSaveUserPreset();
  const deletePreset = useDeleteUserPreset();
  const exportPreset = useExportPreset();
  const importPreset = useImportPreset();

  const [activeTab, setActiveTab] = useState<TabValue>("profile");
  const [editingPreset, setEditingPreset] = useState<UserPreset | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [shareContext, setShareContext] = useState<ShareContext | null>(null);
  const [shareOpen, setShareOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleNew = useCallback(() => {
    setEditingPreset(null);
    setIsCreating(true);
  }, []);

  const handleEdit = useCallback((p: UserPreset) => {
    setEditingPreset(p);
    setIsCreating(true);
  }, []);

  const handleSave = useCallback(
    (input: UserPresetInput) => {
      const payload = editingPreset ? { ...input, id: editingPreset.id } : input;
      savePreset.mutate(payload as UserPresetInput & { id?: number }, {
        onSuccess: () => {
          setIsCreating(false);
          setEditingPreset(null);
        },
      });
    },
    [editingPreset, savePreset]
  );

  const handleCancel = useCallback(() => {
    setIsCreating(false);
    setEditingPreset(null);
  }, []);

  const handleDelete = useCallback(
    (id: number) => {
      if (confirm(t("presets:deleteConfirm"))) {
        deletePreset.mutate(id);
      }
    },
    [deletePreset, t]
  );

  const handleShare = useCallback(
    (preset: UserPreset) => {
      const stats: ShareStat[] = [];
      if (preset.camera) {
        stats.push({ label: "FOV", value: String(preset.camera.fov) });
        stats.push({ label: "Height", value: String(preset.camera.height) });
        stats.push({ label: "Distance", value: String(preset.camera.distance) });
        stats.push({ label: "Stiffness", value: String(preset.camera.stiffness) });
        stats.push({ label: "Swivel Speed", value: String(preset.camera.swivelSpeed) });
        stats.push({ label: "Transition Speed", value: String(preset.camera.transitionSpeed) });
        stats.push({ label: "Ball Cam", value: preset.camera.ballCamera });
        stats.push({ label: "Camera Shake", value: preset.camera.cameraShake });
      }
      if (preset.deadzone) {
        stats.push({ label: "Deadzone Shape", value: preset.deadzone.deadzoneShape });
        stats.push({ label: "Deadzone", value: String(preset.deadzone.deadzone) });
        stats.push({ label: "Dodge Deadzone", value: String(preset.deadzone.dodgeDeadzone) });
        stats.push({ label: "Aerial Sens", value: String(preset.deadzone.aerialSensitivity) });
        stats.push({ label: "Steering Sens", value: String(preset.deadzone.steeringSensitivity) });
      }
      if (preset.controls) {
        stats.push({ label: "Powerslide", value: preset.controls.powerslide });
        stats.push({ label: "Boost", value: preset.controls.boost });
        stats.push({ label: "Air Roll Left", value: preset.controls.airRollLeft });
        stats.push({ label: "Air Roll Right", value: preset.controls.airRollRight });
      }
      if (preset.hardware) {
        stats.push({ label: "Controller", value: preset.hardware.controller });
        stats.push({ label: "Monitor", value: preset.hardware.monitor });
        stats.push({ label: "Headset", value: preset.hardware.headset });
      }

      const ctx: ShareContext = {
        type: "config",
        title: preset.name,
        subtitle: preset.description || undefined,
        stats,
        dateLabel: new Date().toLocaleDateString(i18n.language || "es", { dateStyle: "long" }),
      };
      setShareContext(ctx);
      setShareOpen(true);
    },
    [i18n.language]
  );

  const handleExport = useCallback(
    (preset: UserPreset) => {
      exportPreset.mutate(preset.id, {
        onSuccess: (json) => {
          const blob = new Blob([json], { type: "application/json" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${preset.name.replace(/\s+/g, "_")}_preset.json`;
          a.click();
          URL.revokeObjectURL(url);
        },
      });
    },
    [exportPreset]
  );

  const handleImportClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const json = String(ev.target?.result || "");
        if (json) {
          importPreset.mutate(json);
        }
      };
      reader.readAsText(file);
      e.target.value = "";
    },
    [importPreset]
  );

  return (
    <PageContainer>
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)}>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-text-primary">
            {t("profiles:profilePage.title")}
          </h2>
          <TabsList>
            <TabsTrigger value="profile">{t("profiles:profilePage.title")}</TabsTrigger>
            <TabsTrigger value="configs">{t("presets:title")}</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="profile">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <RefreshCw size={24} className="animate-spin text-text-tertiary" />
            </div>
          )}

          {!isLoading && !profile && (
            <div className="mt-6">
              <EmptyState
                icon={User}
                title={t("profiles:profilePage.notConfigured.title")}
                description={t("profiles:profilePage.notConfigured.description")}
              />
              <div className="mt-4 flex justify-center">
                <Button
                  onClick={() => fetchMutation.mutate()}
                  disabled={fetchMutation.isPending}
                >
                  {fetchMutation.isPending ? (
                    <>
                      <RefreshCw size={16} className="mr-2 animate-spin" />
                      {t("profiles:profilePage.connecting")}
                    </>
                  ) : (
                    t("profiles:profilePage.connect")
                  )}
                </Button>
              </div>
              {fetchMutation.isError && (
                <p className="mt-2 text-center text-sm text-accent-danger">
                  {fetchMutation.error?.message || t("profiles:profilePage.connectionError")}
                </p>
              )}
            </div>
          )}

          {!isLoading && profile && (
            <>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-text-secondary">{profile.username}</span>
                    <span className="rounded bg-surface-elevated px-1.5 py-0.5 text-xs uppercase text-text-tertiary">
                      {profile.platform}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => refreshMutation.mutate()}
                  disabled={refreshMutation.isPending}
                >
                  <RefreshCw
                    size={14}
                    className={cn("mr-1", refreshMutation.isPending && "animate-spin")}
                  />
                  {t("profiles:profilePage.refresh")}
                </Button>
              </div>

              <div className="mt-6 space-y-6">
                <section>
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-text-tertiary">
                    <Trophy size={14} />
                    {t("profiles:profilePage.sections.ranked")}
                  </h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <PlaylistCard name="duel" stats={profile.stats.ranked.duel} />
                    <PlaylistCard name="double" stats={profile.stats.ranked.double} />
                    <PlaylistCard name="standard" stats={profile.stats.ranked.standard} />
                  </div>
                </section>

                {(profile.stats.extra.dropshot || profile.stats.extra.hoops || profile.stats.extra.rumble || profile.stats.extra.snowday) && (
                  <section>
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-text-tertiary">
                      <Users size={14} />
                      {t("profiles:profilePage.sections.extraModes")}
                    </h3>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      <PlaylistCard name="dropshot" stats={profile.stats.extra.dropshot} />
                      <PlaylistCard name="hoops" stats={profile.stats.extra.hoops} />
                      <PlaylistCard name="rumble" stats={profile.stats.extra.rumble} />
                      <PlaylistCard name="snowday" stats={profile.stats.extra.snowday} />
                    </div>
                  </section>
                )}

                {profile.stats.unranked && (
                  <section>
                    <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-tertiary">
                      {t("profiles:profilePage.sections.casual")}
                    </h3>
                    <PlaylistCard name="unranked" stats={profile.stats.unranked} />
                  </section>
                )}

                <section>
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-tertiary">
                    {t("profiles:profilePage.sections.careerStats")}
                  </h3>
                  <CareerStats stats={profile.stats.overview} />
                </section>

                {profile.linkedAccounts.length > 0 && (
                  <section>
                    <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-tertiary">
                      {t("profiles:profilePage.sections.linkedAccounts")}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.linkedAccounts.map((account) => (
                        <span
                          key={`${account.platform}-${account.username}`}
                          className="rounded-md bg-surface-elevated px-2.5 py-1 text-xs text-text-secondary"
                        >
                          <span className="font-medium uppercase text-text-tertiary">{account.platform}</span>{" "}
                          {account.username}
                        </span>
                      ))}
                    </div>
                  </section>
                )}

                {profile.stats.overview.seasonRank && (
                  <section>
                    <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-tertiary">
                      {t("profiles:profilePage.sections.seasonRank")}
                    </h3>
                    <RankBadge rank={profile.stats.overview.seasonRank} size="lg" />
                  </section>
                )}

                {profile.stats.totalMatchesPlayed != null && (
                  <p className="text-center text-xs text-text-tertiary">
                    {t("profiles:profilePage.totalMatches", { count: profile.stats.totalMatchesPlayed.toLocaleString(i18n.language) })}
                  </p>
                )}
              </div>

              {refreshMutation.isError && (
                <p className="mt-4 text-center text-sm text-accent-danger">
                  {t("profiles:profilePage.refreshError", { message: refreshMutation.error?.message || t("profiles:profilePage.refreshErrorFallback") })}
                </p>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="configs">
          <div className="space-y-4">
            {!isCreating ? (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button variant="primary" size="sm" leftIcon={Plus} onClick={handleNew}>
                      {t("presets:newPreset")}
                    </Button>
                    <Button variant="secondary" size="sm" leftIcon={Upload} onClick={handleImportClick}>
                      {t("presets:import")}
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="application/json"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>
                  {presetsLoading && (
                    <RefreshCw size={16} className="animate-spin text-text-tertiary" />
                  )}
                </div>

                <UserPresetList
                  presets={presets}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onShare={handleShare}
                  onExport={handleExport}
                />
              </>
            ) : (
              <div className="rounded-xl border border-border-subtle bg-bg-surface p-6">
                <h3 className="mb-4 text-lg font-semibold text-text-primary">
                  {editingPreset ? t("presets:editPreset") : t("presets:newPreset")}
                </h3>
                <UserPresetEditor
                  preset={editingPreset}
                  onSave={handleSave}
                  onCancel={handleCancel}
                />
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <ShareModal isOpen={shareOpen} onClose={() => setShareOpen(false)} context={shareContext} />
    </PageContainer>
  );
}
