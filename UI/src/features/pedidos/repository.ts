import { getDb } from "../../lib/db/client";
import type { PedidoRow } from "./types";

export const criarPedido = async (data: {
    id: string;
    cliente_id: string;
    produto: string;
    quantidade: number;
    preco_unitario: number;
    valor_total?: number;
    status?: string;
    created_at?: Date;
}) => {
    const db = await getDb();

    await db.execute(
        `INSERT INTO pedidos (id, cliente_id, produto, quantidade, preco_unitario, valor_total, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            data.id,
            data.cliente_id,
            data.produto,
            data.quantidade,
            data.preco_unitario,
            data.valor_total,
            data.status ?? 'pendente',
            data.created_at ?? new Date().toISOString(),
        ]
    );  
}

export const listarPedidos = async () => {
    const db = await getDb();

    const query = `
        SELECT
          p.id,
          c.nome AS cliente,
          c.endereco AS endereco,
          p.produto AS produto,
          p.valor_total AS valor_total,
          p.quantidade AS quantidade,
          p.status AS status,
          p.created_at AS created_at
        FROM pedidos p
        INNER JOIN clientes c ON p.cliente_id = c.id
        ORDER BY p.created_at DESC
    `;

    const pedidos = await db.select<PedidoRow>(query);

    return pedidos.map((row: PedidoRow) => ({
        id: row.id,
        cliente: row.cliente,
        endereco: row.endereco,
        produto: row.produto,
        valor_total: Number(row.valor_total).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }),
        quantidade: row.quantidade,
        status: row.status,
        created_at: row.created_at
    }));
}

export const atualizarStatusPedido = async (id: string, status: string) => {
    const db = await getDb();

    await db.execute(
        `UPDATE pedidos SET status = ? WHERE id = ?`,
        [status, id]
    );
}

export const deletarPedido = async (id: string) => {
    const db = await getDb();

    await db.execute(
        `DELETE FROM pedidos WHERE id = ?`,
        [id]
    );
}

export const atualizarPedido = async (
    id: string, 
    data: {
        cliente_id: string;
        produto: string;
        quantidade: number;
        preco_unitario: number;
        valor_total: number;
        status: string;
    }
) => {
    const db = await getDb();

    await db.execute(
        `UPDATE pedidos 
         SET cliente_id = ?, 
             produto = ?, 
             quantidade = ?, 
             preco_unitario = ?, 
             valor_total = ?, 
             status = ?
         WHERE id = ?`,
        [
            data.cliente_id,
            data.produto,
            data.quantidade,
            data.preco_unitario,
            data.valor_total,
            data.status,
            id
        ]
    );
};
