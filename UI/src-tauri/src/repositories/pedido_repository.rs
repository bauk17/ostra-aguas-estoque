use rusqlite::{params, Result, Connection};

use crate::{
    database::connection::DbState,
    models::pedido::Pedido,
    models::pedidoView::PedidoView,
};

use super::repository::Repository;

pub struct PedidoRepository;

impl PedidoRepository {

    // ============================
    // LISTAR PEDIDOS (JOIN CLIENTES)
    // ============================
    pub fn listar(db: &DbState) -> Result<Vec<PedidoView>> {

        let conn = Repository::conn(db);

        let mut stmt = conn.prepare(
            "
            SELECT
                p.id,
                c.nome AS cliente,
                c.endereco AS endereco,
                p.produto,
                p.valor_total,
                p.quantidade,
                p.status,
                p.created_at
            FROM pedidos p
            INNER JOIN clientes c
                ON p.cliente_id = c.id
            ORDER BY p.created_at DESC
            "
        )?;

        let rows = stmt.query_map([], PedidoView::from_row)?;

        let mut pedidos = Vec::new();

        for row in rows {
            pedidos.push(row?);
        }

        Ok(pedidos)
    }

    // ============================
    // BUSCAR POR ID
    // ============================
    pub fn buscar_por_id(
        db: &DbState,
        id: &str,
    ) -> Result<Option<Pedido>> {

        let conn = Repository::conn(db);

        let mut stmt = conn.prepare(
            "
            SELECT
                id,
                cliente_id,
                produto,
                quantidade,
                preco_unitario,
                valor_total,
                status,
                created_at
            FROM pedidos
            WHERE id = ?
            "
        )?;

        let mut rows = stmt.query(params![id])?;

        if let Some(row) = rows.next()? {
            return Ok(Some(Pedido::from_row(row)?));
        }

        Ok(None)
    }

    // ============================
    // CRIAR
    // ============================
    pub fn criar(
        db: &DbState,
        pedido: &Pedido,
    ) -> Result<()> {

        let conn = Repository::conn(db);

        conn.execute(
            "
            INSERT INTO pedidos
            (
                id,
                cliente_id,
                produto,
                quantidade,
                preco_unitario,
                valor_total,
                status,
                created_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ",
            params![
                pedido.id,
                pedido.cliente_id,
                pedido.produto,
                pedido.quantidade,
                pedido.preco_unitario,
                pedido.valor_total,
                pedido.status,
                pedido.created_at
            ],
        )?;

        Ok(())
    }

    // ============================
    // ATUALIZAR
    // ============================
    pub fn atualizar(
        db: &DbState,
        pedido: &Pedido,
    ) -> Result<()> {

        let conn = Repository::conn(db);

        conn.execute(
            "
            UPDATE pedidos
            SET
                cliente_id = ?,
                produto = ?,
                quantidade = ?,
                preco_unitario = ?,
                valor_total = ?,
                status = ?
            WHERE id = ?
            ",
            params![
                pedido.cliente_id,
                pedido.produto,
                pedido.quantidade,
                pedido.preco_unitario,
                pedido.valor_total,
                pedido.status,
                pedido.id
            ],
        )?;

        Ok(())
    }

    // ============================
    // ALTERAR STATUS
    // ============================
    pub fn atualizar_status(
        db: &DbState,
        id: &str,
        status: &str,
    ) -> Result<()> {

        let conn = Repository::conn(db);

        Self::atualizar_status_conn(&conn, id, status)
    }

    pub fn atualizar_status_conn(
    conn: &Connection,
    id: &str,
    status: &str,
    ) -> Result<()> {

        conn.execute(
            "
            UPDATE pedidos
            SET status = ?
            WHERE id = ?
            ",
            params![
                status,
                id,
            ],
        )?;

         Ok(())
    }

    // ============================
    // EXCLUIR
    // ============================
    pub fn excluir(
        db: &DbState,
        id: &str,
    ) -> Result<()> {

        let conn = Repository::conn(db);

        conn.execute(
            "
            DELETE FROM pedidos
            WHERE id = ?
            ",
            params![id],
        )?;

        Ok(())
    }

}