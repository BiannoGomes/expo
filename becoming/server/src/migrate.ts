import { readFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { pool } from "./db.js";

const migrationsDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "migrations",
);

export async function runMigrations() {
  const client = await pool.connect();
  try {
    await client.query(
      `create table if not exists schema_migrations (
         name text primary key, applied_at timestamptz not null default now()
       )`,
    );
    const files = (await readdir(migrationsDir)).filter((f) => f.endsWith(".sql")).sort();
    for (const file of files) {
      const { rowCount } = await client.query(
        "select 1 from schema_migrations where name = $1",
        [file],
      );
      if (rowCount) continue;
      const sql = await readFile(path.join(migrationsDir, file), "utf8");
      console.log(`applying ${file}`);
      await client.query("begin");
      try {
        await client.query(sql);
        await client.query("insert into schema_migrations (name) values ($1)", [file]);
        await client.query("commit");
      } catch (err) {
        await client.query("rollback");
        throw err;
      }
    }
    console.log("migrations up to date");
  } finally {
    client.release();
  }
}

if (process.argv[1]?.endsWith("src/migrate.ts")) {
  runMigrations()
    .then(() => pool.end())
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
