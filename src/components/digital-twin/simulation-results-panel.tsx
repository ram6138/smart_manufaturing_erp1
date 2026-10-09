"use client";

import React from "react";
import { SimulationResponse } from "@/types/digital-twin";
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  Info,
  Calendar,
  Layers,
  Database,
  ArrowRight,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";

interface SimulationResultsPanelProps {
  simulationData: SimulationResponse | null;
}

export function SimulationResultsPanel({ simulationData }: SimulationResultsPanelProps) {
  if (!simulationData) {
    return (
      <div className="p-8 rounded-2xl bg-white border border-slate-200/90 shadow-xs text-center space-y-3">
        <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 w-fit mx-auto border border-blue-200">
          <Sparkles className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-800">No Simulation Executed Yet</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
          Configure scenario parameters in the panel above and click <strong>&quot;Run What-If Simulation&quot;</strong> to evaluate capacity, shortfall, and delivery impact safely.
        </p>
      </div>
    );
  }

  const { results, machineInfo, productInfo, assumptions, warnings, dataQuality } = simulationData;

  const getFeasibilityBadge = (status: string) => {
    switch (status) {
      case "Feasible":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Plan Feasible & Compliant
          </span>
        );
      case "At Risk":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-300 shadow-xs">
            <AlertTriangle className="w-3.5 h-3.5" />
            At Risk (Minor Shortfall)
          </span>
        );
      case "Critical Shortfall":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-300 shadow-xs">
            <ShieldAlert className="w-3.5 h-3.5" />
            Critical Shortfall Deficit
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300 shadow-xs">
            <Info className="w-3.5 h-3.5" />
            Indeterminate
          </span>
        );
    }
  };

  const chartData = [
    {
      name: "Original Demand",
      quantity: results.originalDemand,
      fill: "#94a3b8",
    },
    {
      name: "Simulated Demand",
      quantity: results.simulatedDemand,
      fill: "#3b82f6",
    },
    {
      name: "Estimated Capacity",
      quantity: results.estimatedCapacity || 0,
      fill: (results.estimatedCapacity || 0) >= results.simulatedDemand ? "#10b981" : "#f43f5e",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Simulation Safety Guarantee Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-emerald-600 text-white shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-emerald-900">Virtual Simulation Engine Active</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-200 text-emerald-800 border border-emerald-300">
                READ-ONLY ISOLATION
              </span>
            </div>
            <p className="text-[11px] text-emerald-700 mt-0.5">
              Zero production tables modified (<code>database_modified: false</code>). Real ERP shop floor orders and inventory remain safe.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="px-2.5 py-1 rounded-lg bg-white border border-emerald-200 text-[11px] font-mono text-emerald-800 font-semibold">
            Confidence: {dataQuality.confidenceScore}%
          </div>
        </div>
      </div>

      {/* Main Results Container */}
      <div className="rounded-2xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-6">
        {/* Header with Feasibility Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Simulation Analysis & Findings
              </h2>
              <span className="text-xs font-mono text-slate-400">
                {machineInfo.name} • {productInfo.name}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Evaluated throughput capacity, fulfillment timelines, and operational trade-offs
            </p>
          </div>

          <div>{getFeasibilityBadge(results.feasibilityStatus)}</div>
        </div>

        {/* Visual Chart & Metric Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Chart */}
          <div className="lg:col-span-6 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(val: any) => [`${Number(val).toLocaleString()} ${productInfo.unit}`, "Quantity"]}
                  contentStyle={{ backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "12px" }}
                />
                <Bar dataKey="quantity" radius={[6, 6, 0, 0]} barSize={42}>
                  {chartData.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Detailed Summary Table */}
          <div className="lg:col-span-6 space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block mb-0.5 font-medium">Throughput Rate Source</span>
                <span className="font-bold text-slate-800 capitalize">
                  {results.throughputSource.replace(/_/g, " ")}
                </span>
                <span className="text-[11px] text-blue-600 block mt-0.5 font-mono">
                  {results.throughputRatePerHour ? `${results.throughputRatePerHour} ${productInfo.unit}/hr` : "Unavailable"}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block mb-0.5 font-medium">Projected Delivery Date</span>
                <span className="font-bold text-slate-800">
                  {results.projectedDeliveryDate ? new Date(results.projectedDeliveryDate).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "N/A"}
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  {results.estimatedDelayHours && results.estimatedDelayHours > 0 ? `+${results.estimatedDelayHours}h delay` : "On schedule"}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-medium">Estimated Capacity:</span>
                <span className="font-mono font-bold text-slate-900">
                  {results.estimatedCapacity?.toLocaleString() || "N/A"} {productInfo.unit}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-medium">Simulated Demand:</span>
                <span className="font-mono font-bold text-blue-600">
                  {results.simulatedDemand.toLocaleString()} {productInfo.unit}
                </span>
              </div>
              <div className="flex justify-between items-center pt-1.5 border-t border-slate-200">
                <span className="text-slate-700 font-bold">Shortfall / Surplus:</span>
                <span className={`font-mono font-extrabold ${results.productionShortfall && results.productionShortfall > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                  {results.productionShortfall && results.productionShortfall > 0
                    ? `-${results.productionShortfall.toLocaleString()} ${productInfo.unit}`
                    : `+${results.productionSurplus?.toLocaleString() || 0} ${productInfo.unit}`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Assumptions & Warnings Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs">
          {/* Assumptions */}
          <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200 space-y-2">
            <div className="flex items-center gap-1.5 text-blue-800 font-bold text-xs uppercase tracking-wider">
              <Info className="w-4 h-4 text-blue-600" />
              <span>Simulation Assumptions ({assumptions.length})</span>
            </div>
            {assumptions.length === 0 ? (
              <p className="text-slate-500 italic">Standard baseline conditions without special assumptions.</p>
            ) : (
              <ul className="space-y-1.5 text-[11.5px] text-slate-700">
                {assumptions.map((asm, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-blue-500 font-bold">•</span>
                    <span>{asm}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Warnings & Bottlenecks */}
          <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200 space-y-2">
            <div className="flex items-center gap-1.5 text-amber-800 font-bold text-xs uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Operational Warnings ({warnings.length})</span>
            </div>
            {warnings.length === 0 ? (
              <p className="text-emerald-700 font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Zero operational bottlenecks detected for this scenario.
              </p>
            ) : (
              <ul className="space-y-1.5 text-[11.5px] text-slate-700">
                {warnings.map((wrn, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-amber-500 font-bold">⚠️</span>
                    <span>{wrn}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
