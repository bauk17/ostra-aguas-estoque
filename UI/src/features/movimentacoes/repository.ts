import { getDb } from "../../lib/db/client"
import type { Movimentacao } from "./types"

export async function criarMovimentacao(m: Movimentacao) {
  const db = await getDb();

  console.log("Criando movimentação", m);
  await db.execute(
    'INSERT INTO movimentacoes (id, produto, quantidade, tipo, origem, referencia_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [
      m.id,
      m.produto,
      m.quantidade,
      m.tipo,
      m.origem,
      m.referencia_id ?? null,
      m.created_at,
    ] 
  )

  console.log("Movimentação criada");
}

export async function listarMovimentacoes(): Promise<Movimentacao[]> {
  const db = await getDb();

  const result = await db.select(
    `SELECT * FROM movimentacoes ORDER BY created_at DESC`
  );

  return result as Movimentacao[];
}