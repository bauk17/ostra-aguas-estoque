use serde_json::Value;

use crate::{
    database::connection::DbState,
    models::movimentacao::Movimentacao,
    repositories::movimentacao_repository::MovimentacaoRepository,
};

pub fn processar(db: &DbState, event: &str, record: &Value) -> Result<(), String> {
    match event {
        "INSERT" => inserir(db, record),
        "DELETE" => excluir(db, record),

        _ => Err(format!(
            "[SYNC] Evento desconhecido para movimentacoes: {}",
            event
        )),
    }
}

pub fn inserir(db: &DbState, record: &Value) -> Result<(), String> {
    let movimentacao = converter_movimentacao(record)?;
    

    let existente = MovimentacaoRepository::buscar_por_id(db, &movimentacao.id)
        .map_err(|e| e.to_string())?;

    if existente.is_some() {
        println!(
            "[SYNC] Movimentação {} já existe no SQLite. Atualizando.",
            movimentacao.id
        );
    } else {
        MovimentacaoRepository::criar(db, &movimentacao)
            .map_err(|e| e.to_string())?;
    }

    Ok(())
}

pub fn excluir(db: &DbState, record: &Value) -> Result<(), String> {
    let id = record
        .get("id")
        .and_then(Value::as_str)
        .ok_or_else(|| "[SYNC] ID da movimentação não encontrado".to_string())?
        .to_string();

    MovimentacaoRepository::excluir(db, &id)
        .map_err(|e| e.to_string())
}

fn converter_movimentacao(record: &Value) -> Result<Movimentacao, String> {
    let id = record
        .get("id")
        .and_then(Value::as_str)
        .ok_or_else(|| "[SYNC] ID da movimentação não encontrado".to_string())?
        .to_string();

    let produto = record
        .get("produto")
        .and_then(Value::as_str)
        .ok_or_else(|| "[SYNC] Produto da movimentação não encontrado".to_string())?
        .to_string();

    let quantidade = record
        .get("quantidade")
        .and_then(Value::as_i64)
        .ok_or_else(|| "[SYNC] Quantidade da movimentação não encontrada".to_string())?;

    let tipo = record
        .get("tipo")
        .and_then(Value::as_str)
        .ok_or_else(|| "[SYNC] Tipo da movimentação não encontrado".to_string())?
        .to_string();

    let origem = record
        .get("origem")
        .and_then(Value::as_str)
        .ok_or_else(|| "[SYNC] Origem da movimentação não encontrada".to_string())?
        .to_string();

    let referencia_id = record
        .get("referencia_id")
        .and_then(Value::as_str)
        .map(|value| value.to_string());

    let created_at = record
        .get("created_at")
        .and_then(Value::as_str)
        .ok_or_else(|| "[SYNC] Data de criação da movimentação não encontrada".to_string())?
        .to_string();

    Ok(Movimentacao {
        id,
        produto,
        quantidade,
        tipo,
        origem,
        referencia_id,
        created_at,
    })
}