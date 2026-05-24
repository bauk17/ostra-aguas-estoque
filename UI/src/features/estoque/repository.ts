import { getDb } from "../../lib/db/client";

import type { Carga } from "./types"; 
import type { Movimentacao } from "./types";

export async function criarCarga(data: {
  id: string;
  produto: string;
  quantidade: number;
  custo_unitario: number;
  preco_venda?: number;
  lucro_esperado?: number;
  quebras?: number;
}) {
  const db = await getDb();

  await db.execute(
    `INSERT INTO cargas (id, produto, quantidade, custo_unitario, preco_venda, lucro_esperado, quebras, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.id,
      data.produto,
      data.quantidade,
      data.custo_unitario,
      data.preco_venda ?? null,
      data.lucro_esperado ?? null,
      data.quebras ?? 0,
      new Date().toISOString(),
    ]
  );


}

export async function listarCargas(): Promise<Carga[]> {
  const db = await getDb();

  const result = await db.select(
    `SELECT * FROM cargas ORDER BY created_at DESC`
  );

  return result as Carga[];
}


export async function criarMovimentacao(m: Movimentacao) {
  const db = await getDb();

  await db.execute(
    'INSERT INTO movimentacoes (id, produto, quantidade, tipo, origem, referencia_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
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
}

export async function listarMovimentacoes(): Promise<Movimentacao[]> {
  const db = await getDb();

  const result = await db.select(
    `SELECT * FROM movimentacoes ORDER BY created_at DESC`
  );

  return result as Movimentacao[];
}