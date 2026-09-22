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

    let mut conn = db.conn.lock().unwrap();

    let tx = conn
        .transaction()
        .map_err(|e| e.to_string())?;

    let payload = serde_json::to_value(&movimentacao)
        .map_err(|e| e.to_string())?;

    MovimentacaoRepository::criar_na_conexao(
        &tx,
        &movimentacao,
    )
    .map_err(|e| e.to_string())?;

    crate::sync::sync_queue::adicionar(
        &tx,
        "movimentacoes",
        &movimentacao.id,
        "INSERT",
        Some(&payload),
    )?;

    tx.commit()
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn excluir_movimentacao(
    db: State<DbState>,
    id: String,
) -> Result<(), String> {

    let mut conn = db.conn.lock().unwrap();

    let tx = conn
        .transaction()
        .map_err(|e| e.to_string())?;

    MovimentacaoRepository::excluir_na_conexao(
        &tx,
        &id,
    )
    .map_err(|e| e.to_string())?;

    crate::sync::sync_queue::adicionar(
        &tx,
        "movimentacoes",
        &id,
        "DELETE",
        None,
    )?;

    tx.commit()
        .map_err(|e| e.to_string())?;

    Ok(())
}