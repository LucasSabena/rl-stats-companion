use crate::core::settings::get_rl_installation_paths;

#[tauri::command]
pub async fn detect_rl_path() -> Result<Vec<String>, String> {
    let paths = get_rl_installation_paths();
    Ok(paths)
}
