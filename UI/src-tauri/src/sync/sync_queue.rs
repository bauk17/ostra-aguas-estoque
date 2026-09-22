use rusqlite::{params, Connection};
use serde_json::{json, Value};
use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct SyncQueueItem {
    pub id: i64,
    pub entity: String,
    pub entity_id: String,
    pub operation: String,
    pub payload: Option<String>,
    pub created_at: String,
    pub attempts: i64,
    pub last_error: Option<String>,
    pub next_retry_at: Option<String>,
    pub status: String,
}

/// Adiciona uma operação à fila de sincronização.
pub fn adicionar(
    conn: &Connection,
    entity: &str,
    entity_id: &str,
    operation: &str,
    payload: Option<&Value>,
) -> Result<(), String> {

    let payload_json = payload
        .map(|value| serde_json::to_string(value))
        .transpose()
        .map_err(|e| e.to_string())?;

    conn.execute(
        "
        INSERT INTO sync_queue (
            entity,
            entity_id,
            operation,
            payload,
            created_at
        )
        VALUES (?, ?, ?, ?, ?)
        ",
        params![
            entity,
            entity_id,
            operation,
            payload_json,
            chrono::Utc::now().to_rfc3339()
        ],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}



pub fn listar(
    conn: &Connection,
) -> Result<Vec<SyncQueueItem>, String> {

    let mut stmt = conn
        .prepare(
            "
            SELECT
                id,
                entity,
                entity_id,
                operation,
                payload,
                created_at,
                attempts,
                last_error,
                next_retry_at,
                status
            FROM sync_queue
            ORDER BY id ASC
            "
        )
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map([], |row| {
            Ok(SyncQueueItem {
                id: row.get("id")?,
                entity: row.get("entity")?,
                entity_id: row.get("entity_id")?,
                operation: row.get("operation")?,
                payload: row.get("payload")?,
                created_at: row.get("created_at")?,
                attempts: row.get("attempts")?,
                last_error: row.get("last_error")?,
                next_retry_at: row.get("next_retry_at")?,
                status: row.get("status")?,
            })
        })
        .map_err(|e| e.to_string())?;

    let mut resultado = Vec::new();

    for row in rows {
        resultado.push(row.map_err(|e| e.to_string())?);
    }

    Ok(resultado)
}


pub fn buscar_proxima_pendente(
    conn: &Connection,
) -> Result<Option<SyncQueueItem>, String> {

    let mut stmt = conn
        .prepare(
            "
            SELECT
                id,
                entity,
                entity_id,
                operation,
                payload,
                created_at,
                attempts,
                last_error,
                next_retry_at,
                status
            FROM sync_queue
            WHERE status != 'SENT'
            ORDER BY id ASC
            LIMIT 1
            "
        )
        .map_err(|e| e.to_string())?;

    let mut rows = stmt
        .query([])
        .map_err(|e| e.to_string())?;

    if let Some(row) = rows
        .next()
        .map_err(|e| e.to_string())?
    {
        let item = SyncQueueItem {
            id: row.get("id").map_err(|e| e.to_string())?,
            entity: row.get("entity").map_err(|e| e.to_string())?,
            entity_id: row.get("entity_id").map_err(|e| e.to_string())?,
            operation: row.get("operation").map_err(|e| e.to_string())?,
            payload: row.get("payload").map_err(|e| e.to_string())?,
            created_at: row.get("created_at").map_err(|e| e.to_string())?,
            attempts: row.get("attempts").map_err(|e| e.to_string())?,
            last_error: row.get("last_error").map_err(|e| e.to_string())?,
            next_retry_at: row.get("next_retry_at").map_err(|e| e.to_string())?,
            status: row.get("status").map_err(|e| e.to_string())?,
        };

        if item.status == "FAILED" {
            return Ok(None);
        }

        if let Some(next_retry_at) = &item.next_retry_at {
            let retry_due: bool = conn
                .query_row(
                    "SELECT datetime(?) <= datetime('now')",
                    params![next_retry_at],
                    |row| row.get(0),
                )
                .map_err(|e| e.to_string())?;

            if !retry_due {
                return Ok(None);
            }
        }


        return Ok(Some(item));
    }

    Ok(None)
}


pub fn marcar_como_enviada(
    conn: &Connection,
    id: i64,
) -> Result<(), String> {
    conn.execute(
        "
        UPDATE sync_queue
        SET
            status = 'SENT',
            last_error = NULL,
            next_retry_at = NULL
        WHERE id = ?
        ",
        params![id],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

pub fn registrar_falha(
    conn: &Connection,
    id: i64,
    attempts: i64,
    erro: &str,
) -> Result<(), String> {
    let novo_attempts = attempts + 1;

    if novo_attempts >= 10 {
        conn.execute(
            "
            UPDATE sync_queue
            SET
                attempts = ?,
                last_error = ?,
                status = 'FAILED',
                next_retry_at = NULL
            WHERE id = ?
            ",
            params![
                novo_attempts,
                erro,
                id
            ],
        )
        .map_err(|e| e.to_string())?;

        return Ok(());
    }

    let delay = std::cmp::min(
        2_i64.pow(novo_attempts as u32),
        10,
    );

    let next_retry_at =
        chrono::Utc::now()
            + chrono::Duration::seconds(delay);

    conn.execute(
        "
        UPDATE sync_queue
        SET
            attempts = ?,
            last_error = ?,
            status = 'PENDING',
            next_retry_at = ?
        WHERE id = ?
        ",
        params![
            novo_attempts,
            erro,
            next_retry_at.to_rfc3339(),
            id
        ],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

pub fn reabrir(
    conn: &Connection,
    id: i64,
) -> Result<(), String> {
    conn.execute(
        "
        UPDATE sync_queue
        SET
            attempts = 0,
            last_error = NULL,
            next_retry_at = NULL,
            status = 'PENDING'
        WHERE id = ?
          AND status = 'FAILED'
        ",
        params![id],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}


pub fn obter_status_fila(
    conn: &Connection,
) -> Result<String, String> {
    let mut stmt = conn
        .prepare(
            "
            SELECT
                id,
                status,
                next_retry_at
            FROM sync_queue
            WHERE status != 'SENT'
            ORDER BY id ASC
            LIMIT 1
            "
        )
        .map_err(|e| e.to_string())?;

    let resultado = stmt
        .query_row([], |row| {
            let id: i64 = row.get("id")?;
            let status: String = row.get("status")?;
            let next_retry_at: Option<String> =
                row.get("next_retry_at")?;

            Ok((id, status, next_retry_at))
        });

    match resultado {
        Ok((id, status, next_retry_at)) => {
            match status.as_str() {
                "FAILED" => {
                    Ok(format!(
                        "Fila bloqueada: operação {} está FAILED.",
                        id
                    ))
                }

                "PENDING" => {
                    if let Some(next_retry_at) = next_retry_at {
                        Ok(format!(
                            "Fila aguardando retry da operação {} até {}.",
                            id,
                            next_retry_at
                        ))
                    } else {
                        Ok(format!(
                            "Operação {} está PENDING.",
                            id
                        ))
                    }
                }

                _ => {
                    Ok(format!(
                        "Fila bloqueada pela operação {} com status {}.",
                        id,
                        status
                    ))
                }
            }
        }

        Err(rusqlite::Error::QueryReturnedNoRows) => {
            Ok("Fila vazia.".to_string())
        }

        Err(error) => {
            Err(error.to_string())
        }
    }
}