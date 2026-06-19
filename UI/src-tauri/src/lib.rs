use tauri_plugin_sql::Builder as SqlBuilder;
use std::fs;
use chrono::Local;
use tauri::Manager;

use serde::Serialize;

#[derive(Serialize)]
struct BackupInfo {
    nome: String,
    data: String,
    tamanho_bytes: u64,
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn criar_backup(app: tauri::AppHandle) -> Result<String, String> {

    let app_dir = app.
        path()
        .app_config_dir()
        .map_err(|e| e.to_string())?;

    let banco = app_dir.join("estoque.db");

    let backups_dir = app_dir.join("backups");

    fs::create_dir_all(&backups_dir)
        .map_err(|e| format!("Failed to create backups directory: {}", e))?;

    let timestamp = chrono::Local::now().format("%Y%m%d%H%M%S").to_string();

    let destino = backups_dir.join(format!("backup_{}.db", timestamp));

    fs::copy(&banco, &destino)
        .map_err(|e| format!("Failed to create backup: {}", e))?;

    
    const MAX_BACKUPS: usize = 90;

    let mut backups: Vec<_> = fs::read_dir(&backups_dir)
    .map_err(|e| e.to_string())?
    .filter_map(Result::ok)
    .collect();

    backups.sort_by_key(|entry| {
    entry
        .metadata()
        .and_then(|m| m.modified())
        .ok()
    });
    

    while backups.len() > MAX_BACKUPS {
        if let Some(oldest) = backups.first() {
            let path = oldest.path();
            fs::remove_file(&path)
                .map_err(|e| format!("Failed to remove old backup: {}", e))?;
            backups.remove(0);
        }
    }
    Ok(destino.to_string_lossy().to_string())
}

#[tauri::command]
fn listar_backups(
    app: tauri::AppHandle
) -> Result<Vec<BackupInfo>, String> {

    let app_dir = app
        .path()
        .app_config_dir()
        .map_err(|e| e.to_string())?;

    let backups_dir = app_dir.join("backups");

    if !backups_dir.exists() {
        return Ok(vec![]);
    }

    let mut backups = vec![];

    for entry in fs::read_dir(backups_dir)
        .map_err(|e| e.to_string())?
    {
        let entry = entry.map_err(|e| e.to_string())?;

        let metadata = entry
            .metadata()
            .map_err(|e| e.to_string())?;

        let nome = entry
            .file_name()
            .to_string_lossy()
            .to_string();

        let modified = metadata
            .modified()
            .map_err(|e| e.to_string())?;

        let data = chrono::DateTime::<chrono::Local>::from(modified)
            .format("%d/%m/%Y %H:%M:%S")
            .to_string();

        backups.push(BackupInfo {
            nome,
            data,
            tamanho_bytes: metadata.len(),
        });
    }

    backups.sort_by(|a, b| b.data.cmp(&a.data));

    Ok(backups)
}

#[tauri::command]
fn restaurar_backup(app: tauri::AppHandle, backup_path: &str) -> Result<String, String> {
    let app_dir = app
        .path()
        .app_config_dir()
        .map_err(|e| e.to_string())?;

    let banco = app_dir.join("estoque.db");
    let backup = std::path::Path::new(backup_path);

    if !backup.exists() {
        return Err("Backup file does not exist".to_string());
    }

    fs::copy(backup, banco)
        .map_err(|e| format!("Failed to restore backup: {}", e))?;

    Ok("Backup restored successfully".to_string())
}



#[tauri::command]
fn verificar_backup_diario(app: tauri::AppHandle) -> Result<(), String> {
    let app_dir = app
        .path()
        .app_config_dir()
        .map_err(|e| e.to_string())?;

    let backups_dir = app_dir.join("backups");

    if !backups_dir.exists() {
        fs::create_dir_all(&backups_dir)
            .map_err(|e| e.to_string())?;
    }

    let mut ultimo_backup: Option<std::time::SystemTime> = None;

    let entries = fs::read_dir(&backups_dir)
        .map_err(|e| e.to_string())?;

    for entry in entries {
        let entry = entry.map_err(|e| e.to_string())?;

        let metadata = entry
            .metadata()
            .map_err(|e| e.to_string())?;

        if let Ok(modified) = metadata.modified() {
            match ultimo_backup {
                Some(data) if modified > data => {
                    ultimo_backup = Some(modified);
                }
                None => {
                    ultimo_backup = Some(modified);
                }
                _ => {}
            }
        }
    }

    let precisa_criar = match ultimo_backup {
        Some(data) => {
            let agora = std::time::SystemTime::now();

            match agora.duration_since(data) {
                Ok(diff) => diff.as_secs() > 60 * 60 * 24,
                Err(_) => false,
            }
        }
        None => true,
    };

    if precisa_criar {
        criar_backup(app)?;
    }

    Ok(())
}

#[tauri::command]
fn excluir_backup(
    app: tauri::AppHandle,
    nome_arquivo: String,
) -> Result<(), String> {

    let app_dir = app
        .path()
        .app_config_dir()
        .map_err(|e| e.to_string())?;

    let backup_path = app_dir
        .join("backups")
        .join(nome_arquivo);

    if !backup_path.exists() {
        return Err("Backup não encontrado".into());
    }

    fs::remove_file(backup_path)
        .map_err(|e| e.to_string())?;

    Ok(())
}


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(SqlBuilder::default().build())
        .invoke_handler(tauri::generate_handler![greet, criar_backup, listar_backups, restaurar_backup, verificar_backup_diario, excluir_backup])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
