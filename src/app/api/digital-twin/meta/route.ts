import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getMachineHistoricalPerformance } from '@/lib/simulation/digital-twin-engine';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    // 1. Fetch all real machines joined with machine types
    const machinesRes = await query(`
      SELECT 
        m.machine_id as id,
        m.machine_code as code,
        m.machine_name as name,
        COALESCE(mt.machine_type_name, 'Production Equipment') as type,
        COALESCE(m.status, 'Running') as status,
        COALESCE(m.machine_age_years, 2.5)::float as "ageYears"
      FROM machines m
      LEFT JOIN machine_types mt ON m.machine_type_id = mt.machine_type_id
      ORDER BY m.machine_id ASC;
    `);

    // Enhance each machine with historical production stats
    const enrichedMachines = await Promise.all(
      machinesRes.rows.map(async (m: any) => {
        const perf = await getMachineHistoricalPerformance(m.id);
        return {
          ...m,
          totalOrdersExecuted: perf?.totalOrdersExecuted || 0,
          totalHistoricalHours: perf?.totalHistoricalHours || 0,
          averageThroughputPerHour: perf?.averageThroughputPerHour || null,
          historicalRejectionRatePct: perf?.historicalRejectionRatePct || 1.2,
          avgUnitProductionCost: perf?.avgUnitProductionCost || 20.0,
        };
      })
    );

    // 2. Fetch all manufactured products & current inventory levels
    const productsRes = await query(`
      SELECT 
        p.product_id as id,
        p.product_code as code,
        p.product_name as name,
        COALESCE(p.unit, 'Packs') as unit,
        COALESCE(c.category_name, 'Finished Goods') as category,
        COALESCE(SUM(s.current_quantity), 0)::float as "currentStock",
        COALESCE(AVG(s.reorder_level), 500)::float as "reorderLevel",
        COALESCE(AVG(s.unit_cost), 22.5)::float as "unitCost"
      FROM products p
      LEFT JOIN product_categories c ON p.category_id = c.category_id
      LEFT JOIN inventory_stock s ON p.product_id = s.product_id
      GROUP BY p.product_id, p.product_code, p.product_name, p.unit, c.category_name
      ORDER BY p.product_id ASC;
    `);

    // 3. Fetch active customer orders for quick demand scenario population
    const ordersRes = await query(`
      SELECT 
        o.order_id as id,
        o.order_number as "orderNumber",
        COALESCE(c.customer_name, 'Direct Customer') as customer,
        o.order_status as status,
        COALESCE(o.expected_delivery_date::text, (CURRENT_DATE + INTERVAL '5 days')::text) as "deliveryDate",
        COALESCE(SUM(oi.ordered_quantity), 1500)::float as "totalQuantity",
        COALESCE(oi.product_id, 1) as "productId"
      FROM customer_orders o
      LEFT JOIN customers c ON o.customer_id = c.customer_id
      LEFT JOIN order_items oi ON o.order_id = oi.order_id
      GROUP BY o.order_id, o.order_number, c.customer_name, o.order_status, o.expected_delivery_date, oi.product_id
      ORDER BY o.order_id DESC
      LIMIT 10;
    `);

    // 4. Fetch factory shifts
    const shiftsRes = await query(`
      SELECT 
        shift_id as id,
        shift_name as name,
        start_time as "startTime",
        end_time as "endTime"
      FROM shifts
      ORDER BY shift_id ASC;
    `);

    // 5. Recent active production orders
    const activeProdOrdersRes = await query(`
      SELECT 
        po.production_order_id as id,
        po.batch_number as "batchNumber",
        po.product_id as "productId",
        po.machine_id as "machineId",
        COALESCE(po.planned_quantity, 4000)::float as "plannedQuantity",
        COALESCE(po.actual_quantity, 0)::float as "actualQuantity",
        COALESCE(po.production_efficiency_pct, 95.0)::float as efficiency,
        po.production_status as status
      FROM production_orders po
      ORDER BY po.production_order_id DESC
      LIMIT 8;
    `);

    return NextResponse.json({
      status: 'success',
      simulation_ready: true,
      database_source: 'smart_manufacturing_erp',
      machines: enrichedMachines,
      products: productsRes.rows,
      customerOrders: ordersRes.rows,
      shifts: shiftsRes.rows,
      recentProductionOrders: activeProdOrdersRes.rows,
    });
  } catch (error: any) {
    console.error('Error fetching digital twin metadata:', error);
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}
