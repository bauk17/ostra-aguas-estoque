import { getDb } from "../../lib/db/client";
import type { Carga } from "./types"; 

export async function criarCarga(data: Carga) {
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


export async function deletarCarga(id: string) {
  const db = await getDb();

  await db.execute(
    `DELETE FROM cargas WHERE id = ?`,
    [id]
  );
}