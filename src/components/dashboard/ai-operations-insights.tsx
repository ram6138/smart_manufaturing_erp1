"use client";

import React, { useState } from "react";
import { AIInsightItem, AIInsightSeverity } from "@/types/dashboard";
import {
  Sparkles,
  Bot,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Info,
  CheckCircle2,
  X,
  Zap,
} from "lucide-react";

interface AIOperationsInsightsProps {
  insights: AIInsightItem[];
}

export function AIOperationsInsights({ insights }: AIOperationsInsightsProps) {
  const [selectedInsight, setSelectedInsight] = useState<AIInsightItem | null>(null);

  const getSeverityBadge = (severity: AIInsightSeverity) => {
    switch (severity) {
      case "High":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm">
            <ShieldAlert className="w-3 h-3 text-rose-400" />
            High Severity
          </span>
        );
      case "Medium":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            Medium Severity
          </span>
        );
      case "Low":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm">
            <Info className="w-3 h-3 text-cyan-400" />
            Low Severity
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-cyan-950/20 border border-cyan-500/30 p-5 sm:p-6 shadow-xl space-y-4">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-1/4 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20 ring-1 ring-white/20 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                AI Operations Insights
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                PROTOTYPE ENGINE
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Automated anomaly detection, predictive failure alerts, and yield optimizations
            </p>
          </div>
        </div>

        <span className="text-xs font-mono text-cyan-400/90">
          {insights.length} Actionable Insight{insights.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Insights Cards Grid */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className="flex flex-col justify-between p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900/80 transition-all group space-y-3"
          >
            <div className="space-y-2">
              {/* Category & Severity */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold text-cyan-400">
                  {insight.category}
                </span>
                {getSeverityBadge(insight.severity)}
              </div>

              {/* Title */}
              <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition">
                {insight.title}
              </h3>

              {/* Explanation */}
              <p className="text-xs text-slate-400 leading-relaxed">
                {insight.explanation}
              </p>

              {/* Recommended Action Card */}
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block mb-1">
                  💡 Recommended Action:
                </span>
                <p className="text-slate-300 text-[11px] leading-snug">
                  {insight.recommendedAction}
                </p>
              </div>
            </div>

            {/* Bottom button & timestamp */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-[10px] text-slate-400 font-mono">
                {insight.timestamp}
              </span>

              <button
                onClick={() => setSelectedInsight(insight)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300 group-hover:translate-x-0.5 transition"
              >
                <span>View Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal / Deep-Dive Simulation */}
      {selectedInsight && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    {getSeverityBadge(selectedInsight.severity)}
                    <span className="text-xs text-slate-400 font-mono">
                      {selectedInsight.category}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-1">
                    {selectedInsight.title}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setSelectedInsight(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 font-semibold uppercase tracking-wider block mb-1 text-[10px]">
                  Analysis & Diagnostic
                </span>
                <p className="text-slate-200 leading-relaxed bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                  {selectedInsight.explanation}
                </p>
              </div>

              <div>
                <span className="text-cyan-400 font-semibold uppercase tracking-wider block mb-1 text-[10px]">
                  Prescribed Operational Resolution
                </span>
                <p className="text-slate-200 leading-relaxed bg-cyan-950/30 p-3 rounded-xl border border-cyan-500/30">
                  {selectedInsight.recommendedAction}
                </p>
              </div>

              <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1">
                <span>Impact Estimate: <strong className="text-white">{selectedInsight.impact}</strong></span>
                <span className="font-mono">Observed {selectedInsight.timestamp}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => setSelectedInsight(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition"
              >
                Dismiss
              </button>
              <button
                onClick={() => {
                  alert(`Work Order / Inspection Ticket drafted for "${selectedInsight.title}"`);
                  setSelectedInsight(null);
                }}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-xs font-semibold text-white shadow-md transition"
              >
                Create Corrective Action Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
