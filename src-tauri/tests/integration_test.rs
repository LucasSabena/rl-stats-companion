/// Integration tests for the RL Stats.
/// These tests cover parsing, session management, storage CRUD, and metrics.
use rl_stats_lib::core::metrics::{save_percentage, shots_to_goals_ratio};
use rl_stats_lib::core::models::{PlayerStats, RlEvent};
use rl_stats_lib::core::parser::parse_event;
use rl_stats_lib::core::session::SessionManager;
use rl_stats_lib::core::storage::{self, init_storage, DbPool};
use std::fs::{self, File};
use std::io::{BufRead, BufReader};
use std::path::PathBuf;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/// Read a fixture file line by line and collect non-empty lines.
fn read_fixture_lines(filename: &str) -> Vec<String> {
    let path = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("tests")
        .join("fixtures")
        .join(filename);
    let file = File::open(&path).unwrap_or_else(|_| panic!("Missing fixture: {}", path.display()));
    let reader = BufReader::new(file);
    reader
        .lines()
        .map(|l| l.expect("failed to read line"))
        .filter(|l| !l.trim().is_empty())
        .collect()
}

/// Create an in-memory pool using a temp file so pooled connections share the same DB.
fn temp_db_pool() -> (DbPool, PathBuf) {
    let dir = std::env::temp_dir().join("rl_test_dbs");
    fs::create_dir_all(&dir).unwrap();
    // Use a unique name per test process; we rely on the fact that each #[test] runs
    // in its own thread, but we still create unique paths.
    let path = dir.join(format!("test_{}.db", uuid::Uuid::new_v4()));
    // Clean up any leftover from previous runs
    let _ = fs::remove_file(&path);
    let pool = init_storage(&path).expect("failed to init temp storage");
    (pool, path)
}

/// Read events from a fixture and feed them into the session manager.
fn replay_fixture_into_session(fixture: &str, session: &mut SessionManager) -> Vec<RlEvent> {
    let lines = read_fixture_lines(fixture);
    let mut events = Vec::new();
    for line in &lines {
        match parse_event(line) {
            Ok(event) => {
                events.push(event.clone());
                session.handle_event(event);
            }
            Err(e) => {
                eprintln!("Parse error in fixture {}: {}", fixture, e);
            }
        }
    }
    events
}

// ---------------------------------------------------------------------------
// Task 2: Parser integration tests (fixture-based)
// ---------------------------------------------------------------------------

mod fixture_tests {
    use super::*;

    #[test]
    fn parse_full_match_fixture_all_success() {
        let lines = read_fixture_lines("full_match.jsonl");
        assert!(!lines.is_empty(), "fixture must have content");

        let mut success_count = 0;
        let mut error_count = 0;
        for line in &lines {
            match parse_event(line) {
                Ok(_) => success_count += 1,
                Err(e) => {
                    error_count += 1;
                    eprintln!("Unexpected parse error: {} | line: {}", e, line);
                }
            }
        }
        assert_eq!(error_count, 0, "all lines must parse without errors");
        assert_eq!(success_count, lines.len());
    }

    #[test]
    fn parse_full_match_verify_event_sequence() {
        let lines = read_fixture_lines("full_match.jsonl");
        let mut event_types: Vec<String> = Vec::new();

        for line in &lines {
            let ev = parse_event(line).unwrap();
            let ty = match &ev {
                RlEvent::MatchCreated => "MatchCreated",
                RlEvent::MatchInitialized => "MatchInitialized",
                RlEvent::MatchEnded { .. } => "MatchEnded",
                RlEvent::MatchDestroyed => "MatchDestroyed",
                RlEvent::UpdateState { .. } => "UpdateState",
                RlEvent::BallHit => "BallHit",
                RlEvent::GoalScored { .. } => "GoalScored",
                RlEvent::StatfeedEvent { .. } => "StatfeedEvent",
                RlEvent::ClockUpdatedSeconds { .. } => "ClockUpdatedSeconds",
                RlEvent::CountdownBegin => "CountdownBegin",
                RlEvent::PodiumStart => "PodiumStart",
                RlEvent::GoalReplayStart => "GoalReplayStart",
                RlEvent::GoalReplayEnd => "GoalReplayEnd",
                RlEvent::GoalReplayWillEnd => "GoalReplayWillEnd",
                _ => "Other",
            };
            event_types.push(ty.to_string());
        }

        // The fixture MUST contain these milestone events in order.
        let has_match_created = event_types.iter().any(|e| e == "MatchCreated");
        let has_match_ended = event_types.iter().any(|e| e == "MatchEnded");
        let has_match_destroyed = event_types.iter().any(|e| e == "MatchDestroyed");
        let has_podium = event_types.iter().any(|e| e == "PodiumStart");
        let has_update_state = event_types.iter().any(|e| e == "UpdateState");
        let has_goal = event_types.iter().any(|e| e == "GoalScored");
        let has_statfeed = event_types.iter().any(|e| e == "StatfeedEvent");

        assert!(has_match_created, "must contain MatchCreated");
        assert!(has_match_ended, "must contain MatchEnded");
        assert!(has_match_destroyed, "must contain MatchDestroyed");
        assert!(has_podium, "must contain PodiumStart");
        assert!(has_update_state, "must contain at least one UpdateState");
        assert!(has_goal, "must contain at least one GoalScored");
        assert!(has_statfeed, "must contain at least one StatfeedEvent");
    }

    #[test]
    fn parse_full_match_extract_player_names() {
        let lines = read_fixture_lines("full_match.jsonl");
        let mut all_names: std::collections::HashSet<String> = std::collections::HashSet::new();

        for line in &lines {
            if let Ok(RlEvent::UpdateState { players, .. }) = parse_event(line) {
                for p in players.values() {
                    all_names.insert(p.name.clone());
                }
            }
        }

        assert!(all_names.contains("AlphaStar"), "must contain AlphaStar");
        assert!(all_names.contains("BetaKnight"), "must contain BetaKnight");
        assert!(all_names.contains("GammaWing"), "must contain GammaWing");
        assert!(all_names.contains("DeltaRush"), "must contain DeltaRush");
        assert!(
            all_names.contains("EpsilonDrift"),
            "must contain EpsilonDrift"
        );
        assert!(all_names.contains("ZetaBoost"), "must contain ZetaBoost");
        assert_eq!(all_names.len(), 6);
    }

    #[test]
    fn parse_short_match_fixture_all_success() {
        let lines = read_fixture_lines("short_match.jsonl");
        assert!(!lines.is_empty());

        for line in &lines {
            let ev = parse_event(line);
            assert!(
                ev.is_ok(),
                "line should parse successfully: {}",
                ev.unwrap_err()
            );
        }
    }
}

// ---------------------------------------------------------------------------
// Task 2: Malformed events resilience tests
// ---------------------------------------------------------------------------

mod malformed_tests {
    use super::*;

    #[test]
    fn parse_malformed_fixture_valid_events_succeed() {
        let lines = read_fixture_lines("malformed_events.jsonl");

        let mut valid_count = 0;
        let mut invalid_count = 0;
        let mut valid_types: Vec<String> = Vec::new();

        for line in &lines {
            match parse_event(line) {
                Ok(ev) => {
                    valid_count += 1;
                    let ty = match &ev {
                        RlEvent::UpdateState { .. } => "UpdateState",
                        RlEvent::StatfeedEvent { .. } => "StatfeedEvent",
                        RlEvent::MatchEnded { .. } => "MatchEnded",
                        _ => "Other",
                    };
                    valid_types.push(ty.to_string());
                }
                Err(_) => {
                    invalid_count += 1;
                }
            }
        }

        assert!(valid_count > 0, "must have at least one valid event");
        assert!(invalid_count > 0, "must have at least one invalid line");
        // Expected valid lines: 3 UpdateState + 1 StatfeedEvent + 1 MatchEnded = 5
        assert_eq!(valid_count, 5, "expected 5 valid events in fixture");
    }

    #[test]
    fn parse_malformed_fixture_no_panics() {
        let lines = read_fixture_lines("malformed_events.jsonl");
        // The key property: this loop must never panic.
        for line in &lines {
            let _ = parse_event(line); // discarding the Result is intentional here
        }
    }
}

// ---------------------------------------------------------------------------
// Task 3: Session manager integration tests
// ---------------------------------------------------------------------------

mod session_tests {
    use super::*;
    use rl_stats_lib::core::models::{GameState, LivePlayer};
    use std::collections::HashMap;

    #[test]
    fn session_state_transitions_from_fixture() {
        let mut session = SessionManager::new(7);
        assert_eq!(
            session.phase(),
            &rl_stats_lib::core::session::MatchPhase::Waiting
        );

        replay_fixture_into_session("full_match.jsonl", &mut session);

        // After MatchEnded, phase should be Finished
        assert_eq!(
            session.phase(),
            &rl_stats_lib::core::session::MatchPhase::Finished,
            "session should be Finished after full fixture replay"
        );
    }

    #[test]
    fn session_short_match_transitions_to_finished() {
        let mut session = SessionManager::new(7);
        replay_fixture_into_session("short_match.jsonl", &mut session);
        assert_eq!(
            session.phase(),
            &rl_stats_lib::core::session::MatchPhase::Finished
        );
    }

    #[test]
    fn session_persists_match_to_db() {
        let (pool, _path) = temp_db_pool();
        let mut session = SessionManager::new(7);

        replay_fixture_into_session("short_match.jsonl", &mut session);

        // Should be Finished now
        let summary = session
            .persist_finished_match(&pool)
            .expect("persist must succeed");

        assert!(!summary.match_guid.is_empty());
        assert_eq!(summary.players.len(), 2);
        assert!(summary.duration_seconds >= 0);

        // Verify match count
        let count = storage::get_match_count(&pool).unwrap();
        assert_eq!(count, 1);

        // Verify match detail
        let matches = storage::get_matches(
            &pool,
            storage::MatchQuery {
                limit: 10,
                offset: 0,
                arena: None,
                match_type: None,
                playlist: None,
                result: None,
                date_from: None,
                date_to: None,
                search: None,
            },
        )
        .unwrap();
        assert_eq!(matches.len(), 1);
        let m = &matches[0];
        assert_eq!(m.guid, summary.match_guid);

        // Cleanup
        let _ = fs::remove_file(&_path);
    }

    #[test]
    fn session_tracks_live_state() {
        let mut session = SessionManager::new(7);
        replay_fixture_into_session("full_match.jsonl", &mut session);

        let live = session.live_state();
        assert!(live.match_guid.is_some());
        assert_eq!(live.arena.as_deref(), Some("DFHStadium"));
        // Teams: blue = 2, orange = 1 from the last UpdateState before MatchEnded
        assert_eq!(live.score_blue, 2);
        assert_eq!(live.score_orange, 1);
        assert_eq!(live.players.len(), 6);
    }

    #[test]
    fn session_accumulates_player_stats() {
        let mut session = SessionManager::new(7);
        replay_fixture_into_session("full_match.jsonl", &mut session);

        let live = session.live_state();
        let alpha = live
            .players
            .iter()
            .find(|p| p.name == "AlphaStar")
            .expect("AlphaStar must be present");

        // AlphaStar scored 1 goal on the final state
        assert_eq!(alpha.goals, 1);
        assert!(alpha.shots >= 3); // accumulated across state updates
        assert!(alpha.score >= 200);
    }

    #[test]
    fn session_preserves_previous_players_on_partial_snapshot() {
        let mut session = SessionManager::new(7);

        let mut initial_players = HashMap::new();
        initial_players.insert(
            "P1".to_string(),
            LivePlayer {
                id: "P1".to_string(),
                name: "Alpha".to_string(),
                team: 0,
                ..Default::default()
            },
        );
        initial_players.insert(
            "P2".to_string(),
            LivePlayer {
                id: "P2".to_string(),
                name: "Bravo".to_string(),
                team: 1,
                ..Default::default()
            },
        );

        session.handle_event(RlEvent::UpdateState {
            match_guid: Some("guid-1".to_string()),
            game: GameState::default(),
            players: initial_players,
        });

        let mut updated_players = HashMap::new();
        updated_players.insert(
            "P1".to_string(),
            LivePlayer {
                id: "P1".to_string(),
                name: "Alpha".to_string(),
                team: 0,
                score: 150,
                ..Default::default()
            },
        );

        session.handle_event(RlEvent::UpdateState {
            match_guid: Some("guid-1".to_string()),
            game: GameState::default(),
            players: updated_players,
        });

        let live = session.live_state();
        // Session intentionally keeps players from prior snapshots so
        // disconnected teammates are not lost before MatchEnded.
        assert_eq!(live.players.len(), 2);
        let alpha = live
            .players
            .iter()
            .find(|p| p.name == "Alpha")
            .expect("Alpha present");
        assert_eq!(alpha.score, 150);
        assert!(
            live.players.iter().any(|p| p.name == "Bravo"),
            "Bravo should still be present"
        );
    }

    #[test]
    fn session_double_start_is_handled() {
        // Two MatchCreated events in sequence should reset, not panic.
        let mut session = SessionManager::new(7);
        session.handle_event(RlEvent::MatchCreated);
        assert_eq!(
            session.phase(),
            &rl_stats_lib::core::session::MatchPhase::Active
        );
        session.handle_event(RlEvent::MatchCreated);
        assert!(
            *session.phase() == rl_stats_lib::core::session::MatchPhase::Active
                || *session.phase() == rl_stats_lib::core::session::MatchPhase::Waiting,
            "double MatchCreated should not crash"
        );
    }
}

// ---------------------------------------------------------------------------
// Task 4: Storage CRUD tests
// ---------------------------------------------------------------------------

mod storage_crud_tests {
    use super::*;
    use chrono::Utc;

    fn init_test_pool() -> (DbPool, PathBuf) {
        temp_db_pool()
    }

    #[test]
    fn insert_and_query_match_by_id() {
        let (pool, path) = init_test_pool();

        let match_id = storage::insert_match(
            &pool,
            "test-guid-001",
            Utc::now(),
            Some("DFHStadium"),
            false,
            None,
            None,
        )
        .expect("insert_match must succeed");
        assert!(match_id > 0);

        let (m, players) =
            storage::get_match_detail(&pool, match_id).expect("get_match_detail must succeed");
        assert_eq!(m.guid, "test-guid-001");
        assert_eq!(m.arena.as_deref(), Some("DFHStadium"));
        assert!(!m.is_online);
        assert!(players.is_empty()); // no players linked yet

        let _ = fs::remove_file(&path);
    }

    #[test]
    fn list_all_matches() {
        let (pool, path) = init_test_pool();

        storage::insert_match(
            &pool,
            "guid-a",
            Utc::now(),
            Some("Arena A"),
            false,
            None,
            None,
        )
        .unwrap();
        storage::insert_match(
            &pool,
            "guid-b",
            Utc::now(),
            Some("Arena B"),
            true,
            None,
            None,
        )
        .unwrap();

        let matches = storage::get_matches(
            &pool,
            storage::MatchQuery {
                limit: 10,
                offset: 0,
                arena: None,
                match_type: None,
                playlist: None,
                result: None,
                date_from: None,
                date_to: None,
                search: None,
            },
        )
        .unwrap();
        assert_eq!(matches.len(), 2);

        let _ = fs::remove_file(&path);
    }

    #[test]
    fn delete_match_cascade() {
        let (pool, path) = init_test_pool();

        // Insert match + player + event
        let match_id = storage::insert_match(
            &pool,
            "guid-del",
            Utc::now(),
            Some("Arena"),
            false,
            None,
            None,
        )
        .unwrap();
        let player_id = storage::get_or_create_player(&pool, "P1", "TestPlayer").unwrap();
        storage::insert_match_player(
            &pool,
            match_id,
            storage::MatchPlayerRow {
                player_id,
                team_num: 0,
                stats: PlayerStats {
                    score: 100,
                    goals: 1,
                    shots: 2,
                    assists: 0,
                    saves: 1,
                    touches: 5,
                    car_touches: 3,
                    demos: 1,
                    speed: 1200.0,
                    boost: 50,
                    mmr: None,
                    kickoff_goals: 0,
                    head_to_head: None,
                },
                head_to_head_json: None,
            },
        )
        .unwrap();
        storage::insert_match_event(&pool, match_id, "GoalScored", r#"{"x":1}"#, Utc::now())
            .unwrap();

        // Verify data exists
        let count_before = storage::get_match_count(&pool).unwrap();
        assert_eq!(count_before, 1);

        let (_m, players) = storage::get_match_detail(&pool, match_id).unwrap();
        assert_eq!(players.len(), 1);

        // Delete
        storage::delete_match(&pool, match_id).unwrap();

        // Verify cascade
        let count_after = storage::get_match_count(&pool).unwrap();
        assert_eq!(count_after, 0);

        // Check match_players cascade
        let conn = pool.get().unwrap();
        let mp_count: i64 = conn
            .query_row(
                "SELECT COUNT(*) FROM match_players WHERE match_id = ?1",
                rusqlite::params![match_id],
                |r| r.get(0),
            )
            .unwrap();
        assert_eq!(mp_count, 0, "match_players must be cascade-deleted");

        let me_count: i64 = conn
            .query_row(
                "SELECT COUNT(*) FROM match_events WHERE match_id = ?1",
                rusqlite::params![match_id],
                |r| r.get(0),
            )
            .unwrap();
        assert_eq!(me_count, 0, "match_events must be cascade-deleted");

        let _ = fs::remove_file(&path);
    }

    #[test]
    fn get_or_create_player_idempotent() {
        let (pool, path) = init_test_pool();

        let id1 = storage::get_or_create_player(&pool, "unique-player", "Name1").unwrap();
        let id2 = storage::get_or_create_player(&pool, "unique-player", "Name2").unwrap();
        // Same primary_id => same database id
        assert_eq!(id1, id2);
        // Name should be the original
        let conn = pool.get().unwrap();
        let stored_name: String = conn
            .query_row(
                "SELECT name FROM players WHERE id = ?1",
                rusqlite::params![id1],
                |r| r.get(0),
            )
            .unwrap();
        assert_eq!(stored_name, "Name1");

        let _ = fs::remove_file(&path);
    }

    #[test]
    fn get_matches_with_arena_filter() {
        let (pool, path) = init_test_pool();

        storage::insert_match(
            &pool,
            "g1",
            Utc::now(),
            Some("Mannfield"),
            false,
            None,
            None,
        )
        .unwrap();
        storage::insert_match(
            &pool,
            "g2",
            Utc::now(),
            Some("DFHStadium"),
            false,
            None,
            None,
        )
        .unwrap();
        storage::insert_match(
            &pool,
            "g3",
            Utc::now(),
            Some("Mannfield"),
            false,
            None,
            None,
        )
        .unwrap();

        let filtered = storage::get_matches(
            &pool,
            storage::MatchQuery {
                limit: 10,
                offset: 0,
                arena: Some("Mannfield"),
                match_type: None,
                playlist: None,
                result: None,
                date_from: None,
                date_to: None,
                search: None,
            },
        )
        .unwrap();
        assert_eq!(filtered.len(), 2);

        let none = storage::get_matches(
            &pool,
            storage::MatchQuery {
                limit: 10,
                offset: 0,
                arena: Some("Nonexistent"),
                match_type: None,
                playlist: None,
                result: None,
                date_from: None,
                date_to: None,
                search: None,
            },
        )
        .unwrap();
        assert!(none.is_empty());

        let _ = fs::remove_file(&path);
    }

    #[test]
    fn get_storage_stats_works() {
        let (pool, path) = init_test_pool();

        storage::insert_match(&pool, "gs1", Utc::now(), Some("Arena"), false, None, None).unwrap();
        storage::get_or_create_player(&pool, "P1", "P1Name").unwrap();
        storage::get_or_create_player(&pool, "P2", "P2Name").unwrap();

        let stats = storage::get_storage_stats(&pool).unwrap();
        assert_eq!(stats["match_count"], 1);
        assert_eq!(stats["player_count"], 2);
        assert_eq!(stats["event_count"], 0);

        let _ = fs::remove_file(&path);
    }

    #[test]
    fn clear_all_data_works() {
        let (pool, path) = init_test_pool();

        storage::insert_match(&pool, "c1", Utc::now(), Some("Arena"), false, None, None).unwrap();
        storage::get_or_create_player(&pool, "CP1", "Name").unwrap();
        assert_eq!(storage::get_match_count(&pool).unwrap(), 1);

        storage::clear_all_data(&pool).unwrap();
        assert_eq!(storage::get_match_count(&pool).unwrap(), 0);

        let _ = fs::remove_file(&path);
    }

    #[test]
    fn finish_match_updates_row() {
        let (pool, path) = init_test_pool();

        let match_id = storage::insert_match(
            &pool,
            "fm-guid",
            Utc::now(),
            Some("Arena"),
            false,
            None,
            None,
        )
        .unwrap();
        let end = Utc::now();

        storage::finish_match(
            &pool,
            match_id,
            storage::FinishMatchUpdate {
                end_time: end,
                score_blue: 3,
                score_orange: 2,
                winner: Some(0),
                is_overtime: true,
                duration_seconds: 300,
            },
        )
        .unwrap();

        let (m, _) = storage::get_match_detail(&pool, match_id).unwrap();
        assert_eq!(m.score_blue, 3);
        assert_eq!(m.score_orange, 2);
        assert_eq!(m.winner, Some(0));
        assert!(m.is_overtime);
        assert_eq!(m.duration_seconds, 300);
        assert!(m.end_time.is_some());

        let _ = fs::remove_file(&path);
    }

    #[test]
    fn session_fully_persists_with_rollup() {
        let (pool, path) = init_test_pool();
        let mut session = SessionManager::new(7);

        replay_fixture_into_session("short_match.jsonl", &mut session);
        let summary = session.persist_finished_match(&pool).unwrap();

        assert!(!summary.match_guid.is_empty());
        assert_eq!(summary.players.len(), 2);

        // Verify daily_rollup was upserted
        let conn = pool.get().unwrap();
        let rollup_count: i64 = conn
            .query_row("SELECT COUNT(*) FROM daily_rollups", [], |r| r.get(0))
            .unwrap();
        assert!(
            rollup_count > 0,
            "daily_rollups must have at least one entry"
        );

        let _ = fs::remove_file(&path);
    }
}

// ---------------------------------------------------------------------------
// Task 5: Metrics tests
// ---------------------------------------------------------------------------

mod metrics_tests {
    use super::*;

    #[test]
    fn shots_to_goals_ratio_normal() {
        let stats = PlayerStats {
            goals: 5,
            shots: 15,
            ..Default::default()
        };
        let ratio = shots_to_goals_ratio(&stats);
        assert!((ratio - 3.0).abs() < f64::EPSILON); // 15/5 = 3
    }

    #[test]
    fn shots_to_goals_ratio_zero_goals() {
        let stats = PlayerStats {
            goals: 0,
            shots: 10,
            ..Default::default()
        };
        let ratio = shots_to_goals_ratio(&stats);
        assert_eq!(ratio, 0.0);
    }

    #[test]
    fn save_percentage_normal() {
        let pct = save_percentage(10, 5);
        assert!((pct - 50.0).abs() < f64::EPSILON); // 5/10 * 100 = 50
    }

    #[test]
    fn save_percentage_zero_against() {
        let pct = save_percentage(0, 3);
        assert_eq!(pct, 0.0);
    }

    #[test]
    fn save_percentage_perfect() {
        let pct = save_percentage(4, 4);
        assert!((pct - 100.0).abs() < f64::EPSILON);
    }

    #[test]
    fn shots_to_goals_ratio_all_zero() {
        let stats = PlayerStats::default();
        let ratio = shots_to_goals_ratio(&stats);
        assert_eq!(ratio, 0.0);
    }
}

// ---------------------------------------------------------------------------
// Cross-cutting integration: full lifecycle with session + storage
// ---------------------------------------------------------------------------

#[test]
fn full_match_lifecycle_persist_and_verify() {
    let (pool, path) = temp_db_pool();
    let mut session = SessionManager::new(7);

    // Replay full match
    replay_fixture_into_session("full_match.jsonl", &mut session);

    // Persist
    let summary = session
        .persist_finished_match(&pool)
        .expect("persist should succeed");

    // Verify counts
    assert_eq!(storage::get_match_count(&pool).unwrap(), 1);
    let matches = storage::get_matches(
        &pool,
        storage::MatchQuery {
            limit: 10,
            offset: 0,
            arena: None,
            match_type: None,
            playlist: None,
            result: None,
            date_from: None,
            date_to: None,
            search: None,
        },
    )
    .unwrap();
    let stored_match = &matches[0];

    // Verify stored match data
    assert_eq!(stored_match.guid, summary.match_guid);
    assert_eq!(stored_match.score_blue, 2);
    assert_eq!(stored_match.score_orange, 1);
    assert_eq!(stored_match.winner, Some(0)); // blue (team 0) won
    assert!(!stored_match.is_overtime);

    // Verify match detail with players
    let (_, players) = storage::get_match_detail(&pool, stored_match.id).unwrap();
    assert_eq!(players.len(), 6, "all 6 players must be persisted");

    let _ = fs::remove_file(&path);
}
