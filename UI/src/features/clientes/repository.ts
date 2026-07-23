import { invoke } from "@tauri-apps/api/core";
import { Cliente } from "../../features/clientes/types";

export async function listarClientes(): Promise<Cliente[]> {
    return await invoke("listar_clientes");
}

export async function criarCliente(cliente: Cliente): Promise<void> {
    await invoke("criar_cliente", { cliente });
}

export async function atualizarCliente(cliente: Cliente): Promise<void> {
    await invoke("atualizar_cliente", { cliente });
}

export async function excluirCliente(id: string): Promise<void> {
    await invoke("excluir_cliente", { id });
}