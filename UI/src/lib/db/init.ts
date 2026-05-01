import { getDb } from "./client";

export async function initDB() {
  const db = await getDb();

  await db.execute(`
    CREATE TABLE IF NOT EXISTS cargas (
      id TEXT PRIMARY KEY,
      produto TEXT NOT NULL,
      quantidade INTEGER NOT NULL,
      custo_unitario REAL NOT NULL,
      lucro_esperado REAL,
      created_at TEXT NOT NULL
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS movimentacoes (
      id TEXT PRIMARY KEY,
      produto TEXT NOT NULL,
      quantidade INTEGER NOT NULL,
      tipo TEXT NOT NULL, -- 'entrada' | 'saida'
      origem TEXT NOT NULL, -- 'carga' | 'entrega'
      referencia_id TEXT,
      created_at TEXT NOT NULL
    );
`);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS clientes (
      id TEXT PRIMARY KEY,
      nome TEXT NOT NULL,
      telefone TEXT,
      endereco TEXT,
      created_at TEXT NOT NULL
    );
  `);
}