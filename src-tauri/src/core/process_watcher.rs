use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use std::thread;
use std::time::Duration;
use tracing::info;

const RL_PROCESS_NAMES: &[&str] = &["RocketLeague.exe", "RocketLeague-Win64-Shipping.exe"];

pub struct ProcessWatcher {
    pub game_running: Arc<AtomicBool>,
}

impl Default for ProcessWatcher {
    fn default() -> Self {
        Self::new()
    }
}

impl ProcessWatcher {
    pub fn new() -> Self {
        ProcessWatcher {
            game_running: Arc::new(AtomicBool::new(false)),
        }
    }

    /// Start background thread that polls for the Rocket League process every 2 seconds.
    pub fn start(self) -> Arc<AtomicBool> {
        let game_running = Arc::clone(&self.game_running);
        thread::spawn(move || {
            let mut last_state = false;
            loop {
                let running = is_rl_running();
                if running != last_state {
                    last_state = running;
                    game_running.store(running, Ordering::SeqCst);
                    info!(running, "Rocket League process state changed");
                }
                thread::sleep(Duration::from_secs(2));
            }
        });
        self.game_running
    }
}

fn is_rl_running() -> bool {
    let mut system = sysinfo::System::new_all();
    system.refresh_processes(sysinfo::ProcessesToUpdate::All, true);
    for process in system.processes().values() {
        let name = process.name().to_str().unwrap_or_default();
        for rl_name in RL_PROCESS_NAMES {
            if name.eq_ignore_ascii_case(rl_name) {
                return true;
            }
        }
    }
    false
}
