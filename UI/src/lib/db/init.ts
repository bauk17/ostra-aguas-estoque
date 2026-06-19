import { getDb } from "./client";

export async function initDB() {
  const db = await getDb();
}