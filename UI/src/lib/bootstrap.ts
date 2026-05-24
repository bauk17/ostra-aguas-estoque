import { initDB } from "./db/init";

export async function bootstrap() {
  await initDB();
}