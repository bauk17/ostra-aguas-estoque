use tauri::State;

use crate::{
    database::connection::DbState,
    sync::sync_queue
};


#[tauri::command]
pub fn listar_sync_queue(
    db: State<DbState>,
) -> Result<Vec<sync_queue::SyncQueueItem>, String> {

    let conn = db.conn.lock().unwrap();

    sync_queue::listar(&conn)
}

#[tauri::command]
pub fn reabrir_sync_queue(
    db: State<DbState>,
    id: i64,
) -> Result<(), String> {
    let conn = db.conn.lock().unwrap();

    sync_queue::reabrir(&conn, id)
}