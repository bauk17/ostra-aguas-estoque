use serde_json::Value;

use crate::{
    database::connection::DbState,
    models::pedido::Pedido,
    repositories::pedido_repository::PedidoRepository,
};

pub fn processar(db: &DbState, event: &str, record: &Value) -> Result<(), String> {

    match event {
        "INSERT" => inserir(db, record),
        "UPDATE" => atualizar(db, record),
        "DELETE" => excluir(db, record),

        _ => Err(format!(
            "[SYNC] Evento desconhecido para pedidos: {}",
            event
        )),
    }
}


fn inserir(
    db: &DbState,
    record: &Value,
) -> Result<(), String> {
    let pedido = converter_pedido(record)?;

    let existente = PedidoRepository::buscar_por_id(
        db,
        &pedido.id,
    )
    .map_err(|e| e.to_string())?;

    if existente.is_some() {
        println!(
            "[SYNC] Pedido {} já existe no SQLite. Atualizando.",
            pedido.id
        );

        PedidoRepository::atualizar(db, &pedido)
            .map_err(|e| e.to_string())?;
    } else {

        PedidoRepository::criar(db, &pedido)
            .map_err(|e| e.to_string())?;
        
        println!(
            "[SYNC] Pedido {} inserido no SQLite.",
            pedido.id
        );
    }

    Ok(())
}

fn atualizar(
    db: &DbState,
    record: &Value,
) -> Result<(), String> {
    let pedido = converter_pedido(record)?;

    PedidoRepository::atualizar(db, &pedido)
        .map_err(|e| e.to_string())?;

    println!(
        "[SYNC] Pedido {} atualizado no SQLite.",
        pedido.id
    );

    Ok(())
}

fn excluir(
    db: &DbState,
    record: &Value,
) -> Result<(), String> {
    let id = record
        .get("id")
        .and_then(Value::as_str)
        .ok_or_else(|| "[SYNC] ID do pedido não encontrado".to_string())?
        .to_string();

    PedidoRepository::excluir(db, &id)
        .map_err(|e| e.to_string())?;

    println!(
        "[SYNC] Pedido {} excluído do SQLite.",
        id
    );

    Ok(())
}


fn converter_pedido(record: &Value) -> Result<Pedido, String> {
    let id = record
        .get("id")
        .and_then(Value::as_str)
        .ok_or_else(|| {
            "[SYNC] ID do pedido não encontrado".to_string()
        })?
        .to_string();

    let cliente_id = record
        .get("cliente_id")
        .and_then(Value::as_str)
        .ok_or_else(|| {
            "[SYNC] Cliente ID do pedido não encontrado".to_string()
        })?
        .to_string();

    let produto = record
        .get("produto")
        .and_then(Value::as_str)
        .ok_or_else(|| {
            "[SYNC] Produto do pedido não encontrado".to_string()
        })?
        .to_string();

    let quantidade = record
        .get("quantidade")
        .and_then(Value::as_i64)
        .ok_or_else(|| {
            "[SYNC] Quantidade do pedido não encontrada".to_string()
        })?;

    let preco_unitario = record
        .get("preco_unitario")
        .and_then(Value::as_f64)
        .ok_or_else(|| {
            "[SYNC] Preço unitário do pedido não encontrado".to_string()
        })?;

    let valor_total = record
        .get("valor_total")
        .and_then(Value::as_f64)
        .ok_or_else(|| {
            "[SYNC] Valor total do pedido não encontrado".to_string()
        })?;

    let status = record
        .get("status")
        .and_then(Value::as_str)
        .ok_or_else(|| {
            "[SYNC] Status do pedido não encontrado".to_string()
        })?
        .to_string();

    let carga_id = record
        .get("carga_id")
        .and_then(Value::as_str)
        .map(|valor| valor.to_string());

    let created_at = record
        .get("created_at")
        .and_then(Value::as_str)
        .ok_or_else(|| {
            "[SYNC] Data de criação do pedido não encontrada".to_string()
        })?
        .to_string();

    Ok(Pedido {
        id,
        cliente_id,
        produto,
        quantidade,
        preco_unitario,
        valor_total,
        status,
        carga_id,
        created_at,
    })
}