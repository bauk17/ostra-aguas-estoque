use serde::{Deserialize, Serialize};
use rusqlite::Row;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PedidoView {

    pub id: String,

    pub cliente: String,

    pub endereco: Option<String>,

    pub produto: String,

    pub valor_total: f64,

    pub quantidade: i64,

    pub status: String,

    pub created_at: String,
}

impl PedidoView {

    pub fn from_row(row: &Row) -> rusqlite::Result<Self> {

        Ok(Self {

            id: row.get("id")?,

            cliente: row.get("cliente")?,

            endereco: row.get("endereco")?,

            produto: row.get("produto")?,

            valor_total: row.get("valor_total")?,

            quantidade: row.get("quantidade")?,

            status: row.get("status")?,

            created_at: row.get("created_at")?,
        })
    }
}