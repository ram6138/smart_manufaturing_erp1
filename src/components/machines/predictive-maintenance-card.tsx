"use client";

import React from "react";
import { MachineItem } from "@/types/machines";
import { RiskIndicator } from "./risk-indicator";
import {
  Sparkles,
  Bot,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Wrench,
  Clock,
  CheckCircle2,
} from "lucide-react";

interface PredictiveMaintenanceCardProps {
  machines: MachineItem[];
  onScheduleMaintenance: (machine: MachineItem) => void;
  onViewMachine: (machine: MachineItem) => void;
}

export function PredictiveMaintenanceCard({
  machines,
  onScheduleMaintenance,
  onViewMachine,
}: PredictiveMaintenanceCardProps) {
  const [showAll, setShowAll] = React.useState(false);

  // Filter for machines with warnings, critical, high or elevated risk
  const flaggedMachines = machines.filter(
    (m) =>
      m.prediction.riskLevel === "Critical" ||
      m.prediction.riskLevel === "High" ||
      m.prediction.riskLevel === "Medium" ||
      m.prediction.riskScore > 30 ||
      m.status === "Warning" ||
      m.status === "Maintenance"
  );

  const displayedMachines = (showAll ? machines : (flaggedMachines.length > 0 ? flaggedMachines : machines)).sort(
    (a, b) => b.prediction.riskScore - a.prediction.riskScore
  );

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-cyan-950/20 border border-cyan-500/30 p-5 sm:p-6 shadow-xl space-y-5">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20 ring-1 ring-white/20 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Predictive Maintenance AI Engine
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                AI / ML PROTOTYPE
              </span>
              {flaggedMachines.length > 0 && (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
                  {flaggedMachines.length} Action Required
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Anomaly detection & early failure prediction model focusing on equipment requiring preventative service
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {flaggedMachines.length > 0 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition"
            >
              {showAll ? `Show Flagged Only (${flaggedMachines.length})` : `Show All (${machines.length})`}
            </button>
          )}
          <span className="text-xs font-mono text-cyan-400/90 hidden md:inline">
            {machines.length} Models Synchronized
          </span>
        </div>
      </div>

      {/* Prediction Cards Grid */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedMachines.map((machine) => {
          const pred = machine.prediction;
          const isCritical = pred.riskLevel === "Critical";
          const isHigh = pred.riskLevel === "High";

          return (
            <div
              key={machine.id}
              className={`flex flex-col justify-between p-4 rounded-xl transition-all space-y-3 ${
                isCritical || isHigh
                  ? "bg-slate-950/80 border border-orange-500/40 shadow-lg shadow-orange-500/5 ring-1 ring-orange-500/20"
                  : "bg-slate-950/60 border border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="space-y-2.5">
                {/* Top header: Code, Name, Risk indicator */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-xs font-bold text-cyan-400">
                      {machine.machineCode}
                    </span>
                    <h3 className="text-sm font-bold text-white">
                      {machine.machineName}
                    </h3>
                  </div>

                  <RiskIndicator
                    riskLevel={pred.riskLevel}
                    riskScore={pred.riskScore}
                    showMeter={false}
                  />
                </div>

                {/* Main Risk Factor Badge */}
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-0.5">
                    Primary Failure Risk Factor
                  </span>
                  <span className="font-semibold text-amber-300">
                    {pred.mainRiskFactor}
                  </span>
                </div>

                {/* Prediction Explanation */}
                <p className="text-xs text-slate-300 leading-relaxed">
                  {pred.prediction}
                </p>

                {/* Prescribed Action */}
                <div className="p-2.5 rounded-lg bg-cyan-950/30 border border-cyan-500/30 text-xs space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block">
                    💡 Prescribed Maintenance Action:
                  </span>
                  <p className="text-slate-200 text-[11px] leading-snug">
                    {pred.recommendedAction}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2 text-xs">
                <button
                  onClick={() => onViewMachine(machine)}
                  className="text-xs text-slate-400 hover:text-cyan-400 transition"
                >
                  View Telemetry
                </button>

                <button
                  onClick={() => onScheduleMaintenance(machine)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-xs transition active:scale-95 ${
                    isCritical || isHigh
                      ? "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 shadow-md font-bold"
                      : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                  }`}
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Schedule PM</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
