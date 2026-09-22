use tauri::State;

use crate::{
    database::connection::DbState,
    models::cliente::Cliente,
    repositories::cliente_repository::ClienteRepository,
};


#[tauri::command]
pub fn listar_clientes(
    db: State<DbState>,
) -> Result<Vec<Cliente>, String> {

    ClienteRepository::listar(&db)
        .map_err(|e| e.to_string())
}


#[tauri::command]
pub fn buscar_cliente(
    db: State<DbState>,
    id: String,
) -> Result<Option<Cliente>, String> {

    ClienteRepository::buscar_por_id(&db, &id)
        .map_err(|e| e.to_string())
}


#[tauri::command]
pub fn criar_cliente(
    db: State<DbState>,
    cliente: Cliente,
) -> Result<(), String> {

    let mut conn = db.conn.lock().unwrap();

    let tx = conn
        .transaction()
        .map_err(|e| e.to_string())?;

    let payload = serde_json::to_value(&cliente)
        .map_err(|e| e.to_string())?;

    ClienteRepository::criar_na_conexao(
        &tx,
        &cliente,
    )
    .map_err(|e| e.to_string())?;

    crate::sync::sync_queue::adicionar(
        &tx,
        "clientes",
        &cliente.id,
        "INSERT",
        Some(&payload),
    )?;

    tx.commit()
        .map_err(|e| e.to_string())?;

    Ok(())
}


#[tauri::command]
pub fn atualizar_cliente(
    db: State<DbState>,
    cliente: Cliente,
) -> Result<(), String> {

    let mut conn = db.conn.lock().unwrap();

    let tx = conn
        .transaction()
        .map_err(|e| e.to_string())?;

    let payload = serde_json::to_value(&cliente)
        .map_err(|e| e.to_string())?;

    ClienteRepository::atualizar_na_conexao(
        &tx,
        &cliente,
    )
    .map_err(|e| e.to_string())?;

    crate::sync::sync_queue::adicionar(
        &tx,
        "clientes",
        &cliente.id,
        "UPDATE",
        Some(&payload),
    )?;

    tx.commit()
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn excluir_cliente(
    db: State<DbState>,
    id: String,
) -> Result<(), String> {

    let mut conn = db.conn.lock().unwrap();

    let tx = conn
        .transaction()
        .map_err(|e| e.to_string())?;

    ClienteRepository::excluir_na_conexao(
        &tx,
        &id,
    )
    .map_err(|e| e.to_string())?;

    crate::sync::sync_queue::adicionar(
        &tx,
        "clientes",
        &id,
        "DELETE",
        None,
    )?;

    tx.commit()
        .map_err(|e| e.to_string())?;

    Ok(())
}