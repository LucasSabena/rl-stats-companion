use crate::core::storage::{self, FriendRecord};
use crate::AppState;
use tauri::State;
use tracing::error;

#[tauri::command]
pub async fn add_friend_cmd(
    state: State<'_, AppState>,
    player_id: i64,
    tag: Option<String>,
) -> Result<(), String> {
    let pool = &state.db_pool;
    storage::add_friend(pool, player_id, tag.as_deref()).map_err(|e| {
        error!(error = %e, "Failed to add friend");
        e.to_string()
    })
}

#[tauri::command]
pub async fn remove_friend_cmd(state: State<'_, AppState>, player_id: i64) -> Result<(), String> {
    let pool = &state.db_pool;
    storage::remove_friend(pool, player_id).map_err(|e| {
        error!(error = %e, "Failed to remove friend");
        e.to_string()
    })
}

#[tauri::command]
pub async fn get_friends_cmd(state: State<'_, AppState>) -> Result<Vec<FriendRecord>, String> {
    let pool = &state.db_pool;
    storage::get_friends(pool).map_err(|e| {
        error!(error = %e, "Failed to get friends");
        e.to_string()
    })
}

#[tauri::command]
pub async fn is_friend_cmd(state: State<'_, AppState>, player_id: i64) -> Result<bool, String> {
    let pool = &state.db_pool;
    storage::is_friend(pool, player_id).map_err(|e| {
        error!(error = %e, "Failed to check friend status");
        e.to_string()
    })
}
