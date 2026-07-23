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

    ClienteRepository::criar(&db, &cliente)
        .map_err(|e| e.to_string())
}


#[tauri::command]
pub fn atualizar_cliente(
    db: State<DbState>,
    cliente: Cliente,
) -> Result<(), String> {

    ClienteRepository::atualizar(&db, &cliente)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn excluir_cliente(
    db: State<DbState>,
    id: String,
) -> Result<(), String> {

    ClienteRepository::excluir(&db, &id)
        .map_err(|e| e.to_string())
}