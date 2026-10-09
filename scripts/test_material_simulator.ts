import { simulateMaterialDelay } from '../src/lib/simulation/material-delay-simulator';

async function testSimulator() {
  console.log('--- Testing Raw Material Delay Simulator ---');
  
  // Test 1: Standard 2h delay on order #4
  const res1 = await simulateMaterialDelay({
    situation_type: 'RAW_MATERIAL_DELAY',
    material_id: 3, // Wheat Flour
    delay_hours: 2,
    production_order_id: 4,
    priority: 'BALANCED'
  });

  console.log('Scenario Code:', res1.scenario_code);
  console.log('Problem Summary:', res1.problem_summary);
  console.log('Recommended Option:', res1.recommended_option);
  console.log('Rationale:', res1.recommendation_rationale);
  console.log('Options Count:', res1.options.length);

  for (const opt of res1.options) {
    console.log(`\n[${opt.option_id}] ${opt.title} (Score: ${opt.suitability_score})`);
    console.log(`  Delay: ${opt.metrics.predicted_delay_hours} hrs | Extra Cost: ₹${opt.metrics.extra_cost} | Utilization: ${opt.metrics.capacity_utilization_pct}%`);
    console.log(`  Delivery: ${opt.metrics.customer_delivery_impact}`);
    console.log(`  Pros: ${opt.trade_offs.pros.join('; ')}`);
  }

  // Test 2: Priority 'DELIVERY_FIRST'
  const res2 = await simulateMaterialDelay({
    situation_type: 'RAW_MATERIAL_DELAY',
    material_id: 3,
    delay_hours: 4,
    production_order_id: 2,
    priority: 'DELIVERY_FIRST'
  });
  console.log('\n--- Priority DELIVERY_FIRST Winner:', res2.recommended_option, '(Score:', res2.options.find(o => o.option_id === res2.recommended_option)?.suitability_score, ')');

  // Test 3: Priority 'COST_MINIMIZE'
  const res3 = await simulateMaterialDelay({
    situation_type: 'RAW_MATERIAL_DELAY',
    material_id: 3,
    delay_hours: 1.5,
    production_order_id: 2,
    priority: 'COST_MINIMIZE'
  });
  console.log('--- Priority COST_MINIMIZE Winner:', res3.recommended_option, '(Score:', res3.options.find(o => o.option_id === res3.recommended_option)?.suitability_score, ')');

  console.log('\nAll simulation unit tests completed successfully.');
}

testSimulator().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
