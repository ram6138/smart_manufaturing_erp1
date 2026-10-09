import fs from 'fs';
import path from 'path';
import { query } from '../src/lib/db';

async function main() {
  const sqlPath = path.join(process.cwd(), 'scripts', 'init_simulation_tables.sql');
  const sql = fs.readFileSync(sqlPath, 'utf-8');
  console.log('Running migration...');
  await query(sql);
  console.log('Migration completed successfully.');

  const res = await query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name IN ('simulation_scenarios', 'simulation_decisions')
    ORDER BY table_name;
  `);
  console.log('Verified tables in DB:', res.rows);
}

main().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
