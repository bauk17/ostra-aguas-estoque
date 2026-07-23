use rusqlite::Connection;

pub fn run_migrations(conn: &Connection) -> Result<(), String> {

    conn.execute_batch(
        r#"

        CREATE TABLE IF NOT EXISTS cargas (
            id TEXT PRIMARY KEY,
            produto TEXT NOT NULL,
            quantidade INTEGER NOT NULL,
            custo_unitario REAL NOT NULL,
            preco_venda REAL,
            lucro_esperado REAL,
            created_at TEXT NOT NULL,
            quebras INTEGER DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS clientes (
            id TEXT PRIMARY KEY,
            nome TEXT NOT NULL,
            telefone TEXT,
            endereco TEXT,
            created_at TEXT NOT NULL,
            observacoes TEXT
        );

        CREATE TABLE IF NOT EXISTS movimentacoes (
            id TEXT PRIMARY KEY,
            produto TEXT NOT NULL,
            quantidade INTEGER NOT NULL,
            tipo TEXT NOT NULL,
            origem TEXT NOT NULL,
            referencia_id TEXT,
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS pedidos (
            id TEXT PRIMARY KEY,
            cliente_id TEXT NOT NULL,
            produto TEXT NOT NULL,
            quantidade INTEGER NOT NULL,
            preco_unitario REAL NOT NULL,
            valor_total REAL NOT NULL,
            status TEXT DEFAULT 'pendente',
            created_at TEXT NOT NULL
        );

        "#
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}