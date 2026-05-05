use crate::core::profiles::{
    create_profile, delete_profile, get_active_profile, get_db_path_for_profile, list_profiles,
    rename_profile, switch_profile, Profile,
};
use crate::core::settings::{set_settings, AppSettings};
use crate::core::storage::init_storage;
use crate::error::AppResult;
use tauri::Manager;
use tracing::info;

fn app_data_dir(app_handle: &tauri::AppHandle) -> AppResult<std::path::PathBuf> {
    app_handle
        .path()
        .app_data_dir()
        .map_err(|e| crate::error::AppError::IoError(e.to_string()))
}

#[tauri::command]
pub async fn list_profiles_cmd(app_handle: tauri::AppHandle) -> AppResult<Vec<Profile>> {
    let app_dir = app_data_dir(&app_handle)?;
    list_profiles(&app_dir)
}

#[tauri::command]
pub async fn get_active_profile_cmd(app_handle: tauri::AppHandle) -> AppResult<Profile> {
    let app_dir = app_data_dir(&app_handle)?;
    get_active_profile(&app_dir)
}

#[tauri::command]
pub async fn create_profile_cmd(
    name: String,
    player_name: Option<String>,
    app_handle: tauri::AppHandle,
) -> AppResult<Profile> {
    let app_dir = app_data_dir(&app_handle)?;
    let profile = create_profile(&app_dir, &name)?;

    let db_path = get_db_path_for_profile(&app_dir, &profile.id);
    let pool = init_storage(&db_path)?;
    let settings = AppSettings {
        player_name: player_name.unwrap_or_default(),
        ..Default::default()
    };
    set_settings(&pool, &settings)?;

    info!(profile_id = %profile.id, profile_name = %profile.name, "Created profile and initialized settings");
    Ok(profile)
}

#[tauri::command]
pub async fn delete_profile_cmd(id: String, app_handle: tauri::AppHandle) -> AppResult<()> {
    let app_dir = app_data_dir(&app_handle)?;
    delete_profile(&app_dir, &id)?;
    info!(profile_id = %id, "Deleted profile");
    Ok(())
}

#[tauri::command]
pub async fn switch_profile_cmd(id: String, app_handle: tauri::AppHandle) -> AppResult<()> {
    let app_dir = app_data_dir(&app_handle)?;
    switch_profile(&app_dir, &id)?;
    info!(profile_id = %id, "Switched profile");
    Ok(())
}

#[tauri::command]
pub async fn rename_profile_cmd(
    id: String,
    new_name: String,
    app_handle: tauri::AppHandle,
) -> AppResult<()> {
    let app_dir = app_data_dir(&app_handle)?;
    rename_profile(&app_dir, &id, &new_name)?;
    info!(profile_id = %id, new_name = %new_name, "Renamed profile");
    Ok(())
}
