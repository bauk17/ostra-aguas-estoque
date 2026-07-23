use serde::{Deserialize, Serialize};
use rusqlite::Row;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Carga {
    pub id: String,
    pub produto: String,
    pub quantidade: i64,
    pub custo_unitario: f64,
    pub preco_venda: Option<f64>,
    pub lucro_esperado: Option<f64>,
    pub quebras: Option<i64>,
    pub created_at: String,
}

impl Carga {
    pub fn from_row(row: &Row) -> rusqlite::Result<Self> {
        Ok(Self {
            id: row.get("id")?,
            produto: row.get("produto")?,
            quantidade: row.get("quantidade")?,
            custo_unitario: row.get("custo_unitario")?,
            preco_venda: row.get("preco_venda")?,
            lucro_esperado: row.get("lucro_esperado")?,
            quebras: row.get("quebras")?,
            created_at: row.get("created_at")?,
        })
    }
}