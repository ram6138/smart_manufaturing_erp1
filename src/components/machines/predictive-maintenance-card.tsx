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

      {/* Prediction Cards Grid Container with vertical scrollbar when expanded */}
      <div
        className={`relative z-10 ${
          showAll || displayedMachines.length > 3
            ? "max-h-[560px] overflow-y-auto pr-2.5 space-y-4 scrollbar-thin scrollbar-thumb-cyan-500/30 scrollbar-track-slate-950/60 hover:scrollbar-thumb-cyan-500/50"
            : ""
        }`}
        style={{ scrollbarGutter: "stable" }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedMachines.map((machine) => {
            const pred = machine.prediction;
            const isCritical = pred.riskLevel === "Critical";
            const isHigh = pred.riskLevel === "High";

            return (
              <div
                key={machine.id}
                className={`flex flex-col justify-between p-4.5 rounded-xl transition-all space-y-3.5 ${
                  isCritical || isHigh
                    ? "bg-[#0f172a] border-2 border-amber-500/80 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/40"
                    : "bg-[#0f172a] border border-slate-700 hover:border-slate-600 shadow-md"
                }`}
              >
                <div className="space-y-3">
                  {/* Top header: Code, Name, Risk indicator */}
                  <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-800">
                    <div>
                      <span className="font-mono text-xs font-bold text-cyan-400 tracking-wider">
                        {machine.machineCode}
                      </span>
                      <h3 className="text-sm font-bold text-white tracking-wide mt-0.5">
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
                  <div className="p-2.5 rounded-lg bg-[#1e293b] border border-slate-700 text-xs space-y-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 block">
                      Primary Failure Risk Factor
                    </span>
                    <span className="font-bold text-amber-300 text-xs block">
                      {pred.mainRiskFactor}
                    </span>
                  </div>

                  {/* Prediction Explanation */}
                  <div className="p-2.5 rounded-lg bg-[#020617] border border-slate-800 text-xs">
                    <p className="text-white text-xs font-medium leading-relaxed">
                      {pred.prediction}
                    </p>
                  </div>

                  {/* Prescribed Action */}
                  <div className="p-3 rounded-lg bg-[#082f49] border border-cyan-500/60 text-xs space-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-cyan-300 block">
                      💡 Prescribed Maintenance Action:
                    </span>
                    <p className="text-white text-xs font-semibold leading-relaxed">
                      {pred.recommendedAction}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2.5 border-t border-slate-800 flex items-center justify-between gap-2 text-xs">
                  <button
                    onClick={() => onViewMachine(machine)}
                    className="text-xs font-bold text-cyan-400 hover:text-cyan-200 transition"
                  >
                    View Telemetry
                  </button>

                  <button
                    onClick={() => onScheduleMaintenance(machine)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold text-xs transition active:scale-95 ${
                      isCritical || isHigh
                        ? "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md font-extrabold"
                        : "bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 font-bold"
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
    </div>
  );
}
