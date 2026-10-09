"use client";

import React, { useState, useEffect } from "react";
import { ErpLayout } from "@/components/layout/erp-layout";
import {
  ScenarioInput,
  SimulationResponse,
  MultiScenarioComparisonResponse,
} from "@/types/digital-twin";
import { TwinKpiCards } from "@/components/digital-twin/twin-kpi-cards";
import { ScenarioConfigPanel } from "@/components/digital-twin/scenario-config-panel";
import { SimulationResultsPanel } from "@/components/digital-twin/simulation-results-panel";
import { ScenarioComparisonPanel } from "@/components/digital-twin/scenario-comparison-panel";
import { TwinVisualizer } from "@/components/digital-twin/twin-visualizer";
import { AiDecisionStudio } from "@/components/digital-twin/ai-decision-studio";
import {
  Sparkles,
  Layers,
  SlidersHorizontal,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Database,
  Activity,
  BrainCircuit,
} from "lucide-react";

export default function DigitalTwinPage() {
  const [activeTab, setActiveTab] = useState<"decision-studio" | "single" | "compare">("decision-studio");
  const [isLoadingMeta, setIsLoadingMeta] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isComparing, setIsComparing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Metadata from PostgreSQL
  const [machines, setMachines] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [customerOrders, setCustomerOrders] = useState<any[]>([]);
  const [shifts, setShifts] = useState<any[]>([]);

  // Current Scenario Input State
  const [scenarioInput, setScenarioInput] = useState<ScenarioInput>({
    machineId: 1,
    productId: 1,
    orderId: null,
    baseDemand: 4000,
    demandChangePct: 0,
    downtimeHours: 0,
    extraShiftEnabled: false,
    extraShiftHours: 0,
    horizon: "1_shift",
  });

  // Simulation Results
  const [simulationData, setSimulationData] = useState<SimulationResponse | null>(null);
  const [comparisonData, setComparisonData] = useState<MultiScenarioComparisonResponse | null>(null);

  // 1. Fetch Metadata from PostgreSQL
  const loadMetadata = async () => {
    setIsLoadingMeta(true);
    try {
      const res = await fetch("/api/digital-twin/meta", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.status === "success") {
          setMachines(data.machines || []);
          setProducts(data.products || []);
          setCustomerOrders(data.customerOrders || []);
          setShifts(data.shifts || []);

          if (data.machines.length > 0 && data.products.length > 0) {
            const initialMachine = data.machines[0];
            const initialProduct = data.products[0];
            const initialInput: ScenarioInput = {
              machineId: initialMachine.id,
              productId: initialProduct.id,
              orderId: null,
              baseDemand: 4000,
              demandChangePct: 0,
              downtimeHours: 0,
              extraShiftEnabled: false,
              extraShiftHours: 0,
              horizon: "1_shift",
            };
            setScenarioInput(initialInput);

            // Auto-run initial baseline simulation
            runInitialSimulation(initialInput);
          }
        }
      }
    } catch (e) {
      console.error("Failed to load digital twin metadata:", e);
    } finally {
      setIsLoadingMeta(false);
    }
  };

  const runInitialSimulation = async (input: ScenarioInput) => {
    try {
      const res = await fetch("/api/digital-twin/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (res.ok) {
        const simRes = await res.json();
        if (simRes.status === "success") {
          setSimulationData(simRes);
        }
      }
    } catch (e) {
      console.warn("Initial simulation fallback:", e);
    }
  };

  useEffect(() => {
    loadMetadata();
  }, []);

  // 2. Handle Scenario Change
  const handleInputChange = (partial: Partial<ScenarioInput>) => {
    setScenarioInput((prev) => ({ ...prev, ...partial }));
  };

  // 3. Run Single Scenario Simulation
  const handleRunSimulation = async () => {
    setIsSimulating(true);
    try {
      const res = await fetch("/api/digital-twin/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(scenarioInput),
      });

      const data = await res.json();
      if (res.ok && data.status === "success") {
        setSimulationData(data);
        setToastMessage("Virtual scenario executed successfully!");
        setTimeout(() => setToastMessage(null), 3500);
      } else {
        alert(data.message || "Simulation error");
      }
    } catch (e: any) {
      alert(`Simulation failed: ${e.message}`);
    } finally {
      setIsSimulating(false);
    }
  };

  // 4. Run Multi-Scenario Comparison
  const handleRunComparison = async () => {
    setIsComparing(true);
    try {
      const baseline: ScenarioInput = {
        scenarioName: "Baseline Normal Plan",
        machineId: scenarioInput.machineId,
        productId: scenarioInput.productId,
        baseDemand: scenarioInput.baseDemand,
        demandChangePct: 0,
        downtimeHours: 0,
        extraShiftEnabled: false,
        extraShiftHours: 0,
        horizon: scenarioInput.horizon,
      };

      const scenarioB: ScenarioInput = {
        scenarioName: "Scenario A: Downtime Stoppage",
        machineId: scenarioInput.machineId,
        productId: scenarioInput.productId,
        baseDemand: scenarioInput.baseDemand,
        demandChangePct: scenarioInput.demandChangePct,
        downtimeHours: Math.max(2.5, scenarioInput.downtimeHours || 3.0),
        extraShiftEnabled: false,
        extraShiftHours: 0,
        horizon: scenarioInput.horizon,
      };

      const scenarioC: ScenarioInput = {
        scenarioName: "Scenario B: Overtime Shift Mitigation",
        machineId: scenarioInput.machineId,
        productId: scenarioInput.productId,
        baseDemand: scenarioInput.baseDemand,
        demandChangePct: scenarioInput.demandChangePct,
        downtimeHours: Math.max(2.5, scenarioInput.downtimeHours || 3.0),
        extraShiftEnabled: true,
        extraShiftHours: 4.0,
        horizon: scenarioInput.horizon,
      };

      const res = await fetch("/api/digital-twin/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenarios: [baseline, scenarioB, scenarioC] }),
      });

      const data = await res.json();
      if (res.ok && data.status === "success") {
        setComparisonData(data);
        setActiveTab("compare");
        setToastMessage("Multi-scenario comparison matrix generated!");
        setTimeout(() => setToastMessage(null), 3500);
      }
    } catch (e: any) {
      alert(`Comparison failed: ${e.message}`);
    } finally {
      setIsComparing(false);
    }
  };

  // 5. Reset Scenario
  const handleReset = () => {
    const defaultInput: ScenarioInput = {
      machineId: machines[0]?.id || 1,
      productId: products[0]?.id || 1,
      orderId: null,
      baseDemand: 4000,
      demandChangePct: 0,
      downtimeHours: 0,
      extraShiftEnabled: false,
      extraShiftHours: 0,
      horizon: "1_shift",
    };
    setScenarioInput(defaultInput);
    runInitialSimulation(defaultInput);
    setToastMessage("Scenario reset to factory baseline");
    setTimeout(() => setToastMessage(null), 3000);
  };

  const currentMachine = machines.find((m) => m.id === scenarioInput.machineId);
  const currentProduct = products.find((p) => p.id === scenarioInput.productId);

  return (
    <ErpLayout>
      <div className="space-y-6 pb-12">
        {/* Toast */}
        {toastMessage && (
          <div className="fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-emerald-950 border border-emerald-500 text-emerald-200 rounded-xl shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top duration-300">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-sm font-medium">{toastMessage}</span>
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Factory Digital Twin
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cyan-600" />
                What-If Simulator
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Simulate production shifts, machine downtime, and demand variations virtually without altering real factory records.
            </p>
          </div>

          {/* Action Buttons & Tabs */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab("decision-studio")}
                className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === "decision-studio"
                    ? "bg-white text-indigo-700 shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <BrainCircuit className="w-3.5 h-3.5 text-indigo-600" />
                AI Decision Studio (A, B, C)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("single")}
                className={`px-3.5 py-1.5 rounded-lg transition-all ${
                  activeTab === "single"
                    ? "bg-white text-blue-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Horizon Simulator
              </button>
              <button
                type="button"
                onClick={handleRunComparison}
                disabled={isComparing}
                className={`px-3.5 py-1.5 rounded-lg transition-all ${
                  activeTab === "compare"
                    ? "bg-white text-purple-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {isComparing ? "Evaluating..." : "Compare Scenarios"}
              </button>
            </div>

            <button
              type="button"
              onClick={loadMetadata}
              disabled={isLoadingMeta}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 text-xs font-medium transition shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${isLoadingMeta ? "animate-spin" : ""}`} />
              <span>Sync DB Telemetry</span>
            </button>
          </div>
        </div>

        {/* Tab 1: AI Decision Studio */}
        {activeTab === "decision-studio" && (
          <AiDecisionStudio metadata={{ machines, products, customerOrders, shifts }} />
        )}

        {/* Tab 2: Horizon Simulator */}
        {activeTab === "single" && (
          <div className="space-y-6">
            <TwinKpiCards
              results={simulationData ? simulationData.results : null}
              productUnit={currentProduct?.unit || "Packs"}
            />

            <TwinVisualizer
              machineName={currentMachine?.name || "Continuous Baking Oven"}
              machineStatus={currentMachine?.status || "Running"}
              productName={currentProduct?.name || "Classic Biscuit"}
              downtimeHours={scenarioInput.downtimeHours || 0}
              netHours={simulationData?.results.netOperatingHours || 8}
              isSimulating={isSimulating}
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-6 space-y-6">
                <ScenarioConfigPanel
                  input={scenarioInput}
                  onChange={handleInputChange}
                  onRunSimulation={handleRunSimulation}
                  onReset={handleReset}
                  isLoading={isSimulating}
                  machines={machines}
                  products={products}
                  customerOrders={customerOrders}
                />
              </div>

              <div className="lg:col-span-6 space-y-6">
                <SimulationResultsPanel simulationData={simulationData} />
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Multi-Scenario Comparison View */}
        {activeTab === "compare" && (
          <ScenarioComparisonPanel
            comparisonData={comparisonData}
            onSelectScenario={(sc) => {
              setScenarioInput(sc);
              setActiveTab("single");
              runInitialSimulation(sc);
              setToastMessage(`Loaded '${sc.scenarioName}' into simulator`);
              setTimeout(() => setToastMessage(null), 3000);
            }}
          />
        )}
      </div>
    </ErpLayout>
  );
}
