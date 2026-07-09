use tauri_plugin_sql::Builder as SqlBuilder;
use std::fs;
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
fn listar_backups(app: tauri::AppHandle) -> Result<Vec<BackupInfo>, String> {
    let app_dir = app
        .path()
        .app_config_dir()
        .map_err(|e| e.to_string())?;

    let backups_dir = app_dir.join("backups");

    if !backups_dir.exists() {
        return Ok(vec![]);
    }

    // Criamos uma tupla temporária contendo a estrutura e o SystemTime original para ordenação
    let mut arquivos_com_data = vec![];

    for entry in fs::read_dir(backups_dir).map_err(|e| e.to_string())? {
        let entry = entry.map_err(|e| e.to_string())?;
        let metadata = entry.metadata().map_err(|e| e.to_string())?;
        let nome = entry.file_name().to_string_lossy().to_string();
        let modified = metadata.modified().map_err(|e| e.to_string())?;

        let data_formatada = chrono::DateTime::<chrono::Local>::from(modified)
            .format("%d/%m/%Y %H:%M:%S")
            .to_string();

        arquivos_com_data.push((
            BackupInfo {
                nome,
                data: data_formatada,
                tamanho_bytes: metadata.len(),
            },
            modified, // Guardamos o SystemTime real aqui
        ));
    }

    // 1. Ordena pelo SystemTime de forma decrescente (mais recente primeiro)
    arquivos_com_data.sort_by(|a, b| b.1.cmp(&a.1));

    // 2. Extrai apenas o BackupInfo já ordenado corretamente
    let backups: Vec<BackupInfo> = arquivos_com_data.into_iter().map(|(info, _)| info).collect();

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

    println!("Restaurando backup: {:?}", backup);
    println!("Banco destino: {:?}", banco);

    if !backup.exists() {
        return Err("Backup file does not exist".to_string());
    }

    fs::copy(&backup, &banco)
        .map_err(|e| format!("Failed to restore backup: {}", e))?;

    println!(
    "Tamanho backup: {} bytes",
    fs::metadata(&backup)
        .map_err(|e| e.to_string())?
        .len()
    );

    println!(
        "Tamanho banco: {} bytes",
        fs::metadata(&banco)
            .map_err(|e| e.to_string())?
            .len()
    );

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

#[tauri::command]
fn exportar_backup(
    backup_path: String,
    destino: String,
) -> Result<(), String> {
    std::fs::copy(&backup_path, &destino)
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
fn importar_backup(
    app: tauri::AppHandle,
    backup_path: String,
) -> Result<(), String> {
    let app_dir = app
        .path()
        .app_config_dir()
        .map_err(|e| e.to_string())?;

    let backups_dir = app_dir.join("backups");

    if !backups_dir.exists() {
        fs::create_dir_all(&backups_dir)
            .map_err(|e| e.to_string())?;
    }

    let backup_file_name = std::path::Path::new(&backup_path)
        .file_name()
        .ok_or("Invalid backup path")?
        .to_string_lossy()
        .to_string();

    let timestamp = chrono::Local::now().format("%Y%m%d%H%M%S").to_string();

    let destino = backups_dir.join(format!("backup_importado_{}.db", timestamp));

    fs::copy(&backup_path, &destino)
        .map_err(|e| format!("Failed to import backup: {}", e))?;

    Ok(())
}

#[tauri::command]
fn caminho_banco(app: tauri::AppHandle) -> Result<String, String> {
    Ok(app
        .path()
        .app_config_dir()
        .map_err(|e| e.to_string())?
        .join("estoque.db")
        .display()
        .to_string())
}


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(SqlBuilder::default().build())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![greet, criar_backup, listar_backups, restaurar_backup, verificar_backup_diario, excluir_backup, exportar_backup, importar_backup, caminho_banco])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
