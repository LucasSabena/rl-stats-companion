use crate::core::storage;
use crate::AppState;
use serde::Deserialize;
use tauri::State;
use tracing::error;

#[derive(Deserialize)]
pub struct AnalyticsPeriod {
    pub days: i32,
}

#[tauri::command]
pub async fn get_analytics(
    state: State<'_, AppState>,
    period: AnalyticsPeriod,
) -> Result<serde_json::Value, String> {
    let pool = &state.db_pool;
    let end = chrono::Utc::now();
    let start = end - chrono::Duration::days(period.days as i64);

    match storage::get_daily_rollups(
        pool,
        &start.format("%Y-%m-%d").to_string(),
        &end.format("%Y-%m-%d").to_string(),
    ) {
        Ok(rollups) => Ok(serde_json::json!({ "rollups": rollups })),
        Err(e) => {
            error!(error = %e, "Failed to get analytics");
            Err(e.to_string())
        }
    }
}

#[tauri::command]
pub async fn get_daily_rollups(
    state: State<'_, AppState>,
    start_date: String,
    end_date: String,
) -> Result<serde_json::Value, String> {
    let pool = &state.db_pool;
    match storage::get_daily_rollups(pool, &start_date, &end_date) {
        Ok(rollups) => Ok(serde_json::json!({ "rollups": rollups })),
        Err(e) => {
            error!(error = %e, "Failed to get daily rollups");
            Err(e.to_string())
        }
    }
}
