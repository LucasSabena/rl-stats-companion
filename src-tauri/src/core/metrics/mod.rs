/// Metrics engine for derived statistics.
/// Currently a placeholder for future analytics computations.
use crate::core::models::PlayerStats;

/// Calculate shots-to-goals ratio.
pub fn shots_to_goals_ratio(stats: &PlayerStats) -> f64 {
    if stats.goals == 0 {
        0.0
    } else {
        stats.shots as f64 / stats.goals as f64
    }
}

/// Calculate save percentage.
pub fn save_percentage(shots_against: i32, saves: i32) -> f64 {
    if shots_against == 0 {
        0.0
    } else {
        (saves as f64 / shots_against as f64) * 100.0
    }
}
