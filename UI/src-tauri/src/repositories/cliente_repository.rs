use rusqlite::{params, Result};

use crate::{
    database::connection::DbState,
    models::cliente::Cliente,
};

pub struct ClienteRepository;

impl ClienteRepository {

    /// Lista todos os clientes
    pub fn listar(db: &DbState) -> Result<Vec<Cliente>> {

        let conn = db.conn.lock().unwrap();

        let mut stmt = conn.prepare(
            "
            SELECT
                id,
                nome,
                telefone,
                endereco,
                created_at
            FROM clientes
            ORDER BY nome
            "
        )?;

        let clientes = stmt.query_map([], Cliente::from_row)?;

        let mut resultado = Vec::new();

        for cliente in clientes {
            resultado.push(cliente?);
        }

        Ok(resultado)
    }

    /// Procura um cliente pelo ID
    pub fn buscar_por_id(
        db: &DbState,
        id: &str,
    ) -> Result<Option<Cliente>> {

        let conn = db.conn.lock().unwrap();

        let mut stmt = conn.prepare(
            "
            SELECT
                id,
                nome,
                telefone,
                endereco,
                created_at
            FROM clientes
            WHERE id = ?
            "
        )?;

        let mut rows = stmt.query(params![id])?;

        if let Some(row) = rows.next()? {
            return Ok(Some(Cliente::from_row(row)?));
        }

        Ok(None)
    }

    /// Cria um novo cliente
    pub fn criar(
        db: &DbState,
        cliente: &Cliente,
    ) -> Result<()> {

        let conn = db.conn.lock().unwrap();

        conn.execute(
            "
            INSERT INTO clientes
            (
                id,
                nome,
                telefone,
                endereco,
                created_at
            )
            VALUES (?, ?, ?, ?, ?)
            ",
            params![
                cliente.id,
                cliente.nome,
                cliente.telefone,
                cliente.endereco,
                cliente.created_at
            ],
        )?;

        Ok(())
    }

    /// Atualiza um cliente
    pub fn atualizar(
        db: &DbState,
        cliente: &Cliente,
    ) -> Result<()> {

        let conn = db.conn.lock().unwrap();

        conn.execute(
            "
            UPDATE clientes
            SET
                nome = ?,
                telefone = ?,
                endereco = ?
            WHERE id = ?
            ",
            params![
                cliente.nome,
                cliente.telefone,
                cliente.endereco,
                cliente.id
            ],
        )?;

        Ok(())
    }

    /// Exclui um cliente
    pub fn excluir(
        db: &DbState,
        id: &str,
    ) -> Result<()> {

        let conn = db.conn.lock().unwrap();

        conn.execute(
            "
            DELETE FROM clientes
            WHERE id = ?
            ",
            params![id],
        )?;

        Ok(())
    }
}