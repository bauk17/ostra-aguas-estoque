use tauri::State;

use crate::{
    database::connection::DbState,
    models::movimentacao::Movimentacao,
    repositories::movimentacao_repository::MovimentacaoRepository,
};

#[tauri::command]
pub fn listar_movimentacoes(
    db: State<DbState>,
) -> Result<Vec<Movimentacao>, String> {

    MovimentacaoRepository::listar(&db)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn criar_movimentacao(
    db: State<DbState>,
    movimentacao: Movimentacao,
) -> Result<(), String> {

    MovimentacaoRepository::criar(&db, &movimentacao)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn excluir_movimentacao(
    db: State<DbState>,
    id: String,
) -> Result<(), String> {

    MovimentacaoRepository::excluir(&db, &id)
        .map_err(|e| e.to_string())
}