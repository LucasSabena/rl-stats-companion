use crate::core::models::{
    LiveMatchState, LivePlayer, Player, PlayerStats, RlEvent, SessionSummary,
};
use crate::core::settings::{get_settings, set_settings, AppSettings};
use crate::core::storage::{
    finish_match, get_or_create_player, insert_match, insert_match_event, insert_match_player,
    insert_session, rebuild_daily_rollups_for_identity, upsert_daily_rollup, DbPool,
};
use crate::error::AppResult;
use chrono::Utc;
use std::collections::HashMap;
use tracing::{debug, info, warn};

/// State machine for match lifecycle tracking.
#[derive(Clone, Debug, PartialEq)]
pub enum MatchPhase {
    Waiting,
    Active,
    Finished,
}

/// Manages the current match session in memory.
pub struct SessionManager {
    phase: MatchPhase,
    match_id: Option<i64>,
    match_guid: Option<String>,
    start_time: Option<chrono::DateTime<chrono::Utc>>,
    arena: Option<String>,
    is_online: bool,
    is_overtime: bool,
    time_remaining: i32,
    score_blue: i32,
    score_orange: i32,
    players: HashMap<String, LivePlayer>,
    events: Vec<(String, String, chrono::DateTime<chrono::Utc>)>, // (event_type, json, occurred_at)
    ball_speed: f64,
    match_type: Option<String>,
    winner_team_num: Option<i32>,
}

impl SessionManager {
    pub fn new() -> Self {
        Self {
            phase: MatchPhase::Waiting,
            match_id: None,
            match_guid: None,
            start_time: None,
            arena: None,
            is_online: false,
            is_overtime: false,
            time_remaining: 0,
            score_blue: 0,
            score_orange: 0,
            players: HashMap::new(),
            events: Vec::new(),
            ball_speed: 0.0,
            match_type: Some("ranked".into()),
            winner_team_num: None,
        }
    }

    pub fn phase(&self) -> &MatchPhase {
        &self.phase
    }

    pub fn set_match_type(&mut self, mt: String) {
        self.match_type = Some(mt);
    }

    pub fn live_state(&self) -> LiveMatchState {
        let player_count = self.players.len();
        LiveMatchState {
            match_guid: self.match_guid.clone(),
            arena: self.arena.clone(),
            is_online: self.is_online,
            is_overtime: self.is_overtime,
            time_remaining: self.time_remaining,
            score_blue: self.score_blue,
            score_orange: self.score_orange,
            players: self.players.values().cloned().collect(),
            ball_speed: self.ball_speed,
            player_count,
            match_type: self.match_type.clone(),
        }
    }

    /// Process an incoming RL event and update session state.
    pub fn handle_event(&mut self, event: RlEvent) {
        match &event {
            RlEvent::MatchCreated | RlEvent::MatchInitialized => {
                info!("Match created/initialized");
                self.reset();
                self.phase = MatchPhase::Active;
                self.start_time = Some(Utc::now());
            }
            RlEvent::UpdateState {
                match_guid,
                game,
                players,
            } => {
                if self.phase == MatchPhase::Waiting {
                    self.phase = MatchPhase::Active;
                    self.start_time = Some(Utc::now());
                }
                if self.phase == MatchPhase::Active {
                    if let Some(guid) = match_guid {
                        self.match_guid = Some(guid.clone());
                        self.is_online = true;
                    }
                    self.arena.clone_from(&game.arena);
                    self.is_overtime = game.is_overtime;
                    self.time_remaining = game.time;
                    self.ball_speed = game.ball.as_ref().map(|ball| ball.speed).unwrap_or(0.0);
                    if let Some(teams) = &game.teams {
                        if teams.len() > 0 {
                            self.score_blue = teams[0].score;
                        }
                        if teams.len() > 1 {
                            self.score_orange = teams[1].score;
                        }
                    }
                    for (id, player) in players.iter() {
                        self.players.insert(id.clone(), player.clone());
                    }
                    info!(
                        player_count = players.len(),
                        time = game.time,
                        arena = ?game.arena,
                        blue = self.score_blue,
                        orange = self.score_orange,
                        "UpdateState"
                    );
                }
            }
            RlEvent::ClockUpdatedSeconds { time } => {
                self.time_remaining = *time;
            }
            RlEvent::GoalScored { data } => {
                if self.phase == MatchPhase::Active {
                    info!(scorer = %data.scorer.name, "Goal scored");
                    let json = serde_json::to_string(&data).unwrap_or_default();
                    self.events.push(("GoalScored".into(), json, Utc::now()));
                }
            }
            RlEvent::StatfeedEvent { data } => {
                if self.phase == MatchPhase::Active {
                    debug!(event = %data.event_name, target = %data.main_target.name, "Statfeed event");
                    let json = serde_json::to_string(&data).unwrap_or_default();
                    self.events.push(("StatfeedEvent".into(), json, Utc::now()));
                }
            }
            RlEvent::MatchEnded { winner_team_num } => {
                if self.phase == MatchPhase::Active {
                    info!(?winner_team_num, "Match ended");
                    self.winner_team_num = *winner_team_num;
                    self.phase = MatchPhase::Finished;
                }
            }
            RlEvent::MatchPaused => {
                info!("Match paused");
            }
            RlEvent::MatchUnpaused => {
                info!("Match unpaused");
            }
            RlEvent::MatchDestroyed | RlEvent::PodiumStart => {
                if self.phase == MatchPhase::Active && self.has_meaningful_match_data() {
                    info!("Match destroyed before formal end; finalizing with last known state");
                    self.phase = MatchPhase::Finished;
                }

                if self.phase == MatchPhase::Finished {
                    if matches!(&event, RlEvent::PodiumStart) {
                        info!("Podium start");
                        let json = serde_json::json!({"type": "PodiumStart"}).to_string();
                        self.events.push(("PodiumStart".into(), json, Utc::now()));
                    }
                    info!("Match destroyed / podium start");
                }
            }
            RlEvent::CrossbarHit { data } => {
                if self.phase == MatchPhase::Active {
                    info!(player = %data.player.name, "Crossbar hit");
                    let json = serde_json::to_string(&data).unwrap_or_default();
                    self.events.push(("CrossbarHit".into(), json, Utc::now()));
                }
            }
            _ => {}
        }
    }

    /// Persist the finished match to storage and generate summary.
    pub fn persist_finished_match(&mut self, pool: &DbPool) -> AppResult<SessionSummary> {
        if self.phase != MatchPhase::Finished {
            return Err(crate::error::AppError::StorageError(
                "Match not finished".into(),
            ));
        }

        let guid = self
            .match_guid
            .clone()
            .unwrap_or_else(|| uuid::Uuid::new_v4().to_string());
        let start_time = self.start_time.unwrap_or_else(Utc::now);
        let end_time = Utc::now();
        let duration = (end_time - start_time).num_seconds() as i32;
        let arena = self.arena.clone().unwrap_or_else(|| "Unknown".into());

        let winner = self.winner_team_num.or_else(|| {
            if self.score_blue > self.score_orange {
                Some(0)
            } else if self.score_orange > self.score_blue {
                Some(1)
            } else {
                None
            }
        });
        let playlist = infer_playlist(self.players.values());

        let match_id = insert_match(
            pool,
            &guid,
            start_time,
            Some(&arena),
            self.is_online,
            self.match_type.as_deref(),
            playlist.as_deref(),
        )?;
        self.match_id = Some(match_id);

        let mut players_vec = Vec::new();
        for (primary_id, live) in &self.players {
            let player_id = get_or_create_player(pool, primary_id, &live.name)?;
            insert_match_player(
                pool,
                match_id,
                player_id,
                live.team,
                live.score,
                live.goals,
                live.shots,
                live.assists,
                live.saves,
                live.touches,
                live.car_touches,
                live.demos,
                live.speed,
                live.boost,
            )?;

            players_vec.push(Player {
                id: player_id,
                primary_id: primary_id.clone(),
                name: live.name.clone(),
                team_num: live.team,
                stats: PlayerStats {
                    score: live.score,
                    goals: live.goals,
                    shots: live.shots,
                    assists: live.assists,
                    saves: live.saves,
                    touches: live.touches,
                    car_touches: live.car_touches,
                    demos: live.demos,
                    speed: live.speed,
                    boost: live.boost,
                },
            });
        }

        finish_match(
            pool,
            match_id,
            end_time,
            self.score_blue,
            self.score_orange,
            winner,
            self.is_overtime,
            duration,
        )?;

        for (event_type, event_data, occurred_at) in &self.events {
            insert_match_event(pool, match_id, event_type, event_data, *occurred_at)?;
        }

        let mut settings = get_settings(pool).unwrap_or_else(|_| AppSettings::default());
        let local_identity = resolve_local_player_identity(self.players.values(), &settings);

        if let Some((local_primary_id, _)) = &local_identity {
            let should_save = settings.local_primary_id.as_deref() != Some(local_primary_id.as_str());
            if should_save {
                settings.local_primary_id = Some(local_primary_id.clone());
                if let Err(e) = set_settings(pool, &settings) {
                    warn!(error = %e, "Failed to persist local primary id");
                } else if let Err(e) = rebuild_daily_rollups_for_identity(
                    pool,
                    settings.local_primary_id.as_deref(),
                    &identity_candidate_names(&settings),
                ) {
                    warn!(error = %e, "Failed to rebuild daily rollups after learning local primary id");
                }
            }
        }

        let my_team = local_identity.map(|(_, team_num)| team_num);

        let is_win = matches!((winner, my_team), (Some(winner_team), Some(my_team)) if winner_team == my_team);
        let is_loss = matches!((winner, my_team), (Some(winner_team), Some(my_team)) if winner_team != my_team);

        let my_goals: i32 = players_vec
            .iter()
            .filter(|p| Some(p.team_num) == my_team)
            .map(|p| p.stats.goals)
            .sum();
        let their_goals: i32 = players_vec
            .iter()
            .filter(|p| my_team.is_some() && Some(p.team_num) != my_team)
            .map(|p| p.stats.goals)
            .sum();
        let total_shots: i32 = players_vec.iter().map(|p| p.stats.shots).sum();
        let total_saves: i32 = players_vec.iter().map(|p| p.stats.saves).sum();
        let total_demos: i32 = players_vec
            .iter()
            .filter(|p| Some(p.team_num) == my_team)
            .map(|p| p.stats.demos)
            .sum();
        let total_assists: i32 = players_vec
            .iter()
            .filter(|p| Some(p.team_num) == my_team)
            .map(|p| p.stats.assists)
            .sum();

        let summary = SessionSummary {
            match_guid: guid.clone(),
            duration_seconds: duration,
            score_blue: self.score_blue,
            score_orange: self.score_orange,
            winner,
            players: players_vec,
            match_type: self.match_type.clone(),
        };

        insert_session(pool, match_id, &summary)?;

        // Update daily rollup
        let date = start_time.format("%Y-%m-%d").to_string();

        let rollup = crate::core::models::DailyRollup {
            date,
            matches_played: 1,
            wins: if is_win { 1 } else { 0 },
            losses: if is_loss { 1 } else { 0 },
            goals_scored: my_goals,
            goals_conceded: their_goals,
            total_shots,
            total_saves,
            avg_duration_seconds: duration,
            total_demos,
            total_assists,
        };
        upsert_daily_rollup(pool, &rollup)?;

        info!(match_id, "Match persisted successfully");
        Ok(summary)
    }

    fn reset(&mut self) {
        self.phase = MatchPhase::Waiting;
        self.match_id = None;
        self.match_guid = None;
        self.start_time = None;
        self.arena = None;
        self.is_online = false;
        self.is_overtime = false;
        self.time_remaining = 0;
        self.score_blue = 0;
        self.score_orange = 0;
        self.players.clear();
        self.events.clear();
        self.ball_speed = 0.0;
        self.winner_team_num = None;
    }

    fn has_meaningful_match_data(&self) -> bool {
        !self.players.is_empty() || !self.events.is_empty() || self.score_blue != 0 || self.score_orange != 0
    }
}

fn infer_playlist<'a>(players: impl Iterator<Item = &'a LivePlayer>) -> Option<String> {
    let (blue_count, orange_count) = players.fold((0usize, 0usize), |(blue, orange), player| {
        match player.team {
            0 => (blue + 1, orange),
            1 => (blue, orange + 1),
            _ => (blue, orange),
        }
    });

    let team_size = blue_count.max(orange_count);
    let playlist = match team_size {
        0 => return None,
        1 => "Duel",
        2 => "Doubles",
        3 => "Standard",
        4 => "Chaos",
        _ => "Other",
    };

    Some(playlist.to_string())
}

impl Default for SessionManager {
    fn default() -> Self {
        Self::new()
    }
}

fn resolve_local_player_identity<'a>(
    players: impl Iterator<Item = &'a LivePlayer>,
    settings: &AppSettings,
) -> Option<(String, i32)> {
    let players = players.collect::<Vec<_>>();

    if let Some(local_primary_id) = settings.local_primary_id.as_deref() {
        if let Some(player) = players.iter().find(|player| player.id == local_primary_id) {
            return Some((player.id.clone(), player.team));
        }
    }

    for candidate_name in [&settings.player_name, settings.tracker_username.as_deref().unwrap_or("")] {
        let candidate_name = candidate_name.trim();
        if candidate_name.is_empty() {
            continue;
        }

        if let Some(player) = players.iter().find(|player| player.name.trim().eq_ignore_ascii_case(candidate_name)) {
            return Some((player.id.clone(), player.team));
        }
    }

    None
}

fn identity_candidate_names(settings: &AppSettings) -> Vec<String> {
    let mut names = Vec::new();

    if !settings.player_name.trim().is_empty() {
        names.push(settings.player_name.trim().to_string());
    }

    if let Some(username) = &settings.tracker_username {
        let username = username.trim();
        if !username.is_empty() && !names.iter().any(|name| name.eq_ignore_ascii_case(username)) {
            names.push(username.to_string());
        }
    }

    names
}
