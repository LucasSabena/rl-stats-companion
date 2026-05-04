use crate::core::settings::{get_rl_installation_paths, RlInstallation};

#[tauri::command]
pub async fn detect_rl_path(platform: Option<String>) -> Result<Vec<RlInstallation>, String> {
    let installations = get_rl_installation_paths(platform.as_deref());
    Ok(installations)
}
