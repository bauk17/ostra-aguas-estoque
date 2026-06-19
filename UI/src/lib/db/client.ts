import Database from "@tauri-apps/plugin-sql";




let db: Database;

const DB_NAME = "estoque.db";


export async function getDb() {
    if (!db) {
        db = await Database.load(`sqlite:${DB_NAME}`);
    }


  
    return db;

    
}