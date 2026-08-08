import { invoke } from "@tauri-apps/api/core";
import type { Cliente } from "./types";

export async function listarClientes(): Promise<Cliente[]> {
    return await invoke<Cliente[]>("listar_clientes");
}

export async function buscarCliente(
    id: string
): Promise<Cliente | null> {
    return await invoke<Cliente | null>("buscar_cliente", {
        id,
    });
}

export async function criarCliente(
    cliente: Cliente
): Promise<void> {
    await invoke("criar_cliente", {
        cliente,
    });
}

export async function atualizarCliente(
    cliente: Cliente
): Promise<void> {
    await invoke("atualizar_cliente", {
        cliente,
    });
}

export async function excluirCliente(
    id: string
): Promise<void> {
    await invoke("excluir_cliente", {
        id,
    });
}