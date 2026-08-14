use rusqlite::{params, Result};

use crate::{
    database::connection::DbState,
    models::carga::Carga,
};

pub struct CargaRepository;

impl CargaRepository {

    pub fn listar(db: &DbState) -> Result<Vec<Carga>> {

        let conn = db.conn.lock().unwrap();

        let mut stmt = conn.prepare(
            "
            SELECT
                id,
                produto,
                quantidade,
                custo_unitario,
                preco_venda,
                lucro_esperado,
                quantidade_final,
                quebras,
                valor_quebras,
                created_at
            FROM cargas
            ORDER BY created_at DESC
            "
        )?;

        let cargas = stmt.query_map([], Carga::from_row)?;

        let mut resultado = Vec::new();

        for carga in cargas {
            resultado.push(carga?);
        }

        Ok(resultado)
    }

    pub fn buscar_por_id(
        db: &DbState,
        id: &str,
    ) -> Result<Option<Carga>> {

        let conn = db.conn.lock().unwrap();

        let mut stmt = conn.prepare(
            "
            SELECT
                id,
                produto,
                quantidade,
                custo_unitario,
                preco_venda,
                lucro_esperado,
                quantidade_final,
                quebras,
                valor_quebras,
                created_at
            FROM cargas
            WHERE id = ?
            "
        )?;

        let mut rows = stmt.query(params![id])?;

        if let Some(row) = rows.next()? {
            return Ok(Some(Carga::from_row(row)?));
        }

        Ok(None)
    }

    pub fn criar(
        db: &DbState,
        carga: &Carga,
    ) -> Result<()> {

        let conn = db.conn.lock().unwrap();

        conn.execute(
            "
            INSERT INTO cargas
            (
                id,
                produto,
                quantidade,
                custo_unitario,
                preco_venda,
                lucro_esperado,
                quantidade_final,
                quebras,
                valor_quebras,
                created_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ",
            params![
                carga.id,
                carga.produto,
                carga.quantidade,
                carga.custo_unitario,
                carga.preco_venda,
                carga.lucro_esperado,

                // Começa com o estoque completo
                carga.quantidade,

                carga.quebras,
                carga.valor_quebras,
                carga.created_at
            ],
            )?;

            Ok(())
    }

    pub fn excluir(
        db: &DbState,
        id: &str,
    ) -> Result<()> {

        let conn = db.conn.lock().unwrap();

        conn.execute(
            "DELETE FROM cargas WHERE id = ?",
            params![id],
        )?;

        Ok(())
    }
}