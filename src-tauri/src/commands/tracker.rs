use crate::core::settings::get_settings;
use crate::core::storage;
use crate::core::tracker_api::{TrackerClient, TrackerProfile};
use crate::AppState;
use tauri::State;
use tracing::{debug, info};

#[tauri::command]
pub async fn fetch_tracker_profile(state: State<'_, AppState>) -> Result<TrackerProfile, String> {
    let pool = &state.db_pool;
    let settings = get_settings(pool).map_err(|e| e.to_string())?;

    let platform = settings
        .tracker_platform
        .clone()
        .ok_or_else(|| "No se configuro la plataforma. Seleccionala en Ajustes.".to_string())?;

    let username = settings
        .tracker_username
        .clone()
        .ok_or_else(|| "No se configuro el nombre de usuario. Ingresalo en Ajustes.".to_string())?;

    info!(%platform, %username, "Fetching Tracker Network profile");

    let api_key = settings.tracker_api_key.clone();
    let client = TrackerClient::new(api_key).map_err(|e| e.to_string())?;
    let profile = client.fetch_profile(&platform, &username).await.map_err(|e| e.to_string())?;

    let profile_json =
        serde_json::to_string(&profile).map_err(|e| format!("Failed to serialize profile: {e}"))?;

    storage::upsert_tracker_cache(pool, &platform, &username, &profile_json)
        .map_err(|e| e.to_string())?;

    debug!("Tracker profile cached successfully");
    Ok(profile)
}

#[tauri::command]
pub async fn get_cached_profile(state: State<'_, AppState>) -> Result<Option<TrackerProfile>, String> {
    let pool = &state.db_pool;
    let settings = get_settings(pool).map_err(|e| e.to_string())?;

    let platform = match settings.tracker_platform.clone() {
        Some(p) => p,
        None => return Ok(None),
    };

    let username = match settings.tracker_username.clone() {
        Some(u) => u,
        None => return Ok(None),
    };

    let cached = storage::get_tracker_cache(pool, &platform, &username).map_err(|e| e.to_string())?;

    match cached {
        Some((profile_json, _fetched_at)) => {
            let profile: TrackerProfile =
                serde_json::from_str(&profile_json).map_err(|e| format!("Failed to deserialize cached profile: {e}"))?;
            Ok(Some(profile))
        }
        None => Ok(None),
    }
}

#[tauri::command]
pub async fn refresh_tracker_profile(state: State<'_, AppState>) -> Result<TrackerProfile, String> {
    fetch_tracker_profile(state).await
}
