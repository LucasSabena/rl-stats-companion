use crate::core::storage::DbPool;
use crate::error::{AppError, AppResult};
use rusqlite::params;
use serde::{Deserialize, Serialize};
use std::collections::HashSet;
use std::fs;
use std::path::{Path, PathBuf};
use tracing::info;

/// Application settings persisted in the database.
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct AppSettings {
    pub player_name: String,
    pub local_primary_id: Option<String>,
    pub auto_start: bool,
    pub port: u16,
    pub data_retention_days: i32,
    pub rl_path: Option<String>,
    pub platform: Option<String>,
    pub theme: String,
    pub language: String,
    pub default_match_type: Option<String>,
    pub tracker_api_key: Option<String>,
    pub tracker_platform: Option<String>,
    pub tracker_username: Option<String>,
    pub tracker_auto_refresh: bool,
    pub tracker_refresh_interval_min: u32,
    pub session_gap_minutes: u32,
    // ─── Overlay window settings ─────────────────────────────────────────
    pub overlay_enabled: bool,
    pub overlay_opacity: f64,
    pub overlay_position_x: i32,
    pub overlay_position_y: i32,
    pub overlay_width: i32,
    pub overlay_height: i32,
    pub overlay_show_score: bool,
    pub overlay_show_players: bool,
    pub overlay_show_stats: bool,
    pub overlay_show_timer: bool,
    pub overlay_font_scale: String,
    pub overlay_clickthrough: bool,
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            player_name: String::new(),
            local_primary_id: None,
            auto_start: true,
            port: 49123,
            data_retention_days: 90,
            rl_path: None,
            platform: None,
            theme: "dark".to_string(),
            language: "es".to_string(),
            default_match_type: Some("ranked".to_string()),
            tracker_api_key: None,
            tracker_platform: None,
            tracker_username: None,
            tracker_auto_refresh: true,
            tracker_refresh_interval_min: 5,
            session_gap_minutes: 30,
            overlay_enabled: false,
            overlay_opacity: 0.75,
            overlay_position_x: 40,
            overlay_position_y: 80,
            overlay_width: 420,
            overlay_height: 320,
            overlay_show_score: true,
            overlay_show_players: true,
            overlay_show_stats: true,
            overlay_show_timer: true,
            overlay_font_scale: "medium".to_string(),
            overlay_clickthrough: true,
        }
    }
}

impl AppSettings {
    fn to_kv(&self) -> Vec<(&str, String)> {
        vec![
            ("player_name", self.player_name.clone()),
            (
                "local_primary_id",
                self.local_primary_id.clone().unwrap_or_default(),
            ),
            ("auto_start", self.auto_start.to_string()),
            ("port", self.port.to_string()),
            ("data_retention_days", self.data_retention_days.to_string()),
            ("rl_path", self.rl_path.clone().unwrap_or_default()),
            ("platform", self.platform.clone().unwrap_or_default()),
            ("theme", self.theme.clone()),
            ("language", self.language.clone()),
            (
                "default_match_type",
                self.default_match_type.clone().unwrap_or_default(),
            ),
            (
                "tracker_api_key",
                self.tracker_api_key.clone().unwrap_or_default(),
            ),
            (
                "tracker_platform",
                self.tracker_platform.clone().unwrap_or_default(),
            ),
            (
                "tracker_username",
                self.tracker_username.clone().unwrap_or_default(),
            ),
            (
                "tracker_auto_refresh",
                self.tracker_auto_refresh.to_string(),
            ),
            (
                "tracker_refresh_interval_min",
                self.tracker_refresh_interval_min.to_string(),
            ),
            (
                "session_gap_minutes",
                self.session_gap_minutes.to_string(),
            ),
            ("overlay_enabled", self.overlay_enabled.to_string()),
            ("overlay_opacity", self.overlay_opacity.to_string()),
            ("overlay_position_x", self.overlay_position_x.to_string()),
            ("overlay_position_y", self.overlay_position_y.to_string()),
            ("overlay_width", self.overlay_width.to_string()),
            ("overlay_height", self.overlay_height.to_string()),
            ("overlay_show_score", self.overlay_show_score.to_string()),
            ("overlay_show_players", self.overlay_show_players.to_string()),
            ("overlay_show_stats", self.overlay_show_stats.to_string()),
            ("overlay_show_timer", self.overlay_show_timer.to_string()),
            ("overlay_font_scale", self.overlay_font_scale.clone()),
            (
                "overlay_clickthrough",
                self.overlay_clickthrough.to_string(),
            ),
        ]
    }
}

/// Load settings from the database, returning defaults if none exist.
pub fn get_settings(pool: &DbPool) -> AppResult<AppSettings> {
    let conn = pool
        .get()
        .map_err(|e| AppError::StorageError(e.to_string()))?;

    let mut settings = AppSettings::default();

    let mut stmt = conn
        .prepare("SELECT key, value FROM app_settings")
        .map_err(|e| AppError::StorageError(e.to_string()))?;

    let rows = stmt
        .query_map([], |row| {
            let key: String = row.get(0)?;
            let value: String = row.get(1)?;
            Ok((key, value))
        })
        .map_err(|e| AppError::StorageError(e.to_string()))?;

    for row in rows {
        let (key, value) = row.map_err(|e| AppError::StorageError(e.to_string()))?;
        match key.as_str() {
            "player_name" => settings.player_name = value,
            "local_primary_id" => {
                settings.local_primary_id = if value.is_empty() { None } else { Some(value) };
            }
            "auto_start" => settings.auto_start = value.parse().unwrap_or(true),
            "port" => settings.port = value.parse().unwrap_or(49123),
            "data_retention_days" => settings.data_retention_days = value.parse().unwrap_or(90),
            "rl_path" => {
                settings.rl_path = if value.is_empty() { None } else { Some(value) };
            }
            "platform" => {
                settings.platform = if value.is_empty() { None } else { Some(value) };
            }
            "theme" => settings.theme = value,
            "language" => settings.language = value,
            "default_match_type" => {
                settings.default_match_type = if value.is_empty() { None } else { Some(value) };
            }
            "tracker_api_key" => {
                settings.tracker_api_key = if value.is_empty() { None } else { Some(value) };
            }
            "tracker_platform" => {
                settings.tracker_platform = if value.is_empty() { None } else { Some(value) };
            }
            "tracker_username" => {
                settings.tracker_username = if value.is_empty() { None } else { Some(value) };
            }
            "tracker_auto_refresh" => settings.tracker_auto_refresh = value.parse().unwrap_or(true),
            "tracker_refresh_interval_min" => {
                settings.tracker_refresh_interval_min = value.parse().unwrap_or(5)
            }
            "session_gap_minutes" => {
                settings.session_gap_minutes = value.parse().unwrap_or(30)
            }
            "overlay_enabled" => {
                settings.overlay_enabled = value.parse().unwrap_or(false)
            }
            "overlay_opacity" => {
                settings.overlay_opacity = value.parse::<f64>().unwrap_or(0.75)
            }
            "overlay_position_x" => {
                settings.overlay_position_x = value.parse().unwrap_or(40)
            }
            "overlay_position_y" => {
                settings.overlay_position_y = value.parse().unwrap_or(80)
            }
            "overlay_width" => {
                settings.overlay_width = value.parse().unwrap_or(420)
            }
            "overlay_height" => {
                settings.overlay_height = value.parse().unwrap_or(320)
            }
            "overlay_show_score" => {
                settings.overlay_show_score = value.parse().unwrap_or(true)
            }
            "overlay_show_players" => {
                settings.overlay_show_players = value.parse().unwrap_or(true)
            }
            "overlay_show_stats" => {
                settings.overlay_show_stats = value.parse().unwrap_or(true)
            }
            "overlay_show_timer" => {
                settings.overlay_show_timer = value.parse().unwrap_or(true)
            }
            "overlay_font_scale" => settings.overlay_font_scale = value,
            "overlay_clickthrough" => {
                settings.overlay_clickthrough = value.parse().unwrap_or(true)
            }
            _ => {}
        }
    }

    Ok(settings)
}

/// Save settings to the database.
pub fn set_settings(pool: &DbPool, settings: &AppSettings) -> AppResult<()> {
    let conn = pool
        .get()
        .map_err(|e| AppError::StorageError(e.to_string()))?;

    for (key, value) in settings.to_kv() {
        conn.execute(
            "INSERT INTO app_settings (key, value) VALUES (?1, ?2)
             ON CONFLICT(key) DO UPDATE SET value = excluded.value",
            params![key, value],
        )
        .map_err(|e| AppError::StorageError(e.to_string()))?;
    }

    info!("Settings saved");
    Ok(())
}

/// Attempt to write Rocket League's DefaultStatsAPI.ini to configure the Stats API port.
/// Checks multiple known installation locations (Steam libraries, Epic, Documents).
pub fn configure_rl_ini(port: u16) -> AppResult<()> {
    let candidates = find_rl_ini_candidates();

    if candidates.is_empty() {
        return Err(AppError::ConfigError(
            "No se encontró la instalación de Rocket League. \
Verificá que el juego esté instalado en Steam o Epic Games."
                .into(),
        ));
    }

    let content = format!(
        "[TAGame.MatchStatsExporter_TA]\n\n; Port the client will listen for connections on\nPort={}\n\n; How many times per second the game sends the update state (capped at 120, 0 disables this feature)\nPacketSendRate=60\n",
        port
    );

    let mut last_error = None;
    let mut written_paths = Vec::new();

    for path in &candidates {
        if let Some(parent) = path.parent() {
            if let Err(e) = fs::create_dir_all(parent) {
                last_error = Some(format!("{}: {}", path.display(), e));
                continue;
            }
        }
        match fs::write(path, &content) {
            Ok(()) => {
                info!(path = %path.display(), "Wrote Rocket League Stats API INI");
                written_paths.push(path.display().to_string());
            }
            Err(e) => {
                last_error = Some(format!("{}: {}", path.display(), e));
            }
        }
    }

    if !written_paths.is_empty() {
        info!(
            count = written_paths.len(),
            "Updated Rocket League Stats API INI files"
        );
        return Ok(());
    }

    Err(AppError::ConfigError(format!(
        "No se pudo escribir el archivo de configuración en ninguna ubicación conocida. Último error: {}",
        last_error.unwrap_or_else(|| "desconocido".into())
    )))
}

/// Find all candidate paths for DefaultStatsAPI.ini across known Steam/Epic installations.
fn find_rl_ini_candidates() -> Vec<PathBuf> {
    let mut candidates = Vec::new();

    // 1. User profile search for any existing Rocket League config copies, including OneDrive/localized folders.
    if let Some(user_profile) = dirs::home_dir() {
        collect_existing_rl_ini_files(&user_profile, &mut candidates);
    }

    // 2. Documents fallback (legacy location used by some versions)
    if let Some(docs) = dirs::document_dir() {
        candidates.push(docs.join("My Games/Rocket League/TAGame/Config/DefaultStatsAPI.ini"));
    }

    // 3. Discover Steam library folders from libraryfolders.vdf
    let mut steam_root_candidates: Vec<PathBuf> = vec![
        PathBuf::from("C:/Program Files (x86)/Steam"),
        PathBuf::from("C:/Program Files/Steam"),
        PathBuf::from("A:/Steam"),
        PathBuf::from("A:/SteamLibrary"),
    ];
    if let Some(data_dir) = dirs::data_dir() {
        steam_root_candidates.push(data_dir.join("Steam"));
    }

    for steam_root in &steam_root_candidates {
        let vdf = steam_root.join("steamapps/libraryfolders.vdf");
        if vdf.exists() {
            if let Ok(text) = fs::read_to_string(&vdf) {
                // Extract quoted paths from VDF (simple heuristic)
                for line in text.lines() {
                    let trimmed = line.trim();
                    if trimmed.starts_with('"')
                        && (trimmed.contains(":/") || trimmed.contains(":\\"))
                    {
                        // Find quoted string content
                        if let Some(start) = trimmed.find('"') {
                            let after = &trimmed[start + 1..];
                            if let Some(end) = after.find('"') {
                                let path_str = &after[..end];
                                let path = PathBuf::from(path_str.replace("\\\\", "/"));
                                candidates.push(path.join("steamapps/common/rocketleague/TAGame/Config/DefaultStatsAPI.ini"));
                            }
                        }
                    }
                }
            }
        }

        // Always include the default steamapps/common under this root
        candidates.push(
            steam_root.join("steamapps/common/rocketleague/TAGame/Config/DefaultStatsAPI.ini"),
        );
    }

    // 4. Epic Games common paths
    let epic_candidates = [
        "C:/Program Files/Epic Games/RocketLeague/TAGame/Config/DefaultStatsAPI.ini",
        "C:/Program Files/Epic Games/Rocket League/TAGame/Config/DefaultStatsAPI.ini",
        "A:/Epic Games/RocketLeague/TAGame/Config/DefaultStatsAPI.ini",
    ];
    for path in &epic_candidates {
        candidates.push(PathBuf::from(path));
    }

    // Remove duplicates while preserving order
    let mut seen = std::collections::HashSet::new();
    candidates.retain(|p| seen.insert(p.clone()));

    candidates
}

fn collect_existing_rl_ini_files(root: &Path, candidates: &mut Vec<PathBuf>) {
    let mut stack = vec![root.to_path_buf()];

    while let Some(dir) = stack.pop() {
        let entries = match fs::read_dir(&dir) {
            Ok(entries) => entries,
            Err(_) => continue,
        };

        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_dir() {
                let name = path
                    .file_name()
                    .and_then(|name| name.to_str())
                    .unwrap_or_default()
                    .to_ascii_lowercase();

                if ["appdata", ".cargo", ".rustup", "node_modules"].contains(&name.as_str()) {
                    continue;
                }

                stack.push(path);
                continue;
            }

            let is_target = path
                .file_name()
                .and_then(|name| name.to_str())
                .map(|name| name.eq_ignore_ascii_case("DefaultStatsAPI.ini"))
                .unwrap_or(false);

            if !is_target {
                continue;
            }

            let path_text = path.to_string_lossy().to_ascii_lowercase();
            if path_text.contains("rocket league") || path_text.contains("rocketleague") {
                candidates.push(path);
            }
        }
    }
}

/// Extract unique Rocket League installation root paths from INI candidates.
/// Goes up from TAGame/Config/ to find the game root directory.
pub fn get_rl_installation_paths() -> Vec<String> {
    let mut seen = HashSet::new();
    let mut paths = Vec::new();

    for ini_path in find_rl_ini_candidates() {
        // Walk up to find the game root (above TAGame/Config/DefaultStatsAPI.ini)
        if let Some(root) = extract_game_root(&ini_path) {
            let normalized = root.to_string_lossy().to_string();
            if seen.insert(normalized.clone()) {
                paths.push(normalized);
            }
        }
    }

    paths
}

/// Given a path like ".../rocketleague/TAGame/Config/DefaultStatsAPI.ini",
/// return the game root directory (e.g., ".../rocketleague").
fn extract_game_root(ini_path: &Path) -> Option<PathBuf> {
    let mut current = ini_path.to_path_buf();

    // Walk up 3 levels: file -> Config -> TAGame -> game root
    // First: remove DefaultStatsAPI.ini (file)
    current = current.parent()?.to_path_buf();
    // Second: remove Config
    current = current.parent()?.to_path_buf();
    // Third: remove TAGame
    current = current.parent()?.to_path_buf();

    // Verify this looks like a game root by checking existence
    if current.exists() {
        Some(current)
    } else {
        None
    }
}
