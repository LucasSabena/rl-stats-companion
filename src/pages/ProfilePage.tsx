import { PageContainer } from "@/components/layout/PageContainer";
import { RankBadge } from "@/components/tracker/RankBadge";
import { PlaylistCard } from "@/components/tracker/PlaylistCard";
import { CareerStats } from "@/components/tracker/CareerStats";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { useTrackerProfile, useRefreshTrackerProfile, useFetchTrackerProfile } from "@/hooks/useTrackerProfile";
import { cn } from "@/lib/utils";
import { User, RefreshCw, Trophy, Users } from "lucide-react";
import { useTranslation } from "react-i18next";

export function ProfilePage() {
  const { t, i18n } = useTranslation(["profiles", "common"]);
  const { data: profile, isLoading } = useTrackerProfile();
  const refreshMutation = useRefreshTrackerProfile();
  const fetchMutation = useFetchTrackerProfile();

  if (isLoading) {
    return (
      <PageContainer>
        <h2 className="text-2xl font-bold text-text-primary">{t("profiles:profilePage.title")}</h2>
        <div className="mt-6 flex items-center justify-center py-12">
          <RefreshCw size={24} className="animate-spin text-text-tertiary" />
        </div>
      </PageContainer>
    );
  }

  if (!profile) {
    return (
      <PageContainer>
        <h2 className="text-2xl font-bold text-text-primary">{t("profiles:profilePage.title")}</h2>
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
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="flex items-start justify-between">
        <div>
      <h2 className="text-2xl font-bold text-text-primary">
        {t("profiles:profilePage.title")}
      </h2>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-sm text-text-secondary">{profile.username}</span>
            <span className="text-xs rounded bg-surface-elevated px-1.5 py-0.5 text-text-tertiary uppercase">
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
        {/* Ranked playlists */}
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

        {/* Extra playlists */}
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

        {/* Unranked */}
        {profile.stats.unranked && (
          <section>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-tertiary">
              {t("profiles:profilePage.sections.casual")}
            </h3>
            <PlaylistCard name="unranked" stats={profile.stats.unranked} />
          </section>
        )}

        {/* Career stats */}
        <section>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-tertiary">
            {t("profiles:profilePage.sections.careerStats")}
          </h3>
          <CareerStats stats={profile.stats.overview} />
        </section>

        {/* Linked accounts */}
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
                  <span className="font-medium uppercase text-text-tertiary">{account.platform}</span>
                  {" "}
                  {account.username}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Season rank */}
        {profile.stats.overview.seasonRank && (
          <section>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-tertiary">
              {t("profiles:profilePage.sections.seasonRank")}
            </h3>
            <RankBadge rank={profile.stats.overview.seasonRank} size="lg" />
          </section>
        )}

        {/* Total matches */}
        {profile.stats.totalMatchesPlayed != null && (
          <p className="text-xs text-text-tertiary text-center">
            {t("profiles:profilePage.totalMatches", { count: profile.stats.totalMatchesPlayed.toLocaleString(i18n.language) })}
          </p>
        )}
      </div>

      {refreshMutation.isError && (
        <p className="mt-4 text-center text-sm text-accent-danger">
          {t("profiles:profilePage.refreshError", { message: refreshMutation.error?.message || t("profiles:profilePage.refreshErrorFallback") })}
        </p>
      )}
    </PageContainer>
  );
}
