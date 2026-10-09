"use client";

import React from "react";
import { ScenarioInput, SimulationHorizon } from "@/types/digital-twin";
import {
  SlidersHorizontal,
  Play,
  RotateCcw,
  Wrench,
  Boxes,
  ClipboardList,
  Clock,
  Sparkles,
  Zap,
  Layers,
  AlertCircle,
} from "lucide-react";

interface ScenarioConfigPanelProps {
  input: ScenarioInput;
  onChange: (newInput: Partial<ScenarioInput>) => void;
  onRunSimulation: () => void;
  onReset: () => void;
  isLoading: boolean;
  machines: any[];
  products: any[];
  customerOrders: any[];
}

export function ScenarioConfigPanel({
  input,
  onChange,
  onRunSimulation,
  onReset,
  isLoading,
  machines,
  products,
  customerOrders,
}: ScenarioConfigPanelProps) {
  const selectedMachine = machines.find((m) => m.id === input.machineId);
  const selectedProduct = products.find((p) => p.id === input.productId);

  const handleOrderSelect = (orderIdStr: string) => {
    if (!orderIdStr || orderIdStr === "none") {
      onChange({ orderId: null });
      return;
    }
    const oId = Number(orderIdStr);
    const ord = customerOrders.find((o) => o.id === oId);
    if (ord) {
      onChange({
        orderId: oId,
        productId: ord.productId || input.productId,
        baseDemand: ord.totalQuantity || input.baseDemand,
      });
    }
  };

  const applyPreset = (presetKey: string) => {
    switch (presetKey) {
      case "normal_baseline":
        onChange({
          demandChangePct: 0,
          downtimeHours: 0,
          extraShiftEnabled: false,
          extraShiftHours: 0,
          horizon: "1_shift",
        });
        break;
      case "breakdown_3h":
        onChange({
          demandChangePct: 0,
          downtimeHours: 3.0,
          extraShiftEnabled: false,
          extraShiftHours: 0,
          horizon: "1_shift",
        });
        break;
      case "demand_surge_30":
        onChange({
          demandChangePct: 30,
          downtimeHours: 0,
          extraShiftEnabled: false,
          extraShiftHours: 0,
          horizon: "1_shift",
        });
        break;
      case "mitigation_overtime":
        onChange({
          demandChangePct: 20,
          downtimeHours: 2.5,
          extraShiftEnabled: true,
          extraShiftHours: 4.0,
          horizon: "1_shift",
        });
        break;
    }
  };

  return (
    <div className="rounded-2xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-600">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Scenario Configuration
            </h2>
            <p className="text-xs text-slate-500">
              Configure virtual production parameters against live PostgreSQL data
            </p>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
            Presets:
          </span>
          <button
            type="button"
            onClick={() => applyPreset("normal_baseline")}
            className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
          >
            Baseline
          </button>
          <button
            type="button"
            onClick={() => applyPreset("breakdown_3h")}
            className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 transition"
          >
            3h Downtime
          </button>
          <button
            type="button"
            onClick={() => applyPreset("demand_surge_30")}
            className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 transition"
          >
            +30% Surge
          </button>
          <button
            type="button"
            onClick={() => applyPreset("mitigation_overtime")}
            className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border border-cyan-200 transition"
          >
            Overtime Sched
          </button>
        </div>
      </div>

      {/* Form Grid */}
      <div className="space-y-4 text-xs">
        {/* Row 1: Target Machine & Product */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Machine Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-blue-600" />
              <span>Production Machine (Asset) *</span>
            </label>
            <select
              value={input.machineId}
              onChange={(e) => onChange({ machineId: Number(e.target.value) })}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:bg-white focus:border-blue-500 transition-colors cursor-pointer"
            >
              {machines.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.code} - {m.name} ({m.status}) {m.averageThroughputPerHour ? `[~${m.averageThroughputPerHour} u/h]` : ""}
                </option>
              ))}
            </select>
            {selectedMachine && (
              <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500">
                <span>
                  Status: <strong className="text-slate-700">{selectedMachine.status}</strong>
                </span>
                <span>
                  Hist. Output:{" "}
                  <strong className="text-blue-600">
                    {selectedMachine.averageThroughputPerHour
                      ? `${selectedMachine.averageThroughputPerHour} units/hr`
                      : "No historical run rate"}
                  </strong>
                </span>
              </div>
            )}
          </div>

          {/* Product SKU Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Boxes className="w-3.5 h-3.5 text-blue-600" />
              <span>Manufactured Product SKU *</span>
            </label>
            <select
              value={input.productId}
              onChange={(e) => onChange({ productId: Number(e.target.value) })}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:bg-white focus:border-blue-500 transition-colors cursor-pointer"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} - {p.name} ({p.unit}) [Stock: {p.currentStock?.toLocaleString() || 0}]
                </option>
              ))}
            </select>
            {selectedProduct && (
              <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500">
                <span>
                  On-hand: <strong className="text-emerald-700">{selectedProduct.currentStock?.toLocaleString() || 0} {selectedProduct.unit}</strong>
                </span>
                <span>
                  Unit Cost: <strong className="text-slate-700">₹{selectedProduct.unitCost || 22.5}</strong>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Row 2: Customer Order & Demand Basis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Order Auto-Populate */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <ClipboardList className="w-3.5 h-3.5 text-blue-600" />
              <span>Link Active Customer Order (Optional)</span>
            </label>
            <select
              value={input.orderId || "none"}
              onChange={(e) => handleOrderSelect(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:bg-white focus:border-blue-500 transition-colors cursor-pointer"
            >
              <option value="none">-- Standalone Simulated Lot (No Order Link) --</option>
              {customerOrders.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.orderNumber} • {o.customer} ({o.totalQuantity?.toLocaleString()} units) - Due: {o.deliveryDate?.split("T")[0]}
                </option>
              ))}
            </select>
          </div>

          {/* Baseline Planned Demand */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Baseline Planned Demand ({selectedProduct?.unit || "Units"}) *
            </label>
            <input
              type="number"
              min="1"
              value={input.baseDemand}
              onChange={(e) => onChange({ baseDemand: Number(e.target.value) })}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono font-bold focus:bg-white focus:border-blue-500"
              required
            />
          </div>
        </div>

        {/* Row 3: Demand Change Slider & Simulated Target */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Simulated Demand Fluctuation (What-If Demand Shift)
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-extrabold ${
                input.demandChangePct > 0
                  ? "bg-purple-100 text-purple-700 border border-purple-300"
                  : input.demandChangePct < 0
                  ? "bg-amber-100 text-amber-700 border border-amber-300"
                  : "bg-slate-200 text-slate-700"
              }`}
            >
              {input.demandChangePct > 0 ? `+${input.demandChangePct}%` : `${input.demandChangePct}%`}
            </span>
          </div>

          <input
            type="range"
            min="-50"
            max="100"
            step="5"
            value={input.demandChangePct}
            onChange={(e) => onChange({ demandChangePct: Number(e.target.value) })}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />

          <div className="flex justify-between items-center text-[11px] text-slate-500 font-mono">
            <span>-50% (Drop)</span>
            <span className="font-bold text-blue-700">
              Simulated Target: {Math.max(0, Math.round(input.baseDemand * (1 + input.demandChangePct / 100))).toLocaleString()} {selectedProduct?.unit || "units"}
            </span>
            <span>+100% (Surge)</span>
          </div>
        </div>

        {/* Row 4: Downtime & Shifts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Downtime Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Hypothetical Downtime (Hours)
            </label>
            <input
              type="number"
              min="0"
              max="168"
              step="0.5"
              value={input.downtimeHours}
              onChange={(e) => onChange({ downtimeHours: Number(e.target.value) })}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono font-bold focus:bg-white focus:border-blue-500"
            />
            <div className="flex gap-1.5 mt-1.5">
              {[0, 2, 4, 8].map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => onChange({ downtimeHours: h })}
                  className={`px-2 py-0.5 rounded text-[10.5px] font-mono font-medium ${
                    input.downtimeHours === h
                      ? "bg-blue-600 text-white"
                      : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                  }`}
                >
                  {h}h
                </button>
              ))}
            </div>
          </div>

          {/* Simulation Horizon */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Simulation Horizon *
            </label>
            <select
              value={input.horizon}
              onChange={(e) => onChange({ horizon: e.target.value as SimulationHorizon })}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:bg-white focus:border-blue-500 cursor-pointer"
            >
              <option value="1_shift">1 Shift (8 Hours)</option>
              <option value="2_shifts">2 Shifts (16 Hours)</option>
              <option value="24_hours">24 Hours (Full Day)</option>
              <option value="3_days">3 Days (72 Hours)</option>
              <option value="7_days">7 Days (168 Hours)</option>
            </select>
          </div>

          {/* Extra Shift Toggle */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Extra Shift Mitigation
              </label>
              <input
                type="checkbox"
                checked={input.extraShiftEnabled}
                onChange={(e) => onChange({ extraShiftEnabled: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded cursor-pointer"
              />
            </div>
            <input
              type="number"
              min="0"
              max="16"
              step="1"
              disabled={!input.extraShiftEnabled}
              value={input.extraShiftHours}
              onChange={(e) => onChange({ extraShiftHours: Number(e.target.value) })}
              placeholder="e.g. 4 or 8 hrs"
              className={`w-full px-3 py-2.5 border rounded-xl font-mono font-bold ${
                input.extraShiftEnabled
                  ? "bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-blue-500"
                  : "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            />
          </div>
        </div>

        {/* Fallback Custom Throughput (if machine has no historical rate) */}
        {!selectedMachine?.averageThroughputPerHour && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
            <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>Machine has no historical production run rate in database</span>
            </div>
            <p className="text-[11px] text-amber-700">
              Provide an assumed nominal throughput rate to compute capacity estimates:
            </p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="10"
                value={input.customThroughputRate || 500}
                onChange={(e) => onChange({ customThroughputRate: Number(e.target.value) })}
                className="w-36 px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs font-mono font-bold text-amber-900"
                placeholder="Units/hr"
              />
              <span className="text-xs text-amber-800 font-semibold">{selectedProduct?.unit || "units"}/hour</span>
            </div>
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          <span>Reset Scenario</span>
        </button>

        <button
          type="button"
          onClick={onRunSimulation}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-bold shadow-md shadow-blue-600/25 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
        >
          <Play className={`w-4 h-4 fill-white ${isLoading ? "animate-spin" : ""}`} />
          <span>{isLoading ? "Running Digital Twin..." : "Run What-If Simulation"}</span>
        </button>
      </div>
    </div>
  );
}
