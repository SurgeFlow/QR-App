import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

function resolveSqlitePath(databaseUrl: string | undefined): string | null {
  if (!databaseUrl) return null;
  if (!databaseUrl.startsWith('file:')) return null;

  const relativePath = databaseUrl.replace('file:', '');
  return path.resolve(process.cwd(), relativePath);
}

function hasMigrations(prismaDir: string): boolean {
  const migrationsDir = path.join(prismaDir, 'migrations');
  if (!fs.existsSync(migrationsDir)) return false;
  const entries = fs.readdirSync(migrationsDir, { withFileTypes: true });
  return entries.some((entry) => entry.isDirectory());
}

export async function ensureDatabase(): Promise<void> {
  const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
  const prismaDir = path.dirname(schemaPath);
  const migrationsPresent = hasMigrations(prismaDir);
  const sqlitePath = resolveSqlitePath(process.env.DATABASE_URL);
  const sqliteExists = sqlitePath ? fs.existsSync(sqlitePath) : true;

  try {
    if (migrationsPresent) {
      console.log('Applying Prisma migrations...');
      execSync(`npx prisma migrate deploy --schema "${schemaPath}"`, { stdio: 'inherit' });
    } else if (!sqliteExists) {
      console.log('SQLite database missing; pushing Prisma schema...');
      execSync(`npx prisma db push --schema "${schemaPath}"`, { stdio: 'inherit' });
    }
  } catch (error) {
    console.error('Failed to ensure SQLite database state:', error);
    throw error;
  }
}
