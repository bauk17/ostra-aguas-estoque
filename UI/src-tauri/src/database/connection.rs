use rusqlite::Connection;
use std::{fs, sync::Mutex};
use tauri::{AppHandle, Manager};

use super::migrations::run_migrations;

pub struct DbState {
    pub conn: Mutex<Connection>,
}

impl DbState {
    pub fn new(app: &AppHandle) -> Result<Self, String> {
        let app_dir = app
            .path()
            .app_config_dir()
            .map_err(|e| e.to_string())?;

        fs::create_dir_all(&app_dir)
            .map_err(|e| e.to_string())?;

        let db_path = app_dir.join("estoque.db");

        let conn = Connection::open(db_path)
            .map_err(|e| e.to_string())?;

        conn.execute_batch(
            "
            PRAGMA foreign_keys = ON;
            PRAGMA journal_mode = WAL;
            PRAGMA synchronous = NORMAL;
            PRAGMA busy_timeout = 5000;
            ",
        )
        .map_err(|e| e.to_string())?;

        run_migrations(&conn)?;

        Ok(Self {
            conn: Mutex::new(conn),
        })
    }
}