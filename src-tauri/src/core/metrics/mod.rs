mod streak;

use crate::core::models::PlayerStats;

pub use streak::{calculate_streaks, calculate_streaks_for_sessions, StreakData};

pub fn shots_to_goals_ratio(stats: &PlayerStats) -> f64 {
    if stats.goals == 0 {
        0.0
    } else {
        stats.shots as f64 / stats.goals as f64
    }
}

pub fn save_percentage(shots_against: i32, saves: i32) -> f64 {
    if shots_against == 0 {
        0.0
    } else {
        (saves as f64 / shots_against as f64) * 100.0
    }
}
