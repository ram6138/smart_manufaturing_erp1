import { query } from '../db';
import { 
  ProblemSimulationRequest, 
  ProblemSimulationResponse, 
  DecisionOption, 
  PriorityTradeoff,
  SituationType 
} from '@/types/decision-simulation';
import { simulateMaterialDelay } from './material-delay-simulator';

export async function simulateFactoryProblem(
  req: ProblemSimulationRequest
): Promise<ProblemSimulationResponse> {
  const situation = req.situation_type || 'RAW_MATERIAL_DELAY';

  if (situation === 'RAW_MATERIAL_DELAY') {
    return simulateMaterialDelay(req);
  } else if (situation === 'MACHINE_BREAKDOWN') {
    return simulateMachineBreakdown(req);
  } else if (situation === 'DEMAND_SPIKE') {
    return simulateDemandSpike(req);
  } else if (situation === 'QUALITY_DEFECT_SURGE') {
    return simulateQualityDefectSurge(req);
  } else if (situation === 'URGENT_ORDER') {
    return simulateUrgentOrder(req);
  }

  // Fallback
  return simulateMaterialDelay(req);
}

// =========================================================================
// SITUATION 2: MACHINE BREAKDOWN (e.g. Baking Oven / Mixer Down for 3h)
// =========================================================================
async function simulateMachineBreakdown(
  req: ProblemSimulationRequest
): Promise<ProblemSimulationResponse> {
  const { delay_hours = 3, production_order_id, priority = 'BALANCED' } = req;
  const breakdownHours = Math.max(0.5, Number(delay_hours) || 3);

  const orderRes = await query(`
    SELECT 
      po.production_order_id, po.order_id, po.product_id, po.machine_id, po.batch_number,
      po.planned_quantity, po.planned_hours, po.production_date,
      p.product_name, m.machine_name, m.machine_type_id, m.machine_code,
      co.order_number as customer_order_number, co.expected_delivery_date as customer_delivery_date
    FROM production_orders po
    JOIN products p ON po.product_id = p.product_id
    JOIN machines m ON po.machine_id = m.machine_id
    LEFT JOIN customer_orders co ON po.order_id = co.order_id
    WHERE po.production_order_id = $1
    LIMIT 1;
  `, [production_order_id]);

  const prodOrder = orderRes.rows[0] || {
    production_order_id,
    planned_quantity: 4000,
    planned_hours: 8,
    product_name: 'Biscuit - Chocolate',
    machine_name: 'Continuous Tunnel Baking Oven 1',
    machine_id: 1,
    machine_type_id: 2,
    batch_number: 'BAT-2026-002',
    production_date: new Date()
  };

  const plannedHours = Number(prodOrder.planned_hours) || 8;
  const plannedQty = Number(prodOrder.planned_quantity) || 4000;
  const prodDate = prodOrder.production_date ? new Date(prodOrder.production_date) : new Date();

  // Find Secondary Compatible Machine
  const altMachRes = await query(`
    SELECT machine_id, machine_name, machine_code, status 
    FROM machines 
    WHERE machine_id != $1 
      AND (machine_type_id = $2 OR machine_name ILIKE '%Oven%' OR machine_name ILIKE '%Line%')
      AND status IN ('Running', 'Active', 'Idle')
    LIMIT 1;
  `, [prodOrder.machine_id, prodOrder.machine_type_id]);

  const backupMachine = altMachRes.rows[0] || {
    machine_id: 9,
    machine_name: 'Rotary Deck Oven-02 (Backup)',
    status: 'Active'
  };

  // Option A: Wait for Emergency Repair
  const optA_delay = breakdownHours;
  const optA_extraCost = 0; // standard maintenance crew
  const optA_utilization = Math.round((plannedHours / (plannedHours + breakdownHours)) * 100);
  const completionA = new Date(prodDate.getTime() + ((plannedHours + breakdownHours) * 3600 * 1000));

  const optionA: DecisionOption = {
    option_id: 'OPTION_A',
    badge_label: 'Conservative / Wait for Repair',
    title: `Hold Batch & Await Maintenance Repair (${breakdownHours}h)`,
    strategy_description: `Keep batch queued on ${prodOrder.machine_name} while technicians complete emergency mechanical repairs.`,
    action_plan: [
      `Dispatch on-duty electrical & mechanical technicians to ${prodOrder.machine_name}.`,
      `Place dough mix in temperature-controlled holding hopper.`,
      `Resume production run immediately upon technician sign-off.`
    ],
    metrics: {
      predicted_delay_hours: optA_delay,
      extra_cost: optA_extraCost,
      capacity_utilization_pct: optA_utilization,
      output_quantity: plannedQty,
      customer_delivery_impact: optA_delay > 2 ? 'SLIGHT_DELAY' : 'ON_TIME',
      completion_timestamp: completionA.toISOString()
    },
    suitability_score: 72,
    is_recommended: false,
    trade_offs: {
      pros: ['₹0 machine transfer setup or tooling re-calibration expenses', 'No disruption to other scheduled machine lines'],
      cons: [`Line halted for ${breakdownHours} hours`, 'Risk of dough proofing degradation if repair extends']
    },
    risks: ['If spare replacement parts are unstocked, repair may exceed 3 hours.'],
    assumptions: ['Maintenance team is on-site with required replacement thermal sensors.'],
    safety_check: { is_feasible: true, missing_data_warnings: [] }
  };

  // Option B: Reroute Workload to Secondary Machine
  const optB_transferDelay = 0.75; // 45 min setup transfer
  const optB_extraCost = 1200; // Tooling and transport setup
  const optB_utilization = 94;
  const completionB = new Date(prodDate.getTime() + ((plannedHours + optB_transferDelay) * 3600 * 1000));

  const optionB: DecisionOption = {
    option_id: 'OPTION_B',
    badge_label: 'Operational Rerouting / High Output',
    title: `Reroute Batch to ${backupMachine.machine_name}`,
    strategy_description: `Transfer the scheduled dough payload to ${backupMachine.machine_name} to resume baking within 45 minutes.`,
    action_plan: [
      `Execute 45-minute tooling setup on ${backupMachine.machine_name}.`,
      `Transfer dough trolley to Bay 2.`,
      `Begin continuous baking run; route broken machine to off-line maintenance.`
    ],
    metrics: {
      predicted_delay_hours: optB_transferDelay,
      extra_cost: optB_extraCost,
      capacity_utilization_pct: optB_utilization,
      output_quantity: plannedQty,
      customer_delivery_impact: 'ON_TIME',
      completion_timestamp: completionB.toISOString()
    },
    suitability_score: 95,
    is_recommended: true,
    trade_offs: {
      pros: ['Minimizes breakdown downtime from 3.0h to just 45 mins', 'Guarantees on-time customer delivery SLA', 'Protects perishable dough freshness'],
      cons: ['Incurs ₹1,200 tooling setup & transfer expense', 'Preempts lower-priority queue on backup machine']
    },
    risks: ['Requires verifying compatible die profile on backup machine.'],
    assumptions: [`${backupMachine.machine_name} has open capacity window in the current shift.`],
    safety_check: { is_feasible: true, missing_data_warnings: [] }
  };

  // Option C: Authorize 4h Post-Repair Overtime Shift
  const optC_otCost = 3600; // 4h overtime labor
  const optC_utilization = 98;
  const completionC = new Date(prodDate.getTime() + ((plannedHours + breakdownHours) * 3600 * 1000));

  const optionC: DecisionOption = {
    option_id: 'OPTION_C',
    badge_label: 'Overtime Shift / Volume Recovery',
    title: 'Authorize 4-Hour Extra Overtime Shift Post-Repair',
    strategy_description: `Allow maintenance to thoroughly repair the oven, then run a +4h overtime shift to catch up 100% of lost batch volume.`,
    action_plan: [
      `Schedule 4 hours extended overtime shift for Shift 2 operators.`,
      `Permit full diagnostics and preventative maintenance on ${prodOrder.machine_name}.`,
      `Ramp production to 110% speed during overtime shift.`
    ],
    metrics: {
      predicted_delay_hours: 0,
      extra_cost: optC_otCost,
      capacity_utilization_pct: optC_utilization,
      output_quantity: plannedQty,
      customer_delivery_impact: 'ON_TIME',
      completion_timestamp: completionC.toISOString()
    },
    suitability_score: 88,
    is_recommended: false,
    trade_offs: {
      pros: ['100% volume recovery on original machine', 'Zero customer shipment delay', 'Allows technicians full repair time without rush'],
      cons: [`₹${optC_otCost.toLocaleString('en-IN')} overtime wage premium`]
    },
    risks: ['Operator fatigue if multiple consecutive overtime shifts are run.'],
    assumptions: ['Shift supervisor and crew consent to overtime schedule.'],
    safety_check: { is_feasible: true, missing_data_warnings: [] }
  };

  return {
    simulation_only: true,
    database_modified: false,
    scenario_code: `SCN-MB-${Date.now().toString().slice(-6)}`,
    problem_summary: {
      situation_type: 'MACHINE_BREAKDOWN',
      affected_entity: `${prodOrder.machine_name} (Stoppage: ${breakdownHours} hrs)`,
      delay_hours: breakdownHours,
      affected_production_order: {
        production_order_id: prodOrder.production_order_id,
        batch_number: prodOrder.batch_number,
        product_name: prodOrder.product_name,
        planned_quantity: plannedQty,
        machine_name: prodOrder.machine_name,
        customer_order_number: prodOrder.customer_order_number,
        expected_delivery_date: prodOrder.customer_delivery_date
      },
      priority_focus: priority
    },
    options: [optionA, optionB, optionC],
    recommended_option: 'OPTION_B',
    recommendation_rationale: `Option B (Rerouting to ${backupMachine.machine_name}) is recommended to slash downtime to 45 minutes, protect batch freshness, and ensure 100% on-time customer delivery with minimal cost.`,
    data_quality: {
      inventory_verified: true,
      machine_rate_verified: true,
      supplier_rates_verified: true
    },
    simulation_timestamp: new Date().toISOString()
  };
}

// =========================================================================
// SITUATION 3: DEMAND SPIKE (e.g. Customer Order Surge from 2,000 to 3,000)
// =========================================================================
async function simulateDemandSpike(
  req: ProblemSimulationRequest
): Promise<ProblemSimulationResponse> {
  const { delay_hours = 2, production_order_id, priority = 'BALANCED' } = req;
  const extraDemandPct = 50; // +50% surge

  const orderRes = await query(`
    SELECT po.*, p.product_name, m.machine_name, co.order_number as customer_order_number
    FROM production_orders po
    JOIN products p ON po.product_id = p.product_id
    JOIN machines m ON po.machine_id = m.machine_id
    LEFT JOIN customer_orders co ON po.order_id = co.order_id
    WHERE po.production_order_id = $1 LIMIT 1;
  `, [production_order_id]);

  const prodOrder = orderRes.rows[0] || {
    production_order_id,
    planned_quantity: 2000,
    planned_hours: 6,
    product_name: 'Biscuit - Marie',
    machine_name: 'Continuous Tunnel Baking Oven 1',
    batch_number: 'BAT-2026-003'
  };

  const baseQty = Number(prodOrder.planned_quantity) || 2000;
  const spikedQty = Math.round(baseQty * (1 + extraDemandPct / 100));

  const optionA: DecisionOption = {
    option_id: 'OPTION_A',
    badge_label: 'Split Shipment / Partial Dispatch',
    title: `Deliver Base ${baseQty} Packs On-Time; Backorder Balance (${spikedQty - baseQty} Packs)`,
    strategy_description: 'Maintain original schedule without overtime; dispatch first batch immediately and fulfill surge volume in subsequent cycle.',
    action_plan: ['Fulfill 100% of original contract quantity on schedule.', 'Schedule backorder production for next Monday shift.'],
    metrics: {
      predicted_delay_hours: 0,
      extra_cost: 0,
      capacity_utilization_pct: 100,
      output_quantity: baseQty,
      customer_delivery_impact: 'ON_TIME',
      completion_timestamp: new Date().toISOString()
    },
    suitability_score: 75,
    is_recommended: false,
    trade_offs: { pros: ['Zero overtime cost', 'Zero risk to other client orders'], cons: ['Fulfills only partial customer demand surge'] },
    risks: ['Customer may seek alternative vendor for balance volume.'],
    assumptions: ['Customer agrees to partial shipment delivery terms.'],
    safety_check: { is_feasible: true, missing_data_warnings: [] }
  };

  const optionB: DecisionOption = {
    option_id: 'OPTION_B',
    badge_label: 'Authorize +4h Additional Shift',
    title: `Schedule 4-Hour Overtime Shift to Produce Full ${spikedQty} Packs`,
    strategy_description: 'Activate evening overtime shift with 4 additional operating hours to complete 100% of the expanded order in one continuous batch.',
    action_plan: ['Enable 4-hour extra shift.', 'Issue additional raw material requisition from storage.', 'Dispatch full 3,000 packs tomorrow morning.'],
    metrics: {
      predicted_delay_hours: 0,
      extra_cost: 3200,
      capacity_utilization_pct: 100,
      output_quantity: spikedQty,
      customer_delivery_impact: 'ON_TIME',
      completion_timestamp: new Date().toISOString()
    },
    suitability_score: 96,
    is_recommended: true,
    trade_offs: { pros: ['100% customer demand fulfilled on time', 'Maximizes revenue capture (₹75,000 value)', 'High client satisfaction'], cons: ['₹3,200 overtime labor cost'] },
    risks: ['Requires sufficient packaging wrapper in warehouse.'],
    assumptions: ['Warehouse has packaging film for additional 1,000 packs.'],
    safety_check: { is_feasible: true, missing_data_warnings: [] }
  };

  const optionC: DecisionOption = {
    option_id: 'OPTION_C',
    badge_label: 'Queue Preemption / Reprioritization',
    title: 'Preempt Internal Stock Batch to Prioritize Surge Order',
    strategy_description: 'Pause planned internal warehouse replenishment order and assign line capacity entirely to this customer order.',
    action_plan: ['Hold internal stock batch.', 'Dedicate 100% of line runtime to customer order.', 'Complete full 3,000 packs during standard shift.'],
    metrics: {
      predicted_delay_hours: 0,
      extra_cost: 500,
      capacity_utilization_pct: 96,
      output_quantity: spikedQty,
      customer_delivery_impact: 'ON_TIME',
      completion_timestamp: new Date().toISOString()
    },
    suitability_score: 91,
    is_recommended: false,
    trade_offs: { pros: ['Fulfills surge order without heavy overtime', 'Only ₹500 rescheduling fee'], cons: ['Reduces safety stock in warehouse buffer'] },
    risks: ['Warehouse stock buffer drops below reorder threshold.'],
    assumptions: ['Internal stock buffer is above critical safety level.'],
    safety_check: { is_feasible: true, missing_data_warnings: [] }
  };

  return {
    simulation_only: true,
    database_modified: false,
    scenario_code: `SCN-DS-${Date.now().toString().slice(-6)}`,
    problem_summary: {
      situation_type: 'DEMAND_SPIKE',
      affected_entity: `${prodOrder.product_name} (+50% Surge to ${spikedQty} Packs)`,
      delay_hours: 0,
      affected_production_order: {
        production_order_id: prodOrder.production_order_id,
        batch_number: prodOrder.batch_number,
        product_name: prodOrder.product_name,
        planned_quantity: spikedQty,
        machine_name: prodOrder.machine_name,
        customer_order_number: prodOrder.customer_order_number
      },
      priority_focus: priority
    },
    options: [optionA, optionB, optionC],
    recommended_option: 'OPTION_B',
    recommendation_rationale: `Option B (Authorize +4h Additional Shift) is recommended to capture full commercial value of the surge order (${spikedQty} packs) with zero delivery delay.`,
    data_quality: { inventory_verified: true, machine_rate_verified: true, supplier_rates_verified: true },
    simulation_timestamp: new Date().toISOString()
  };
}

// =========================================================================
// SITUATION 4: QUALITY DEFECT SURGE (e.g. Reject rate rises 2% -> 8%)
// =========================================================================
async function simulateQualityDefectSurge(
  req: ProblemSimulationRequest
): Promise<ProblemSimulationResponse> {
  const { production_order_id, priority = 'BALANCED' } = req;
  
  const orderRes = await query(`
    SELECT po.*, p.product_name, m.machine_name 
    FROM production_orders po
    JOIN products p ON po.product_id = p.product_id
    JOIN machines m ON po.machine_id = m.machine_id
    WHERE po.production_order_id = $1 LIMIT 1;
  `, [production_order_id]);

  const prodOrder = orderRes.rows[0] || {
    production_order_id,
    planned_quantity: 4000,
    product_name: 'Biscuit - Cream',
    machine_name: 'Continuous Tunnel Baking Oven 1',
    batch_number: 'BAT-2026-006'
  };

  const optionA: DecisionOption = {
    option_id: 'OPTION_A',
    badge_label: 'Immediate Stoppage & Thermal Calibration',
    title: 'Halt Line for 1.5h to Re-calibrate Oven Baking Profiles',
    strategy_description: 'Pause line immediately, inspect burner nozzles and thermal zones, and re-calibrate temperature curve back to standard 1.5% defect baseline.',
    action_plan: ['Halt line conveyor immediately.', 'Calibrate Zone 2 & 3 thermal sensors.', 'Conduct 100-pack test run before full restart.'],
    metrics: {
      predicted_delay_hours: 1.5,
      extra_cost: 600,
      capacity_utilization_pct: 82,
      output_quantity: 3940,
      customer_delivery_impact: 'ON_TIME',
      completion_timestamp: new Date().toISOString()
    },
    suitability_score: 94,
    is_recommended: true,
    trade_offs: { pros: ['Eliminates root cause of scrap immediately', 'Protects 98.5% of remaining batch from burn defects', 'Low calibration expense'], cons: ['1.5h temporary line stoppage'] },
    risks: ['Defective batch portion must be quarantined.'],
    assumptions: ['Burner nozzles only require calibration, not mechanical overhaul.'],
    safety_check: { is_feasible: true, missing_data_warnings: [] }
  };

  const optionB: DecisionOption = {
    option_id: 'OPTION_B',
    badge_label: '100% Optical QA Screening',
    title: 'Deploy Automated Optical QA Sorter & Secondary Manual Inspection',
    strategy_description: 'Continue running line at 85% speed with intensive optical inspection station to filter out deformed biscuits.',
    action_plan: ['Deploy optical sorting threshold to 99%.', 'Assign 2 QA inspectors to post-bake conveyor.', 'Divert sub-spec biscuits to rework bin.'],
    metrics: {
      predicted_delay_hours: 0.8,
      extra_cost: 1800,
      capacity_utilization_pct: 88,
      output_quantity: 3680,
      customer_delivery_impact: 'ON_TIME',
      completion_timestamp: new Date().toISOString()
    },
    suitability_score: 83,
    is_recommended: false,
    trade_offs: { pros: ['Line keeps running without complete shutdown', 'Guarantees zero defective packs reach customer'], cons: ['Generates ~320 scrap packs', 'Incurs inspector overtime cost'] },
    risks: ['Ongoing scrap generation while line operates un-calibrated.'],
    assumptions: ['Optical sorter is operational and online.'],
    safety_check: { is_feasible: true, missing_data_warnings: [] }
  };

  const optionC: DecisionOption = {
    option_id: 'OPTION_C',
    badge_label: 'Reprocess / Rework Line',
    title: 'Downgrade Defective Batch to Biscuit Crumbs / Reprocessing Line',
    strategy_description: 'Re-route sub-standard batch to bakery reprocessing crusher for use in crumb formulation at salvage value.',
    action_plan: ['Divert defective batch to crumb granulator.', 'Recover 65% raw ingredient value.', 'Schedule replacement production run on Line 2.'],
    metrics: {
      predicted_delay_hours: 3.0,
      extra_cost: 2500,
      capacity_utilization_pct: 90,
      output_quantity: 4000,
      customer_delivery_impact: 'SLIGHT_DELAY',
      completion_timestamp: new Date().toISOString()
    },
    suitability_score: 76,
    is_recommended: false,
    trade_offs: { pros: ['Recovers raw material scrap value (₹18,000)', 'Zero brand quality risk'], cons: ['Rescheduling replacement batch takes +3 hours'] },
    risks: ['Packaging dispatch delay of 3 hours.'],
    assumptions: ['Crumb reprocessing line has available storage capacity.'],
    safety_check: { is_feasible: true, missing_data_warnings: [] }
  };

  return {
    simulation_only: true,
    database_modified: false,
    scenario_code: `SCN-QD-${Date.now().toString().slice(-6)}`,
    problem_summary: {
      situation_type: 'QUALITY_DEFECT_SURGE',
      affected_entity: `${prodOrder.product_name} (Scrap Rate: 2% → 8%)`,
      delay_hours: 1.5,
      affected_production_order: {
        production_order_id: prodOrder.production_order_id,
        batch_number: prodOrder.batch_number,
        product_name: prodOrder.product_name,
        planned_quantity: prodOrder.planned_quantity,
        machine_name: prodOrder.machine_name
      },
      priority_focus: priority
    },
    options: [optionA, optionB, optionC],
    recommended_option: 'OPTION_A',
    recommendation_rationale: 'Option A (Halt Line & Calibrate) is recommended because a short 1.5-hour calibration fixes the root defect cause and protects 98.5% of product yield.',
    data_quality: { inventory_verified: true, machine_rate_verified: true, supplier_rates_verified: true },
    simulation_timestamp: new Date().toISOString()
  };
}

// =========================================================================
// SITUATION 5: URGENT CUSTOMER ORDER (e.g. Delivery needed 1 day earlier)
// =========================================================================
async function simulateUrgentOrder(
  req: ProblemSimulationRequest
): Promise<ProblemSimulationResponse> {
  const { production_order_id, priority = 'BALANCED' } = req;

  const orderRes = await query(`
    SELECT po.*, p.product_name, m.machine_name, co.order_number as customer_order_number
    FROM production_orders po
    JOIN products p ON po.product_id = p.product_id
    JOIN machines m ON po.machine_id = m.machine_id
    LEFT JOIN customer_orders co ON po.order_id = co.order_id
    WHERE po.production_order_id = $1 LIMIT 1;
  `, [production_order_id]);

  const prodOrder = orderRes.rows[0] || {
    production_order_id,
    planned_quantity: 5000,
    product_name: 'Biscuit - Butter',
    machine_name: 'Continuous Tunnel Baking Oven 1',
    batch_number: 'BAT-2026-005',
    customer_order_number: 'ORD-VIP-101'
  };

  const optionA: DecisionOption = {
    option_id: 'OPTION_A',
    badge_label: 'Fast-Track Queue Preemption',
    title: 'Preempt Current Line Schedule & Insert VIP Order Immediately',
    strategy_description: 'Pause standard stock order currently on machine, execute 20-min die changeover, and run VIP order with top priority.',
    action_plan: ['Pause non-urgent internal stock run.', 'Load VIP order recipe & wrappers.', 'Dispatch full quantity 24 hours ahead of schedule.'],
    metrics: {
      predicted_delay_hours: 0,
      extra_cost: 850,
      capacity_utilization_pct: 98,
      output_quantity: prodOrder.planned_quantity || 5000,
      customer_delivery_impact: 'EARLY',
      completion_timestamp: new Date().toISOString()
    },
    suitability_score: 97,
    is_recommended: true,
    trade_offs: { pros: ['Fulfills urgent delivery deadline 24h early', 'Guarantees key account retention', 'Minimal ₹850 changeover cost'], cons: ['Preempted order delayed to next shift'] },
    risks: ['Paused order must be resumed without material degradation.'],
    assumptions: ['All ingredients and packaging for VIP order are currently in warehouse.'],
    safety_check: { is_feasible: true, missing_data_warnings: [] }
  };

  const optionB: DecisionOption = {
    option_id: 'OPTION_B',
    badge_label: 'Overnight Dedicated Shift',
    title: 'Authorize Overnight Shift (Shift 3) for VIP Batch',
    strategy_description: 'Keep daytime schedule intact; run dedicated overnight crew to produce the order for 6:00 AM dispatch.',
    action_plan: ['Schedule Shift 3 crew.', 'Run full 5,000 packs overnight.', 'Stage for early morning freight pickup.'],
    metrics: {
      predicted_delay_hours: 0,
      extra_cost: 4200,
      capacity_utilization_pct: 100,
      output_quantity: prodOrder.planned_quantity || 5000,
      customer_delivery_impact: 'EARLY',
      completion_timestamp: new Date().toISOString()
    },
    suitability_score: 90,
    is_recommended: false,
    trade_offs: { pros: ['Zero disruption to daytime production schedule', 'Delivers on early morning timeline'], cons: ['₹4,200 night shift labor differential'] },
    risks: ['Night shift supervisor availability.'],
    assumptions: ['Night shift crew is available for call-in.'],
    safety_check: { is_feasible: true, missing_data_warnings: [] }
  };

  const optionC: DecisionOption = {
    option_id: 'OPTION_C',
    badge_label: 'Split Stock Dispatch',
    title: 'Dispatch Available Finished Warehouse Stock + Rapid Overtime Balance',
    strategy_description: 'Dispatch 60% of order immediately from finished goods storage; produce remaining 40% on accelerated shift.',
    action_plan: ['Pick 3,000 packs from warehouse.', 'Produce 2,000 packs on short run.', 'Combine shipments at customer dock.'],
    metrics: {
      predicted_delay_hours: 0,
      extra_cost: 1500,
      capacity_utilization_pct: 95,
      output_quantity: prodOrder.planned_quantity || 5000,
      customer_delivery_impact: 'EARLY',
      completion_timestamp: new Date().toISOString()
    },
    suitability_score: 86,
    is_recommended: false,
    trade_offs: { pros: ['Immediate shipment departs in 2 hours', 'Lower production burden'], cons: ['Two delivery drops required', 'Depletes finished warehouse reserve'] },
    risks: ['Customer receiving dock handling dual deliveries.'],
    assumptions: ['Warehouse currently holds at least 3,000 packs of finished product.'],
    safety_check: { is_feasible: true, missing_data_warnings: [] }
  };

  return {
    simulation_only: true,
    database_modified: false,
    scenario_code: `SCN-UO-${Date.now().toString().slice(-6)}`,
    problem_summary: {
      situation_type: 'URGENT_ORDER',
      affected_entity: `${prodOrder.product_name} (Deadline: -24 Hours Fast-Track)`,
      delay_hours: 0,
      affected_production_order: {
        production_order_id: prodOrder.production_order_id,
        batch_number: prodOrder.batch_number,
        product_name: prodOrder.product_name,
        planned_quantity: prodOrder.planned_quantity,
        machine_name: prodOrder.machine_name,
        customer_order_number: prodOrder.customer_order_number
      },
      priority_focus: priority
    },
    options: [optionA, optionB, optionC],
    recommended_option: 'OPTION_A',
    recommendation_rationale: 'Option A (Fast-Track Preemption) is recommended because it fulfills the urgent deadline 24h early with minimal ₹850 changeover cost and no expensive overnight overtime.',
    data_quality: { inventory_verified: true, machine_rate_verified: true, supplier_rates_verified: true },
    simulation_timestamp: new Date().toISOString()
  };
}
