use crate::core::storage;
use crate::AppState;
use serde::Deserialize;
use tauri::State;
use tracing::error;

#[derive(Deserialize)]
pub struct PlayerDirectoryFilters {
    pub search: Option<String>,
    pub relationship: Option<String>,
    pub sort_by: Option<String>,
    pub limit: Option<i64>,
    pub offset: Option<i64>,
}

#[tauri::command]
pub async fn get_player_directory(
    state: State<'_, AppState>,
    filters: PlayerDirectoryFilters,
) -> Result<serde_json::Value, String> {
    let pool = &state.db_pool;

    let settings = crate::core::settings::get_settings(pool).unwrap_or_default();
    let player_names = resolve_player_names(&settings);
    let local_primary_id = settings.local_primary_id.as_deref();
    let limit = filters.limit.unwrap_or(100);
    let offset = filters.offset.unwrap_or(0);

    match storage::get_player_directory(
        pool,
        local_primary_id,
        &player_names,
        filters.search.as_deref(),
        filters.relationship.as_deref(),
        filters.sort_by.as_deref(),
        limit,
        offset,
    ) {
        Ok(entries) => Ok(serde_json::json!({ "players": entries })),
        Err(e) => {
            error!(error = %e, "Failed to get player directory");
            Err(e.to_string())
        }
    }
}

#[tauri::command]
pub async fn get_player_detail(
    state: State<'_, AppState>,
    player_id: i64,
) -> Result<serde_json::Value, String> {
    let pool = &state.db_pool;

    let settings = crate::core::settings::get_settings(pool).unwrap_or_default();
    let player_names = resolve_player_names(&settings);
    let local_primary_id = settings.local_primary_id.as_deref();

    match storage::get_player_detail(pool, player_id, local_primary_id, &player_names) {
        Ok(Some(detail)) => Ok(serde_json::json!(detail)),
        Ok(None) => Err("Player not found".into()),
        Err(e) => {
            error!(error = %e, player_id, "Failed to get player detail");
            Err(e.to_string())
        }
    }
}

fn resolve_player_names(
    settings: &crate::core::settings::AppSettings,
) -> Vec<String> {
    let mut names = Vec::new();
    if !settings.player_name.trim().is_empty() {
        names.push(settings.player_name.trim().to_string());
    }
    if let Some(user) = &settings.tracker_username {
        let u = user.trim();
        if !u.is_empty() && !names.iter().any(|n| n.eq_ignore_ascii_case(u)) {
            names.push(u.to_string());
        }
    }
    names
}
