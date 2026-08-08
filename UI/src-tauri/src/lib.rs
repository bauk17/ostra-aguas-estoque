mod backup;
mod commands;
mod database;
mod models;
mod repositories;
mod services;

use backup::*;
use commands::carga::*;
use commands::cliente::*;
use commands::movimentacao::*;
use commands::pedido::*;
use commands::vendas_mes::{obter_metricas_dashboard, obter_vendas_mes};
use tauri::Manager;
use database::connection::DbState;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let db = DbState::new(app.handle())?;
            app.manage(db);
            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            // Clientes
            listar_clientes,
            buscar_cliente,
            criar_cliente,
            atualizar_cliente,
            excluir_cliente,

            // Cargas
            listar_cargas,
            criar_carga,
            excluir_carga,

            // Movimentações
            listar_movimentacoes,
            criar_movimentacao,
            excluir_movimentacao,

            // Pedidos
            listar_pedidos,
            buscar_pedido,
            criar_pedido,
            atualizar_pedido,
            atualizar_status_pedido,
            excluir_pedido,

            // Dashboard
            obter_metricas_dashboard,
            obter_vendas_mes,

            // Backups 

            criar_backup,
            listar_backups,
            excluir_backup,
            exportar_backup,
            importar_backup,
            restaurar_backup,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}