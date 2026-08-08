use rusqlite::{
    backup::Backup,
    Connection,
    DatabaseName,
};
use std::path::Path;
use tauri::{AppHandle, Manager, State};

use crate::database::connection::DbState;

#[tauri::command]
pub fn importar_backup(
    app: AppHandle,
    backup_path: String,
) -> Result<String, String> {
    let app_dir = app
        .path()
        .app_config_dir()
        .map_err(|e| e.to_string())?;

    let backups_dir = app_dir.join("backups");

    std::fs::create_dir_all(&backups_dir)
        .map_err(|e| e.to_string())?;

    let origem = Path::new(&backup_path);

    if !origem.exists() {
        return Err("Arquivo de backup não encontrado.".into());
    }

    let timestamp = chrono::Local::now()
        .format("%Y%m%d%H%M%S")
        .to_string();

    let destino = backups_dir.join(format!(
        "backup_importado_{}.db",
        timestamp
    ));

    std::fs::copy(origem, &destino)
        .map_err(|e| format!("Erro ao importar backup: {}", e))?;

    Ok("Backup importado com sucesso.".into())
}

#[tauri::command]
pub fn restaurar_backup(
    db: State<DbState>,
    backup_path: String,
) -> Result<String, String> {

    let backup = Path::new(&backup_path);

    if !backup.exists() {
        return Err("Arquivo de backup não encontrado.".into());
    }

    println!("Iniciando restauração:");
    println!("Backup: {:?}", backup);

    // Abre o backup como uma conexão SQLite independente.
    let origem = Connection::open(backup)
        .map_err(|e| format!("Erro ao abrir backup: {}", e))?;

    // Mantém a conexão principal do aplicativo aberta.
    let mut destino = db
        .conn
        .lock()
        .map_err(|_| "Erro ao acessar conexão do banco.".to_string())?;

    println!("Executando SQLite Backup API...");

    {
        let backup_api = Backup::new(
            &origem,
            &mut destino,
        )
        .map_err(|e| format!("Erro ao iniciar restauração: {}", e))?;

        backup_api
            .run_to_completion(
                100,
                std::time::Duration::from_millis(10),
                None,
            )
            .map_err(|e| format!("Erro durante restauração: {}", e))?;
    }

    println!("Backup restaurado com sucesso.");

    Ok("Backup restaurado com sucesso.".into())
}