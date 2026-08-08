use rusqlite::Result;

use crate::{
    database::connection::DbState,
    models::pedido::Pedido,
    models::pedidoView::PedidoView,
    repositories::pedido_repository::PedidoRepository,
};

pub struct PedidoService;

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

        PedidoRepository::criar(db, pedido)
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
        status: &str,
    ) -> Result<()> {

        PedidoRepository::atualizar_status(
            db,
            id,
            status,
        )
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