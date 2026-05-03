use std::sync::Arc;
use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Emitter, Manager, WebviewUrl, WebviewWindowBuilder,
};
#[cfg(not(debug_assertions))]
use tauri_plugin_updater::UpdaterExt;
use tokio::sync::RwLock;
use tracing::info;

mod commands;
pub mod core;
pub mod error;
mod updater;

use crate::core::autostart::configure_autostart;
use crate::core::ingestor::{start_ingestor, IngestorHandle};
use crate::core::models::RlEvent;
use crate::core::overlay::OverlayServer;
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
    pub overlay_server: Arc<tokio::sync::Mutex<Option<OverlayServer>>>,
    pub overlay_handle: Arc<std::sync::Mutex<Option<tauri::WebviewWindow>>>,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Check if launched with --minimized (autostart)
    let start_minimized = std::env::args().any(|arg| arg == "--minimized");

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
            commands::analytics::get_sessions,
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
            commands::overlay::start_overlay_server,
            commands::overlay::stop_overlay_server,
            commands::overlay::get_overlay_server_status,
            commands::overlay::get_overlay_urls,
            commands::overlay::get_overlay_state,
            commands::overlay_window::create_overlay_window,
            commands::overlay_window::destroy_overlay_window,
            commands::overlay_window::get_overlay_window_state,
            commands::overlay_window::toggle_overlay_enabled,
            commands::overlay_window::update_overlay_position,
            commands::overlay_window::update_overlay_size,
            commands::overlay_window::update_overlay_opacity,
            commands::overlay_window::set_overlay_clickthrough,
            commands::overlay_window::notify_overlay_settings_changed,
            commands::overlay_window::set_overlay_interactive,
        ])
        .setup(move |app| {
            #[cfg(all(desktop, not(debug_assertions)))]
            {
                let handle = app.handle().clone();
                tauri::async_runtime::spawn(async move {
                    if let Ok(updater) = handle.updater() {
                        let _: Result<_, _> = updater.check().await;
                    }
                });
            }

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

            let settings = get_settings(&db_pool).unwrap_or_default();
            let port = settings.port;

            // Configure autostart based on current setting
            configure_autostart(settings.auto_start);

            // Start hidden if launched via autostart
            let main_window = app.get_webview_window("main");

            // Build system tray
            let show_item = MenuItem::with_id(app, "show", "Mostrar", true, None::<&str>)?;
            let quit_item = MenuItem::with_id(app, "quit", "Salir", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&show_item, &quit_item])?;

            let tray = TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .tooltip("RL Stats Companion")
                .menu(&menu)
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "show" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                    "quit" => app.exit(0),
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        let app = tray.app_handle();
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                })
                .build(app)?;

            // Intercept close event to hide instead of quitting
            if let Some(ref window) = main_window {
                let window_clone = window.clone();
                window.on_window_event(move |event| {
                    if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                        api.prevent_close();
                        let _ = window_clone.hide();
                    }
                });
            }

            // If launched via autostart, start minimized to tray
            if start_minimized {
                if let Some(ref window) = main_window {
                    let _ = window.hide();
                }
            }

            let watcher = ProcessWatcher::new();
            let game_running_flag = watcher.start();

            let ingestor = start_ingestor(port, Arc::clone(&game_running_flag));
            let ingestor_status = Arc::clone(&ingestor.status);

            let session_manager = Arc::new(RwLock::new(SessionManager::new()));

            let session_mgr_clone = Arc::clone(&session_manager);
            let db_pool_clone = Arc::clone(&db_pool);
            let app_handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                process_events(ingestor, session_mgr_clone, db_pool_clone, app_handle).await;
            });

            let db_pool_tracker = Arc::clone(&db_pool);
            let app_handle_tracker = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                tracker_refresh_loop(db_pool_tracker, app_handle_tracker).await;
            });

            app.manage(AppState {
                db_pool: db_pool.clone(),
                session_manager,
                ingestor_status,
                game_running: game_running_flag,
                overlay_server: Arc::new(tokio::sync::Mutex::new(None)),
                overlay_handle: Arc::new(std::sync::Mutex::new(None)),
            });

            // Store tray in app state so it stays alive. We move it into a "leaked" Box to
            // keep it for the lifetime of the app without having to manage it through AppState.
            // The tray handle must not be dropped.
            app.manage(TrayHandle {
                _tray: Box::new(tray),
            });

            // Restore overlay window if it was enabled last session
            if settings.overlay_enabled {
                let app_handle = app.handle().clone();
                let pool = db_pool.clone();
                tauri::async_runtime::spawn(async move {
                    tokio::time::sleep(tokio::time::Duration::from_secs(2)).await;
                    let app_settings = get_settings(&pool).unwrap_or_default();
                    if app_settings.overlay_enabled {
                        if let Err(e) = create_overlay_window_inner(&app_handle, &app_settings).await {
                            tracing::warn!(error = %e, "Failed to restore overlay window on startup");
                        }
                    }
                });
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

/// Wrapper to keep the tray icon alive for the app lifetime.
pub struct TrayHandle {
    _tray: Box<tauri::tray::TrayIcon>,
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

        {
            let live_data = session.live_state();
            let _ = app_handle.emit("live-update", &live_data);

            let overlay = app_handle.state::<AppState>().overlay_server.clone();
            let overlay_data = live_data.clone();
            tokio::spawn(async move {
                let guard = overlay.lock().await;
                if let Some(ref server) = *guard {
                    server.broadcast_state(&overlay_data);
                }
            });
        }

        let is_finished = session.phase() == &MatchPhase::Finished;
        if !was_finished && is_finished {
            drop(session);
            tokio::time::sleep(tokio::time::Duration::from_secs(2)).await;

            let mut session = session_manager.write().await;
            if session.phase() == &MatchPhase::Finished {
                match session.persist_finished_match(&db_pool) {
                    Ok(summary) => {
                        info!(guid = %summary.match_guid, "Match persisted");
                        let _ = app_handle.emit("match-summary", &summary);
                        session.handle_event(RlEvent::MatchDestroyed);
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

/// Internal helper to create the overlay window without going through the command system.
/// Used during startup restoration.
async fn create_overlay_window_inner(
    app: &tauri::AppHandle,
    settings: &crate::core::settings::AppSettings,
) -> Result<(), String> {
    let url = WebviewUrl::App("index.html".into());

    let win = WebviewWindowBuilder::new(app, "overlay", url)
        .title("RL Overlay")
        .inner_size(settings.overlay_width as f64, settings.overlay_height as f64)
        .position(
            settings.overlay_position_x as f64,
            settings.overlay_position_y as f64,
        )
        .transparent(true)
        .decorations(false)
        .always_on_top(true)
        .skip_taskbar(true)
        .resizable(false)
        .minimizable(false)
        .maximizable(false)
        .shadow(false)
        .visible_on_all_workspaces(true)
        .build()
        .map_err(|e| format!("Failed to create overlay window: {}", e))?;

    win.set_ignore_cursor_events(settings.overlay_clickthrough)
        .map_err(|e| e.to_string())?;

    let _ = win.emit(
        "overlay-settings-updated",
        serde_json::json!({
            "showScore": settings.overlay_show_score,
            "showPlayers": settings.overlay_show_players,
            "showStats": settings.overlay_show_stats,
            "showTimer": settings.overlay_show_timer,
            "fontScale": settings.overlay_font_scale,
            "opacity": settings.overlay_opacity,
            "playerScope": settings.overlay_player_scope,
            "showNames": settings.overlay_show_names,
            "showPlayerScore": settings.overlay_show_player_score,
            "showBoost": settings.overlay_show_boost,
        }),
    );
    let _ = win.emit("overlay-opacity-changed", settings.overlay_opacity);
    let _ = win.emit("overlay-clickthrough-changed", settings.overlay_clickthrough);

    let _ = win.show();

    Ok(())
}
