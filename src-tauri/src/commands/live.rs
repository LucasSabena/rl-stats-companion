use crate::core::models::{ConnectionStatus, LiveMatchState};
use crate::core::session::MatchPhase;
use crate::AppState;
use std::sync::atomic::Ordering;
use tauri::State;

#[tauri::command]
pub async fn get_live_state(state: State<'_, AppState>) -> Result<Option<LiveMatchState>, String> {
    let session = state.session_manager.read().await;
    let live = session.live_state();
    if session.phase() == &MatchPhase::Waiting && live.players.is_empty() {
        Ok(None)
    } else {
        Ok(Some(live))
    }
}

#[tauri::command]
pub async fn get_connection_status(state: State<'_, AppState>) -> Result<ConnectionStatus, String> {
    let mut status = state.ingestor_status.read().await.clone();
    status.game_running = state.game_running.load(Ordering::SeqCst);
    Ok(status)
}
