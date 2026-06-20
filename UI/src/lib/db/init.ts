import { getDb } from "./client";

export async function initDB() {
  await getDb();
}