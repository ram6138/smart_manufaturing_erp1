import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    // 1. Fetch live stock items joined with products, categories, warehouses
    const stockResult = await query(`
      SELECT 
        s.inventory_stock_id::text as id,
        s.product_id as "productId",
        p.product_code as "itemCode",
        p.product_name as "itemName",
        COALESCE(c.category_name, 'General') as category,
        COALESCE(w.warehouse_name, 'Main Warehouse') as warehouse,
        COALESCE(w.warehouse_id::text, '1') as "warehouseId",
        p.unit,
        COALESCE(s.current_quantity, 0)::float as "quantityOnHand",
        0 as "reservedQuantity",
        COALESCE(s.reorder_level, 0)::float as "reorderLevel",
        COALESCE(s.reorder_quantity, 1000)::float as "normalStockLevel",
        COALESCE(s.unit_cost, 0)::float as "unitCost",
        COALESCE(w.location, 'Bin-A1') as "locationBin",
        COALESCE(s.reorder_quantity, 500)::float as "minOrderQuantity",
        7 as "leadTimeDays",
        COALESCE(p.created_at, NOW())::text as "createdAt",
        COALESCE(s.updated_at, NOW())::text as "updatedAt"
      FROM inventory_stock s
      JOIN products p ON s.product_id = p.product_id
      LEFT JOIN product_categories c ON p.category_id = c.category_id
      LEFT JOIN warehouses w ON s.warehouse_id = w.warehouse_id
      ORDER BY p.product_name ASC;
    `);

    // 2. Fetch live transactions
    const trxResult = await query(`
      SELECT 
        t.inventory_transaction_id::text as id,
        CONCAT('TRX-', LPAD(t.inventory_transaction_id::text, 4, '0')) as "transactionId",
        COALESCE(t.transaction_date, t.created_at, NOW())::text as date,
        t.product_id::text as "itemId",
        p.product_code as "itemCode",
        p.product_name as "itemName",
        COALESCE(w.warehouse_name, 'Main Warehouse') as warehouse,
        t.transaction_type as "transactionType",
        t.transaction_quantity::float as quantity,
        p.unit,
        CONCAT('REF-', LPAD(t.inventory_transaction_id::text, 4, '0')) as reference,
        COALESCE(t.transaction_type, 'Movement Log') as notes,
        'System Admin' as "performedBy"
      FROM inventory_transactions t
      JOIN products p ON t.product_id = p.product_id
      LEFT JOIN warehouses w ON t.warehouse_id = w.warehouse_id
      ORDER BY t.transaction_date DESC;
    `);

    // 3. Category Breakdown aggregated directly from live DB
    const categoryResult = await query(`
      SELECT 
        COALESCE(c.category_name, 'General') as category,
        COUNT(s.inventory_stock_id)::int as "itemCount",
        SUM(s.current_quantity)::float as "totalQuantity",
        SUM(s.current_quantity * s.unit_cost)::float as "totalValue"
      FROM inventory_stock s
      JOIN products p ON s.product_id = p.product_id
      LEFT JOIN product_categories c ON p.category_id = c.category_id
      GROUP BY c.category_name;
    `);

    const colorMap: Record<string, string> = {
      'Raw Material': '#06b6d4',
      'Finished Goods': '#10b981',
      'Work In Progress': '#f59e0b',
      'Packaging Material': '#8b5cf6',
    };

    const categoriesWithColors = categoryResult.rows.map((row: any) => ({
      category: row.category,
      itemCount: row.itemCount,
      totalQuantity: row.totalQuantity || 0,
      totalValue: row.totalValue || 0,
      color: colorMap[row.category] || '#64748b',
    }));

    // 4. Generate dynamic trend points for recent days
    const totalCurrentStock = stockResult.rows.reduce(
      (acc: number, item: any) => acc + item.quantityOnHand,
      0
    );

    const trendDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const trendData = trendDays.map((day, idx) => {
      const dayOffset = 6 - idx;
      const d = new Date();
      d.setDate(d.getDate() - dayOffset);
      const isoDate = d.toISOString().split('T')[0];

      return {
        date: isoDate,
        dayLabel: day,
        stockReceived: idx === 6 ? 1500 : (idx * 250) % 1200 + 400,
        productionConsumption: (idx * 320) % 900 + 200,
        currentStock: Math.round(totalCurrentStock - (6 - idx) * 300),
      };
    });

    return NextResponse.json({
      status: 'success',
      items: stockResult.rows,
      transactions: trxResult.rows,
      categorySummary: categoriesWithColors,
      trendData,
    });
  } catch (error: any) {
    console.error('Error fetching inventory data:', error);
    return NextResponse.json(
      { status: 'error', message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'adjustStock') {
      const { itemId, newQuantityOnHand, adjustmentDelta, reason, notes } = body;

      // Find stock row
      const stockCheck = await query(
        `SELECT s.product_id, s.warehouse_id, s.current_quantity, s.unit_cost, s.reorder_level, p.product_name, p.product_code 
         FROM inventory_stock s 
         JOIN products p ON s.product_id = p.product_id 
         WHERE s.inventory_stock_id::text = $1`,
        [String(itemId)]
      );

      if (stockCheck.rows.length === 0) {
        return NextResponse.json({ error: 'Stock item not found' }, { status: 404 });
      }

      const stockRow = stockCheck.rows[0];
      const openingStock = Number(stockRow.current_quantity) || 0;
      const closingStock = Math.max(0, Number(newQuantityOnHand) || 0);
      const reorderLvl = Number(stockRow.reorder_level) || 500;
      const unitCost = Number(stockRow.unit_cost) || 25.0;
      const newValue = closingStock * unitCost;
      const delta = adjustmentDelta !== undefined ? Number(adjustmentDelta) : (closingStock - openingStock);

      const computedStatus = closingStock <= 0 ? 'Out of Stock' : closingStock <= reorderLvl ? 'Low Stock' : 'In Stock';

      // Update inventory_stock
      await query(
        `UPDATE inventory_stock 
         SET current_quantity = $1, inventory_value = $2, stock_status = $3, updated_at = NOW() 
         WHERE inventory_stock_id::text = $4`,
        [closingStock, newValue, computedStatus, String(itemId)]
      );

      // Insert into inventory_transactions
      const trxNotes = reason ? `${reason}${notes ? ` - ${notes}` : ''}` : 'Stock Adjustment';
      await query(
        `INSERT INTO inventory_transactions 
         (transaction_date, product_id, warehouse_id, transaction_type, transaction_quantity, opening_stock, closing_stock, notes, created_at)
         VALUES (NOW(), $1, $2, 'Adjustment', $3, $4, $5, $6, NOW())`,
        [stockRow.product_id, stockRow.warehouse_id, delta, openingStock, closingStock, trxNotes]
      );

      return NextResponse.json({
        status: 'success',
        message: 'Stock adjusted in database successfully',
        productName: stockRow.product_name,
        closingStock,
      });
    }

    if (action === 'transferStock') {
      const { itemId, targetWarehouse, transferQuantity, notes } = body;

      const stockCheck = await query(
        `SELECT product_id, warehouse_id, current_quantity, unit_cost FROM inventory_stock WHERE inventory_stock_id = $1`,
        [itemId]
      );

      if (stockCheck.rows.length === 0) {
        return NextResponse.json({ error: 'Stock item not found' }, { status: 404 });
      }

      const stockRow = stockCheck.rows[0];
      const openingStock = stockRow.current_quantity;
      const closingStock = Math.max(0, openingStock - transferQuantity);
      const unitCost = Number(stockRow.unit_cost) || 25.0;

      // Decrement source warehouse stock
      await query(
        `UPDATE inventory_stock 
         SET current_quantity = $1, inventory_value = $2, updated_at = NOW() 
         WHERE inventory_stock_id = $3`,
        [closingStock, closingStock * unitCost, itemId]
      );

      // Log source transaction (Transfer Out)
      await query(
        `INSERT INTO inventory_transactions 
         (transaction_date, product_id, warehouse_id, transaction_type, transaction_quantity, opening_stock, closing_stock, created_at)
         VALUES (NOW(), $1, $2, 'Transfer Out', $3, $4, $5, NOW())`,
        [stockRow.product_id, stockRow.warehouse_id, -transferQuantity, openingStock, closingStock]
      );

      // Resolve destination warehouse ID
      let destWhId = 2;
      const whRes = await query(
        `SELECT warehouse_id FROM warehouses WHERE warehouse_name ILIKE $1 LIMIT 1`,
        [targetWarehouse || '']
      );
      if (whRes.rows.length > 0) {
        destWhId = whRes.rows[0].warehouse_id;
      }

      // Check or create destination stock record
      const destStockCheck = await query(
        `SELECT inventory_stock_id, current_quantity FROM inventory_stock WHERE product_id = $1 AND warehouse_id = $2`,
        [stockRow.product_id, destWhId]
      );

      if (destStockCheck.rows.length > 0) {
        const destStock = destStockCheck.rows[0];
        const destOpening = Number(destStock.current_quantity) || 0;
        const destClosing = destOpening + transferQuantity;
        await query(
          `UPDATE inventory_stock 
           SET current_quantity = $1, inventory_value = $2, updated_at = NOW() 
           WHERE inventory_stock_id = $3`,
          [destClosing, destClosing * unitCost, destStock.inventory_stock_id]
        );
        // Log destination transaction (Transfer In)
        await query(
          `INSERT INTO inventory_transactions 
           (transaction_date, product_id, warehouse_id, transaction_type, transaction_quantity, opening_stock, closing_stock, created_at)
           VALUES (NOW(), $1, $2, 'Transfer In', $3, $4, $5, NOW())`,
          [stockRow.product_id, destWhId, transferQuantity, destOpening, destClosing]
        );
      } else {
        await query(
          `INSERT INTO inventory_stock (product_id, warehouse_id, current_quantity, unit_cost, inventory_value, reorder_level, reorder_quantity, stock_status, updated_at)
           VALUES ($1, $2, $3, $4, $5, 200, 500, 'In Stock', NOW())`,
          [stockRow.product_id, destWhId, transferQuantity, unitCost, transferQuantity * unitCost]
        );
        // Log destination transaction (Transfer In)
        await query(
          `INSERT INTO inventory_transactions 
           (transaction_date, product_id, warehouse_id, transaction_type, transaction_quantity, opening_stock, closing_stock, created_at)
           VALUES (NOW(), $1, $2, 'Transfer In', $3, 0, $3, NOW())`,
          [stockRow.product_id, destWhId, transferQuantity]
        );
      }

      return NextResponse.json({ status: 'success', message: `Transferred ${transferQuantity} units to ${targetWarehouse}` });
    }

    if (action === 'purchaseRequest') {
      const { itemCode, requestedQuantity, reason } = body;

      // Find product and unit cost
      const prod = await query(
        `SELECT p.product_id, COALESCE(s.unit_cost, 25.0)::float as unit_cost 
         FROM products p 
         LEFT JOIN inventory_stock s ON p.product_id = s.product_id 
         WHERE p.product_code = $1 OR p.product_name = $1 LIMIT 1`,
        [itemCode]
      );
      const productId = prod.rows.length > 0 ? prod.rows[0].product_id : 1;
      const unitCost = prod.rows.length > 0 ? prod.rows[0].unit_cost : 25.0;

      // Insert purchase request with clean PR number
      const countRes = await query(`SELECT COALESCE(MAX(purchase_request_id), 0) + 1 as next_id FROM purchase_requests;`);
      const nextId = parseInt(countRes.rows[0].next_id, 10);
      const reqNumber = `PR-2026-${String(100 + nextId).padStart(3, '0')}`;

      const prRes = await query(
        `INSERT INTO purchase_requests 
           (request_number, request_date, requesting_department_id, requester_id, request_status, required_by_date, created_at)
         VALUES 
           ($1, CURRENT_DATE, 1, 1, 'Pending', CURRENT_DATE + INTERVAL '7 days', NOW())
         RETURNING purchase_request_id, request_number;`,
        [reqNumber]
      );

      if (productId && prRes.rows.length > 0) {
        await query(
          `INSERT INTO purchase_request_items 
             (purchase_request_id, product_id, requested_quantity, required_by_date, estimated_unit_price)
           VALUES 
             ($1, $2, $3, CURRENT_DATE + INTERVAL '7 days', $4);`,
          [prRes.rows[0].purchase_request_id, productId, requestedQuantity, unitCost]
        );
      }

      return NextResponse.json({ status: 'success', requestNumber: reqNumber });
    }

    if (action === 'addItem') {
      const {
        productName,
        productCode,
        categoryId = 1,
        quantity = 1000,
        unitPrice = 10.0,
        warehouseId = 1,
        unit = 'kg',
      } = body;

      const code = productCode || `RAW-${Date.now().toString().slice(-4)}`;

      // Insert product
      const prodRes = await query(
        `INSERT INTO products (product_name, product_code, category_id, unit, is_active, created_at)
         VALUES ($1, $2, $3, $4, true, NOW())
         RETURNING product_id, product_name, product_code`,
        [productName, code, categoryId, unit]
      );

      const createdProduct = prodRes.rows[0];

      // Insert initial stock
      await query(
        `INSERT INTO inventory_stock (product_id, warehouse_id, current_quantity, unit_cost, inventory_value, reorder_level, reorder_quantity, stock_status, updated_at)
         VALUES ($1, $2, $3, $4, $5, 200, 500, 'In Stock', NOW())`,
        [createdProduct.product_id, warehouseId, quantity, unitPrice, quantity * unitPrice]
      );

      return NextResponse.json({
        status: 'success',
        message: 'Product added and stock initialized in database successfully',
        product: createdProduct,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Error handling inventory POST action:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
