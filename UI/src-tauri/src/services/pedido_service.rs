use rusqlite::Result;

use crate::{
    database::connection::DbState,
    models::pedido::Pedido,
    models::pedidoView::PedidoView,
    repositories::pedido_repository::PedidoRepository,
};

pub struct PedidoService;

fn status_igual(a: &str, b: &str) -> bool {
    a.trim().to_lowercase() == b.trim().to_lowercase()
}

fn descontar_estoque_da_carga(
    tx: &rusqlite::Transaction<'_>,
    carga_id: &str,
    quantidade: i64,
) -> Result<()> {
    let quantidade_final: i64 = tx.query_row(
        "
        SELECT quantidade_final
        FROM cargas
        WHERE id = ?
        ",
        [carga_id],
        |row| row.get(0),
    )
    .map_err(|_| {
        rusqlite::Error::InvalidParameterName(
            format!("Carga não encontrada para o pedido: {}", carga_id),
        )
    })?;

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

    tx.execute(
        "
        UPDATE cargas
        SET quantidade_final = quantidade_final - ?
        WHERE id = ?
        ",
        rusqlite::params![quantidade, carga_id],
    )?;

    Ok(())
}

impl PedidoService {

    pub fn listar(
        db: &DbState,
    ) -> Result<Vec<PedidoView>> {

        PedidoRepository::listar(db)
    }

    pub fn buscar(
        db: &DbState,
        id: &str,
    ) -> Result<Option<Pedido>> {

        PedidoRepository::buscar_por_id(db, id)
    }

    pub fn criar(
        db: &DbState,
        pedido: &Pedido,
    ) -> Result<()> {

        let mut conn = db.conn.lock().unwrap();

        let tx = conn.transaction()?;

        if let Some(carga_id) = &pedido.carga_id {
            if status_igual(&pedido.status, "entregue") {
                descontar_estoque_da_carga(&tx, carga_id, pedido.quantidade)?;
            }
        }

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

    pub fn atualizar(
        db: &DbState,
        pedido: &Pedido,
    ) -> Result<()> {

        PedidoRepository::atualizar(db, pedido)
    }

    pub fn excluir(
        db: &DbState,
        id: &str,
    ) -> Result<()> {

        PedidoRepository::excluir(db, id)
    }

    pub fn atualizar_status(
    db: &DbState,
    id: &str,
    novo_status: &str,
    ) -> Result<()> {

        let mut conn = db.conn.lock().unwrap();

        let tx = conn.transaction()?;

        // =====================================================
        // BUSCA O PEDIDO ATUAL
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

        // =====================================================
        // SE O STATUS NÃO MUDOU, NÃO FAZ NADA
        // =====================================================

        if status_igual(&status_atual, novo_status) {
            tx.commit()?;
            return Ok(());
        }

        // =====================================================
        // PEDIDO SENDO MARCADO COMO ENTREGUE
        // =====================================================

        if status_igual(novo_status, "entregue") && !status_igual(&status_atual, "entregue") {

            let carga_id = carga_id.as_ref().ok_or_else(|| {
                rusqlite::Error::InvalidParameterName(
                    "Pedido não possui uma carga associada.".into()
                )
            })?;

            descontar_estoque_da_carga(&tx, carga_id, quantidade)?;
        }

        // =====================================================
        // ATUALIZA O STATUS DO PEDIDO
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

        Ok(())
    }

    pub fn concluir_pedido(
    db: &DbState,
    pedido_id: &str,
    ) -> Result<()> {

        let mut conn = db.conn.lock().unwrap();

        let tx = conn.transaction()?;

        tx.commit()?;

        Ok(())
    }
}
#[cfg(test)]
mod tests {
    use super::{descontar_estoque_da_carga, PedidoService, status_igual};
    use crate::{
        database::{connection::DbState, migrations::run_migrations},
        models::pedido::Pedido,
    };
    use rusqlite::Connection;
    use std::sync::Mutex;

    #[test]
    fn deve_descontar_quantidade_final_da_carga_apenas_quando_entregue() {
        let mut conn = Connection::open_in_memory().unwrap();
        run_migrations(&conn).unwrap();

        conn.execute(
            "
            INSERT INTO cargas (id, produto, quantidade, custo_unitario, preco_venda, lucro_esperado, quantidade_final, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ",
            rusqlite::params![
                "carga-1",
                "Galão 20L",
                50,
                10.0,
                18.5,
                400.0,
                50,
                "2024-01-01T00:00:00Z"
            ],
        )
        .unwrap();

        let tx = conn.transaction().unwrap();
        descontar_estoque_da_carga(&tx, "carga-1", 12).unwrap();
        tx.commit().unwrap();

        let restante: i64 = conn
            .query_row(
                "SELECT quantidade_final FROM cargas WHERE id = ?",
                ["carga-1"],
                |row| row.get(0),
            )
            .unwrap();

        assert_eq!(restante, 38);
        assert!(status_igual("Entregue", "entregue"));
    }

    #[test]
    fn nao_deve_descontar_carga_quando_pedido_esta_pendente() {
        let conn = Connection::open_in_memory().unwrap();
        run_migrations(&conn).unwrap();

        conn.execute(
            "
            INSERT INTO cargas (id, produto, quantidade, custo_unitario, preco_venda, lucro_esperado, quantidade_final, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ",
            rusqlite::params![
                "carga-1",
                "Galão 20L",
                50,
                10.0,
                18.5,
                400.0,
                50,
                "2024-01-01T00:00:00Z"
            ],
        )
        .unwrap();

        let db = DbState {
            conn: Mutex::new(conn),
        };

        let pedido = Pedido {
            id: "pedido-1".to_string(),
            cliente_id: "cliente-1".to_string(),
            produto: "Galão 20L".to_string(),
            quantidade: 6,
            preco_unitario: 18.5,
            valor_total: 111.0,
            status: "Pendente".to_string(),
            carga_id: Some("carga-1".to_string()),
            created_at: "2024-01-02T00:00:00Z".to_string(),
        };

        PedidoService::criar(&db, &pedido).unwrap();

        let restante: i64 = db.conn.lock().unwrap()
            .query_row(
                "SELECT quantidade_final FROM cargas WHERE id = ?",
                ["carga-1"],
                |row| row.get(0),
            )
            .unwrap();

        assert_eq!(restante, 50);
    }

    #[test]
    fn deve_descontar_uma_unica_vez_ao_mudar_para_entregue() {
        let conn = Connection::open_in_memory().unwrap();
        run_migrations(&conn).unwrap();

        conn.execute(
            "
            INSERT INTO cargas (id, produto, quantidade, custo_unitario, preco_venda, lucro_esperado, quantidade_final, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ",
            rusqlite::params![
                "carga-1",
                "Galão 20L",
                50,
                10.0,
                18.5,
                400.0,
                50,
                "2024-01-01T00:00:00Z"
            ],
        )
        .unwrap();

        conn.execute(
            "
            INSERT INTO pedidos (id, cliente_id, produto, quantidade, preco_unitario, valor_total, status, carga_id, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ",
            rusqlite::params![
                "pedido-1",
                "cliente-1",
                "Galão 20L",
                10,
                18.5,
                185.0,
                "Pendente",
                "carga-1",
                "2024-01-02T00:00:00Z"
            ],
        )
        .unwrap();

        let db = DbState {
            conn: Mutex::new(conn),
        };

        PedidoService::atualizar_status(&db, "pedido-1", "Entregue").unwrap();
        PedidoService::atualizar_status(&db, "pedido-1", "Entregue").unwrap();

        let restante: i64 = db.conn.lock().unwrap()
            .query_row(
                "SELECT quantidade_final FROM cargas WHERE id = ?",
                ["carga-1"],
                |row| row.get(0),
            )
            .unwrap();

        assert_eq!(restante, 40);
    }
}