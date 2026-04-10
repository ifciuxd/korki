import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

function createDb() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  const client = postgres(connectionString);
  return drizzle(client, { schema });
}

// Lazy singleton — only created on first access, not at module import time.
// This prevents build failures when DATABASE_URL is not available.
let _db: ReturnType<typeof createDb> | undefined;

export function getDb() {
  if (!_db) {
    _db = createDb();
  }
  return _db;
}

// Re-export for convenience — but consumers that need build-time safety
// should use getDb() instead.
export const db = new Proxy({} as ReturnType<typeof createDb>, {
  get(_target, prop) {
    return Reflect.get(getDb(), prop);
  },
});
