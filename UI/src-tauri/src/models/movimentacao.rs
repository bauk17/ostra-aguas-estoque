use serde::{Deserialize, Serialize};
use rusqlite::Row;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Movimentacao {
    pub id: String,
    pub produto: String,
    pub quantidade: i64,
    pub tipo: String,
    pub origem: String,
    pub referencia_id: Option<String>,
    pub created_at: String,
}

impl Movimentacao {
    pub fn from_row(row: &Row) -> rusqlite::Result<Self> {
        Ok(Self {
            id: row.get("id")?,
            produto: row.get("produto")?,
            quantidade: row.get("quantidade")?,
            tipo: row.get("tipo")?,
            origem: row.get("origem")?,
            referencia_id: row.get("referencia_id")?,
            created_at: row.get("created_at")?,
        })
    }
}