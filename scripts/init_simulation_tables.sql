-- Migration: Create simulation_scenarios and simulation_decisions tables
-- For AI What-If Simulator & Decision Audit Engine

CREATE TABLE IF NOT EXISTS simulation_scenarios (
    id SERIAL PRIMARY KEY,
    scenario_code VARCHAR(50) UNIQUE NOT NULL,
    situation_type VARCHAR(50) NOT NULL, -- e.g. 'RAW_MATERIAL_DELAY', 'MACHINE_BREAKDOWN', 'DEMAND_SPIKE', 'QUALITY_DEFECT_SURGE', 'URGENT_ORDER'
    title VARCHAR(255) NOT NULL,
    description TEXT,
    affected_entity_type VARCHAR(50), -- 'MATERIAL', 'MACHINE', 'PRODUCT', 'ORDER'
    affected_entity_id VARCHAR(50),
    parameters JSONB NOT NULL DEFAULT '{}'::jsonb,
    options_data JSONB NOT NULL DEFAULT '[]'::jsonb, -- Generated Options A, B, C
    recommended_option VARCHAR(20),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING_DECISION', -- 'PENDING_DECISION', 'DECISION_RECORDED', 'APPLIED', 'ARCHIVED'
    created_by VARCHAR(100) DEFAULT 'Factory Manager',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS simulation_decisions (
    id SERIAL PRIMARY KEY,
    scenario_id INTEGER NOT NULL REFERENCES simulation_scenarios(id) ON DELETE CASCADE,
    selected_option VARCHAR(20) NOT NULL, -- 'OPTION_A', 'OPTION_B', 'OPTION_C'
    option_title VARCHAR(255) NOT NULL,
    manager_id VARCHAR(100) DEFAULT 'MGR-001',
    manager_name VARCHAR(150) DEFAULT 'Production Manager',
    manager_notes TEXT,
    priority_tradeoff VARCHAR(50) DEFAULT 'BALANCED', -- 'DELIVERY_FIRST', 'COST_MINIMIZE', 'THROUGHPUT_MAX', 'BALANCED'
    estimated_delay_hours NUMERIC(6, 2) DEFAULT 0,
    estimated_extra_cost NUMERIC(12, 2) DEFAULT 0,
    estimated_capacity_utilization NUMERIC(5, 2) DEFAULT 0,
    is_approved BOOLEAN DEFAULT TRUE,
    applied_to_erp BOOLEAN DEFAULT FALSE,
    applied_at TIMESTAMP WITH TIME ZONE,
    applied_changes_summary JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_simulation_scenarios_type ON simulation_scenarios(situation_type);
CREATE INDEX IF NOT EXISTS idx_simulation_scenarios_status ON simulation_scenarios(status);
CREATE INDEX IF NOT EXISTS idx_simulation_decisions_scenario_id ON simulation_decisions(scenario_id);
