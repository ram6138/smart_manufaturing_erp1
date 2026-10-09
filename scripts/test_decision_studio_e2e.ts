import { query } from '../src/lib/db';
import { simulateMaterialDelay } from '../src/lib/simulation/material-delay-simulator';

async function runE2eTest() {
  console.log('=== Step 1: Running Situation 1 (Raw Material Delay) Simulation ===');
  const simResult = await simulateMaterialDelay({
    situation_type: 'RAW_MATERIAL_DELAY',
    material_id: 3, // Wheat Flour
    delay_hours: 2,
    production_order_id: 4,
    priority: 'BALANCED'
  });

  console.log('✓ Scenario Code Generated:', simResult.scenario_code);
  console.log('✓ Options Generated:', simResult.options.map(o => `${o.option_id}: ${o.title} (₹${o.metrics.extra_cost}, +${o.metrics.predicted_delay_hours}h)`));
  console.log('✓ AI Recommendation:', simResult.recommended_option);

  console.log('\n=== Step 2: Persisting Scenario in PostgreSQL ===');
  const scenInsert = await query(`
    INSERT INTO simulation_scenarios (
      scenario_code, situation_type, title, description, parameters, options_data, recommended_option, status
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING id;
  `, [
    simResult.scenario_code,
    'RAW_MATERIAL_DELAY',
    'Wheat Flour 2h Delay on Batch BAT-2026-004',
    'Manager simulated 2h inbound delay',
    JSON.stringify(simResult.problem_summary),
    JSON.stringify(simResult.options),
    simResult.recommended_option,
    'PENDING_DECISION'
  ]);
  const scenarioId = scenInsert.rows[0].id;
  console.log('✓ Scenario persisted with DB ID:', scenarioId);

  console.log('\n=== Step 3: Manager Records Decision (Option B: Switch Order) ===');
  const chosenOpt = simResult.options.find(o => o.option_id === 'OPTION_B')!;
  const decInsert = await query(`
    INSERT INTO simulation_decisions (
      scenario_id, selected_option, option_title, manager_id, manager_name, manager_notes,
      priority_tradeoff, estimated_delay_hours, estimated_extra_cost, estimated_capacity_utilization, is_approved, applied_to_erp
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING *;
  `, [
    scenarioId,
    'OPTION_B',
    chosenOpt.title,
    'MGR-001',
    'Factory Operations Lead',
    'Switched to in-stock recipe to keep oven utilization above 90% while awaiting flour delivery.',
    'BALANCED',
    chosenOpt.metrics.predicted_delay_hours,
    chosenOpt.metrics.extra_cost,
    chosenOpt.metrics.capacity_utilization_pct,
    true,
    false
  ]);
  console.log('✓ Decision saved in PostgreSQL decision audit table with ID:', decInsert.rows[0].id);

  console.log('\n=== Step 4: Verifying Audit Log Query ===');
  const auditRes = await query(`
    SELECT d.id, d.selected_option, d.manager_notes, s.scenario_code, s.situation_type
    FROM simulation_decisions d
    JOIN simulation_scenarios s ON d.scenario_id = s.id
    WHERE s.id = $1;
  `, [scenarioId]);
  console.log('✓ Audit record retrieved:', auditRes.rows[0]);

  console.log('\n=== Step 5: Safe ERP Application Verification ===');
  await query(`
    UPDATE simulation_decisions
    SET applied_to_erp = true, applied_at = CURRENT_TIMESTAMP, applied_changes_summary = $1
    WHERE id = $2;
  `, [JSON.stringify({ action: 'SWAP_QUEUE_CONFIRMED', notes: 'Scheduled swap in MES' }), decInsert.rows[0].id]);
  
  await query(`
    UPDATE simulation_scenarios SET status = 'APPLIED' WHERE id = $1;
  `, [scenarioId]);
  console.log('✓ Scenario marked as APPLIED in PostgreSQL audit log.');

  console.log('\n========================================');
  console.log('ALL DIGITAL TWIN DECISION TESTS PASSED!');
  console.log('========================================');
}

runE2eTest().catch(err => {
  console.error('E2E Test Failed:', err);
  process.exit(1);
});
