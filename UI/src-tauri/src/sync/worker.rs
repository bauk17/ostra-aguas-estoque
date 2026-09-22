use tauri::{Manager, State};

use crate::database::connection::DbState;
use crate::sync::supabase::SupabaseClient;
use crate::sync::sync_queue;

pub async fn processar_proxima_operacao(
    db: State<'_, DbState>,
) -> Result<(), String> {
    let item = {
        let conn = db.conn.lock().unwrap();

        sync_queue::buscar_proxima_pendente(&conn)?
    };

    let item = match item {
        Some(item) => item,
        None => {
            let conn = db.conn.lock().unwrap();

            let status = sync_queue::obter_status_fila(&conn)?;

            println!("[SYNC] {}", status);

            return Ok(());
        }
    };

    println!(
        "[SYNC] Processando operação {}: {} {} {}",
        item.id,
        item.entity,
        item.operation,
        item.entity_id
    );


    let payload = match item.payload.as_deref() {
        Some(payload_string) => {
            Some(
                serde_json::from_str::<serde_json::Value>(
                    payload_string,
                )
                .map_err(|e| {
                    format!(
                        "[SYNC] Payload inválido na operação {}: {}",
                        item.id,
                        e
                    )
                })?,
            )
        }

        None => None,
    };

    let supabase = SupabaseClient::new()?;

    let resultado = match item.operation.as_str() {
        "INSERT" => {
            let payload = payload.ok_or_else(|| {
                format!(
                    "[SYNC] INSERT {} não possui payload.",
                    item.id
                )
            })?;

            supabase
                .inserir(&item.entity, &payload)
                .await
        }

        "UPDATE" => {
            let payload = payload.ok_or_else(|| {
                format!(
                    "[SYNC] UPDATE {} não possui payload.",
                    item.id
                )
            })?;

            supabase
                .atualizar(
                    &item.entity,
                    &item.entity_id,
                    &payload,
                )
                .await
        }

        "DELETE" => {
            supabase
                .excluir(
                    &item.entity,
                    &item.entity_id,
                )
                .await
        }

        operation => {
            Err(format!(
                "[SYNC] Operação ainda não implementada: {}",
                operation
            ))
        }
    };

    if let Err(error) = resultado {
        let conn = db.conn.lock().unwrap();

        sync_queue::registrar_falha(
            &conn,
            item.id,
            item.attempts,
            &error,
        )?;

        println!(
            "[SYNC] Operação {} falhou: {}",
            item.id,
            error
        );

        return Err(error);
    }

    {
        let conn = db.conn.lock().unwrap();

        sync_queue::marcar_como_enviada(
            &conn,
            item.id,
        )?;
    }

    println!(
        "[SYNC] Operação {} enviada com sucesso e marcada como SENT.",
        item.id
    );

    Ok(())
}

pub async fn iniciar_worker(
    app: tauri::AppHandle,
) {
    loop {
        let db = app.state::<DbState>();

        match processar_proxima_operacao(db).await {
            Ok(_) => {}
            Err(error) => {
                eprintln!("[SYNC] Erro ao processar fila: {}", error);
            }
        }

        tokio::time::sleep(
            std::time::Duration::from_secs(5)
        ).await;
    }
}