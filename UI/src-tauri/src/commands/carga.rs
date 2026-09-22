use tauri::State;

use crate::{
    database::connection::DbState,
    models::carga::Carga,
    repositories::carga_repository::CargaRepository,
};

#[tauri::command]
pub fn listar_cargas(
    db: State<DbState>,
) -> Result<Vec<Carga>, String> {

    CargaRepository::listar(&db)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn criar_carga(
    db: State<DbState>,
    carga: Carga,
) -> Result<(), String> {

    let mut conn = db.conn.lock().unwrap();

    let tx = conn
        .transaction()
        .map_err(|e| e.to_string())?;

    let payload = serde_json::to_value(&carga)
        .map_err(|e| e.to_string())?;

    CargaRepository::criar_na_conexao(
        &tx,
        &carga,
    )
    .map_err(|e| e.to_string())?;

    crate::sync::sync_queue::adicionar(
        &tx,
        "cargas",
        &carga.id,
        "INSERT",
        Some(&payload),
    )?;

    tx.commit()
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn buscar_carga(
    db: State<DbState>,
    id: String,
) -> Result<Option<Carga>, String> {

    CargaRepository::buscar_por_id(&db, &id)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn excluir_carga(
    db: State<DbState>,
    id: String,
) -> Result<(), String> {

    CargaRepository::excluir(&db, &id)
        .map_err(|e| e.to_string())
}