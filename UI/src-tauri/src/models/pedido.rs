use serde::{Deserialize, Serialize};
use rusqlite::Row;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Pedido {
    pub id: String,
    pub cliente_id: String,
    pub produto: String,
    pub quantidade: i64,
    pub preco_unitario: f64,
    pub valor_total: f64,
    pub status: String,
    pub carga_id: Option<String>,
    pub created_at: String,
}

impl Pedido {
    pub fn from_row(row: &Row) -> rusqlite::Result<Self> {
        Ok(Self {
            id: row.get("id")?,
            cliente_id: row.get("cliente_id")?,
            produto: row.get("produto")?,
            quantidade: row.get("quantidade")?,
            preco_unitario: row.get("preco_unitario")?,
            valor_total: row.get("valor_total")?,
            status: row.get("status")?,
            carga_id: row.get("carga_id")?,
            created_at: row.get("created_at")?,
        })
    }
}