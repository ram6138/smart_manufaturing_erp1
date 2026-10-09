"use client";

import React from "react";
import { MultiScenarioComparisonResponse } from "@/types/digital-twin";
import {
  Layers,
  Sparkles,
  Trophy,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Clock,
  IndianRupee,
} from "lucide-react";

interface ScenarioComparisonPanelProps {
  comparisonData: MultiScenarioComparisonResponse | null;
  onSelectScenario?: (scenarioInput: any) => void;
}

export function ScenarioComparisonPanel({
  comparisonData,
  onSelectScenario,
}: ScenarioComparisonPanelProps) {
  if (!comparisonData) return null;

  const { scenarios, preferredScenarioId, comparativeAnalysis } = comparisonData;
  const preferred = scenarios.find((s) => s.id === preferredScenarioId) || scenarios[0];

  return (
    <div className="rounded-2xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-50 border border-purple-200 text-purple-600">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Multi-Scenario Comparative Decision Matrix
            </h2>
            <p className="text-xs text-slate-500">
              Side-by-side trade-off analysis between normal baseline and mitigation options
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-800 text-xs font-semibold">
          <Trophy className="w-4 h-4 text-purple-600" />
          <span>Recommended: {preferred?.name}</span>
        </div>
      </div>

      {/* Recommended Choice Box */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-purple-50/70 via-blue-50/50 to-cyan-50/70 border border-purple-200 space-y-2">
        <div className="flex items-center gap-2 text-purple-900 font-bold text-xs uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span>Optimization Recommendation</span>
        </div>
        <p className="text-xs text-slate-700 leading-relaxed">
          {comparativeAnalysis.summary}
        </p>
      </div>

      {/* Scenario Comparison Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {scenarios.map((item) => {
          const isSelected = item.id === preferredScenarioId;
          const isShortfall = (item.outputs.productionShortfall || 0) > 0;

          return (
            <div
              key={item.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                isSelected
                  ? "bg-purple-50/40 border-purple-400 ring-2 ring-purple-400/20 shadow-sm"
                  : "bg-white border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="space-y-2">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      {item.isBaseline ? "Baseline" : "Option"}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">{item.name}</h3>
                  </div>

                  <div className="flex flex-col items-end">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-mono font-extrabold ${
                        item.suitabilityScore >= 80
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : item.suitabilityScore >= 60
                          ? "bg-amber-100 text-amber-800 border border-amber-300"
                          : "bg-rose-100 text-rose-800 border border-rose-300"
                      }`}
                    >
                      {item.suitabilityScore}/100
                    </span>
                    <span className="text-[9.5px] text-slate-400 uppercase tracking-wider mt-0.5">
                      Score
                    </span>
                  </div>
                </div>

                <p className="text-[11.5px] text-slate-500">{item.description}</p>

                {/* Metrics Table */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs">
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Demand:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {item.outputs.simulatedDemand.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Est. Capacity:</span>
                    <span className="font-mono font-bold text-blue-600">
                      {item.outputs.estimatedCapacity?.toLocaleString() || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Deficit / Lag:</span>
                    <span
                      className={`font-mono font-bold ${
                        isShortfall ? "text-rose-600" : "text-emerald-600"
                      }`}
                    >
                      {isShortfall
                        ? `-${item.outputs.productionShortfall?.toLocaleString()} (${item.outputs.estimatedDelayHours}h)`
                        : "0 shortfall"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600 pt-1 border-t border-slate-200">
                    <span>Cost Delta:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {(item.outputs.estimatedCostImpact || 0) > 0
                        ? `+₹${item.outputs.estimatedCostImpact?.toLocaleString()}`
                        : "₹0"}
                    </span>
                  </div>
                </div>

                {/* Reason synopsis */}
                <p className="text-[11px] text-slate-600 leading-snug">
                  {item.recommendationReason}
                </p>
              </div>

              {onSelectScenario && (
                <button
                  type="button"
                  onClick={() => onSelectScenario(item.inputs)}
                  className="w-full mt-2 py-1.5 px-3 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 transition flex items-center justify-center gap-1"
                >
                  <span>Load this Scenario</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Comparative Tradeoffs & Bottlenecks */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
        <span className="font-bold text-slate-800 uppercase tracking-wider block">
          Key Trade-Off Insights & Bottleneck Summary
        </span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <ul className="space-y-1 text-slate-600">
            {comparativeAnalysis.tradeoffs.map((t, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-purple-600 font-bold">•</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
          <ul className="space-y-1 text-slate-600">
            {comparativeAnalysis.bottlenecks.map((b, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-amber-600 font-bold">⚠️</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
