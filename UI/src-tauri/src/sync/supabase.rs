use reqwest::Client;
use serde_json::Value;

pub struct SupabaseClient {
    client: Client,
    base_url: String,
    api_key: String,
}

impl SupabaseClient {
    pub fn new() -> Result<Self, String> {
        dotenvy::dotenv().ok();

        let base_url = std::env::var("SUPABASE_URL")
            .map_err(|_| "SUPABASE_URL não configurada.".to_string())?;

        let api_key = std::env::var("SUPABASE_KEY")
            .map_err(|_| "SUPABASE_KEY não configurada.".to_string())?;

        let client = Client::new();

        Ok(Self {
            client,
            base_url,
            api_key,
        })
    }

    pub async fn inserir(
        &self,
        tabela: &str,
        payload: &Value,
    ) -> Result<(), String> {
        let url = format!(
            "{}/rest/v1/{}",
            self.base_url.trim_end_matches('/'),
            tabela
        );

        let response = self
            .client
            .post(&url)
            .header("apikey", &self.api_key)
            .header("Content-Type", "application/json")
            .json(payload)
            .send()
            .await
            .map_err(|e| {
                format!("[SUPABASE] Erro HTTP: {}", e)
            })?;

        let status = response.status();

        if !status.is_success() {
            let body = response
                .text()
                .await
                .unwrap_or_else(|_| {
                    "Não foi possível ler a resposta.".to_string()
                });

            return Err(format!(
                "[SUPABASE] API retornou {}: {}",
                status,
                body
            ));
        }

        Ok(())
    }

    pub async fn atualizar(
        &self,
        tabela: &str,
        id: &str,
        payload: &Value,
    ) -> Result<(), String> {
        let url = format!(
            "{}/rest/v1/{}?id=eq.{}",
            self.base_url.trim_end_matches('/'),
            tabela,
            id
        );

        let response = self
            .client
            .patch(&url)
            .header("apikey", &self.api_key)
            .header("Content-Type", "application/json")
            .json(payload)
            .send()
            .await
            .map_err(|e| {
                format!("[SUPABASE] Erro HTTP: {}", e)
            })?;

        let status = response.status();

        if !status.is_success() {
            let body = response
                .text()
                .await
                .unwrap_or_else(|_| {
                    "Não foi possível ler a resposta.".to_string()
                });

            return Err(format!(
                "[SUPABASE] API retornou {}: {}",
                status,
                body
            ));
        }

        Ok(())
    }


    pub async fn excluir(
        &self,
        tabela: &str,
        id: &str,
    ) -> Result<(), String> {
        let url = format!(
            "{}/rest/v1/{}?id=eq.{}",
            self.base_url.trim_end_matches('/'),
            tabela,
            id
        );

        let response = self
            .client
            .delete(&url)
            .header("apikey", &self.api_key)
            .header("Content-Type", "application/json")
            .send()
            .await
            .map_err(|e| {
                format!("[SUPABASE] Erro HTTP: {}", e)
            })?;

        let status = response.status();

        if !status.is_success() {
            let body = response
                .text()
                .await
                .unwrap_or_else(|_| {
                    "Não foi possível ler a resposta.".to_string()
                });

            return Err(format!(
                "[SUPABASE] API retornou {}: {}",
                status,
                body
            ));
        }

        Ok(())
    }
}