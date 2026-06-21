import { getDb } from "../../lib/db/client";
import type { Carga } from "./types"; 

export async function criarCarga(data: Carga) {
  const db = await getDb();

  console.log("DATA RECEBIDA:", data);

  try {
    await db.execute(
      `INSERT INTO cargas (id, produto, quantidade, custo_unitario, preco_venda, quebras, lucro_esperado, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.id,
        data.produto,
        data.quantidade,
        data.custo_unitario,
        data.preco_venda ?? null,
        data.quebras ?? 0,
        data.lucro_esperado ?? null,
        new Date().toISOString(),
      ]
    );

    console.log("INSERT OK");
  } catch (e) {
    console.error("ERRO NO INSERT DE CARGA:", e);
    throw e;
  }
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