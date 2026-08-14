use rusqlite::Connection;

fn add_column_if_not_exists(
    conn: &Connection,
    table: &str,
    column: &str,
    definition: &str,
) -> Result<(), String> {
    let mut stmt = conn
        .prepare(&format!("PRAGMA table_info({table})"))
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map([], |row| row.get::<_, String>(1))
        .map_err(|e| e.to_string())?;

    for row in rows {
        if row.map_err(|e| e.to_string())? == column {
            return Ok(());
        }
    }

    conn.execute(
        &format!("ALTER TABLE {table} ADD COLUMN {column} {definition}"),
        [],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

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
            quebras INTEGER DEFAULT 0,
            valor_quebras REAL DEFAULT 0
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
            created_at TEXT NOT NULL,
            carga_id TEXT
        );

        CREATE TABLE IF NOT EXISTS pedidos (
            id TEXT PRIMARY KEY,
            cliente_id TEXT NOT NULL,
            produto TEXT NOT NULL,
            quantidade INTEGER NOT NULL,
            preco_unitario REAL NOT NULL,
            valor_total REAL NOT NULL,
            status TEXT DEFAULT 'pendente',
            created_at TEXT NOT NULL,
            carga_id TEXT
        );

        "#
    )
    .map_err(|e| e.to_string())?;

    add_column_if_not_exists(conn, "cargas", "valor_quebras", "REAL DEFAULT 0")?;
    add_column_if_not_exists(conn, "cargas", "quantidade_final", "INTEGER")?;
    add_column_if_not_exists(conn, "pedidos", "carga_id", "TEXT")?;

    conn.execute(
    "
    UPDATE cargas
    SET quantidade_final = quantidade
    WHERE quantidade_final IS NULL
    ",
    [],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}