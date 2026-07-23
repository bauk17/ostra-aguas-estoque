import { invoke } from "@tauri-apps/api/core";

import type { PedidoRow } from "./types";

export const criarPedido = async (pedido: any) => {
    await invoke("criar_pedido", {
        pedido,
    });
};

export const listarPedidos = async (): Promise<PedidoRow[]> => {
    return await invoke("listar_pedidos");
};

export const atualizarStatusPedido = async (
    id: string,
    status: string
) => {

    await invoke("atualizar_status_pedido", {
        id,
        status,
    });
};

export const deletarPedido = async (
    id: string
) => {

    await invoke("excluir_pedido", {
        id,
    });
};

export const atualizarPedido = async (
    pedido: any
) => {

    await invoke("atualizar_pedido", {
        pedido,
    });
};

export const buscarPedido = async (
    id: string
) => {

    return await invoke("buscar_pedido", {
        id,
    });
};