import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(currentDir, "..");
const prismaDir = path.join(projectRoot, "prisma");
const defaultSchemaPath = path.join(prismaDir, "schema.prisma");
const postgresSchemaPath = path.join(prismaDir, "schema.postgresql.prisma");
const prismaCliPath = path.join(projectRoot, "node_modules", "prisma", "build", "index.js");

function resolveProvider() {
  const explicit = process.env.PRISMA_DB_PROVIDER?.trim().toLowerCase();

  if (explicit === "postgres" || explicit === "postgresql") {
    return "postgresql";
  }

  if (explicit === "sqlite") {
    return "sqlite";
  }

  const databaseUrl = (process.env.DATABASE_URL ?? "").trim().toLowerCase();

  if (databaseUrl.startsWith("postgres://") || databaseUrl.startsWith("postgresql://")) {
    return "postgresql";
  }

  return "sqlite";
}

function ensurePostgresSchema() {
  const source = readFileSync(defaultSchemaPath, "utf8");
  const next = source.replace(
    /datasource\s+db\s*\{\s*provider\s*=\s*"sqlite"/m,
    'datasource db {\n  provider = "postgresql"',
  );

  if (!existsSync(prismaDir)) {
    mkdirSync(prismaDir, { recursive: true });
  }

  if (!existsSync(postgresSchemaPath) || readFileSync(postgresSchemaPath, "utf8") !== next) {
    writeFileSync(postgresSchemaPath, next, "utf8");
  }
}

const provider = resolveProvider();
const prismaArgs = process.argv.slice(2);

if (provider === "postgresql") {
  ensurePostgresSchema();
}

const selectedSchemaPath =
  provider === "postgresql" ? postgresSchemaPath : defaultSchemaPath;

const result = spawnSync(
  process.execPath,
  [prismaCliPath, ...prismaArgs, "--schema", selectedSchemaPath],
  {
    cwd: projectRoot,
    env: process.env,
    stdio: "inherit",
  },
);

if (typeof result.status === "number") {
  process.exit(result.status);
}

process.exit(1);
