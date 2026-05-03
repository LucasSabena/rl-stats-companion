use std::sync::Arc;
use tauri::{Emitter, Manager};
#[cfg(not(debug_assertions))]
use tauri_plugin_updater::UpdaterExt;
use tokio::sync::RwLock;
use tracing::info;

mod commands;
pub mod core;
pub mod error;
mod updater;

use crate::core::ingestor::{start_ingestor, IngestorHandle};
use crate::core::models::RlEvent;
use crate::core::process_watcher::ProcessWatcher;
use crate::core::session::{MatchPhase, SessionManager};
use crate::core::settings::get_settings;
use crate::core::storage::{init_storage, DbPool};
use crate::core::tracker_api::TrackerClient;

pub struct AppState {
    pub db_pool: Arc<DbPool>,
    pub session_manager: Arc<RwLock<SessionManager>>,
    pub ingestor_status: Arc<RwLock<core::models::ConnectionStatus>>,
    pub game_running: Arc<std::sync::atomic::AtomicBool>,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Initialize tracing subscriber for structured logging.
    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| tracing_subscriber::EnvFilter::new("info")),
        )
        .init();

    tauri::Builder::default()
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            commands::live::get_live_state,
            commands::live::get_connection_status,
            commands::history::get_matches,
            commands::history::get_match_detail,
            commands::history::delete_match_cmd,
            commands::history::update_match_cmd,
            commands::analytics::get_analytics,
            commands::analytics::get_daily_rollups,
            commands::settings::get_settings_cmd,
            commands::settings::set_settings_cmd,
            commands::settings::configure_rl_ini_cmd,
            commands::settings::export_data,
            commands::settings::export_data_json,
            commands::settings::import_data,
            commands::settings::import_data_json,
            commands::settings::get_storage_stats_cmd,
            commands::settings::clear_all_data_cmd,
            commands::detect::detect_rl_path,
            commands::window::toggle_overlay_mode,
            commands::window::is_overlay_mode,
            commands::tracker::fetch_tracker_profile,
            commands::tracker::get_cached_profile,
            commands::tracker::refresh_tracker_profile,
        ])
        .setup(|app| {
            #[cfg(all(desktop, not(debug_assertions)))]
            {
                let handle = app.handle().clone();
                tauri::async_runtime::spawn(async move {
                    if let Ok(updater) = handle.updater() {
                        let _: Result<_, _> = updater.check().await;
                    }
                });
            }

            // Determine database path in app data directory.
            let app_dir = app
                .path()
                .app_data_dir()
                .expect("Failed to get app data directory");
            std::fs::create_dir_all(&app_dir).expect("Failed to create app data directory");
            let db_path = app_dir.join("rl_stats.db");

            info!(db_path = %db_path.display(), "Initializing storage");
            let db_pool = match init_storage(&db_path) {
                Ok(pool) => Arc::new(pool),
                Err(e) => {
                    tracing::error!(error = %e, "Failed to initialize storage");
                    panic!("Storage initialization failed: {}", e);
                }
            };

            // Load settings to get configured port.
            let settings = get_settings(&db_pool).unwrap_or_default();
            let port = settings.port;

            // Start process watcher to detect when Rocket League is running.
            let watcher = ProcessWatcher::new();
            let game_running_flag = watcher.start();

            // Start TCP ingestor with game-running awareness.
            let ingestor = start_ingestor(port, Arc::clone(&game_running_flag));
            let ingestor_status = Arc::clone(&ingestor.status);

            // Session manager shared state.
            let session_manager = Arc::new(RwLock::new(SessionManager::new()));

            // Spawn event processing task.
            let session_mgr_clone = Arc::clone(&session_manager);
            let db_pool_clone = Arc::clone(&db_pool);
            let app_handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                process_events(ingestor, session_mgr_clone, db_pool_clone, app_handle).await;
            });

            // Spawn tracker profile auto-refresh task.
            let db_pool_tracker = Arc::clone(&db_pool);
            let app_handle_tracker = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                tracker_refresh_loop(db_pool_tracker, app_handle_tracker).await;
            });

            // Manage shared state for commands.
            app.manage(AppState {
                db_pool,
                session_manager,
                ingestor_status,
                game_running: game_running_flag,
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

/// Background task that consumes events from the ingestor and drives the session manager.
/// Emits Tauri `live-update` events when game state changes so the frontend can react in real time.
async fn process_events(
    mut ingestor: IngestorHandle,
    session_manager: Arc<RwLock<SessionManager>>,
    db_pool: Arc<DbPool>,
    app_handle: tauri::AppHandle,
) {
    info!("Event processing task started");

    while let Some(event) = ingestor.event_rx.recv().await {
        let mut session = session_manager.write().await;
        let was_finished = session.phase() == &MatchPhase::Finished;

        // Emit match-started when a new match is created or initialized.
        match &event {
            RlEvent::MatchCreated | RlEvent::MatchInitialized => {
                let _ = app_handle.emit(
                    "match-started",
                    serde_json::json!({
                        "timestamp": chrono::Utc::now().to_rfc3339()
                    }),
                );
            }
            _ => {}
        }

        session.handle_event(event.clone());

        if let Some(live_event) = map_live_event(&event) {
            let _ = app_handle.emit("live-event", live_event);
        }

        // Emit live state to frontend whenever state changes (UpdateState, GoalScored, etc.)
        {
            let live_data = session.live_state();
            let _ = app_handle.emit("live-update", live_data);
        }

        let is_finished = session.phase() == &MatchPhase::Finished;
        if !was_finished && is_finished {
            // Match just ended; persist after a short delay to allow final state accumulation.
            drop(session);
            tokio::time::sleep(tokio::time::Duration::from_secs(2)).await;

            let mut session = session_manager.write().await;
            if session.phase() == &MatchPhase::Finished {
                match session.persist_finished_match(&db_pool) {
                    Ok(summary) => {
                        info!(guid = %summary.match_guid, "Match persisted");
                        // Emit match-summary event so the frontend can refresh history/analytics.
                        let _ = app_handle.emit("match-summary", &summary);
                        session.handle_event(RlEvent::MatchDestroyed);
                        // Emit final update after match-end cleanup.
                        let final_state = session.live_state();
                        let _ = app_handle.emit("live-update", final_state);
                    }
                    Err(e) => {
                        tracing::error!(error = %e, "Failed to persist match");
                    }
                }
            }
        }
    }

    info!("Event processing task ended");
}

fn map_live_event(event: &RlEvent) -> Option<serde_json::Value> {
    let event_type = match event {
        RlEvent::MatchCreated | RlEvent::MatchInitialized => "MatchCreated",
        RlEvent::GoalScored { .. } => "GoalScored",
        RlEvent::StatfeedEvent { .. } => "StatfeedEvent",
        RlEvent::MatchEnded { .. } => "MatchEnded",
        _ => return None,
    };

    Some(serde_json::json!({
        "id": uuid::Uuid::new_v4().to_string(),
        "type": event_type,
        "timestamp": chrono::Utc::now().timestamp(),
        "data": {}
    }))
}

async fn tracker_refresh_loop(db_pool: Arc<DbPool>, app_handle: tauri::AppHandle) {
    // Wait a bit on startup before first refresh.
    tokio::time::sleep(tokio::time::Duration::from_secs(10)).await;

    loop {
        let settings = match get_settings(&db_pool) {
            Ok(s) => s,
            Err(e) => {
                tracing::error!(error = %e, "Failed to read settings for tracker refresh");
                tokio::time::sleep(tokio::time::Duration::from_secs(60)).await;
                continue;
            }
        };

        if !settings.tracker_auto_refresh {
            tokio::time::sleep(tokio::time::Duration::from_secs(30)).await;
            continue;
        }

        let platform = match settings.tracker_platform.clone() {
            Some(p) => p,
            None => {
                tokio::time::sleep(tokio::time::Duration::from_secs(30)).await;
                continue;
            }
        };

        let username = match settings.tracker_username.clone() {
            Some(u) => u,
            None => {
                tokio::time::sleep(tokio::time::Duration::from_secs(30)).await;
                continue;
            }
        };

        let api_key = settings.tracker_api_key.clone();
        let client = match TrackerClient::new(api_key) {
            Ok(c) => c,
            Err(e) => {
                tracing::error!(error = %e, "Failed to create TrackerClient for auto-refresh");
                tokio::time::sleep(tokio::time::Duration::from_secs(60)).await;
                continue;
            }
        };

        match client.fetch_profile(&platform, &username).await {
            Ok(profile) => {
                if let Ok(profile_json) = serde_json::to_string(&profile) {
                    if let Err(e) = crate::core::storage::upsert_tracker_cache(
                        &db_pool,
                        &platform,
                        &username,
                        &profile_json,
                    ) {
                        tracing::error!(error = %e, "Failed to cache tracker profile");
                    } else {
                        let _ = app_handle.emit("tracker-profile-updated", &profile);
                    }
                }
            }
            Err(e) => {
                tracing::warn!(error = %e, "Auto-refresh tracker profile failed");
            }
        }

        let interval_secs = (settings.tracker_refresh_interval_min.max(1) as u64) * 60;
        tokio::time::sleep(tokio::time::Duration::from_secs(interval_secs)).await;
    }
}
