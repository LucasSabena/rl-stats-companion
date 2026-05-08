use crate::core::models::{
    CameraSettings, ControlSettings, DeadzoneSettings, HardwareSettings, UserPreset,
    UserPresetInput,
};
use crate::core::storage;
use crate::AppState;
use tauri::State;
use tracing::{error, info, warn};

#[tauri::command]
pub async fn list_user_presets_cmd(state: State<'_, AppState>) -> Result<Vec<UserPreset>, String> {
    let pool = &state.db_pool;
    storage::list_user_presets(pool).map_err(|e| {
        error!(error = %e, "Failed to list user presets");
        e.to_string()
    })
}

#[tauri::command]
pub async fn get_user_preset_cmd(
    state: State<'_, AppState>,
    id: i64,
) -> Result<Option<UserPreset>, String> {
    let pool = &state.db_pool;
    storage::get_user_preset(pool, id).map_err(|e| {
        error!(error = %e, preset_id = id, "Failed to get user preset");
        e.to_string()
    })
}

#[tauri::command]
pub async fn save_user_preset_cmd(
    state: State<'_, AppState>,
    preset: UserPresetInput,
) -> Result<i64, String> {
    let pool = &state.db_pool;

    let id = preset.id.unwrap_or(0);
    if id <= 0 {
        let new_id = storage::insert_user_preset(
            pool,
            &preset.name,
            preset.description.as_deref(),
            &preset.camera,
            &preset.controls,
            &preset.deadzone,
            &preset.hardware,
        )
        .map_err(|e| {
            error!(error = %e, "Failed to insert user preset");
            e.to_string()
        })?;
        info!(preset_id = new_id, name = %preset.name, "Inserted user preset");
        Ok(new_id)
    } else {
        storage::update_user_preset(
            pool,
            id,
            &preset.name,
            preset.description.as_deref(),
            &preset.camera,
            &preset.controls,
            &preset.deadzone,
            &preset.hardware,
        )
        .map_err(|e| {
            error!(error = %e, preset_id = id, "Failed to update user preset");
            e.to_string()
        })?;
        info!(preset_id = id, name = %preset.name, "Updated user preset");
        Ok(id)
    }
}

#[tauri::command]
pub async fn delete_user_preset_cmd(state: State<'_, AppState>, id: i64) -> Result<(), String> {
    let pool = &state.db_pool;
    storage::delete_user_preset(pool, id).map_err(|e| {
        error!(error = %e, preset_id = id, "Failed to delete user preset");
        e.to_string()
    })
}

#[tauri::command]
pub async fn export_preset_json_cmd(state: State<'_, AppState>, id: i64) -> Result<String, String> {
    let pool = &state.db_pool;
    let preset = storage::get_user_preset(pool, id).map_err(|e| {
        error!(error = %e, preset_id = id, "Failed to get preset for export");
        e.to_string()
    })?;

    match preset {
        Some(p) => serde_json::to_string_pretty(&p).map_err(|e| {
            error!(error = %e, preset_id = id, "Failed to serialize preset for export");
            e.to_string()
        }),
        None => Err("Preset not found".to_string()),
    }
}

#[tauri::command]
pub async fn import_preset_json_cmd(
    state: State<'_, AppState>,
    json: String,
) -> Result<i64, String> {
    let pool = &state.db_pool;

    let partial: serde_json::Value = serde_json::from_str(&json).map_err(|e| {
        error!(error = %e, "Failed to parse preset JSON");
        format!("Invalid JSON: {}", e)
    })?;

    let name = partial
        .get("name")
        .and_then(|v| v.as_str())
        .unwrap_or("Imported Preset")
        .to_string();
    let description = partial
        .get("description")
        .and_then(|v| v.as_str())
        .map(String::from);

    let camera: Option<CameraSettings> = partial.get("camera").and_then(|v| {
        serde_json::from_value(v.clone())
            .map_err(|e| {
                warn!(error = %e, "Failed to parse camera settings in import");
                e
            })
            .ok()
    });
    let controls: Option<ControlSettings> = partial.get("controls").and_then(|v| {
        serde_json::from_value(v.clone())
            .map_err(|e| {
                warn!(error = %e, "Failed to parse control settings in import");
                e
            })
            .ok()
    });
    let deadzone: Option<DeadzoneSettings> = partial.get("deadzone").and_then(|v| {
        serde_json::from_value(v.clone())
            .map_err(|e| {
                warn!(error = %e, "Failed to parse deadzone settings in import");
                e
            })
            .ok()
    });
    let hardware: Option<HardwareSettings> = partial.get("hardware").and_then(|v| {
        serde_json::from_value(v.clone())
            .map_err(|e| {
                warn!(error = %e, "Failed to parse hardware settings in import");
                e
            })
            .ok()
    });

    let id = storage::insert_user_preset(
        pool,
        &name,
        description.as_deref(),
        &camera,
        &controls,
        &deadzone,
        &hardware,
    )
    .map_err(|e| {
        error!(error = %e, "Failed to import preset");
        e.to_string()
    })?;

    info!(preset_id = id, name, "Imported user preset");
    Ok(id)
}
