export type SituationType = 
  | 'RAW_MATERIAL_DELAY'
  | 'MACHINE_BREAKDOWN'
  | 'DEMAND_SPIKE'
  | 'QUALITY_DEFECT_SURGE'
  | 'URGENT_ORDER';

export type PriorityTradeoff = 
  | 'BALANCED'
  | 'DELIVERY_FIRST'
  | 'COST_MINIMIZE'
  | 'THROUGHPUT_MAX';

export interface DecisionOption {
  option_id: 'OPTION_A' | 'OPTION_B' | 'OPTION_C';
  badge_label: string; // e.g. 'Lowest Cost / Conservative', 'Operational Rescheduling', 'Emergency Expedite'
  title: string;
  strategy_description: string;
  action_plan: string[];
  metrics: {
    predicted_delay_hours: number;
    extra_cost: number; // in INR
    capacity_utilization_pct: number;
    output_quantity: number;
    customer_delivery_impact: 'ON_TIME' | 'SLIGHT_DELAY' | 'CRITICAL_DELAY' | 'EARLY';
    completion_timestamp: string;
  };
  suitability_score: number; // 0 to 100
  is_recommended: boolean;
  trade_offs: {
    pros: string[];
    cons: string[];
  };
  risks: string[];
  assumptions: string[];
  safety_check: {
    is_feasible: boolean;
    missing_data_warnings: string[];
  };
  applied_changes?: {
    action: string;
    target_table: string;
    target_id: string | number;
    updates: Record<string, any>;
  };
}

export interface ProblemSimulationRequest {
  situation_type: SituationType;
  material_id?: number;
  material_name?: string;
  delay_hours: number;
  production_order_id: number;
  priority?: PriorityTradeoff;
  notes?: string;
}

export interface ProblemSimulationResponse {
  simulation_only: boolean;
  database_modified: boolean;
  scenario_id?: number;
  scenario_code: string;
  problem_summary: {
    situation_type: SituationType;
    affected_entity: string;
    delay_hours: number;
    affected_production_order: {
      production_order_id: number;
      batch_number: string;
      product_name: string;
      planned_quantity: number;
      machine_name: string;
      customer_order_number?: string;
      expected_delivery_date?: string;
    };
    priority_focus: PriorityTradeoff;
  };
  options: DecisionOption[];
  recommended_option: 'OPTION_A' | 'OPTION_B' | 'OPTION_C';
  recommendation_rationale: string;
  data_quality: {
    inventory_verified: boolean;
    machine_rate_verified: boolean;
    supplier_rates_verified: boolean;
  };
  simulation_timestamp: string;
}

export interface RecordDecisionRequest {
  scenario_id?: number;
  scenario_code?: string;
  situation_type: SituationType;
  selected_option: 'OPTION_A' | 'OPTION_B' | 'OPTION_C';
  option_title: string;
  manager_id?: string;
  manager_name?: string;
  manager_notes?: string;
  priority_tradeoff?: PriorityTradeoff;
  estimated_delay_hours: number;
  estimated_extra_cost: number;
  estimated_capacity_utilization: number;
  options_data: DecisionOption[];
  problem_summary: any;
}

export interface ApplyDecisionRequest {
  decision_id?: number;
  scenario_id?: number;
  selected_option: 'OPTION_A' | 'OPTION_B' | 'OPTION_C';
  manager_id: string;
  confirmation_token: string;
}
