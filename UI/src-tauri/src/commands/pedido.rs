use tauri::State;

use crate::{
    database::connection::DbState,
    models::pedido::Pedido,
    models::pedidoView::PedidoView,
    repositories::pedido_repository::PedidoRepository,
};

#[tauri::command]
pub fn listar_pedidos(
    db: State<DbState>,
) -> Result<Vec<PedidoView>, String> {

    PedidoRepository::listar(&db)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn criar_pedido(
    db: State<DbState>,
    pedido: Pedido,
) -> Result<(), String> {

    PedidoRepository::criar(&db, &pedido)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn atualizar_pedido(
    db: State<DbState>,
    pedido: Pedido,
) -> Result<(), String> {

    PedidoRepository::atualizar(&db, &pedido)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn atualizar_status_pedido(
    db: State<DbState>,
    id: String,
    status: String,
) -> Result<(), String> {

    PedidoRepository::atualizar_status(
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

    PedidoRepository::excluir(&db, &id)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn buscar_pedido(
    db: State<DbState>,
    id: String,
) -> Result<Option<Pedido>, String> {

    PedidoRepository::buscar_por_id(
        &db,
        &id,
    )
    .map_err(|e| e.to_string())
}