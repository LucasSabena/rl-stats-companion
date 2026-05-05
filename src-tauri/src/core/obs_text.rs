use std::fs;
use std::path::PathBuf;
use tracing::warn;

fn obs_output_dir() -> PathBuf {
    let appdata = std::env::var("APPDATA").unwrap_or_else(|_| ".".into());
    PathBuf::from(appdata).join("RLStats").join("obs_outputs")
}

pub fn update_obs_files(wins: i32, losses: i32, streak_str: &str) {
    let dir = obs_output_dir();
    if let Err(e) = fs::create_dir_all(&dir) {
        warn!(error = %e, path = %dir.display(), "Failed to create OBS output directory");
        return;
    }

    let total = wins + losses;
    let winrate = if total > 0 {
        format!("{:.0}%", (wins as f64 / total as f64) * 100.0)
    } else {
        "0%".to_string()
    };

    write_file(&dir.join("wins.txt"), &wins.to_string());
    write_file(&dir.join("losses.txt"), &losses.to_string());
    write_file(&dir.join("winrate.txt"), &winrate);
    write_file(&dir.join("streak.txt"), streak_str);
    write_file(&dir.join("played.txt"), &total.to_string());
}

pub fn update_obs_files_win(is_win: bool, wins: i32, losses: i32, streak_count: i32) {
    let streak = if streak_count > 0 {
        format!("{}W", streak_count)
    } else if streak_count < 0 {
        format!("{}L", -streak_count)
    } else if is_win {
        "1W".to_string()
    } else {
        "1L".to_string()
    };
    update_obs_files(wins, losses, &streak);
}

fn write_file(path: &PathBuf, content: &str) {
    if let Err(e) = fs::write(path, content) {
        warn!(error = %e, path = %path.display(), "Failed to write OBS text file");
    }
}
