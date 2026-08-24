use serde_json::Value;

use crate::{
    database::connection::DbState,
    models::cliente::Cliente,
    repositories::cliente_repository::ClienteRepository,
};

/// Processa uma alteração recebida do Supabase
/// referente à tabela clientes.
pub fn processar(
    db: &DbState,
    event: &str,
    record: &Value,
) -> Result<(), String> {

    match event {
        "INSERT" => inserir(db, record),
        "UPDATE" => atualizar(db, record),
        "DELETE" => excluir(db, record),

        _ => Err(format!(
            "[SYNC] Evento desconhecido para clientes: {}",
            event
        )),
    }
}


// ============================================================
// INSERT
// ============================================================

fn inserir(
    db: &DbState,
    record: &Value,
) -> Result<(), String> {

    let cliente = converter_cliente(record)?;

    // Evita erro caso o cliente já exista no SQLite.
    //
    // Isso é importante porque um evento pode ser recebido
    // novamente ou o cliente pode já existir localmente.
    let existente = ClienteRepository::buscar_por_id(
        db,
        &cliente.id,
    )
    .map_err(|e| e.to_string())?;

    if existente.is_some() {

        println!(
            "[SYNC] Cliente {} já existe no SQLite. Atualizando.",
            cliente.id
        );

        ClienteRepository::atualizar(db, &cliente)
            .map_err(|e| e.to_string())?;

    } else {

        ClienteRepository::criar(db, &cliente)
            .map_err(|e| e.to_string())?;

        println!(
            "[SYNC] Cliente {} inserido no SQLite.",
            cliente.id
        );
    }

    Ok(())
}


// ============================================================
// UPDATE
// ============================================================

fn atualizar(
    db: &DbState,
    record: &Value,
) -> Result<(), String> {

    let cliente = converter_cliente(record)?;

    ClienteRepository::atualizar(db, &cliente)
        .map_err(|e| e.to_string())?;

    println!(
        "[SYNC] Cliente {} atualizado no SQLite.",
        cliente.id
    );

    Ok(())
}


// ============================================================
// DELETE
// ============================================================

fn excluir(
    db: &DbState,
    record: &Value,
) -> Result<(), String> {

    let id = record
        .get("id")
        .and_then(Value::as_str)
        .ok_or_else(|| {
            "[SYNC] Cliente excluído não possui ID.".to_string()
        })?;

    ClienteRepository::excluir(db, id)
        .map_err(|e| e.to_string())?;

    println!(
        "[SYNC] Cliente {} excluído do SQLite.",
        id
    );

    Ok(())
}


// ============================================================
// CONVERSÃO SUPABASE → MODELO RUST
// ============================================================

fn converter_cliente(
    record: &Value,
) -> Result<Cliente, String> {

    let id = record
        .get("id")
        .and_then(Value::as_str)
        .ok_or_else(|| {
            "[SYNC] Cliente sem ID.".to_string()
        })?
        .to_string();


    let nome = record
        .get("nome")
        .and_then(Value::as_str)
        .ok_or_else(|| {
            "[SYNC] Cliente sem nome.".to_string()
        })?
        .to_string();


    let telefone = record
        .get("telefone")
        .and_then(Value::as_str)
        .map(String::from);


    let endereco = record
        .get("endereco")
        .and_then(Value::as_str)
        .map(String::from);


    let created_at = record
        .get("created_at")
        .and_then(Value::as_str)
        .ok_or_else(|| {
            "[SYNC] Cliente sem created_at.".to_string()
        })?
        .to_string();


    Ok(Cliente {
        id,
        nome,
        telefone,
        endereco,
        created_at,
    })
}