export type SimulationHorizon = "1_shift" | "2_shifts" | "24_hours" | "3_days" | "7_days";

export interface ScenarioInput {
  scenarioName?: string;
  machineId: number;
  productId: number;
  orderId?: number | null;
  baseDemand: number;
  demandChangePct: number; // e.g. +20 or -15 (%)
  downtimeHours: number; // hypothetical machine downtime in hours
  extraShiftEnabled: boolean;
  extraShiftHours: number; // hours of additional shift (e.g. 4 or 8)
  horizon: SimulationHorizon;
  horizonHours?: number; // derived or explicit
  customThroughputRate?: number | null; // optional override if no historical data
  rejectionRatePct?: number; // optional defect rate assumption (e.g. 2%)
}

export interface MachineHistoricalPerformance {
  machineId: number;
  machineCode: string;
  machineName: string;
  status: string;
  totalOrdersExecuted: number;
  totalHistoricalHours: number;
  totalHistoricalQuantity: number;
  averageThroughputPerHour: number | null; // units/hour
  productSpecificThroughputPerHour: number | null; // units/hour for target SKU
  historicalRejectionRatePct: number;
  avgUnitProductionCost: number;
}

export interface SimulationResults {
  originalDemand: number;
  simulatedDemand: number;
  baseHorizonHours: number;
  extraShiftHours: number;
  downtimeHours: number;
  netOperatingHours: number;
  throughputRatePerHour: number | null;
  throughputSource: "product_machine_history" | "machine_overall_history" | "user_specified" | "unavailable";
  estimatedCapacity: number | null;
  productionShortfall: number | null;
  productionSurplus: number | null;
  capacityUtilizationPct: number | null;
  estimatedDelayHours: number | null;
  estimatedCostImpact: number | null; // Net incremental cost/saving in ₹
  baselineCost: number | null;
  simulatedCost: number | null;
  projectedDeliveryDate: string | null;
  feasibilityStatus: "Feasible" | "At Risk" | "Critical Shortfall" | "Indeterminate";
}

export interface SimulationResponse {
  simulation_only: true;
  database_modified: false;
  timestamp: string;
  scenario: ScenarioInput;
  results: SimulationResults;
  machineInfo: {
    id: number;
    code: string;
    name: string;
    status: string;
    currentWorkOrder?: string;
  };
  productInfo: {
    id: number;
    code: string;
    name: string;
    unit: string;
    currentStock: number;
    reorderLevel: number;
  };
  assumptions: string[];
  warnings: string[];
  dataQuality: {
    historicalDataAvailable: boolean;
    capacityEstimateAvailable: boolean;
    costEstimateAvailable: boolean;
    confidenceScore: number; // 0 - 100
  };
}

export interface ScenarioComparisonItem {
  id: string;
  name: string;
  description: string;
  isBaseline: boolean;
  inputs: ScenarioInput;
  outputs: SimulationResults;
  suitabilityScore: number; // 0 - 100
  recommendationReason: string;
}

export interface MultiScenarioComparisonResponse {
  simulation_only: true;
  database_modified: false;
  comparedAt: string;
  scenarios: ScenarioComparisonItem[];
  preferredScenarioId: string;
  comparativeAnalysis: {
    summary: string;
    tradeoffs: string[];
    bottlenecks: string[];
  };
}
