import { query } from '../src/lib/db';

async function main() {
  const tables = [
    'inventory_stock',
    'products',
    'production_orders',
    'purchase_orders',
    'purchase_order_items',
    'suppliers',
    'customer_orders',
    'order_items',
    'machines'
  ];

  for (const tbl of tables) {
    const cols = await query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = $1 
      ORDER BY ordinal_position;
    `, [tbl]);
    console.log(`\n=== Table: ${tbl} ===`);
    console.log(cols.rows.map((c: any) => `${c.column_name} (${c.data_type})`).join(', '));
    const sample = await query(`SELECT * FROM ${tbl} LIMIT 2;`);
    console.log('Sample row:', JSON.stringify(sample.rows[0], null, 2));
  }
}

main().catch(console.error);
