use futures_util::{SinkExt, StreamExt};
use serde_json::{json, Value};
use std::time::Duration;
use tokio::time::{interval, MissedTickBehavior};
use tokio_tungstenite::{connect_async, tungstenite::Message};

const HEARTBEAT_INTERVAL: u64 = 20;

const TABLES: [&str; 4] = [
    "clientes",
    "cargas",
    "pedidos",
    "movimentacoes",
];

pub fn start_listener() {
    dotenvy::dotenv().ok();

    tauri::async_runtime::spawn(async {
        loop {
            match connect_and_listen().await {
                Ok(_) => {
                    println!(
                        "[SUPABASE] Connection closed. Reconnecting..."
                    );
                }

                Err(error) => {
                    eprintln!(
                        "[SUPABASE] Error connecting to Supabase: {}",
                        error
                    );
                }
            }

            println!(
                "[SUPABASE] Reconnecting in 5 seconds..."
            );

            tokio::time::sleep(Duration::from_secs(5)).await;
        }
    });
}

async fn connect_and_listen() -> Result<(), String> {
    let supabase_url = std::env::var("SUPABASE_URL")
        .map_err(|_| "SUPABASE_URL not set".to_string())?;

    let supabase_key = std::env::var("SUPABASE_KEY")
        .map_err(|_| "SUPABASE_KEY not set".to_string())?;

    let project_ref = extract_project_ref(&supabase_url)?;

    let websocket_url = format!(
        "wss://{}.supabase.co/realtime/v1/websocket?apikey={}&vsn=1.0.0",
        project_ref,
        supabase_key
    );

    println!(
        "[SUPABASE] Connecting to Supabase Realtime at: {}",
        websocket_url
    );

    let (ws_stream, _) = connect_async(&websocket_url)
        .await
        .map_err(|e| {
            format!(
                "Failed to connect in WebSocket: {:?}",
                e
            )
        })?;

    println!(
        "[SUPABASE] Connected to Supabase Realtime."
    );

    let (mut write, mut read) = ws_stream.split();

    let topic = "realtime:desktop-sync";
    let join_ref = "1";

    let postgres_changes: Vec<Value> = TABLES
        .iter()
        .map(|table| {
            json!({
                "event": "*",
                "schema": "public",
                "table": table,
            })
        })
        .collect();

    let join_message = json!({
        "topic": topic,
        "event": "phx_join",
        "payload": {
            "config": {
                "broadcast": {
                    "ack": false,
                    "self": false
                },
                "presence": {
                    "enabled": false
                },
                "postgres_changes": postgres_changes
            }
        },
        "ref": join_ref,
        "join_ref": join_ref
    });

    write
        .send(Message::Text(
            join_message.to_string().into()
        ))
        .await
        .map_err(|e| {
            format!(
                "Failed to send phx_join: {:?}",
                e
            )
        })?;

    println!(
        "[SUPABASE] Sent phx_join message to Supabase Realtime."
    );

    // =====================================================
    // HEARTBEAT
    // =====================================================

    let mut heartbeat =
        interval(Duration::from_secs(HEARTBEAT_INTERVAL));

    heartbeat.set_missed_tick_behavior(
        MissedTickBehavior::Skip
    );

    // O primeiro tick do interval acontece imediatamente.
    // Consumimos esse primeiro tick para que o primeiro
    // heartbeat aconteça depois de 20 segundos.
    heartbeat.tick().await;

    let mut heartbeat_ref: u64 = 2;

    // =====================================================
    // LOOP PRINCIPAL
    // =====================================================

    loop {
        tokio::select! {

            // =============================================
            // MENSAGENS DO SUPABASE
            // =============================================

            message = read.next() => {

                match message {

                    Some(Ok(Message::Text(text))) => {

                        println!(
                            "[SUPABASE] Message received: {}",
                            text
                        );

                        processar_mensagem(&text);
                    }

                    Some(Ok(Message::Ping(data))) => {

                        println!(
                            "[SUPABASE] Ping received."
                        );

                        write
                            .send(Message::Pong(data))
                            .await
                            .map_err(|e| {
                                format!(
                                    "Failed to send Pong: {:?}",
                                    e
                                )
                            })?;
                    }

                    Some(Ok(Message::Pong(_))) => {

                        println!(
                            "[SUPABASE] Pong received."
                        );
                    }

                    Some(Ok(Message::Close(frame))) => {

                        println!(
                            "[SUPABASE] Server closed connection: {:?}",
                            frame
                        );

                        return Ok(());
                    }

                    Some(Ok(_)) => {
                        // Outros tipos de mensagem.
                    }

                    Some(Err(error)) => {

                        return Err(
                            format!(
                                "WebSocket error: {:?}",
                                error
                            )
                        );
                    }

                    None => {

                        println!(
                            "[SUPABASE] WebSocket stream ended."
                        );

                        return Ok(());
                    }
                }
            }

            // =============================================
            // HEARTBEAT
            // =============================================

            _ = heartbeat.tick() => {

                let heartbeat_message = json!({
                    "topic": "phoenix",
                    "event": "heartbeat",
                    "payload": {},
                    "ref": heartbeat_ref.to_string()
                });

                heartbeat_ref += 1;

                println!(
                    "[SUPABASE] Sending heartbeat."
                );

                write
                    .send(Message::Text(
                        heartbeat_message
                            .to_string()
                            .into()
                    ))
                    .await
                    .map_err(|e| {
                        format!(
                            "Failed to send heartbeat: {:?}",
                            e
                        )
                    })?;
            }
        }
    }
}


// =========================================================
// PROCESSAMENTO DAS MENSAGENS
// =========================================================

fn processar_mensagem(text: &str) {

    let mensagem: Value =
        match serde_json::from_str(text) {

            Ok(value) => value,

            Err(error) => {

                eprintln!(
                    "[SUPABASE] JSON inválido: {}",
                    error
                );

                eprintln!(
                    "[SUPABASE] Mensagem: {}",
                    text
                );

                return;
            }
        };


    let event = mensagem
        .get("event")
        .and_then(Value::as_str)
        .unwrap_or("");


    match event {

        "phx_reply" => {
            processar_phx_reply(&mensagem);
        }

        "postgres_changes" => {
            processar_postgres_change(&mensagem);
        }

        "system" => {

            println!(
                "[SUPABASE] SYSTEM: {}",
                mensagem
            );
        }

        "phx_error" => {

            eprintln!(
                "[SUPABASE] PHX ERROR: {}",
                mensagem
            );
        }

        "phx_close" => {

            println!(
                "[SUPABASE] PHX CLOSE: {}",
                mensagem
            );
        }

        _ => {

            println!(
                "[SUPABASE] Evento recebido: {}",
                mensagem
            );
        }
    }
}


// =========================================================
// PHX JOIN
// =========================================================

fn processar_phx_reply(mensagem: &Value) {

    let status = mensagem
        .get("payload")
        .and_then(|p| p.get("status"))
        .and_then(Value::as_str)
        .unwrap_or("unknown");


    if status == "ok" {

        println!(
            "[SUPABASE] Realtime conectado com sucesso."
        );

        println!(
            "[SUPABASE] Inscrição nas tabelas confirmada."
        );

    } else {

        eprintln!(
            "[SUPABASE] Falha ao entrar no canal: {}",
            mensagem
        );
    }
}


// =========================================================
// POSTGRES CHANGES
// =========================================================

fn processar_postgres_change(mensagem: &Value) {

    let payload = match mensagem.get("payload") {

        Some(payload) => payload,

        None => {

            eprintln!(
                "[SUPABASE] postgres_changes sem payload."
            );

            return;
        }
    };


    let data = match payload.get("data") {

        Some(data) => data,

        None => {

            eprintln!(
                "[SUPABASE] postgres_changes sem data."
            );

            return;
        }
    };


    let table = data
        .get("table")
        .and_then(Value::as_str)
        .unwrap_or("desconhecida");


    let event = data
        .get("type")
        .and_then(Value::as_str)
        .unwrap_or("desconhecido");


    let record = data
        .get("record")
        .cloned()
        .unwrap_or(Value::Null);


    let old_record = data
        .get("old_record")
        .cloned()
        .unwrap_or(Value::Null);


    println!(
        "\n========================================"
    );

    println!(
        "[SUPABASE] ALTERAÇÃO RECEBIDA"
    );

    println!(
        "[SUPABASE] Tabela: {}",
        table
    );

    println!(
        "[SUPABASE] Evento: {}",
        event
    );


    match event {

        "INSERT" => {

            println!(
                "[SUPABASE] Novo registro:"
            );

            println!(
                "{}",
                serde_json::to_string_pretty(&record)
                    .unwrap_or_default()
            );
        }


        "UPDATE" => {

            println!(
                "[SUPABASE] Registro atualizado:"
            );

            println!(
                "{}",
                serde_json::to_string_pretty(&record)
                    .unwrap_or_default()
            );
        }


        "DELETE" => {

            println!(
                "[SUPABASE] Registro removido:"
            );

            println!(
                "{}",
                serde_json::to_string_pretty(&old_record)
                    .unwrap_or_default()
            );
        }


        _ => {

            println!(
                "[SUPABASE] Evento desconhecido."
            );
        }
    }


    println!(
        "========================================\n"
    );
}


// =========================================================
// SUPABASE PROJECT REF
// =========================================================

fn extract_project_ref(
    supabase_url: &str
) -> Result<String, String> {

    let url = supabase_url
        .trim()
        .trim_end_matches('/');


    let host = url
        .strip_prefix("https://")
        .or_else(|| {
            url.strip_prefix("http://")
        })
        .ok_or_else(|| {
            "SUPABASE_URL inválida.".to_string()
        })?;


    let project_ref = host
        .split('.')
        .next()
        .unwrap_or("");


    if project_ref.is_empty() {

        return Err(
            "Não foi possível identificar o project reference do Supabase."
                .to_string()
        );
    }


    Ok(project_ref.to_string())
}