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

            // --- CRIAÇÃO DAS TABELAS (MIGRATIONS) ---
            
            // 1. Tabela de Cargas
            await db.execute(`
                CREATE TABLE IF NOT EXISTS "cargas" (
                    "id" TEXT PRIMARY KEY,
                    "produto" TEXT NOT NULL,
                    "quantidade" INTEGER NOT NULL,
                    "custo_unitario" REAL NOT NULL,
                    "preco_venda" REAL DEFAULT NULL,
                    "lucro_esperado" REAL,
                    "created_at" TEXT NOT NULL,
                    "quebras" INTEGER DEFAULT 0
                );
            `);

            // 2. Tabela de Clientes
            await db.execute(`
                CREATE TABLE IF NOT EXISTS "clientes" (
                    "id" TEXT PRIMARY KEY,
                    "nome" TEXT NOT NULL,
                    "telefone" TEXT,
                    "endereco" TEXT,
                    "created_at" TEXT NOT NULL,
                    "observacoes" TEXT
                );
            `);

            // 3. Tabela de Movimentações
            await db.execute(`
                CREATE TABLE IF NOT EXISTS "movimentacoes" (
                    "id" TEXT PRIMARY KEY,
                    "produto" TEXT NOT NULL,
                    "quantidade" INTEGER NOT NULL,
                    "tipo" TEXT NOT NULL,
                    "origem" TEXT NOT NULL,
                    "referencia_id" TEXT,
                    "created_at" TEXT NOT NULL
                );
            `);

            // 4. Tabela de Pedidos
            await db.execute(`
                CREATE TABLE IF NOT EXISTS "pedidos" (
                    "id" TEXT PRIMARY KEY,
                    "cliente_id" TEXT NOT NULL,
                    "produto" TEXT NOT NULL,
                    "quantidade" INTEGER NOT NULL,
                    "preco_unitario" REAL NOT NULL,
                    "valor_total" REAL NOT NULL,
                    "status" TEXT DEFAULT 'pendente',
                    "created_at" TEXT NOT NULL
                );
            `);

            console.log("Estrutura de tabelas verificada/criada com sucesso.");
        } catch (error) {
            console.error("Erro ao inicializar ou aplicar configurações no SQLite:", error);
        }
    }

    return db;
}