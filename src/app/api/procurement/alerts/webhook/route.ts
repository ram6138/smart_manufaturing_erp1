import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const DEFAULT_PROCUREMENT_MANAGER_EMAIL = 'srirambehera035@gmail.com';

export async function GET(req: NextRequest) {
  try {
    // 1. Fetch live critical & low stock materials from DB
    const matRes = await query(`
      SELECT 
        p.product_id::text as id,
        p.product_code as "materialCode",
        p.product_name as "materialName",
        COALESCE(c.category_name, 'Raw Materials') as category,
        COALESCE(s.current_quantity, 0)::float as "currentStock",
        COALESCE(s.reorder_level, 500)::float as "minStock",
        p.unit,
        CASE 
          WHEN COALESCE(s.current_quantity, 0) = 0 THEN 'Critical'
          WHEN COALESCE(s.current_quantity, 0) <= COALESCE(s.reorder_level, 500) THEN 'Medium'
          ELSE 'Low'
        END as severity
      FROM products p
      LEFT JOIN inventory_stock s ON p.product_id = s.product_id
      LEFT JOIN product_categories c ON p.category_id = c.category_id
      WHERE COALESCE(s.current_quantity, 0) <= COALESCE(s.reorder_level, 500)
      ORDER BY s.current_quantity ASC;
    `);

    // 2. Fetch pending purchase requests
    const prRes = await query(`
      SELECT 
        pr.purchase_request_id::text as id,
        pr.request_number as "requestId",
        COALESCE(d.department_name, 'Production') as department,
        COALESCE(e.employee_name, 'Shopfloor Supervisor') as "requestedBy",
        COALESCE(p.product_name, 'Raw Material') as material,
        COALESCE(pri.requested_quantity, 0)::float as quantity,
        COALESCE(p.unit, 'units') as unit,
        COALESCE(pr.request_status, 'Pending') as status,
        COALESCE(pr.created_at, CURRENT_TIMESTAMP)::text as "createdAt"
      FROM purchase_requests pr
      LEFT JOIN purchase_request_items pri ON pr.purchase_request_id = pri.purchase_request_id
      LEFT JOIN products p ON pri.product_id = p.product_id
      LEFT JOIN departments d ON pr.requesting_department_id = d.department_id
      LEFT JOIN employees e ON pr.requester_id = e.employee_id
      WHERE pr.request_status = 'Pending'
      ORDER BY pr.purchase_request_id DESC;
    `);

    const alerts = [
      ...matRes.rows.map((m: any) => ({
        id: `alert-mat-${m.id}-${m.materialCode}`,
        severity: m.severity,
        entityType: 'Material',
        relatedEntity: m.materialCode,
        materialName: m.materialName,
        currentStock: m.currentStock,
        minStock: m.minStock,
        unit: m.unit,
        reason: `Current inventory (${m.currentStock} ${m.unit}) is below reorder threshold (${m.minStock} ${m.unit}).`,
        recommendedAction: 'Generate Purchase Requisition',
        timestamp: new Date().toISOString(),
      })),
      ...prRes.rows.map((pr: any) => ({
        id: `alert-pr-${pr.id}-${pr.requestId}`,
        severity: 'Low',
        entityType: 'PR',
        relatedEntity: pr.requestId,
        materialName: pr.material,
        requestedBy: pr.requestedBy,
        department: pr.department,
        quantity: pr.quantity,
        unit: pr.unit,
        reason: `${pr.material} (${pr.quantity} ${pr.unit}) requested by ${pr.requestedBy} awaits approval.`,
        recommendedAction: 'Review & Convert to Purchase Order',
        timestamp: pr.createdAt || new Date().toISOString(),
      })),
    ];

    return NextResponse.json({
      status: 'success',
      managerEmail: DEFAULT_PROCUREMENT_MANAGER_EMAIL,
      totalAlerts: alerts.length,
      criticalCount: alerts.filter(a => a.severity === 'Critical').length,
      warningCount: alerts.filter(a => a.severity === 'Medium').length,
      alerts,
      timestamp: new Date().toISOString(),
      n8nWorkflowPayload: {
        to: DEFAULT_PROCUREMENT_MANAGER_EMAIL,
        subject: `[Procurement Alert] ${alerts.length} Active Alerts Detected in Smart ERP`,
        system: 'Smart Manufacturing ERP',
        generatedAt: new Date().toISOString(),
        alertsSummary: alerts.map(a => `[${a.severity}] ${a.relatedEntity}: ${a.reason} -> Action: ${a.recommendedAction}`).join('\n'),
      }
    });
  } catch (error: any) {
    console.error('Failed to fetch procurement alerts for n8n:', error);
    return NextResponse.json(
      { status: 'error', message: error.message || 'Failed to retrieve alerts' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const targetEmail = body.recipientEmail || DEFAULT_PROCUREMENT_MANAGER_EMAIL;
    const webhookUrl = body.webhookUrl || process.env.N8N_PROCUREMENT_WEBHOOK_URL;
    const alertsToDispatch = body.alerts || [];

    // Construct enriched payload for n8n automation
    const payload = {
      event: 'procurement.alert.triggered',
      recipientEmail: targetEmail,
      recipientName: 'Sriram Behera (Procurement Manager)',
      dispatchedAt: new Date().toISOString(),
      alertCount: alertsToDispatch.length,
      criticalCount: alertsToDispatch.filter((a: any) => a.severity === 'Critical').length,
      alerts: alertsToDispatch,
      emailTemplate: {
        to: targetEmail,
        subject: `⚠️ Urgent Procurement Alert: ${alertsToDispatch.length} Issue(s) Requiring Attention`,
        summaryText: `Dear Procurement Team,\n\nThe Smart Manufacturing ERP SLA system has detected ${alertsToDispatch.length} inventory / requisition triggers. Please review the attached items immediately.`,
      },
    };

    let n8nResponse = null;
    let dispatchedToExternalWebhook = false;

    if (webhookUrl && webhookUrl.startsWith('http')) {
      try {
        const extRes = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        dispatchedToExternalWebhook = extRes.ok;
        n8nResponse = {
          status: extRes.status,
          statusText: extRes.statusText,
        };
      } catch (err: any) {
        console.warn('Could not forward to external n8n webhook URL:', err.message);
        n8nResponse = { error: err.message };
      }
    }

    return NextResponse.json({
      status: 'success',
      message: `Alert workflow successfully triggered for ${targetEmail}`,
      recipient: targetEmail,
      alertsDispatched: alertsToDispatch.length,
      externalWebhookCalled: dispatchedToExternalWebhook,
      webhookUrl: webhookUrl || 'Internal n8n automation pipeline',
      n8nResponse,
      timestamp: new Date().toISOString(),
      payload,
    });
  } catch (error: any) {
    console.error('Failed to trigger n8n alert workflow:', error);
    return NextResponse.json(
      { status: 'error', message: error.message || 'Webhook trigger failed' },
      { status: 500 }
    );
  }
}
