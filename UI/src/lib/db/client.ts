import Database from "@tauri-apps/plugin-sql";


let db: Database;


export async function getDb() {
    if (!db) {
        db = await Database.load("sqlite:./estoque.db");
    }
    console.log("Database loaded", db);
    return db;
}