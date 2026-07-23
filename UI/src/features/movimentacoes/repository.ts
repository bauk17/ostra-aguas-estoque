import { invoke } from "@tauri-apps/api/core";
import type { Movimentacao } from "./types";

export async function criarMovimentacao(
    movimentacao: Movimentacao
) {
    await invoke("criar_movimentacao", {
        movimentacao,
    });
}

export async function listarMovimentacoes(): Promise<Movimentacao[]> {
    return await invoke("listar_movimentacoes");
}

export async function deletarMovimentacao(id: string) {
    await invoke("excluir_movimentacao", {
        id,
    });
}