use std::fs;
use tauri::{AppHandle, Manager};

pub fn aplicar_restore_pendente(
    app: &AppHandle,
) -> Result<(), String> {

    let app_dir = app
        .path()
        .app_config_dir()
        .map_err(|e| e.to_string())?;

    let restore = app_dir.join("restore.db");

    if !restore.exists() {
        return Ok(());
    }

    let banco = app_dir.join("estoque.db");

    if banco.exists() {
        fs::remove_file(&banco)
            .map_err(|e| e.to_string())?;
    }

    fs::rename(&restore, &banco)
        .map_err(|e| e.to_string())?;

    Ok(())
}