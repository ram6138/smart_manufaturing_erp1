import { NextRequest, NextResponse } from 'next/server';
import { RecordDecisionRequest } from '@/types/decision-simulation';
import { query } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body: RecordDecisionRequest = await req.json();

    if (!body.selected_option) {
      return NextResponse.json(
        { error: 'selected_option is required (OPTION_A, OPTION_B, or OPTION_C)' },
        { status: 400 }
      );
    }

    let scenarioId = body.scenario_id;

    // If scenario_id was not provided, create a scenario first
    if (!scenarioId) {
      const createScen = await query(`
        INSERT INTO simulation_scenarios (
          scenario_code,
          situation_type,
          title,
          description,
          parameters,
          options_data,
          status,
          created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id;
      `, [
        body.scenario_code || `SCN-${Date.now().toString().slice(-6)}`,
        body.situation_type || 'RAW_MATERIAL_DELAY',
        `Scenario: ${body.option_title}`,
        body.manager_notes || 'Scenario simulated and recorded by manager',
        JSON.stringify(body.problem_summary || {}),
        JSON.stringify(body.options_data || []),
        'DECISION_RECORDED',
        body.manager_name || 'Production Manager'
      ]);
      scenarioId = createScen.rows[0]?.id;
    }

    // Insert into simulation_decisions
    const decisionRes = await query(`
      INSERT INTO simulation_decisions (
        scenario_id,
        selected_option,
        option_title,
        manager_id,
        manager_name,
        manager_notes,
        priority_tradeoff,
        estimated_delay_hours,
        estimated_extra_cost,
        estimated_capacity_utilization,
        is_approved,
        applied_to_erp
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *;
    `, [
      scenarioId,
      body.selected_option,
      body.option_title,
      body.manager_id || 'MGR-001',
      body.manager_name || 'Production Manager',
      body.manager_notes || 'Approved based on AI trade-off evaluation',
      body.priority_tradeoff || 'BALANCED',
      body.estimated_delay_hours || 0,
      body.estimated_extra_cost || 0,
      body.estimated_capacity_utilization || 0,
      true,
      false
    ]);

    // Update scenario status
    await query(`
      UPDATE simulation_scenarios 
      SET status = 'DECISION_RECORDED', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1;
    `, [scenarioId]);

    return NextResponse.json({
      status: 'success',
      message: 'Decision recorded successfully in PostgreSQL audit storage.',
      data: decisionRes.rows[0]
    });
  } catch (error: any) {
    console.error('Error recording decision:', error);
    return NextResponse.json(
      { status: 'error', error: error.message || 'Failed to record decision' },
      { status: 500 }
    );
  }
}
