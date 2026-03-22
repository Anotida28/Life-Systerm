import "dotenv/config";

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function splitSqlStatements(sql: string) {
  return sql
    .split(/;\s*(?:\r?\n|$)/g)
    .map((statement) => statement.trim())
    .filter(Boolean);
}

async function ensureMigrationJournal() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "_manual_migrations" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "appliedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function getAppliedMigrations() {
  const rows = await prisma.$queryRawUnsafe<Array<{ id: string }>>(
    'SELECT "id" FROM "_manual_migrations"',
  );

  return new Set(rows.map((row) => row.id));
}

async function applyMigrations() {
  const migrationsDir = path.join(process.cwd(), "prisma", "migrations");
  const entries = await readdir(migrationsDir, { withFileTypes: true });
  const directories = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  await ensureMigrationJournal();
  const applied = await getAppliedMigrations();

  for (const directory of directories) {
    if (applied.has(directory)) {
      continue;
    }

    const migrationPath = path.join(migrationsDir, directory, "migration.sql");
    const sql = await readFile(migrationPath, "utf8");
    const statements = splitSqlStatements(sql);

    await prisma.$transaction(async (tx) => {
      for (const statement of statements) {
        await tx.$executeRawUnsafe(statement);
      }

      await tx.$executeRaw`
        INSERT INTO "_manual_migrations" ("id")
        VALUES (${directory})
      `;
    });

    console.log(`Applied migration ${directory}`);
  }
}

applyMigrations()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
