use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TrackerProfile {
    pub platform: String,
    pub username: String,
    pub avatar_url: Option<String>,
    pub country_code: Option<String>,
    pub linked_accounts: Vec<LinkedAccount>,
    pub stats: TrackerStats,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LinkedAccount {
    pub platform: String,
    pub username: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TrackerStats {
    pub overview: OverviewStats,
    pub ranked: RankedPlaylists,
    pub extra: ExtraPlaylists,
    pub unranked: Option<PlaylistStats>,
    pub total_matches_played: Option<i64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct OverviewStats {
    pub assists: Option<i64>,
    pub goals: Option<i64>,
    pub goal_shot_ratio: Option<f64>,
    pub mvps: Option<i64>,
    pub saves: Option<i64>,
    pub shots: Option<i64>,
    pub wins: Option<i64>,
    pub season_rank: Option<RankInfo>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RankedPlaylists {
    pub duel: Option<PlaylistStats>,
    pub double: Option<PlaylistStats>,
    pub standard: Option<PlaylistStats>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ExtraPlaylists {
    pub dropshot: Option<PlaylistStats>,
    pub hoops: Option<PlaylistStats>,
    pub rumble: Option<PlaylistStats>,
    pub snowday: Option<PlaylistStats>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PlaylistStats {
    pub rank: Option<RankInfo>,
    pub mmr: Option<i64>,
    pub matches_played: Option<i64>,
    pub win_streak: Option<i64>,
    pub lose_streak: Option<i64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RankInfo {
    pub tier: RankTier,
    pub division: RankDivision,
    pub image_url: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RankTier {
    pub index: i32,
    pub name: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RankDivision {
    pub index: i32,
    pub name: String,
}
