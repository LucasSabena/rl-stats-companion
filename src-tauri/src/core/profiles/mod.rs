use crate::error::{AppError, AppResult};
use chrono::Utc;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};
use tracing::{debug, info, warn};

/// A user profile representing an isolated stats database.
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Profile {
    pub id: String,
    pub name: String,
    pub created_at: String,
}

/// Manifest that tracks all profiles and the currently active one.
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ProfilesManifest {
    pub profiles: Vec<Profile>,
    pub active_profile_id: String,
}

/// Returns the path to the profiles manifest JSON file.
pub fn get_profiles_manifest_path(app_dir: &Path) -> PathBuf {
    app_dir.join("profiles.json")
}

/// Returns the database path for a given profile ID.
pub fn get_db_path_for_profile(app_dir: &Path, profile_id: &str) -> PathBuf {
    app_dir.join(format!("rl_stats_{}.db", profile_id))
}

/// Reads the manifest from disk.
fn read_manifest(path: &Path) -> AppResult<ProfilesManifest> {
    let content = fs::read_to_string(path)?;
    let manifest = serde_json::from_str(&content)?;
    Ok(manifest)
}

/// Writes the manifest atomically (temp file + rename).
fn write_manifest(path: &Path, manifest: &ProfilesManifest) -> AppResult<()> {
    let json = serde_json::to_string_pretty(manifest)?;
    let tmp_path = path.with_extension("tmp");
    fs::write(&tmp_path, json)?;
    fs::rename(&tmp_path, path)?;
    Ok(())
}

/// Initializes the profile system.
///
/// - If `profiles.json` exists, reads it and returns the active profile ID.
/// - If not, checks for a legacy `rl_stats.db` and migrates it to `rl_stats_default.db`.
/// - Creates a default profile if none exist.
pub fn init_profiles(app_dir: &Path) -> AppResult<String> {
    let manifest_path = get_profiles_manifest_path(app_dir);

    if manifest_path.exists() {
        let manifest = read_manifest(&manifest_path)?;
        let active_id = manifest.active_profile_id.clone();

        if manifest.profiles.iter().any(|p| p.id == active_id) {
            debug!(active_profile = %active_id, "Profiles manifest loaded");
            return Ok(active_id);
        }

        warn!(
            active_profile = %active_id,
            "Active profile not found in manifest, falling back to first profile"
        );

        if let Some(first) = manifest.profiles.first() {
            return Ok(first.id.clone());
        }

        return Err(AppError::ConfigError(
            "Profiles manifest exists but contains no profiles".into(),
        ));
    }

    let legacy_db = app_dir.join("rl_stats.db");
    let default_db = get_db_path_for_profile(app_dir, "default");

    if legacy_db.exists() {
        info!("Migrating legacy database to default profile");
        fs::rename(&legacy_db, &default_db)?;
    }

    let default_profile = Profile {
        id: "default".to_string(),
        name: "Default".to_string(),
        created_at: Utc::now().to_rfc3339(),
    };

    let manifest = ProfilesManifest {
        profiles: vec![default_profile],
        active_profile_id: "default".to_string(),
    };

    write_manifest(&manifest_path, &manifest)?;
    info!("Created default profile");

    Ok("default".to_string())
}

/// Lists all profiles.
pub fn list_profiles(app_dir: &Path) -> AppResult<Vec<Profile>> {
    let manifest_path = get_profiles_manifest_path(app_dir);
    let manifest = read_manifest(&manifest_path)?;
    Ok(manifest.profiles)
}

/// Returns the currently active profile.
pub fn get_active_profile(app_dir: &Path) -> AppResult<Profile> {
    let manifest_path = get_profiles_manifest_path(app_dir);
    let manifest = read_manifest(&manifest_path)?;

    manifest
        .profiles
        .into_iter()
        .find(|p| p.id == manifest.active_profile_id)
        .ok_or_else(|| {
            AppError::ConfigError(format!(
                "Active profile '{}' not found",
                manifest.active_profile_id
            ))
        })
}

/// Sanitizes a user-provided name into a valid profile ID.
fn sanitize_profile_id(name: &str) -> String {
    name.to_ascii_lowercase()
        .chars()
        .map(|c| if c == ' ' { '_' } else { c })
        .filter(|c| c.is_ascii_alphanumeric() || *c == '_')
        .collect()
}

/// Creates a new profile with the given name.
pub fn create_profile(app_dir: &Path, name: &str) -> AppResult<Profile> {
    let manifest_path = get_profiles_manifest_path(app_dir);
    let mut manifest = read_manifest(&manifest_path)?;

    let mut id = sanitize_profile_id(name);
    if id.is_empty() {
        id = "profile".to_string();
    }

    let original_id = id.clone();
    let mut counter = 1;
    while manifest.profiles.iter().any(|p| p.id == id) {
        id = format!("{}_{}", original_id, counter);
        counter += 1;
    }

    let profile = Profile {
        id: id.clone(),
        name: name.to_string(),
        created_at: Utc::now().to_rfc3339(),
    };

    let db_path = get_db_path_for_profile(app_dir, &id);
    if !db_path.exists() {
        let _ = fs::File::create(&db_path)?;
        debug!(profile_id = %id, db_path = %db_path.display(), "Created empty profile database");
    }

    manifest.profiles.push(profile.clone());
    write_manifest(&manifest_path, &manifest)?;

    info!(profile_id = %id, profile_name = %name, "Created new profile");
    Ok(profile)
}

/// Deletes a profile by ID.
///
/// Prevents deleting the last profile or the currently active profile.
pub fn delete_profile(app_dir: &Path, id: &str) -> AppResult<()> {
    let manifest_path = get_profiles_manifest_path(app_dir);
    let mut manifest = read_manifest(&manifest_path)?;

    if manifest.profiles.len() <= 1 {
        return Err(AppError::ConfigError(
            "Cannot delete the last remaining profile".into(),
        ));
    }

    if manifest.active_profile_id == id {
        return Err(AppError::ConfigError(
            "Cannot delete the currently active profile".into(),
        ));
    }

    let idx = manifest
        .profiles
        .iter()
        .position(|p| p.id == id)
        .ok_or_else(|| AppError::ConfigError(format!("Profile '{}' not found", id)))?;

    let profile = manifest.profiles.remove(idx);

    let db_path = get_db_path_for_profile(app_dir, id);
    if db_path.exists() {
        fs::remove_file(&db_path)?;
        debug!(profile_id = %id, db_path = %db_path.display(), "Deleted profile database");
    } else {
        warn!(profile_id = %id, db_path = %db_path.display(), "Profile database not found for deletion");
    }

    write_manifest(&manifest_path, &manifest)?;
    info!(profile_id = %id, "Deleted profile '{}'", profile.name);

    Ok(())
}

/// Switches the active profile to the given ID.
pub fn switch_profile(app_dir: &Path, id: &str) -> AppResult<()> {
    let manifest_path = get_profiles_manifest_path(app_dir);
    let mut manifest = read_manifest(&manifest_path)?;

    if !manifest.profiles.iter().any(|p| p.id == id) {
        return Err(AppError::ConfigError(format!("Profile '{}' not found", id)));
    }

    manifest.active_profile_id = id.to_string();
    write_manifest(&manifest_path, &manifest)?;

    info!(profile_id = %id, "Switched active profile");
    Ok(())
}

/// Renames an existing profile.
pub fn rename_profile(app_dir: &Path, id: &str, new_name: &str) -> AppResult<()> {
    let manifest_path = get_profiles_manifest_path(app_dir);
    let mut manifest = read_manifest(&manifest_path)?;

    let profile = manifest
        .profiles
        .iter_mut()
        .find(|p| p.id == id)
        .ok_or_else(|| AppError::ConfigError(format!("Profile '{}' not found", id)))?;

    profile.name = new_name.to_string();
    write_manifest(&manifest_path, &manifest)?;

    info!(profile_id = %id, new_name = %new_name, "Renamed profile");
    Ok(())
}
