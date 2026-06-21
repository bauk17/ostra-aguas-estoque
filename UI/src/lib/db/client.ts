import Database from "@tauri-apps/plugin-sql";




let db: Database;

const DB_NAME = "estoque.db";


export async function getDb() {
    if (!db) {
        db = await Database.load(`sqlite:${DB_NAME}`);
        
        try {
            // 1. Define o timeout de 5 segundos para esperar travas liberarem
            await db.execute("PRAGMA busy_timeout = 5000;");
            
            // 2. Ativa o modo WAL para permitir leitura e escrita simultâneas
            await db.execute("PRAGMA journal_mode = WAL;");
            
            // 3. Deixa a sincronização segura, mas otimizada para o Windows
            await db.execute("PRAGMA synchronous = NORMAL;");
            
            console.log("Configurações de concorrência do SQLite aplicadas com sucesso (WAL).");
        } catch (error) {
            console.error("Erro ao aplicar PRAGMAs no SQLite:", error);
        }
    }

    return db;
}