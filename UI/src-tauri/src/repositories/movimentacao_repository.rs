use rusqlite::{params, Result};

use crate::{
    database::connection::DbState,
    models::movimentacao::Movimentacao,
};

use super::repository::Repository;

pub struct MovimentacaoRepository;

impl MovimentacaoRepository {

    pub fn listar(
        db: &DbState,
    ) -> Result<Vec<Movimentacao>> {

        let conn = Repository::conn(db);

        let mut stmt = conn.prepare(
            "
            SELECT
                id,
                produto,
                quantidade,
                tipo,
                origem,
                referencia_id,
                created_at
            FROM movimentacoes
            ORDER BY created_at DESC
            "
        )?;

        let rows = stmt.query_map([], Movimentacao::from_row)?;

        let mut resultado = Vec::new();

        for row in rows {
            resultado.push(row?);
        }

        Ok(resultado)
    }

    pub fn buscar_por_id(
        db: &DbState,
        id: &str,
    ) -> Result<Option<Movimentacao>> {

        let conn = Repository::conn(db);

        let mut stmt = conn.prepare(
            "
            SELECT
                id,
                produto,
                quantidade,
                tipo,
                origem,
                referencia_id,
                created_at
            FROM movimentacoes
            WHERE id = ?
            "
        )?;

        let mut rows = stmt.query(params![id])?;

        if let Some(row) = rows.next()? {
            return Ok(Some(Movimentacao::from_row(row)?));
        }

        Ok(None)
    }

    pub fn criar(
        db: &DbState,
        movimentacao: &Movimentacao,
    ) -> Result<()> {

        let conn = Repository::conn(db);

        conn.execute(
            "
            INSERT INTO movimentacoes
            (
                id,
                produto,
                quantidade,
                tipo,
                origem,
                referencia_id,
                created_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ",
            params![
                movimentacao.id,
                movimentacao.produto,
                movimentacao.quantidade,
                movimentacao.tipo,
                movimentacao.origem,
                movimentacao.referencia_id,
                movimentacao.created_at
            ],
        )?;

        Ok(())
    }

    pub fn excluir(
        db: &DbState,
        id: &str,
    ) -> Result<()> {

        let conn = Repository::conn(db);

        conn.execute(
            "
            DELETE FROM movimentacoes
            WHERE id = ?
            ",
            params![id],
        )?;

        Ok(())
    }
}