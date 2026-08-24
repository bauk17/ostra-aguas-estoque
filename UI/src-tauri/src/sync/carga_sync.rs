use serde_json::Value;

use crate::{
    database::connection::DbState,
    models::carga::Carga,
    repositories::carga_repository::CargaRepository,
};

pub fn processar(db: &DbState, event: &str, record: &Value) -> Result<(), String> {

    match event {
        "INSERT" => inserir(db, record),
        "DELETE" => excluir(db, record),

        _ => Err(format!(
            "[SYNC] Evento desconhecido para cargas: {}",
            event
        )),
    }
}




fn inserir(
    db: &DbState,
    record: &Value,
) -> Result<(), String> {
    let carga = converter_carga(record)?;

    let existente = CargaRepository::buscar_por_id(
        db,
        &carga.id,
    )
    .map_err(|e| e.to_string())?;

    if existente.is_some() {
        println!(
            "[SYNC] Carga {} já existe no SQLite. Atualizando.",
            carga.id
        );

    } else {

        CargaRepository::criar(db, &carga)
            .map_err(|e| e.to_string())?;
        
        println!(
            "[SYNC] Carga {} inserida no SQLite.",
            carga.id
        );
    }

    Ok(())
}

fn excluir(
    db: &DbState,
    record: &Value,
) -> Result<(), String> {
    let id = record
        .get("id")
        .and_then(Value::as_str)
        .ok_or_else(|| "[SYNC] ID da carga não encontrado".to_string())?
        .to_string();

    CargaRepository::excluir(db, &id)
        .map_err(|e| e.to_string())?;

    println!(
        "[SYNC] Carga {} excluída do SQLite.",
        id
    );

    Ok(())
}


fn converter_carga(record: &Value) -> Result<Carga, String> {
    let id = record
        .get("id")
        .and_then(Value::as_str)
        .ok_or_else(|| "[SYNC] ID da carga não encontrado".to_string())?
        .to_string();

    let produto = record
        .get("produto")
        .and_then(Value::as_str)
        .ok_or_else(|| "[SYNC] Produto da carga não encontrado".to_string())?
        .to_string();

    let quantidade = record
        .get("quantidade")
        .and_then(Value::as_i64)
        .ok_or_else(|| "[SYNC] Quantidade da carga não encontrada".to_string())?;

    let custo_unitario = record
        .get("custo_unitario")
        .and_then(Value::as_f64)
        .ok_or_else(|| "[SYNC] Custo unitário da carga não encontrado".to_string())?;

    let preco_venda = record
        .get("preco_venda")
        .and_then(Value::as_f64);

    let lucro_esperado = record
        .get("lucro_esperado")
        .and_then(Value::as_f64);

    let quebras = record
        .get("quebras")
        .and_then(Value::as_i64);

    let valor_quebras = record
        .get("valor_quebras")
        .and_then(Value::as_f64);

    let created_at = record
        .get("created_at")
        .and_then(Value::as_str)
        .ok_or_else(|| "[SYNC] Data de criação da carga não encontrada".to_string())?
        .to_string();

    let quantidade_final = record
        .get("quantidade_final")
        .and_then(Value::as_i64);

    Ok(Carga {
        id,
        produto,
        quantidade,
        custo_unitario,
        preco_venda,
        lucro_esperado,
        quebras,
        valor_quebras,
        created_at,
        quantidade_final,
    })
}