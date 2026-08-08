use std::fs;

use chrono::Local;
use rusqlite::{backup::Backup, Connection};
use serde::Serialize;
use tauri::{AppHandle, Manager, State};

use crate::database::connection::DbState;

#[derive(Debug, Clone, Serialize)]
pub struct BackupInfo {
    pub nome: String,
    pub data: String,
    pub tamanho_bytes: u64,
}

#[tauri::command]
pub fn criar_backup(
    app: AppHandle,
    db: State<DbState>,
) -> Result<String, String> {

    let app_dir = app
        .path()
        .app_config_dir()
        .map_err(|e| e.to_string())?;

    let backups_dir = app_dir.join("backups");

    fs::create_dir_all(&backups_dir)
        .map_err(|e| e.to_string())?;

    let timestamp = Local::now()
        .format("%Y%m%d%H%M%S")
        .to_string();

    let destino = backups_dir.join(format!("backup_{}.db", timestamp));

    // Pega a conexão atual do banco
    let conn = db
        .conn
        .lock()
        .map_err(|e| e.to_string())?;

    // Cria o arquivo de destino
    let mut destino_db = Connection::open(&destino)
        .map_err(|e| e.to_string())?;

    // Usa a SQLite Backup API
    {
        let backup = Backup::new(
            &conn,
            &mut destino_db,
        )
        .map_err(|e| e.to_string())?;

        backup
            .step(-1)
            .map_err(|e| e.to_string())?;
    }

    // Fecha a conexão do arquivo de destino
    destino_db
        .close()
        .map_err(|(_, e)| e.to_string())?;

    remover_backups_antigos(&backups_dir)?;

    Ok(destino.to_string_lossy().to_string())
}

#[tauri::command]
fn remover_backups_antigos(
    pasta: &std::path::Path,
) -> Result<(), String> {

    const MAX_BACKUPS: usize = 90;

    let mut backups: Vec<_> = fs::read_dir(pasta)
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

            fs::remove_file(oldest.path())
                .map_err(|e| e.to_string())?;

            backups.remove(0);
        }
    }

    Ok(())
}

#[tauri::command]
pub fn listar_backups(
    app: AppHandle,
) -> Result<Vec<BackupInfo>, String> {

    let app_dir = app
        .path()
        .app_config_dir()
        .map_err(|e| e.to_string())?;

    let backups_dir = app_dir.join("backups");

    if !backups_dir.exists() {
        return Ok(vec![]);
    }

    let mut lista = Vec::new();

    for entry in fs::read_dir(backups_dir)
        .map_err(|e| e.to_string())? {

        let entry = entry.map_err(|e| e.to_string())?;

        let metadata = entry
            .metadata()
            .map_err(|e| e.to_string())?;

        let modified = metadata
            .modified()
            .map_err(|e| e.to_string())?;

        lista.push((
            BackupInfo {
                nome: entry
                    .file_name()
                    .to_string_lossy()
                    .to_string(),

                data: chrono::DateTime::<Local>::from(modified)
                    .format("%d/%m/%Y %H:%M:%S")
                    .to_string(),

                tamanho_bytes: metadata.len(),
            },
            modified,
        ));
    }

    lista.sort_by(|a, b| b.1.cmp(&a.1));

    Ok(
        lista
            .into_iter()
            .map(|v| v.0)
            .collect()
    )
}

#[tauri::command]
pub fn excluir_backup(
    app: AppHandle,
    nome: String,
) -> Result<String, String> {

    let app_dir = app
        .path()
        .app_config_dir()
        .map_err(|e| e.to_string())?;

    let backup = app_dir
        .join("backups")
        .join(nome);

    if backup.exists() {

        fs::remove_file(&backup)
            .map_err(|e| e.to_string())?;
    }

    Ok("Backup excluído com sucesso.".into())
}

#[tauri::command]
pub fn exportar_backup(
    origem: String,
    destino: String,
) -> Result<String, String> {

    fs::copy(&origem, &destino)
        .map_err(|e| e.to_string())?;

    Ok("Backup exportado com sucesso.".into())
}