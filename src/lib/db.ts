import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;

// Prevent creating duplicate connection pools across Next.js Hot Module Reloads (HMR)
const globalForPg = globalThis as unknown as { pgPool: Pool };

export const pool =
  globalForPg.pgPool ||
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10, // Max active connections
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
    ssl:
      process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL?.includes('localhost')
        ? { rejectUnauthorized: false }
        : false,
  });

// Handle idle connection errors gracefully without crashing the Node process
pool.on('error', (err: any) => {
  console.warn('PostgreSQL pool error (will reconnect):', err.message);
});

if (process.env.NODE_ENV !== 'production') {
  globalForPg.pgPool = pool;
}

export async function query(text: string, params?: any[]) {
  if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL is not set in environment variables.');
  }
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  return { ...res, duration };
}

export default pool;
