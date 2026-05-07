use crate::core::rlstats_api::RlstatsClient;
use crate::core::settings::get_settings;
use crate::core::storage;
use crate::core::tracker_api::TrackerProfile;
use crate::AppState;
use tauri::State;
use tracing::{debug, info};

#[tauri::command]
pub async fn fetch_rlstats_profile(state: State<'_, AppState>) -> Result<TrackerProfile, String> {
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

    let rlstats_platform = match platform.to_lowercase().as_str() {
        "steam" => "Steam",
        "epic" => "Epic",
        "xbl" => "Xbox",
        "psn" => "PS4",
        "switch" => "Switch",
        other => {
            return Err(format!("Plataforma no soportada para RLStats: {other}"));
        }
    };

    info!(%platform, %username, rlstats_platform, "Fetching RLStats profile");

    let client = RlstatsClient::new().map_err(|e| e.to_string())?;
    let html = client
        .fetch_profile_html(rlstats_platform, &username)
        .await
        .map_err(|e| e.to_string())?;

    let profile = crate::core::rlstats_api::parse_profile_html(&html, &platform, &username)
        .map_err(|e| e.to_string())?;

    let profile_json =
        serde_json::to_string(&profile).map_err(|e| format!("Failed to serialize profile: {e}"))?;

    storage::upsert_rlstats_cache(pool, &platform, &username, &profile_json)
        .map_err(|e| e.to_string())?;

    debug!("RLStats profile cached successfully");
    Ok(profile)
}

#[tauri::command]
pub async fn get_cached_rlstats_profile(
    state: State<'_, AppState>,
) -> Result<Option<TrackerProfile>, String> {
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

    let cached =
        storage::get_rlstats_cache(pool, &platform, &username).map_err(|e| e.to_string())?;

    match cached {
        Some((profile_json, _fetched_at)) => {
            let profile: TrackerProfile = serde_json::from_str(&profile_json)
                .map_err(|e| format!("Failed to deserialize cached profile: {e}"))?;
            Ok(Some(profile))
        }
        None => Ok(None),
    }
}

#[tauri::command]
pub async fn refresh_rlstats_profile(state: State<'_, AppState>) -> Result<TrackerProfile, String> {
    fetch_rlstats_profile(state).await
}
