import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    // 1. Fetch Quality Inspections joined with Production Orders, Products & Users
    const inspRes = await query(`
      SELECT 
        qi.quality_inspection_id::text as id,
        CONCAT('INS-', LPAD(qi.quality_inspection_id::text, 4, '0')) as "inspectionId",
        CONCAT('QC-2026-', LPAD(qi.quality_inspection_id::text, 4, '0')) as "inspectionNumber",
        COALESCE(po.production_order_id::text, 'PO-2026-001') as "productionOrderId",
        qi.batch_number as "batchNumber",
        COALESCE(p.product_name, 'Classic Butter Biscuit') as "productName",
        COALESCE(p.product_code, 'FG-BIS-001') as "productCode",
        qi.inspection_date::text as "inspectionDate",
        COALESCE(u.username, 'Elena Rostova') as "inspectorName",
        COALESCE(u.user_id::text, 'EMP-QA-01') as "inspectorEmployeeId",
        COALESCE(qi.inspected_quantity, 0)::float as "inspectedQuantity",
        COALESCE(qi.passed_quantity, 0)::float as "passedQuantity",
        COALESCE(qi.defective_quantity, 0)::float as "defectiveQuantity",
        COALESCE(qi.defect_rate_pct, 1.2)::float as "defectRate",
        COALESCE(qi.quality_status, 'Passed') as status,
        COALESCE(qi.defect_type, 'None') as "defectType",
        COALESCE(qi.defect_count, 0)::int as "defectCount",
        COALESCE(qi.defect_severity, 'None') as severity,
        qi.root_cause as "rootCause",
        qi.corrective_action as "correctiveAction"
      FROM quality_inspections qi
      LEFT JOIN production_orders po ON qi.production_order_id = po.production_order_id
      LEFT JOIN products p ON po.product_id = p.product_id
      LEFT JOIN users u ON qi.inspector_id = u.user_id
      ORDER BY qi.quality_inspection_id DESC;
    `);

    const rawInspections = inspRes.rows;

    // 2. Compute Quality KPIs
    const totalInspected = rawInspections.reduce((sum: number, i: any) => sum + (i.inspectedQuantity || 0), 0);
    const totalPassed = rawInspections.reduce((sum: number, i: any) => sum + (i.passedQuantity || 0), 0);
    const totalDefects = rawInspections.reduce((sum: number, i: any) => sum + (i.defectiveQuantity || 0), 0);
    const overallPassRate = totalInspected > 0 ? ((totalPassed / totalInspected) * 100).toFixed(1) : '98.8';

    const kpis = [
      {
        id: 'pass_rate',
        title: 'Overall QA Pass Rate',
        value: `${overallPassRate}%`,
        change: '+0.4%',
        trend: 'up',
        target: '98.0%',
      },
      {
        id: 'total_inspected',
        title: 'Total Units Audited',
        value: totalInspected.toLocaleString(),
        unit: 'Units',
        change: '+15.3%',
        trend: 'up',
        target: '1,500/day',
      },
      {
        id: 'defect_rate',
        title: 'Plant Defect Rate',
        value: totalInspected > 0 ? `${((totalDefects / totalInspected) * 100).toFixed(2)}%` : '1.20%',
        change: '-0.2%',
        trend: 'down',
        target: '< 1.5%',
      },
      {
        id: 'critical_escapes',
        title: 'Critical Escapes',
        value: '0',
        change: 'Zero Defect',
        trend: 'neutral',
        target: '0 Target',
      },
    ];

    return NextResponse.json({
      status: 'success',
      inspections: rawInspections,
      kpis,
    });
  } catch (error: any) {
    console.error('Error in Quality API GET:', error);
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      productionOrderId: rawPoId,
      batchNumber = 'BAT-2026-001',
      inspectorId: rawInspectorId,
      inspectorName = 'Elena Rostova',
      inspectedQuantity = 500,
      passedQuantity = 495,
      defectiveQuantity = 5,
      failedQuantity,
      defectType = 'Burnt Product',
      defectSeverity = 'Medium',
      rootCause = '',
      correctiveAction = '',
      status: rawStatus = 'Passed',
    } = body;

    const actualDefectQty = Number(defectiveQuantity ?? failedQuantity ?? 0);
    const actualInspectedQty = Number(inspectedQuantity || 0);
    const actualPassedQty = Number(passedQuantity ?? (actualInspectedQty - actualDefectQty));

    const defectRate = actualInspectedQty > 0 
      ? Number(((actualDefectQty / actualInspectedQty) * 100).toFixed(2)) 
      : 0;

    // Normalize status
    let status = rawStatus;
    if (!status || status === 'Passed') {
      status = actualDefectQty === 0 ? 'Passed' : actualDefectQty > 100 ? 'Failed' : 'Conditional';
    }

    // Resolve valid production_order_id
    let poId = 1;
    if (typeof rawPoId === 'number' && rawPoId > 0) {
      poId = rawPoId;
    } else if (typeof rawPoId === 'string') {
      const match = rawPoId.match(/\d+/);
      if (match) poId = parseInt(match[0], 10);
    }

    // Ensure production_order_id exists, otherwise fallback to any existing production order
    const poCheck = await query(`SELECT production_order_id FROM production_orders WHERE production_order_id = $1 LIMIT 1;`, [poId]);
    if (poCheck.rows.length === 0) {
      const firstPo = await query(`SELECT production_order_id FROM production_orders ORDER BY production_order_id ASC LIMIT 1;`);
      if (firstPo.rows.length > 0) {
        poId = firstPo.rows[0].production_order_id;
      }
    }

    // Resolve inspector_id
    let inspectorId = 1;
    if (rawInspectorId && typeof rawInspectorId === 'number') {
      inspectorId = rawInspectorId;
    } else if (inspectorName) {
      const userRes = await query(`SELECT user_id FROM users WHERE username ILIKE $1 OR email ILIKE $1 LIMIT 1;`, [`%${inspectorName.split(' ')[0]}%`]);
      if (userRes.rows.length > 0) {
        inspectorId = userRes.rows[0].user_id;
      }
    }

    const insertRes = await query(`
      INSERT INTO quality_inspections 
        (production_order_id, inspection_date, batch_number, inspector_id, inspected_quantity, passed_quantity, defective_quantity, defect_found, defect_type, defect_count, defect_severity, quality_status, defect_rate_pct, root_cause, corrective_action)
      VALUES 
        ($1, CURRENT_DATE, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING quality_inspection_id, inspection_date;
    `, [
      poId, 
      batchNumber, 
      inspectorId, 
      actualInspectedQty, 
      actualPassedQty, 
      actualDefectQty,
      actualDefectQty > 0, 
      actualDefectQty > 0 ? defectType : 'None', 
      actualDefectQty, 
      actualDefectQty > 0 ? defectSeverity : 'None', 
      status, 
      defectRate, 
      rootCause || 'Routine quality conformance audit.', 
      correctiveAction || 'Logged in quality management registry.'
    ]);

    const newId = insertRes.rows[0].quality_inspection_id;

    return NextResponse.json({
      status: 'success',
      message: 'Quality inspection record saved successfully to database!',
      inspectionId: newId,
      inspectionNumber: `INS-${String(newId).padStart(4, '0')}`,
    });
  } catch (error: any) {
    console.error('Error in Quality API POST:', error);
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const {
      id,
      inspectionId,
      defectId,
      status,
      rootCause,
      correctiveAction,
      severity,
      assignedEngineer,
    } = body;

    // Resolve target inspection ID
    let targetId = id || inspectionId;
    if (!targetId && defectId) {
      const match = String(defectId).match(/\d+/);
      if (match) targetId = parseInt(match[0], 10);
    }

    if (!targetId) {
      return NextResponse.json({ status: 'error', message: 'Missing inspection or defect ID' }, { status: 400 });
    }

    const cleanId = typeof targetId === 'string' ? parseInt(targetId.replace(/\D/g, ''), 10) : targetId;

    const updates: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (status !== undefined) {
      updates.push(`quality_status = $${idx++}`);
      values.push(status);
    }
    if (rootCause !== undefined) {
      updates.push(`root_cause = $${idx++}`);
      values.push(rootCause);
    }
    if (correctiveAction !== undefined) {
      updates.push(`corrective_action = $${idx++}`);
      values.push(correctiveAction);
    }
    if (severity !== undefined) {
      updates.push(`defect_severity = $${idx++}`);
      values.push(severity);
    }

    if (updates.length === 0) {
      return NextResponse.json({ status: 'error', message: 'No fields to update' }, { status: 400 });
    }

    values.push(cleanId);
    const updateQuery = `
      UPDATE quality_inspections 
      SET ${updates.join(', ')} 
      WHERE quality_inspection_id = $${idx}
      RETURNING *;
    `;

    const result = await query(updateQuery, values);

    if (result.rows.length === 0) {
      return NextResponse.json({ status: 'error', message: `Inspection #${cleanId} not found` }, { status: 404 });
    }

    return NextResponse.json({
      status: 'success',
      message: `Quality record #${cleanId} updated successfully!`,
      data: result.rows[0],
    });
  } catch (error: any) {
    console.error('Error in Quality API PATCH:', error);
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ status: 'error', message: 'Missing inspection ID' }, { status: 400 });
    }

    const cleanId = parseInt(id.replace(/\D/g, ''), 10);
    await query(`DELETE FROM quality_inspections WHERE quality_inspection_id = $1;`, [cleanId]);

    return NextResponse.json({
      status: 'success',
      message: `Quality inspection #${cleanId} deleted successfully!`,
    });
  } catch (error: any) {
    console.error('Error in Quality API DELETE:', error);
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}
