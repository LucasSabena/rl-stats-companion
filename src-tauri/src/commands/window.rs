// (no additional imports needed — tauri::Window injected automatically)

#[tauri::command]
pub async fn toggle_overlay_mode(win: tauri::Window) -> Result<bool, String> {
    let decorated = win.is_decorated().map_err(|e| e.to_string())?;

    if decorated {
        // Switch to overlay mode: frameless, always-on-top, small, semi-transparent
        win.set_decorations(false).map_err(|e| e.to_string())?;
        win.set_always_on_top(true).map_err(|e| e.to_string())?;
        win.set_size(tauri::Size::Physical(tauri::PhysicalSize::new(420, 320)))
            .map_err(|e| e.to_string())?;
        win.set_position(tauri::Position::Physical(tauri::PhysicalPosition::new(
            40, 80,
        )))
        .map_err(|e| e.to_string())?;
        win.set_resizable(false).map_err(|e| e.to_string())?;
        win.set_minimizable(false).map_err(|e| e.to_string())?;
        win.set_skip_taskbar(true).map_err(|e| e.to_string())?;
    } else {
        // Switch to normal mode: decorations, resizable, centered
        win.set_always_on_top(false).map_err(|e| e.to_string())?;
        win.set_resizable(true).map_err(|e| e.to_string())?;
        win.set_minimizable(true).map_err(|e| e.to_string())?;
        win.set_skip_taskbar(false).map_err(|e| e.to_string())?;
        win.set_size(tauri::Size::Physical(tauri::PhysicalSize::new(1280, 800)))
            .map_err(|e| e.to_string())?;
        win.center().map_err(|e| e.to_string())?;
        win.set_decorations(true).map_err(|e| e.to_string())?;
    }

    // Now overlay mode is active if decorations are off
    Ok(!decorated)
}

#[tauri::command]
pub async fn is_overlay_mode(win: tauri::Window) -> Result<bool, String> {
    let decorated = win.is_decorated().map_err(|e| e.to_string())?;
    Ok(!decorated)
}
