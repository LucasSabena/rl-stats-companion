use crate::core::metrics::{self, StreakData};
use crate::core::settings::get_settings;
use crate::core::storage::{self, get_conn, MatchSession};
use crate::AppState;
use serde::Deserialize;
use std::collections::HashMap;
use tauri::State;
use tracing::error;

#[derive(Deserialize)]
pub struct AnalyticsPeriod {
    pub days: i32,
}

#[derive(Deserialize)]
pub struct SessionMatchesQuery {
    pub start_time: String,
    pub end_time: String,
}

#[tauri::command]
pub async fn get_analytics(
    state: State<'_, AppState>,
    period: AnalyticsPeriod,
    playlist: Option<String>,
    match_type: Option<String>,
    scope: Option<String>,
) -> Result<serde_json::Value, String> {
    let pool = &state.db_pool;
    let scope_str = scope.as_deref().unwrap_or("team");

    if period.days == 0 {
        return get_session_analytics_inner(state, playlist, match_type, scope).await;
    }

    let end = chrono::Utc::now();
    let start = end - chrono::Duration::days(period.days as i64);
    let start_str = start.format("%Y-%m-%d").to_string();
    let end_str = end.format("%Y-%m-%d").to_string();

    let settings = get_settings(pool).unwrap_or_default();
    let player_names = storage::identity_candidate_names(&settings);

    let is_individual = scope_str == "me";
    let local_id = settings.local_primary_id.as_deref();

    let has_filters = playlist.is_some() || match_type.is_some();
    let rollups = if has_filters || is_individual {
        storage::get_daily_rollups_filtered(
            pool,
            &start_str,
            &end_str,
            local_id,
            &player_names,
            playlist.as_deref(),
            match_type.as_deref(),
            Some(scope_str),
        )
        .map_err(|e| e.to_string())?
    } else {
        storage::get_daily_rollups(pool, &start_str, &end_str).map_err(|e| e.to_string())?
    };

    let (
        total_matches,
        wins,
        losses,
        total_goals,
        total_conceded,
        total_shots,
        total_saves,
        total_demos,
        total_assists,
        avg_duration,
        avg_score,
        peak_speed,
        streak,
    ) = if is_individual {
        if let Some(local_id_str) = local_id {
            let summary = storage::get_analytics_summary_for_identity(
                pool,
                local_id_str,
                &start_str,
                &end_str,
                playlist.as_deref(),
                match_type.as_deref(),
            )
            .map_err(|e| e.to_string())?;
            let streak_data = metrics::calculate_streaks(
                pool,
                local_id_str,
                &start_str,
                &end_str,
                playlist.as_deref(),
                match_type.as_deref(),
            )
            .unwrap_or(StreakData {
                best_streak: 0,
                current_streak: 0,
            });
            (
                summary.total_matches,
                summary.wins,
                summary.losses,
                summary.total_goals,
                summary.total_conceded,
                summary.total_shots,
                summary.total_saves,
                summary.total_demos,
                summary.total_assists,
                summary.avg_duration,
                summary.avg_score,
                summary.peak_speed,
                streak_data,
            )
        } else {
            // Individual scope without local_primary_id: compute from individual rollups
            let total_matches: i32 = rollups.iter().map(|r| r.matches_played).sum();
            let wins: i32 = rollups.iter().map(|r| r.wins).sum();
            let losses: i32 = rollups.iter().map(|r| r.losses).sum();
            let total_goals: i32 = rollups.iter().map(|r| r.goals_scored).sum();
            let total_conceded: i32 = rollups.iter().map(|r| r.goals_conceded).sum();
            let total_shots: i32 = rollups.iter().map(|r| r.total_shots).sum();
            let total_saves: i32 = rollups.iter().map(|r| r.total_saves).sum();
            let total_demos: i32 = rollups.iter().map(|r| r.total_demos).sum();
            let total_assists: i32 = rollups.iter().map(|r| r.total_assists).sum();

            let avg_duration: f64 = if total_matches > 0 {
                rollups
                    .iter()
                    .map(|r| r.avg_duration_seconds as f64 * r.matches_played as f64)
                    .sum::<f64>()
                    / total_matches as f64
            } else {
                0.0
            };

            let avg_score: f64 = if total_matches > 0 {
                rollups
                    .iter()
                    .map(|r| r.avg_score as f64 * r.matches_played as f64)
                    .sum::<f64>()
                    / total_matches as f64
            } else {
                0.0
            };

            (
                total_matches,
                wins,
                losses,
                total_goals,
                total_conceded,
                total_shots,
                total_saves,
                total_demos,
                total_assists,
                avg_duration,
                avg_score,
                0.0,
                StreakData {
                    best_streak: 0,
                    current_streak: 0,
                },
            )
        }
    } else {
        let total_matches: i32 = rollups.iter().map(|r| r.matches_played).sum();
        let wins: i32 = rollups.iter().map(|r| r.wins).sum();
        let losses: i32 = rollups.iter().map(|r| r.losses).sum();
        let total_goals: i32 = rollups.iter().map(|r| r.goals_scored).sum();
        let total_conceded: i32 = rollups.iter().map(|r| r.goals_conceded).sum();
        let total_shots: i32 = rollups.iter().map(|r| r.total_shots).sum();
        let total_saves: i32 = rollups.iter().map(|r| r.total_saves).sum();
        let total_demos: i32 = rollups.iter().map(|r| r.total_demos).sum();
        let total_assists: i32 = rollups.iter().map(|r| r.total_assists).sum();

        let avg_duration: f64 = if total_matches > 0 {
            rollups
                .iter()
                .map(|r| r.avg_duration_seconds as f64 * r.matches_played as f64)
                .sum::<f64>()
                / total_matches as f64
        } else {
            0.0
        };

        let avg_score: f64 = if total_matches > 0 {
            rollups
                .iter()
                .map(|r| r.avg_score as f64 * r.matches_played as f64)
                .sum::<f64>()
                / total_matches as f64
        } else {
            0.0
        };

        let (peak_speed, streak) = if let Some(ref local_id_str) = settings.local_primary_id {
            let speed = get_player_period_stats(
                pool,
                local_id_str,
                &start_str,
                &end_str,
                playlist.as_deref(),
                match_type.as_deref(),
            )
            .unwrap_or((0.0, 0, 0.0))
            .2;
            let streak_data = metrics::calculate_streaks(
                pool,
                local_id_str,
                &start_str,
                &end_str,
                playlist.as_deref(),
                match_type.as_deref(),
            )
            .unwrap_or(StreakData {
                best_streak: 0,
                current_streak: 0,
            });
            (speed, streak_data)
        } else {
            (
                0.0,
                StreakData {
                    best_streak: 0,
                    current_streak: 0,
                },
            )
        };

        (
            total_matches,
            wins,
            losses,
            total_goals,
            total_conceded,
            total_shots,
            total_saves,
            total_demos,
            total_assists,
            avg_duration,
            avg_score,
            peak_speed,
            streak,
        )
    };

    let avg_goals = if total_matches > 0 {
        total_goals as f64 / total_matches as f64
    } else {
        0.0
    };
    let avg_assists = if total_matches > 0 {
        total_assists as f64 / total_matches as f64
    } else {
        0.0
    };
    let avg_saves = if total_matches > 0 {
        total_saves as f64 / total_matches as f64
    } else {
        0.0
    };
    let avg_shots = if total_matches > 0 {
        total_shots as f64 / total_matches as f64
    } else {
        0.0
    };

    let total_kickoff_goals_scored: i32 = rollups.iter().map(|r| r.kickoff_goals_scored).sum();
    let total_kickoff_goals_conceded: i32 = rollups.iter().map(|r| r.kickoff_goals_conceded).sum();
    let avg_kickoff_goals_scored = if total_matches > 0 {
        total_kickoff_goals_scored as f64 / total_matches as f64
    } else {
        0.0
    };
    let avg_kickoff_goals_conceded = if total_matches > 0 {
        total_kickoff_goals_conceded as f64 / total_matches as f64
    } else {
        0.0
    };

    Ok(serde_json::json!({
        "rollups": rollups,
        "summary": {
            "period": if period.days == 1 { "day" } else if period.days == 7 { "week" } else { "month" },
            "totalMatches": total_matches,
            "wins": wins,
            "losses": losses,
            "winRate": if total_matches > 0 { ((wins as f64 / total_matches as f64) * 100.0).round() as i32 } else { 0 },
            "avgScore": avg_score,
            "avgGoals": avg_goals,
            "avgAssists": avg_assists,
            "avgSaves": avg_saves,
            "avgShots": avg_shots,
            "avgBoost": 0.0,
            "totalGoals": total_goals,
            "totalAssists": total_assists,
            "totalSaves": total_saves,
            "totalShots": total_shots,
            "totalDemos": total_demos,
            "totalConceded": total_conceded,
            "totalKickoffGoalsScored": total_kickoff_goals_scored,
            "totalKickoffGoalsConceded": total_kickoff_goals_conceded,
            "avgKickoffGoalsScored": avg_kickoff_goals_scored,
            "avgKickoffGoalsConceded": avg_kickoff_goals_conceded,
            "bestStreak": streak.best_streak,
            "currentStreak": streak.current_streak,
            "peakSpeed": peak_speed,
            "avgDuration": avg_duration,
        }
    }))
}

#[tauri::command]
pub async fn get_sessions(
    state: State<'_, AppState>,
    gap_minutes: Option<u32>,
    playlist: Option<String>,
    match_type: Option<String>,
    scope: Option<String>,
) -> Result<Vec<MatchSession>, String> {
    let pool = &state.db_pool;
    let settings = get_settings(pool).unwrap_or_default();
    let minutes = gap_minutes.unwrap_or(settings.session_gap_minutes);
    let scope_str = scope.as_deref().unwrap_or("team");

    storage::get_match_sessions(
        pool,
        minutes,
        playlist.as_deref(),
        match_type.as_deref(),
        Some(scope_str),
    )
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_daily_rollups(
    state: State<'_, AppState>,
    start_date: String,
    end_date: String,
    playlist: Option<String>,
    match_type: Option<String>,
    scope: Option<String>,
) -> Result<serde_json::Value, String> {
    let pool = &state.db_pool;
    let scope_str = scope.as_deref().unwrap_or("team");
    let has_filters = playlist.is_some() || match_type.is_some();
    let rollups = if has_filters || scope_str == "me" {
        let settings = get_settings(pool).unwrap_or_default();
        let player_names = storage::identity_candidate_names(&settings);
        storage::get_daily_rollups_filtered(
            pool,
            &start_date,
            &end_date,
            settings.local_primary_id.as_deref(),
            &player_names,
            playlist.as_deref(),
            match_type.as_deref(),
            Some(scope_str),
        )
    } else {
        storage::get_daily_rollups(pool, &start_date, &end_date)
    };
    match rollups {
        Ok(rollups) => Ok(serde_json::json!({ "rollups": rollups })),
        Err(e) => {
            error!(error = %e, "Failed to get daily rollups");
            Err(e.to_string())
        }
    }
}

#[tauri::command]
pub async fn get_session_matches(
    state: State<'_, AppState>,
    query: SessionMatchesQuery,
) -> Result<Vec<serde_json::Value>, String> {
    let pool = &state.db_pool;
    let conn = get_conn(pool).map_err(|e| e.to_string())?;
    let settings = get_settings(pool).unwrap_or_default();

    let mut stmt = conn
        .prepare(
            "SELECT m.id, m.guid, m.start_time, m.end_time, m.arena,
                m.score_blue, m.score_orange, m.winner,
                m.is_online, m.is_overtime, m.duration_seconds,
                m.match_type, m.playlist
         FROM matches m
         WHERE m.start_time >= ?1 AND m.start_time <= ?2
         ORDER BY m.start_time ASC",
        )
        .map_err(|e| e.to_string())?;

    let matches: Vec<serde_json::Value> = stmt
        .query_map(
            rusqlite::params![&query.start_time, &query.end_time],
            |row| {
                let match_id: i64 = row.get(0)?;
                let guid: String = row.get(1)?;
                let start_time: String = row.get(2)?;
                let end_time: Option<String> = row.get(3)?;
                let arena: Option<String> = row.get(4)?;
                let score_blue: i32 = row.get(5)?;
                let score_orange: i32 = row.get(6)?;
                let winner: Option<i32> = row.get(7)?;
                let is_online: i32 = row.get(8)?;
                let is_overtime: i32 = row.get(9)?;
                let duration_seconds: i32 = row.get(10)?;
                let match_type: Option<String> = row.get(11)?;
                let playlist: Option<String> = row.get(12)?;

                Ok(serde_json::json!({
                    "id": match_id,
                    "guid": guid,
                    "start_time": start_time,
                    "end_time": end_time,
                    "arena": arena,
                    "score_blue": score_blue,
                    "score_orange": score_orange,
                    "winner": winner,
                    "is_online": is_online != 0,
                    "is_overtime": is_overtime != 0,
                    "duration_seconds": duration_seconds,
                    "match_type": match_type,
                    "playlist": playlist,
                }))
            },
        )
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    let match_ids: Vec<i64> = matches
        .iter()
        .filter_map(|m| m.get("id").and_then(|value| value.as_i64()))
        .collect();

    let mut players_by_match = if match_ids.is_empty() {
        HashMap::new()
    } else {
        let placeholders = vec!["?"; match_ids.len()].join(", ");
        let sql = format!(
            "SELECT mp.match_id, mp.team_num, mp.score, mp.goals, mp.shots, mp.assists,
                    mp.saves, mp.demos, mp.speed, mp.boost,
                    mp.touches, mp.kickoff_goals, p.name, p.primary_id
             FROM match_players mp
             JOIN players p ON mp.player_id = p.id
             WHERE mp.match_id IN ({})",
            placeholders
        );
        let params_refs: Vec<&dyn rusqlite::ToSql> = match_ids
            .iter()
            .map(|match_id| match_id as &dyn rusqlite::ToSql)
            .collect();
        let mut player_stmt = conn.prepare(&sql).map_err(|e| e.to_string())?;
        let rows = player_stmt
            .query_map(&*params_refs, |row| {
                Ok((
                    row.get::<_, i64>(0)?,
                    serde_json::json!({
                        "team_num": row.get::<_, i32>(1)?,
                        "score": row.get::<_, i32>(2)?,
                        "goals": row.get::<_, i32>(3)?,
                        "shots": row.get::<_, i32>(4)?,
                        "assists": row.get::<_, i32>(5)?,
                        "saves": row.get::<_, i32>(6)?,
                        "demos": row.get::<_, i32>(7)?,
                        "speed": row.get::<_, f64>(8)?,
                        "boost": row.get::<_, i32>(9)?,
                        "touches": row.get::<_, i32>(10)?,
                        "kickoff_goals": row.get::<_, i32>(11)?,
                        "name": row.get::<_, String>(12)?,
                        "primary_id": row.get::<_, String>(13)?,
                    }),
                ))
            })
            .map_err(|e| e.to_string())?;

        let mut grouped: HashMap<i64, Vec<serde_json::Value>> = HashMap::new();
        for row in rows {
            let (match_id, player) = row.map_err(|e| e.to_string())?;
            grouped.entry(match_id).or_default().push(player);
        }
        grouped
    };

    let mut result = Vec::new();
    for m in matches {
        let Some(match_id) = m["id"].as_i64() else {
            continue;
        };
        let players = players_by_match.remove(&match_id).unwrap_or_default();

        let local_team = if let Some(ref lid) = settings.local_primary_id {
            players
                .iter()
                .find(|p| p["primary_id"].as_str() == Some(lid.as_str()))
                .and_then(|p| p["team_num"].as_i64())
                .map(|t| t as i32)
        } else {
            None
        };

        let is_win = matches!(
            (m["winner"].as_i64(), local_team),
            (Some(w), Some(lt)) if w == lt as i64
        );

        let my_diffs = local_team.map(|lt| {
            let scored = m[if lt == 0 {
                "score_blue"
            } else {
                "score_orange"
            }]
            .as_i64()
            .unwrap_or(0);
            let conceded = m[if lt == 0 {
                "score_orange"
            } else {
                "score_blue"
            }]
            .as_i64()
            .unwrap_or(0);
            scored - conceded
        });

        let my_kickoff_goals = local_team.map(|lt| {
            players
                .iter()
                .filter(|p| p["team_num"].as_i64() == Some(lt as i64))
                .map(|p| p["kickoff_goals"].as_i64().unwrap_or(0) as i32)
                .sum::<i32>()
        });

        let their_kickoff_goals = local_team.map(|lt| {
            players
                .iter()
                .filter(|p| p["team_num"].as_i64() != Some(lt as i64))
                .map(|p| p["kickoff_goals"].as_i64().unwrap_or(0) as i32)
                .sum::<i32>()
        });

        result.push(serde_json::json!({
            "id": match_id,
            "guid": m["guid"],
            "start_time": m["start_time"],
            "end_time": m["end_time"],
            "arena": m["arena"],
            "score_blue": m["score_blue"],
            "score_orange": m["score_orange"],
            "winner": m["winner"],
            "is_online": m["is_online"],
            "is_overtime": m["is_overtime"],
            "duration_seconds": m["duration_seconds"],
            "match_type": m["match_type"],
            "playlist": m["playlist"],
            "players": players,
            "local_team": local_team,
            "is_win": is_win,
            "goal_diff": my_diffs,
            "my_kickoff_goals": my_kickoff_goals,
            "their_kickoff_goals": their_kickoff_goals,
        }));
    }

    Ok(result)
}

#[tauri::command]
pub async fn get_insights(
    state: State<'_, AppState>,
    period: AnalyticsPeriod,
    playlist: Option<String>,
    match_type: Option<String>,
    scope: Option<String>,
) -> Result<serde_json::Value, String> {
    let pool = &state.db_pool;
    let settings = get_settings(pool).unwrap_or_default();
    let local_id = match settings.local_primary_id {
        Some(ref id) => id.clone(),
        None => return Ok(serde_json::json!({ "available": false })),
    };

    let days = if period.days == 0 {
        365
    } else {
        period.days as i64
    };
    let end = chrono::Utc::now();
    let start = end - chrono::Duration::days(days);
    let start_str = start.format("%Y-%m-%d").to_string();
    let end_str = end.format("%Y-%m-%d").to_string();

    let scope_str = scope.as_deref().unwrap_or("team");

    let insights = storage::get_insights(
        pool,
        &local_id,
        &start_str,
        &end_str,
        playlist.as_deref(),
        match_type.as_deref(),
        Some(scope_str),
    )
    .map_err(|e| e.to_string())?;

    Ok(insights)
}

async fn get_session_analytics_inner(
    state: State<'_, AppState>,
    playlist: Option<String>,
    match_type: Option<String>,
    scope: Option<String>,
) -> Result<serde_json::Value, String> {
    let pool = &state.db_pool;
    let settings = get_settings(pool).unwrap_or_default();
    let scope_str = scope.as_deref().unwrap_or("team");
    let sessions = storage::get_match_sessions(
        pool,
        settings.session_gap_minutes,
        playlist.as_deref(),
        match_type.as_deref(),
        Some(scope_str),
    )
    .map_err(|e| e.to_string())?;

    // Use only the most recent session for summary stats
    let recent = sessions.first();

    let total_matches = recent.map(|s| s.match_count).unwrap_or(0);
    let wins = recent.map(|s| s.wins).unwrap_or(0);
    let losses = recent.map(|s| s.losses).unwrap_or(0);
    let total_goals = recent.map(|s| s.goals_scored).unwrap_or(0);
    let total_conceded = recent.map(|s| s.goals_conceded).unwrap_or(0);
    let total_shots = recent.map(|s| s.total_shots).unwrap_or(0);
    let total_saves = recent.map(|s| s.total_saves).unwrap_or(0);
    let total_assists = recent.map(|s| s.total_assists).unwrap_or(0);
    let total_demos = recent.map(|s| s.total_demos).unwrap_or(0);

    let (start_str, end_str) = if let Some(s) = recent {
        let start = chrono::DateTime::parse_from_rfc3339(&s.start_time).ok();
        let end = chrono::DateTime::parse_from_rfc3339(&s.end_time).ok();
        (
            start
                .map(|d| d.format("%Y-%m-%d").to_string())
                .unwrap_or_else(|| chrono::Utc::now().format("%Y-%m-%d").to_string()),
            end.map(|d| d.format("%Y-%m-%d").to_string())
                .unwrap_or_else(|| chrono::Utc::now().format("%Y-%m-%d").to_string()),
        )
    } else {
        let today = chrono::Utc::now().format("%Y-%m-%d").to_string();
        (today.clone(), today)
    };

    let (avg_score, peak_speed) = if let Some(ref local_id) = settings.local_primary_id {
        let stats = get_player_period_stats(
            pool,
            local_id,
            &start_str,
            &end_str,
            playlist.as_deref(),
            match_type.as_deref(),
        )
        .unwrap_or((0.0, 0, 0.0));
        (stats.0, stats.2)
    } else {
        (0.0, 0.0)
    };

    let avg_duration: f64 = if total_matches > 0 {
        recent
            .map(|s| s.duration_seconds as f64 / total_matches as f64)
            .unwrap_or(0.0)
    } else {
        0.0
    };

    let streak = if let Some(ref local_id) = settings.local_primary_id {
        metrics::calculate_streaks(
            pool,
            local_id,
            &start_str,
            &end_str,
            playlist.as_deref(),
            match_type.as_deref(),
        )
        .unwrap_or(StreakData {
            best_streak: 0,
            current_streak: 0,
        })
    } else {
        StreakData {
            best_streak: 0,
            current_streak: 0,
        }
    };

    let avg_goals = if total_matches > 0 {
        total_goals as f64 / total_matches as f64
    } else {
        0.0
    };
    let avg_assists = if total_matches > 0 {
        total_assists as f64 / total_matches as f64
    } else {
        0.0
    };
    let avg_saves = if total_matches > 0 {
        total_saves as f64 / total_matches as f64
    } else {
        0.0
    };
    let avg_shots = if total_matches > 0 {
        total_shots as f64 / total_matches as f64
    } else {
        0.0
    };

    let total_kickoff_goals_scored: i32 = sessions.iter().map(|s| s.kickoff_goals_scored).sum();
    let total_kickoff_goals_conceded: i32 = sessions.iter().map(|s| s.kickoff_goals_conceded).sum();
    let avg_kickoff_goals_scored = if total_matches > 0 {
        total_kickoff_goals_scored as f64 / total_matches as f64
    } else {
        0.0
    };
    let avg_kickoff_goals_conceded = if total_matches > 0 {
        total_kickoff_goals_conceded as f64 / total_matches as f64
    } else {
        0.0
    };

    Ok(serde_json::json!({
        "sessions": sessions,
        "summary": {
            "totalMatches": total_matches,
            "wins": wins,
            "losses": losses,
            "avgScore": avg_score,
            "avgGoals": avg_goals,
            "avgAssists": avg_assists,
            "avgSaves": avg_saves,
            "avgShots": avg_shots,
            "avgBoost": 0.0,
            "totalGoals": total_goals,
            "totalAssists": total_assists,
            "totalSaves": total_saves,
            "totalShots": total_shots,
            "totalDemos": total_demos,
            "totalConceded": total_conceded,
            "totalKickoffGoalsScored": total_kickoff_goals_scored,
            "totalKickoffGoalsConceded": total_kickoff_goals_conceded,
            "avgKickoffGoalsScored": avg_kickoff_goals_scored,
            "avgKickoffGoalsConceded": avg_kickoff_goals_conceded,
            "bestStreak": streak.best_streak,
            "currentStreak": streak.current_streak,
            "peakSpeed": peak_speed,
            "avgDuration": avg_duration,
        }
    }))
}

fn get_player_period_stats(
    pool: &crate::core::storage::DbPool,
    local_primary_id: &str,
    start_date: &str,
    end_date: &str,
    playlist: Option<&str>,
    match_type: Option<&str>,
) -> Result<(f64, i32, f64), String> {
    let conn = get_conn(pool).map_err(|e| e.to_string())?;

    let mut sql = String::from(
        "SELECT
            COALESCE(AVG(mp.score), 0.0),
            COALESCE(SUM(mp.assists), 0),
            COALESCE(MAX(mp.speed), 0.0)
         FROM match_players mp
         JOIN matches m ON mp.match_id = m.id
         JOIN players p ON mp.player_id = p.id
         WHERE p.primary_id = ?1
           AND m.start_time >= ?2
           AND m.start_time < date(?3, '+1 day')",
    );
    let mut args: Vec<Box<dyn rusqlite::ToSql>> = Vec::new();
    args.push(Box::new(local_primary_id.to_string()));
    args.push(Box::new(start_date.to_string()));
    args.push(Box::new(end_date.to_string()));

    if let Some(mt) = match_type {
        sql.push_str(" AND m.match_type = ?");
        args.push(Box::new(mt.to_string()));
    }

    if let Some(pl) = playlist {
        sql.push_str(" AND m.playlist = ?");
        args.push(Box::new(pl.to_string()));
    }

    let params_refs: Vec<&dyn rusqlite::ToSql> = args.iter().map(|a| a.as_ref()).collect();

    let (avg_score, total_assists, peak_speed): (f64, i32, f64) = conn
        .query_row(&sql, &*params_refs, |row| {
            Ok((row.get(0)?, row.get(1)?, row.get(2)?))
        })
        .map_err(|e| e.to_string())?;
    Ok((avg_score, total_assists, peak_speed))
}
