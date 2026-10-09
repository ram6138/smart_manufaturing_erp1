import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const historyRes = await query(`
      SELECT 
        d.id as decision_id,
        d.scenario_id,
        d.selected_option,
        d.option_title,
        d.manager_name,
        d.manager_notes,
        d.priority_tradeoff,
        d.estimated_delay_hours,
        d.estimated_extra_cost,
        d.estimated_capacity_utilization,
        d.is_approved,
        d.applied_to_erp,
        d.applied_at,
        d.created_at,
        s.scenario_code,
        s.situation_type,
        s.title as scenario_title,
        s.status as scenario_status,
        s.options_data
      FROM simulation_decisions d
      JOIN simulation_scenarios s ON d.scenario_id = s.id
      ORDER BY d.created_at DESC
      LIMIT 50;
    `);

    return NextResponse.json({
      status: 'success',
      data: historyRes.rows
    });
  } catch (error: any) {
    console.error('Error fetching decision history:', error);
    return NextResponse.json(
      { status: 'error', error: error.message || 'Failed to fetch history' },
      { status: 500 }
    );
  }
}
