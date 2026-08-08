use tauri::State;

use crate::{
    database::connection::DbState,
    models::pedido::Pedido,
    models::pedidoView::PedidoView,
    services::pedido_service::PedidoService,
};

#[tauri::command]
pub fn listar_pedidos(
    db: State<DbState>,
) -> Result<Vec<PedidoView>, String> {

    PedidoService::listar(&db)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn criar_pedido(
    db: State<DbState>,
    pedido: Pedido,
) -> Result<(), String> {

    PedidoService::criar(&db, &pedido)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn atualizar_pedido(
    db: State<DbState>,
    pedido: Pedido,
) -> Result<(), String> {

    PedidoService::atualizar(&db, &pedido)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn atualizar_status_pedido(
    db: State<DbState>,
    id: String,
    status: String,
) -> Result<(), String> {

    PedidoService::atualizar_status(
        &db,
        &id,
        &status,
    )
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn excluir_pedido(
    db: State<DbState>,
    id: String,
) -> Result<(), String> {

    PedidoService::excluir(&db, &id)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn buscar_pedido(
    db: State<DbState>,
    id: String,
) -> Result<Option<Pedido>, String> {

    PedidoService::buscar(&db, &id)
        .map_err(|e| e.to_string())
}