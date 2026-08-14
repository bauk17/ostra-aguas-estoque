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
                p.carga_id,
                cg.produto AS carga_produto,
                cg.created_at AS carga_created_at,
                p.created_at
            FROM pedidos p
            INNER JOIN clientes c
                ON p.cliente_id = c.id
            LEFT JOIN cargas cg
                ON p.carga_id = cg.id
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
                carga_id,
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

        let mut conn = db.conn.lock().unwrap();

        let tx = conn.transaction()?;

        tx.execute(
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
                carga_id,
                created_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ",
            rusqlite::params![
                pedido.id,
                pedido.cliente_id,
                pedido.produto,
                pedido.quantidade,
                pedido.preco_unitario,
                pedido.valor_total,
                pedido.status,
                pedido.carga_id,
                pedido.created_at
            ],
        )?;

        tx.commit()?;

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
                status = ?,
                carga_id = ?
            WHERE id = ?
            ",
            params![
                pedido.cliente_id,
                pedido.produto,
                pedido.quantidade,
                pedido.preco_unitario,
                pedido.valor_total,
                pedido.status,
                pedido.carga_id,
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
    novo_status: &str,
) -> Result<()> {

    let mut conn = db.conn.lock().unwrap();

    let tx = conn.transaction()?;

    // =====================================================
    // BUSCA O PEDIDO
    // =====================================================

    let (status_atual, carga_id, quantidade): (
        String,
        Option<String>,
        i64,
    ) = tx.query_row(
        "
        SELECT
            status,
            carga_id,
            quantidade
        FROM pedidos
        WHERE id = ?
        ",
        [id],
        |row| {
            Ok((
                row.get(0)?,
                row.get(1)?,
                row.get(2)?,
            ))
        },
    )?;

    println!("======================================");
    println!("ALTERAÇÃO DE STATUS");
    println!("Pedido: {}", id);
    println!("Status atual: {}", status_atual);
    println!("Novo status: {}", novo_status);
    println!("Carga: {:?}", carga_id);
    println!("Quantidade pedido: {}", quantidade);

    // =====================================================
    // STATUS NÃO MUDOU
    // =====================================================

    if status_atual == novo_status {
        println!("Status não mudou.");
        tx.commit()?;
        return Ok(());
    }

    // =====================================================
    // SOMENTE ENTREGUE DESCONTA DA CARGA
    // =====================================================

    if novo_status.trim().to_lowercase() == "entregue" {

        println!("Pedido sendo marcado como ENTREGUE.");

        let carga_id = carga_id.as_ref().ok_or_else(|| {
            rusqlite::Error::InvalidParameterName(
                "Pedido não possui uma carga associada.".into()
            )
        })?;

        // Busca estoque restante
        let quantidade_final: Option<i64> = tx.query_row(
            "
            SELECT quantidade_final
            FROM cargas
            WHERE id = ?
            ",
            [carga_id],
            |row| row.get(0),
        )?;

        println!(
            "Quantidade final antes do desconto: {:?}",
            quantidade_final
        );

        let quantidade_final = quantidade_final.ok_or_else(|| {
            rusqlite::Error::InvalidParameterName(
                "A carga não possui quantidade_final.".into()
            )
        })?;

        // =================================================
        // VERIFICA ESTOQUE
        // =================================================

        if quantidade_final < quantidade {
            return Err(
                rusqlite::Error::InvalidParameterName(
                    format!(
                        "Quantidade insuficiente na carga. Disponível: {}, necessário: {}",
                        quantidade_final,
                        quantidade
                    )
                )
            );
        }

        // =================================================
        // DESCONTA SOMENTE quantidade_final
        // =================================================

        let alterados = tx.execute(
            "
            UPDATE cargas
            SET quantidade_final = quantidade_final - ?
            WHERE id = ?
            ",
            rusqlite::params![
                quantidade,
                carga_id,
            ],
        )?;

        println!(
            "Linhas de carga alteradas: {}",
            alterados
        );

        println!(
            "Quantidade final depois: {}",
            quantidade_final - quantidade
        );
    } else {

        println!(
            "Status '{}' não desconta estoque.",
            novo_status
        );
    }

    // =====================================================
    // ATUALIZA STATUS DO PEDIDO
    // =====================================================

    tx.execute(
        "
        UPDATE pedidos
        SET status = ?
        WHERE id = ?
        ",
        rusqlite::params![
            novo_status,
            id,
        ],
    )?;

    tx.commit()?;

    println!("Status atualizado com sucesso.");
    println!("======================================");

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