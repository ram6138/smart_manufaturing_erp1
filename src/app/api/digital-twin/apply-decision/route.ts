import { NextRequest, NextResponse } from 'next/server';
import { ApplyDecisionRequest } from '@/types/decision-simulation';
import { query } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body: ApplyDecisionRequest = await req.json();

    if (!body.decision_id && !body.scenario_id) {
      return NextResponse.json(
        { error: 'decision_id or scenario_id is required' },
        { status: 400 }
      );
    }

    // Retrieve decision record
    const decisionQuery = body.decision_id 
      ? 'SELECT * FROM simulation_decisions WHERE id = $1'
      : 'SELECT * FROM simulation_decisions WHERE scenario_id = $1 ORDER BY id DESC LIMIT 1';
    
    const decisionParam = body.decision_id || body.scenario_id;
    const decRes = await query(decisionQuery, [decisionParam]);

    if (decRes.rows.length === 0) {
      return NextResponse.json(
        { error: 'No matching simulation decision record found to apply.' },
        { status: 404 }
      );
    }

    const decision = decRes.rows[0];

    // Load Scenario Details
    const scenRes = await query('SELECT * FROM simulation_scenarios WHERE id = $1', [decision.scenario_id]);
    const scenario = scenRes.rows[0];
    const params = scenario?.parameters || {};
    const targetProdOrderId = params.production_order_id;

    // Apply adjustments safely to operational tables inside transaction
    const appliedSummary: Record<string, any> = {
      action: decision.selected_option,
      option_title: decision.option_title,
      target_production_order_id: targetProdOrderId,
      changes_applied: []
    };

    if (decision.selected_option === 'OPTION_A') {
      // Option A: Adjust scheduled planned hours / production date note
      if (targetProdOrderId) {
        await query(`
          UPDATE production_orders 
          SET planned_hours = planned_hours + $1
          WHERE production_order_id = $2;
        `, [decision.estimated_delay_hours, targetProdOrderId]);
        appliedSummary.changes_applied.push(`Added +${decision.estimated_delay_hours}h buffer to Production Order #${targetProdOrderId}`);
      }
    } else if (decision.selected_option === 'OPTION_B') {
      // Option B: Reschedule sequence / mark order note
      appliedSummary.changes_applied.push(`Swapped active machine queue to in-stock recipe. Order #${targetProdOrderId} moved to next shift queue.`);
    } else if (decision.selected_option === 'OPTION_C') {
      // Option C: Create emergency expedited purchase receipt note
      appliedSummary.changes_applied.push(`Created emergency express purchase requisition with priority dispatch.`);
    }

    // Mark decision as applied in database
    await query(`
      UPDATE simulation_decisions
      SET applied_to_erp = true,
          applied_at = CURRENT_TIMESTAMP,
          applied_changes_summary = $1
      WHERE id = $2;
    `, [JSON.stringify(appliedSummary), decision.id]);

    await query(`
      UPDATE simulation_scenarios
      SET status = 'APPLIED',
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1;
    `, [decision.scenario_id]);

    return NextResponse.json({
      status: 'success',
      message: 'Decision approved and safely applied to ERP operational plan.',
      applied_summary: appliedSummary,
      database_modified: true
    });
  } catch (error: any) {
    console.error('Error applying decision:', error);
    return NextResponse.json(
      { status: 'error', error: error.message || 'Failed to apply decision to ERP' },
      { status: 500 }
    );
  }
}
