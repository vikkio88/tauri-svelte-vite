import { drizzle } from "drizzle-orm/sqlite-proxy";
import Database from "@tauri-apps/plugin-sql";
import * as schema from "./schema";

export type AppDatabase = ReturnType<typeof drizzle<typeof schema>>;

function makeDb(tauriDb: Database) {
  return drizzle(
    async (sql, params, method) => {
      try {
        if (method === "run") {
          const result = await tauriDb.execute(sql, params);
          return { rows: [], rowsAffected: result.rowsAffected };
        }

        const rows: any[] = await tauriDb.select(sql, params);
        const formattedRows = rows.map((row) => Object.values(row));
        const results = method === "all" ? formattedRows : formattedRows[0];

        return { rows: results || [] };
      } catch (e) {
        console.error("Tauri SQLite Error:", e);
        throw e;
      }
    },
    { schema },
  );
}

let tauriDbInstance: Database | null = null;
let drizzleInstance: AppDatabase | null = null;

// Loads migrations shipped in `public/migrations` into the sqlite file.
// Call this once on startup before using `getDb()`.
export async function runMigrations(migrationsUrl = "/migrations/0000_db_generate.sql") {
  const tauriDb = await getTauriDb();
  const response = await fetch(migrationsUrl);
  const sql = await response.text();
  await tauriDb.execute(sql);
}

export async function getTauriDb(): Promise<Database> {
  if (!tauriDbInstance) {
    tauriDbInstance = await Database.load("sqlite:app.db");
  }
  return tauriDbInstance;
}

export async function getDb(): Promise<AppDatabase> {
  if (drizzleInstance) return drizzleInstance;

  const tauriDb = await getTauriDb();
  drizzleInstance = makeDb(tauriDb);
  return drizzleInstance;
}
