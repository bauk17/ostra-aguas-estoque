use serde::{Deserialize, Serialize};
use rusqlite::Row;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Cliente {
    pub id: String,
    pub nome: String,
    pub telefone: Option<String>,
    pub endereco: Option<String>,
    pub created_at: String,
}

impl Cliente {
    pub fn from_row(row: &Row) -> rusqlite::Result<Self> {
        Ok(Self {
            id: row.get("id")?,
            nome: row.get("nome")?,
            telefone: row.get("telefone")?,
            endereco: row.get("endereco")?,
            created_at: row.get("created_at")?,
        })
    }
}