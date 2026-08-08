import { invoke } from "@tauri-apps/api/core";
import type { Carga } from "./types";

export async function listarCargas(): Promise<Carga[]> {
    return await invoke("listar_cargas");
}

export async function buscarCarga(id: string): Promise<Carga | null> {
    return await invoke("buscar_carga", { id });
}

export async function criarCarga(carga: Carga): Promise<void> {
    await invoke("criar_carga", { carga });
}

export async function atualizarCarga(carga: Carga): Promise<void> {
    await invoke("atualizar_carga", { carga });
}

export async function deletarCarga(id: string): Promise<void> {
    await invoke("excluir_carga", { id });
}