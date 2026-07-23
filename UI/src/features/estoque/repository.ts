import { invoke } from "@tauri-apps/api/core";
import type { Carga } from "./types";

export async function criarCarga(carga: Carga) {
  await invoke("criar_carga", {
    carga,
  });
}

export async function listarCargas(): Promise<Carga[]> {
  return await invoke("listar_cargas");
}

export async function deletarCarga(id: string) {
  await invoke("excluir_carga", {
    id,
  });
}