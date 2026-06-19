
import { getDb } from "../../lib/db/client";

import type { Cliente } from "./types";

export async function criarCliente(cliente: Cliente) {
  const db = await getDb();

  await db.execute(
    `INSERT INTO clientes (id, nome, telefone, endereco, created_at)
     VALUES (?, ?, ?, ?, ?)`,
    [
      cliente.id,
      cliente.nome,
      cliente.telefone ?? null,
      cliente.endereco ?? null,
      cliente.created_at,
    ]
  );
}

export async function listarClientes(): Promise<Cliente[]> {
  const db = await getDb();

  const result = await db.select(
    `SELECT * FROM clientes ORDER BY nome ASC`
  );

  return result as Cliente[];
}

export const deletarCliente = async (id: string) => {
    const db = await getDb();

    await db.execute(
        `DELETE FROM clientes WHERE id = ?`,
        [id]
    );
}

export const atualizarStatusCliente = async (id: string, status: string) => {
    const db = await getDb();

    await db.execute(
        `UPDATE clientes SET status = ? WHERE id = ?`,
        [status, id]
    );
}
