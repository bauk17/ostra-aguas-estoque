use chrono::{Datelike, Utc};
use serde::Serialize;
use tauri::State;

use crate::{
    database::connection::DbState,
    repositories::repository::Repository,
};

#[derive(Serialize)]
pub struct DashboardMetricas {
    pub vendas_mes: f64,
    pub entregas_ativas: i64,
    pub novos_clientes: i64,
}

/// Métricas do dashboard consultadas em tempo real no banco (somente registros existentes).
pub fn obter_metricas(db: &DbState) -> Result<DashboardMetricas, String> {
    let now = Utc::now();
    let mes_ref = format!("{:04}-{:02}", now.year(), now.month());

    let conn = Repository::conn(db);

    let vendas_mes: f64 = conn
        .query_row(
            "
            SELECT COALESCE(SUM(p.valor_total), 0.0)
            FROM pedidos p
            WHERE substr(p.created_at, 1, 7) = ?1
              AND UPPER(p.status) = 'ENTREGUE'
            ",
            [mes_ref.clone()],
            |row| row.get(0),
        )
        .map_err(|e| e.to_string())?;

    let entregas_ativas: i64 = conn
        .query_row(
            "
            SELECT COUNT(*)
            FROM pedidos
            WHERE UPPER(status) IN ('PENDENTE', 'EM ROTA')
            ",
            [],
            |row| row.get(0),
        )
        .map_err(|e| e.to_string())?;

    let novos_clientes: i64 = conn
        .query_row(
            "
            SELECT COUNT(*)
            FROM clientes
            WHERE substr(created_at, 1, 7) = ?1
            ",
            [mes_ref],
            |row| row.get(0),
        )
        .map_err(|e| e.to_string())?;

    Ok(DashboardMetricas {
        vendas_mes,
        entregas_ativas,
        novos_clientes,
    })
}

#[tauri::command]
pub fn obter_metricas_dashboard(db: State<DbState>) -> Result<DashboardMetricas, String> {
    obter_metricas(&db)
}

#[tauri::command]
pub fn obter_vendas_mes(db: State<DbState>) -> Result<f64, String> {
    obter_metricas(&db).map(|m| m.vendas_mes)
}
