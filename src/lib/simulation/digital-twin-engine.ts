import { query } from "@/lib/db";
import {
  ScenarioInput,
  SimulationResponse,
  SimulationResults,
  SimulationHorizon,
  MachineHistoricalPerformance,
  MultiScenarioComparisonResponse,
  ScenarioComparisonItem,
} from "@/types/digital-twin";

export function getHorizonHours(horizon: SimulationHorizon, customHours?: number): number {
  if (customHours && customHours > 0) return customHours;
  switch (horizon) {
    case "1_shift":
      return 8.0;
    case "2_shifts":
      return 16.0;
    case "24_hours":
      return 24.0;
    case "3_days":
      return 72.0;
    case "7_days":
      return 168.0;
    default:
      return 8.0;
  }
}

export async function getMachineHistoricalPerformance(
  machineId: number,
  productId?: number
): Promise<MachineHistoricalPerformance | null> {
  // 1. Fetch machine details
  const mRes = await query(
    `SELECT machine_id, machine_code, machine_name, status FROM machines WHERE machine_id = $1 LIMIT 1;`,
    [machineId]
  );
  if (mRes.rows.length === 0) return null;
  const mRow = mRes.rows[0];

  // 2. Fetch all historical production orders for this machine
  const allOrdersRes = await query(
    `SELECT 
      COUNT(*)::int as total_orders,
      COALESCE(SUM(actual_hours), 0)::float as total_hours,
      COALESCE(SUM(actual_quantity), 0)::float as total_quantity,
      COALESCE(SUM(good_quantity), 0)::float as total_good,
      COALESCE(SUM(rejected_quantity), 0)::float as total_rejected,
      COALESCE(AVG(unit_production_cost), 20.0)::float as avg_unit_cost
    FROM production_orders 
    WHERE machine_id = $1 AND actual_hours > 0 AND actual_quantity > 0;`,
    [machineId]
  );

  const stats = allOrdersRes.rows[0];
  const totalOrders = stats.total_orders || 0;
  const totalHours = stats.total_hours || 0;
  const totalQuantity = stats.total_quantity || 0;
  const totalRejected = stats.total_rejected || 0;

  const averageThroughput = totalHours > 0 && totalQuantity > 0 ? totalQuantity / totalHours : null;
  const historicalRejectionRate = totalQuantity > 0 ? (totalRejected / totalQuantity) * 100 : 1.2;

  // 3. If a specific product is requested, check if SKU-specific history exists
  let productSpecificThroughput: number | null = null;
  if (productId && productId > 0) {
    const skuOrdersRes = await query(
      `SELECT 
        COALESCE(SUM(actual_hours), 0)::float as sku_hours,
        COALESCE(SUM(actual_quantity), 0)::float as sku_quantity
      FROM production_orders 
      WHERE machine_id = $1 AND product_id = $2 AND actual_hours > 0 AND actual_quantity > 0;`,
      [machineId, productId]
    );
    const skuStats = skuOrdersRes.rows[0];
    if (skuStats.sku_hours > 0 && skuStats.sku_quantity > 0) {
      productSpecificThroughput = skuStats.sku_quantity / skuStats.sku_hours;
    }
  }

  return {
    machineId: mRow.machine_id,
    machineCode: mRow.machine_code,
    machineName: mRow.machine_name,
    status: mRow.status || "Running",
    totalOrdersExecuted: totalOrders,
    totalHistoricalHours: totalHours,
    totalHistoricalQuantity: totalQuantity,
    averageThroughputPerHour: averageThroughput ? Number(averageThroughput.toFixed(1)) : null,
    productSpecificThroughputPerHour: productSpecificThroughput ? Number(productSpecificThroughput.toFixed(1)) : null,
    historicalRejectionRatePct: Number(historicalRejectionRate.toFixed(2)),
    avgUnitProductionCost: Number(stats.avg_unit_cost.toFixed(2)),
  };
}

export async function runDigitalTwinSimulation(input: ScenarioInput): Promise<SimulationResponse> {
  const assumptions: string[] = [];
  const warnings: string[] = [];

  // 1. Validate inputs strictly
  if (!input.machineId || input.machineId <= 0) {
    throw new Error("Invalid or missing machine ID. Please select a valid factory machine.");
  }
  if (!input.productId || input.productId <= 0) {
    throw new Error("Invalid or missing product ID. Please select a target manufactured SKU.");
  }
  if (input.baseDemand === undefined || input.baseDemand < 0) {
    throw new Error("Base demand quantity cannot be negative.");
  }
  if (input.downtimeHours === undefined || input.downtimeHours < 0) {
    throw new Error("Hypothetical downtime hours cannot be negative.");
  }
  if (input.extraShiftHours === undefined || input.extraShiftHours < 0) {
    throw new Error("Extra shift hours cannot be negative.");
  }

  // 2. Query real Machine info from PostgreSQL (Read-Only)
  const mRes = await query(
    `SELECT machine_id, machine_code, machine_name, status FROM machines WHERE machine_id = $1 LIMIT 1;`,
    [input.machineId]
  );
  if (mRes.rows.length === 0) {
    throw new Error(`Machine with ID #${input.machineId} was not found in the factory database.`);
  }
  const machine = mRes.rows[0];

  // 3. Query real Product & Stock info from PostgreSQL (Read-Only)
  const pRes = await query(
    `SELECT 
      p.product_id, 
      p.product_code, 
      p.product_name, 
      COALESCE(p.unit, 'Units') as unit,
      COALESCE(SUM(s.current_quantity), 0)::float as current_stock,
      COALESCE(AVG(s.reorder_level), 500)::float as reorder_level,
      COALESCE(AVG(s.unit_cost), 22.5)::float as unit_cost
    FROM products p
    LEFT JOIN inventory_stock s ON p.product_id = s.product_id
    WHERE p.product_id = $1
    GROUP BY p.product_id, p.product_code, p.product_name, p.unit;`,
    [input.productId]
  );
  if (pRes.rows.length === 0) {
    throw new Error(`Product with ID #${input.productId} was not found in the product catalog.`);
  }
  const product = pRes.rows[0];

  // 4. Calculate Demand adjustments
  const originalDemand = Math.max(0, input.baseDemand);
  const demandChangeMultiplier = 1 + (input.demandChangePct || 0) / 100;
  const simulatedDemand = Math.max(0, Math.round(originalDemand * demandChangeMultiplier));

  if (input.demandChangePct !== 0) {
    assumptions.push(
      `Demand adjusted by ${input.demandChangePct > 0 ? "+" : ""}${input.demandChangePct}% from baseline ${originalDemand.toLocaleString()} ${product.unit} to ${simulatedDemand.toLocaleString()} ${product.unit}.`
    );
  }

  // 5. Calculate Operating Time Horizon
  const baseHorizonHours = getHorizonHours(input.horizon, input.horizonHours);
  const extraShiftHours = input.extraShiftEnabled ? Math.max(0, input.extraShiftHours || 0) : 0;
  const grossAvailableHours = baseHorizonHours + extraShiftHours;
  const downtimeHours = Math.max(0, input.downtimeHours || 0);

  if (downtimeHours > grossAvailableHours) {
    warnings.push(
      `Requested downtime (${downtimeHours}h) exceeds total available horizon (${grossAvailableHours}h). Net operating time will be 0 hours.`
    );
  }

  const netOperatingHours = Math.max(0, Number((grossAvailableHours - Math.min(downtimeHours, grossAvailableHours)).toFixed(2)));

  if (input.extraShiftEnabled && extraShiftHours > 0) {
    assumptions.push(`Additional operating shift active (+${extraShiftHours} hours). Total gross operating window = ${grossAvailableHours}h.`);
  }
  if (downtimeHours > 0) {
    assumptions.push(`Simulated mechanical/scheduled downtime of ${downtimeHours} hours deducted from production window.`);
  }

  // 6. Resolve Machine Throughput Rate from PostgreSQL historical production data
  const history = await getMachineHistoricalPerformance(input.machineId, input.productId);
  let throughputRatePerHour: number | null = null;
  let throughputSource: "product_machine_history" | "machine_overall_history" | "user_specified" | "unavailable" = "unavailable";

  if (input.customThroughputRate && input.customThroughputRate > 0) {
    throughputRatePerHour = input.customThroughputRate;
    throughputSource = "user_specified";
    assumptions.push(`Used manager custom throughput rate: ${throughputRatePerHour} ${product.unit}/hr.`);
  } else if (history && history.productSpecificThroughputPerHour && history.productSpecificThroughputPerHour > 0) {
    throughputRatePerHour = history.productSpecificThroughputPerHour;
    throughputSource = "product_machine_history";
    assumptions.push(
      `Derived high-confidence throughput rate (${throughputRatePerHour} ${product.unit}/hr) from historical production runs of ${product.product_name} on ${machine.machine_name}.`
    );
  } else if (history && history.averageThroughputPerHour && history.averageThroughputPerHour > 0) {
    throughputRatePerHour = history.averageThroughputPerHour;
    throughputSource = "machine_overall_history";
    assumptions.push(
      `Derived machine baseline throughput rate (${throughputRatePerHour} units/hr) across all executed shop floor batches on ${machine.machine_name}.`
    );
  } else {
    throughputSource = "unavailable";
    warnings.push(
      `No historical production records with valid actual operating hours exist for ${machine.machine_name}. Capacity cannot be estimated without an explicit assumption.`
    );
  }

  // 7. Calculate Estimated Capacity, Shortfall & Surplus
  let estimatedCapacity: number | null = null;
  let productionShortfall: number | null = null;
  let productionSurplus: number | null = null;
  let capacityUtilizationPct: number | null = null;
  let estimatedDelayHours: number | null = null;
  let feasibilityStatus: "Feasible" | "At Risk" | "Critical Shortfall" | "Indeterminate" = "Indeterminate";

  if (throughputRatePerHour !== null && throughputRatePerHour > 0) {
    estimatedCapacity = Math.max(0, Math.round(throughputRatePerHour * netOperatingHours));

    if (estimatedCapacity >= simulatedDemand) {
      productionSurplus = estimatedCapacity - simulatedDemand;
      productionShortfall = 0;
      estimatedDelayHours = 0;
      capacityUtilizationPct = simulatedDemand > 0 ? Number(((simulatedDemand / estimatedCapacity) * 100).toFixed(1)) : 0;
      feasibilityStatus = "Feasible";
    } else {
      productionShortfall = simulatedDemand - estimatedCapacity;
      productionSurplus = 0;
      capacityUtilizationPct = 100.0;
      estimatedDelayHours = Number((productionShortfall / throughputRatePerHour).toFixed(1));
      
      const shortfallRatio = simulatedDemand > 0 ? productionShortfall / simulatedDemand : 0;
      feasibilityStatus = shortfallRatio > 0.35 ? "Critical Shortfall" : "At Risk";

      warnings.push(
        `Projected production shortfall of ${productionShortfall.toLocaleString()} ${product.unit} (${Math.round(shortfallRatio * 100)}% unfulfilled under current scenario).`
      );
      warnings.push(
        `Estimated production lag: ${estimatedDelayHours} additional operating hours needed to complete simulated demand.`
      );
    }
  }

  // 8. Cost Impact Simulation
  const baseUnitCost = Number(product.unit_cost) || 22.5;
  const baselineCost = Math.round(originalDemand * baseUnitCost);
  let simulatedCost: number | null = null;
  let estimatedCostImpact: number | null = null;

  if (throughputRatePerHour !== null) {
    // Variable cost for produced units + overtime premium for extra shift (approx ₹450/hr overhead) + downtime idle carrying cost
    const producedUnits = Math.min(simulatedDemand, estimatedCapacity || 0);
    const regularCost = producedUnits * baseUnitCost;
    const overtimeOverhead = extraShiftHours * 650.0; // Overtime labor & power surcharge
    const downtimeIdlingCost = downtimeHours * 420.0; // Fixed factory floor carrying cost during stoppage

    simulatedCost = Math.round(regularCost + overtimeOverhead + downtimeIdlingCost);
    estimatedCostImpact = simulatedCost - baselineCost;

    if (extraShiftHours > 0) {
      assumptions.push(`Calculated overtime labor & energy surcharge (₹650/hr) for ${extraShiftHours}h extra shift.`);
    }
    if (downtimeHours > 0) {
      assumptions.push(`Included plant idle asset depreciation and carrying charge (₹420/hr) during ${downtimeHours}h downtime.`);
    }
  }

  // 9. Raw Material / Finished Stock Inventory Check
  if (product.current_stock < simulatedDemand) {
    const deficit = simulatedDemand - product.current_stock;
    warnings.push(
      `Current on-hand warehouse inventory (${product.current_stock.toLocaleString()} ${product.unit}) is below simulated demand. Factory must produce at least ${deficit.toLocaleString()} ${product.unit}.`
    );
  }

  // 10. Check Machine Operational Status
  if (machine.status === "Maintenance" || machine.status === "Offline") {
    warnings.push(
      `ALERT: Machine ${machine.machine_name} (${machine.machine_code}) is currently flagged as '${machine.status}' in live operational database.`
    );
  }

  // Confidence Score Calculation
  let confidenceScore = 50;
  if (history && history.totalOrdersExecuted >= 3) confidenceScore += 25;
  if (throughputSource === "product_machine_history") confidenceScore += 20;
  if (throughputSource === "machine_overall_history") confidenceScore += 10;
  if (throughputSource === "user_specified") confidenceScore = 65;
  if (throughputSource === "unavailable") confidenceScore = 15;

  const now = new Date();
  const projectedDeliveryDate = estimatedDelayHours && estimatedDelayHours > 0
    ? new Date(now.getTime() + (baseHorizonHours + estimatedDelayHours) * 3600 * 1000).toISOString()
    : new Date(now.getTime() + baseHorizonHours * 3600 * 1000).toISOString();

  return {
    simulation_only: true,
    database_modified: false,
    timestamp: new Date().toISOString(),
    scenario: input,
    results: {
      originalDemand,
      simulatedDemand,
      baseHorizonHours,
      extraShiftHours,
      downtimeHours,
      netOperatingHours,
      throughputRatePerHour,
      throughputSource,
      estimatedCapacity,
      productionShortfall,
      productionSurplus,
      capacityUtilizationPct,
      estimatedDelayHours,
      estimatedCostImpact,
      baselineCost,
      simulatedCost,
      projectedDeliveryDate,
      feasibilityStatus,
    },
    machineInfo: {
      id: machine.machine_id,
      code: machine.machine_code,
      name: machine.machine_name,
      status: machine.status || "Running",
    },
    productInfo: {
      id: product.product_id,
      code: product.product_code,
      name: product.product_name,
      unit: product.unit,
      currentStock: Number(product.current_stock),
      reorderLevel: Number(product.reorder_level),
    },
    assumptions,
    warnings,
    dataQuality: {
      historicalDataAvailable: history !== null && history.totalOrdersExecuted > 0,
      capacityEstimateAvailable: throughputRatePerHour !== null,
      costEstimateAvailable: simulatedCost !== null,
      confidenceScore: Math.min(100, confidenceScore),
    },
  };
}

export async function compareDigitalTwinScenarios(
  scenarios: ScenarioInput[]
): Promise<MultiScenarioComparisonResponse> {
  if (!scenarios || scenarios.length === 0) {
    throw new Error("At least one scenario input is required for comparison.");
  }

  const comparisonItems: ScenarioComparisonItem[] = [];

  for (let i = 0; i < scenarios.length; i++) {
    const sc = scenarios[i];
    const isBaseline = i === 0;
    const simRes = await runDigitalTwinSimulation(sc);

    const shortfall = simRes.results.productionShortfall || 0;
    const delay = simRes.results.estimatedDelayHours || 0;
    const costImpact = simRes.results.estimatedCostImpact || 0;

    let score = 100;
    if (shortfall > 0) score -= Math.min(50, Math.round((shortfall / (simRes.results.simulatedDemand || 1)) * 60));
    if (delay > 0) score -= Math.min(25, delay * 3);
    if (costImpact > 0) score -= Math.min(15, Math.round(costImpact / 5000));
    if (simRes.warnings.length > 2) score -= 10;
    score = Math.max(10, Math.min(100, score));

    let reason = "Nominal production parameters with zero bottleneck.";
    if (shortfall > 0 && delay > 0) {
      reason = `Incurs shortfall of ${shortfall.toLocaleString()} units with ~${delay}h delay to delivery.`;
    } else if (costImpact > 0) {
      reason = `Meets demand completely with an estimated ₹${costImpact.toLocaleString()} overtime/carrying surcharge.`;
    } else {
      reason = `Full demand fulfillment with ${simRes.results.productionSurplus?.toLocaleString() || 0} buffer units.`;
    }

    comparisonItems.push({
      id: `scenario-${i + 1}`,
      name: sc.scenarioName || (isBaseline ? "Baseline: Normal Plan" : `Scenario ${String.fromCharCode(65 + i)}`),
      description: isBaseline
        ? "Standard shift horizon with 0h downtime"
        : `${sc.downtimeHours}h downtime, ${sc.demandChangePct > 0 ? "+" : ""}${sc.demandChangePct}% demand${sc.extraShiftEnabled ? `, +${sc.extraShiftHours}h extra shift` : ""}`,
      isBaseline,
      inputs: sc,
      outputs: simRes.results,
      suitabilityScore: score,
      recommendationReason: reason,
    });
  }

  // Find preferred scenario with highest suitability score
  const sorted = [...comparisonItems].sort((a, b) => b.suitabilityScore - a.suitabilityScore);
  const preferred = sorted[0];

  const tradeoffs = comparisonItems.map((c) => {
    return `${c.name}: Capacity ${c.outputs.estimatedCapacity?.toLocaleString() || "N/A"} vs Demand ${c.outputs.simulatedDemand.toLocaleString()} (Score: ${c.suitabilityScore}/100)`;
  });

  const bottlenecks = comparisonItems
    .filter((c) => (c.outputs.productionShortfall || 0) > 0)
    .map((c) => `${c.name} has a capacity deficit of ${c.outputs.productionShortfall?.toLocaleString()} units due to downtime/throughput limitations.`);

  return {
    simulation_only: true,
    database_modified: false,
    comparedAt: new Date().toISOString(),
    scenarios: comparisonItems,
    preferredScenarioId: preferred.id,
    comparativeAnalysis: {
      summary: `Recommended option is '${preferred.name}' (Suitability Score: ${preferred.suitabilityScore}/100) because it minimizes delivery lag and optimizes asset throughput.`,
      tradeoffs,
      bottlenecks: bottlenecks.length > 0 ? bottlenecks : ["No major capacity bottlenecks identified in top-ranked scenarios."],
    },
  };
}
