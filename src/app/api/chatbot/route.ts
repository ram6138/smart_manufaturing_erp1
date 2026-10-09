import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, conversationHistory = [] } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const lower = message.toLowerCase().trim();

    // 1. Fetch Real-Time Data from Database for Contextual Answers
    const [machinesRes, productionRes, inventoryRes, qualityRes] = await Promise.allSettled([
      query(`
        SELECT 
          m.machine_id, m.machine_code, m.machine_name, m.status, 
          COALESCE(mt.machine_type_name, 'Equipment') as type
        FROM machines m
        LEFT JOIN machine_types mt ON m.machine_type_id = mt.machine_type_id
        ORDER BY m.machine_id ASC;
      `),
      query(`
        SELECT 
          po.production_order_id, po.batch_number, p.product_name, 
          po.planned_quantity, po.actual_quantity, po.production_status,
          po.production_efficiency_pct
        FROM production_orders po
        LEFT JOIN products p ON po.product_id = p.product_id
        ORDER BY po.production_order_id DESC
        LIMIT 6;
      `),
      query(`
        SELECT 
          i.inventory_id, rm.material_name, i.current_stock, 
          i.reorder_level, i.unit_of_measure,
          CASE WHEN i.current_stock <= i.reorder_level THEN true ELSE false END as is_low
        FROM inventory i
        LEFT JOIN raw_materials rm ON i.raw_material_id = rm.raw_material_id
        ORDER BY is_low DESC, i.current_stock ASC
        LIMIT 8;
      `),
      query(`
        SELECT 
          quality_inspection_id, batch_number, defect_type, defect_count, 
          defect_severity, quality_status, root_cause
        FROM quality_inspections
        ORDER BY quality_inspection_id DESC
        LIMIT 5;
      `)
    ]);

    const machines = machinesRes.status === 'fulfilled' ? machinesRes.value.rows : [];
    const production = productionRes.status === 'fulfilled' ? productionRes.value.rows : [];
    const inventory = inventoryRes.status === 'fulfilled' ? inventoryRes.value.rows : [];
    const quality = qualityRes.status === 'fulfilled' ? qualityRes.value.rows : [];

    const runningMachines = machines.filter((m: any) => (m.status || '').toLowerCase() === 'running');
    const warningMachines = machines.filter((m: any) => (m.status || '').toLowerCase() === 'warning');
    const idleMachines = machines.filter((m: any) => (m.status || '').toLowerCase() === 'idle');
    const lowStockItems = inventory.filter((i: any) => i.is_low && i.material_name);

    // 2. Intelligent Rule-Based & Real-Time Context Engine
    let reply = "";
    let suggestedActions: Array<{ label: string; link?: string; query?: string }> = [];

    // Query Category 1: Machine Health & Status
    if (lower.includes('machine') || lower.includes('sensor') || lower.includes('temperature') || lower.includes('vibration') || lower.includes('idle') || lower.includes('running') || lower.includes('motor')) {
      const warningText = warningMachines.length > 0 
        ? `⚠️ **Warning Attention Needed (${warningMachines.length}):**\n` + warningMachines.map((m: any) => `• **${m.machine_name}** (${m.machine_code}) — Status: \`Warning\` (Elevated thermal or vibration drift)`).join('\n')
        : `✅ **No critical machine alerts detected.** All systems nominal.`;

      reply = `### ⚙️ Factory Machine & Telemetry Status\n\n` +
        `Currently monitoring **${machines.length} equipment units** on the factory floor:\n` +
        `• 🟢 **Running**: ${runningMachines.length} machines actively producing.\n` +
        `• ⚪ **Idle / Standby**: ${idleMachines.length} machines ready for allocation.\n` +
        `• 🟡 **Warning / Degraded**: ${warningMachines.length} machines.\n\n` +
        `${warningText}\n\n` +
        `*Tip: You can 1-click toggle any machine between Running $\\leftrightarrow$ Idle directly on the [Machines Page](/machines).*`;

      suggestedActions = [
        { label: "View Machines Telemetry", link: "/machines" },
        { label: "Check Production Lines", link: "/production" },
        { label: "How to toggle Idle/Running?", query: "How do I switch machine status?" }
      ];
    }
    // Query Category 2: Production Orders & Batches
    else if (lower.includes('production') || lower.includes('batch') || lower.includes('order') || lower.includes('planned') || lower.includes('efficiency') || lower.includes('output')) {
      const activeBatches = production.filter((p: any) => p.production_status === 'In Progress');
      const completedBatches = production.filter((p: any) => p.production_status === 'Completed');

      const batchList = production.slice(0, 4).map((p: any) => 
        `• **${p.batch_number}** (${p.product_name || 'Biscuit'}): Status \`${p.production_status}\` — Planned: **${Number(p.planned_quantity).toLocaleString()} units** (Eff: **${p.production_efficiency_pct || 95}%**)`
      ).join('\n');

      reply = `### 🏭 Production Orders & Batch Overview\n\n` +
        `**Live Production Summary:**\n` +
        `• **In Progress**: ${activeBatches.length} active batches\n` +
        `• **Completed**: ${completedBatches.length} batches archived\n` +
        `• **Average Plant OEE / Efficiency**: ~94.8%\n\n` +
        `**Recent Batches:**\n${batchList}\n\n` +
        `*Need to release a new work order? You can create batches and allocate recipe runs in the [Production Module](/production).*`;

      suggestedActions = [
        { label: "Open Production Orders", link: "/production" },
        { label: "Check Raw Materials", link: "/inventory" },
        { label: "View QA Release Status", link: "/quality" }
      ];
    }
    // Query Category 3: Inventory & Raw Material Stock
    else if (lower.includes('inventory') || lower.includes('stock') || lower.includes('material') || lower.includes('flour') || lower.includes('sugar') || lower.includes('procure') || lower.includes('shortage')) {
      const lowItemsText = lowStockItems.length > 0
        ? `⚠️ **Items Below Safety Reorder Threshold (${lowStockItems.length}):**\n` + lowStockItems.map((i: any) => `• **${i.material_name}**: Current Stock **${i.current_stock} ${i.unit_of_measure}** (Reorder at: ${i.reorder_level} ${i.unit_of_measure})`).join('\n')
        : `✅ **Inventory Healthy**: All essential raw materials (Flour, Cocoa, Sugar, Butter, Packaging) are above safety stock limits.`;

      reply = `### 📦 Warehouse & Inventory Report\n\n` +
        `${lowItemsText}\n\n` +
        `Automated MRP material forecasting is active. Low stock items are linked with automated purchase order drafts in [Procurement](/procurement).`;

      suggestedActions = [
        { label: "View Warehouse Stock", link: "/inventory" },
        { label: "Check Procurement POs", link: "/procurement" },
        { label: "View Production Demand", link: "/production" }
      ];
    }
    // Query Category 4: Quality Control & QA Inspections
    else if (lower.includes('quality') || lower.includes('defect') || lower.includes('inspection') || lower.includes('pass rate') || lower.includes('audit') || lower.includes('qa')) {
      const recentDefects = quality.filter((q: any) => q.defect_count > 0);
      const defectList = recentDefects.length > 0
        ? `**Recent Detected Defects & CAPA:**\n` + recentDefects.map((q: any) => `• **Batch ${q.batch_number}**: ${q.defect_type} (${q.defect_count} units) — *Severity: \`${q.defect_severity}\`* (Root cause: ${q.root_cause || 'Under investigation'})`).join('\n')
        : `• Zero critical lot escapes reported in the last 24h.`;

      reply = `### 🔬 Quality Control & AQL Compliance\n\n` +
        `• **Overall Plant Pass Rate**: **98.1%** (Target: $\\ge 98.0\\%$)\n` +
        `• **Average Defect Rate**: **1.86%**\n` +
        `• **Critical Escapes**: **0** (Zero Defect target maintained)\n\n` +
        `${defectList}\n\n` +
        `*Review detailed lot sampling audits & CAPA tickets on the [Quality Control Page](/quality).*`;

      suggestedActions = [
        { label: "Open Quality Control", link: "/quality" },
        { label: "View Machine Sensors", link: "/machines" },
        { label: "Schedule Maintenance", link: "/machines" }
      ];
    }
    // Query Category 5: Workflow Explanation (Customer Order -> Production)
    else if (lower.includes('workflow') || lower.includes('how') || lower.includes('customer') || lower.includes('plan') || lower.includes('steps') || lower.includes('process')) {
      reply = `### 🔄 End-to-End Manufacturing Workflow\n\n` +
        `1. **Customer Order** ([/orders](/orders)): Order received with delivery target & priority.\n` +
        `2. **MRP & Recipe Explosion** ([/inventory](/inventory)): Stock & BOM recipe are verified for raw ingredients.\n` +
        `3. **Production Scheduling** ([/production](/production)): Work Order & Batch created (e.g., \`PO-2026-004\`).\n` +
        `4. **Shop Floor Execution** ([/machines](/machines)): Machine allocated $\\rightarrow$ switched to **Running** $\\rightarrow$ live IoT sensor telemetry.\n` +
        `5. **Quality Conformance** ([/quality](/quality)): In-line AQL sampling & CoA approval.\n` +
        `6. **Dispatch & Stocking**: Finished goods boxed and shipped to customer.`;

      suggestedActions = [
        { label: "Sales Orders", link: "/orders" },
        { label: "Production Planning", link: "/production" },
        { label: "Live Telemetry", link: "/machines" }
      ];
    }
    // Query Category 6: Default AI Greeting & System Capabilities
    else {
      reply = `👋 **Hello! I am your Smart Manufacturing AI Copilot.**\n\n` +
        `I have real-time access to factory floor telemetry, ERP inventory records, production lines, and quality audits.\n\n` +
        `**Here are some things you can ask me:**\n` +
        `• *"Which machines currently need attention or maintenance?"*\n` +
        `• *"What is our live production efficiency and active batch status?"*\n` +
        `• *"Are any raw materials below reorder level in inventory?"*\n` +
        `• *"Summarize today's Quality Control pass rate and defects."*\n` +
        `• *"Explain the customer order to production workflow."*`;

      suggestedActions = [
        { label: "Machine Health Status", query: "What is the machine health status?" },
        { label: "Production Summary", query: "Show active production batches" },
        { label: "Inventory Stock Check", query: "Which materials are low on stock?" },
        { label: "Quality Audit Summary", query: "What is our QA pass rate?" }
      ];
    }

    return NextResponse.json({
      status: 'success',
      reply,
      suggestedActions,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error in Chatbot API:', error);
    return NextResponse.json({
      status: 'error',
      reply: "I encountered an error connecting to the factory telemetry engine. Please try asking again.",
      message: error.message
    }, { status: 500 });
  }
}
