const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function check() {
  const tables = [
    'machines',
    'machine_types',
    'machine_sensor_readings',
    'production_orders',
    'production_plans',
    'customer_orders',
    'order_items',
    'products',
    'inventory_stock',
    'warehouses',
    'shifts',
    'machine_failure_predictions',
    'maintenance_records',
    'inventory_transactions',
    'quality_inspections',
    'operational_costs'
  ];

  for (const t of tables) {
    try {
      const cols = await pool.query(
        'SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1 ORDER BY ordinal_position;',
        [t]
      );
      const count = await pool.query(`SELECT COUNT(*) FROM ${t};`);
      console.log(`\n=== ${t.toUpperCase()} (${count.rows[0].count} rows) ===`);
      console.log(cols.rows.map(c => `${c.column_name}: ${c.data_type}`).join('\n'));
      
      const sample = await pool.query(`SELECT * FROM ${t} LIMIT 2;`);
      console.log('Sample row:', sample.rows[0]);
    } catch (e) {
      console.log(`\n=== ${t.toUpperCase()} (NOT FOUND OR ERROR: ${e.message}) ===`);
    }
  }
  await pool.end();
}

check();
