//! Tauri command handlers for the overlay server.
//!
//! These commands allow the React frontend to start/stop the overlay
//! HTTP server, query its status, and retrieve the URLs of available
//! overlay pages that can be pasted into OBS as browser sources.

use crate::core::overlay::{OverlayServer, OverlayServerStatus};
use crate::AppState;
use serde::Serialize;
use tauri::State;
use tracing::info;

// ---------------------------------------------------------------------------
// Response types
// ---------------------------------------------------------------------------

/// A named overlay URL returned to the frontend.
#[derive(Debug, Clone, Serialize)]
pub struct OverlayUrl {
    /// Human-readable overlay name (e.g. "Scoreboard").
    pub name: String,
    /// Full HTTP URL for use as an OBS browser source.
    pub url: String,
}

// ---------------------------------------------------------------------------
// Commands
// ---------------------------------------------------------------------------

/// Starts the overlay HTTP/WebSocket server on the given port.
///
/// The server handle is stored in [`AppState::overlay_server`] so it can
/// be accessed by other commands and the event-processing loop.
///
/// # Errors
///
/// Returns `Err` if the server is already running or if the TCP port
/// cannot be bound.
#[tauri::command]
pub async fn start_overlay_server(
    state: State<'_, AppState>,
    port: u16,
) -> Result<OverlayServerStatus, String> {
    info!(port, "Starting overlay server");

    let mut server = OverlayServer::new(port);
    server.start().await?;

    let status = server.status();
    *state.overlay_server.lock().await = Some(server);

    Ok(status)
}

/// Stops a running overlay server.
///
/// Sends a graceful-shutdown signal and clears the stored handle.
/// Idempotent — safe to call even when no server is running.
#[tauri::command]
pub async fn stop_overlay_server(
    state: State<'_, AppState>,
) -> Result<(), String> {
    info!("Stopping overlay server");

    let mut guard = state.overlay_server.lock().await;
    if let Some(ref mut server) = *guard {
        server.stop();
    }
    *guard = None;

    Ok(())
}

/// Returns the current status of the overlay server.
///
/// When no server has been started, returns `running: false, port: 0,
/// connected_clients: 0`.
#[tauri::command]
pub async fn get_overlay_server_status(
    state: State<'_, AppState>,
) -> Result<OverlayServerStatus, String> {
    let guard = state.overlay_server.lock().await;
    match &*guard {
        Some(server) => Ok(server.status()),
        None => Ok(OverlayServerStatus {
            running: false,
            port: 0,
            connected_clients: 0,
        }),
    }
}

/// Returns a list of available overlay URLs for use as OBS browser sources.
///
/// Currently supports the following overlays (files must exist in the
/// `overlays/` directory next to `Cargo.toml`):
///
/// | Name         | Path                        |
/// |--------------|-----------------------------|
/// | Scoreboard   | `/overlays/scoreboard.html` |
/// | Player Stats | `/overlays/player-stats.html`|
/// | Event Feed   | `/overlays/event-feed.html` |
/// | All-in-One   | `/overlays/all-in-one.html` |
///
/// # Errors
///
/// Returns `Err` if the overlay server is not running.
#[tauri::command]
pub async fn get_overlay_urls(
    state: State<'_, AppState>,
) -> Result<Vec<OverlayUrl>, String> {
    let guard = state.overlay_server.lock().await;
    let port = match &*guard {
        Some(server) => server.port(),
        None => return Err("Overlay server is not running".into()),
    };

    #[rustfmt::skip]
    let overlays: &[(&str, &str)] = &[
        ("Scoreboard",   "scoreboard"),
        ("Player Stats", "player-stats"),
        ("Event Feed",   "event-feed"),
        ("All-in-One",   "all-in-one"),
    ];

    Ok(overlays
        .iter()
        .map(|(name, path)| OverlayUrl {
            name: (*name).to_string(),
            url: format!("http://127.0.0.1:{}/overlays/{}", port, path),
        })
        .collect())
}

/// Returns the current live match state as a JSON string.
/// Useful for OBS URL/API source plugins that poll for data.
#[tauri::command]
pub async fn get_overlay_state(
    state: State<'_, AppState>,
) -> Result<serde_json::Value, String> {
    let guard = state.overlay_server.lock().await;
    match &*guard {
        Some(server) => {
            let cached = server.latest_state_handle();
            let value = cached.read().await;
            match &*value {
                Some(json) => {
                    serde_json::from_str(json).map_err(|e| e.to_string())
                }
                None => Ok(serde_json::json!({})),
            }
        }
        None => Err("Overlay server is not running".into()),
    }
}
