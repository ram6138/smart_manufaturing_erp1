import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;

// Prevent creating duplicate connection pools across Next.js Hot Module Reloads (HMR)
const globalForPg = globalThis as unknown as { pgPool: Pool };

export const pool =
  globalForPg.pgPool ||
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20, // Maximum active connections
    idleTimeoutMillis: 30000, // Close idle clients after 30s
    connectionTimeoutMillis: 5000, // Timeout after 5s if unable to connect
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

// Handle idle connection errors gracefully without crashing the Node process
pool.on('error', (err: any) => {
  console.warn('PostgreSQL idle client encountered error (will automatically reconnect):', err.message);
});

if (process.env.NODE_ENV !== 'production') {
  globalForPg.pgPool = pool;
}

export async function query(text: string, params?: any[]) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  return { ...res, duration };
}

export default pool;
