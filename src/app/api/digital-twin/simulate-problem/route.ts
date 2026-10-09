import { NextRequest, NextResponse } from 'next/server';
import { simulateFactoryProblem } from '@/lib/simulation/factory-problem-simulator';
import { ProblemSimulationRequest } from '@/types/decision-simulation';
import { query } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body: ProblemSimulationRequest = await req.json();

    if (!body.production_order_id) {
      return NextResponse.json(
        { error: 'production_order_id is required' },
        { status: 400 }
      );
    }

    // Run multi-situation factory problem simulation
    const simulationResult = await simulateFactoryProblem(body);

    // Save scenario to simulation_scenarios table for persistent audit
    try {
      const insertScenarioRes = await query(`
        INSERT INTO simulation_scenarios (
          scenario_code,
          situation_type,
          title,
          description,
          affected_entity_type,
          affected_entity_id,
          parameters,
          options_data,
          recommended_option,
          status,
          created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING id;
      `, [
        simulationResult.scenario_code,
        simulationResult.problem_summary.situation_type,
        `Simulation: ${simulationResult.problem_summary.affected_entity}`,
        `Simulated ${body.delay_hours}h disruption on Order #${simulationResult.problem_summary.affected_production_order.production_order_id}`,
        'RAW_MATERIAL',
        body.material_id ? String(body.material_id) : 'RM-3',
        JSON.stringify(body),
        JSON.stringify(simulationResult.options),
        simulationResult.recommended_option,
        'PENDING_DECISION',
        'Production Manager'
      ]);

      if (insertScenarioRes.rows.length > 0) {
        simulationResult.scenario_id = insertScenarioRes.rows[0].id;
      }
    } catch (dbErr) {
      console.warn('Could not persist scenario to database:', dbErr);
    }

    return NextResponse.json({
      status: 'success',
      data: simulationResult
    });
  } catch (error: any) {
    console.error('Simulation error:', error);
    return NextResponse.json(
      {
        status: 'error',
        error: error.message || 'Failed to execute problem simulation'
      },
      { status: 500 }
    );
  }
}
