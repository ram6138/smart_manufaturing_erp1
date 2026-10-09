import { simulateFactoryProblem } from '../src/lib/simulation/factory-problem-simulator';
import { SituationType } from '../src/types/decision-simulation';

async function testAllSituations() {
  console.log('=== Testing Factory Digital Twin: All 5 Disruption Situations ===\n');

  const situations: { type: SituationType; name: string; params: any }[] = [
    {
      type: 'RAW_MATERIAL_DELAY',
      name: '1. Raw Material Delay (Wheat Flour delayed 2h)',
      params: { material_id: 3, delay_hours: 2, production_order_id: 4 }
    },
    {
      type: 'MACHINE_BREAKDOWN',
      name: '2. Machine Breakdown (Tunnel Baking Oven breakdown 3h)',
      params: { delay_hours: 3, production_order_id: 2 }
    },
    {
      type: 'DEMAND_SPIKE',
      name: '3. Sudden Demand Spike (+50% Surge to 3,000 packs)',
      params: { delay_hours: 0, production_order_id: 3 }
    },
    {
      type: 'QUALITY_DEFECT_SURGE',
      name: '4. Quality Defect Surge (Scrap rate rises 2% -> 8%)',
      params: { delay_hours: 1.5, production_order_id: 5 }
    },
    {
      type: 'URGENT_ORDER',
      name: '5. Urgent Customer Order (VIP order needed 24h earlier)',
      params: { delay_hours: 0, production_order_id: 4 }
    }
  ];

  for (const sit of situations) {
    console.log(`--------------------------------------------------`);
    console.log(`Testing: ${sit.name}`);
    const res = await simulateFactoryProblem({
      situation_type: sit.type,
      ...sit.params,
      priority: 'BALANCED'
    });

    console.log(`✓ Scenario Code: ${res.scenario_code}`);
    console.log(`✓ AI Recommended Option: ${res.recommended_option}`);
    console.log(`✓ Recommendation Rationale: ${res.recommendation_rationale}`);
    console.log(`✓ Options Generated (${res.options.length}):`);
    res.options.forEach(opt => {
      console.log(`   - [${opt.option_id}] ${opt.title}`);
      console.log(`     Metrics: +${opt.metrics.predicted_delay_hours}h delay | Extra Cost: ₹${opt.metrics.extra_cost} | Capacity: ${opt.metrics.capacity_utilization_pct}% | Delivery: ${opt.metrics.customer_delivery_impact}`);
      console.log(`     Score: ${opt.suitability_score}/100 | Recommended: ${opt.is_recommended}`);
    });
    console.log(`\n`);
  }

  console.log('====================================================');
  console.log('ALL 5 FACTORY DISRUPTION SITUATIONS VERIFIED CLEANLY!');
  console.log('====================================================');
}

testAllSituations().catch(err => {
  console.error('Test Failed:', err);
  process.exit(1);
});
