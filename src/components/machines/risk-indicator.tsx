"use client";

import React from "react";
import { MachineRiskLevel, MachineStatus } from "@/types/machines";
import {
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Flame,
  Clock,
  Wrench,
  Activity,
} from "lucide-react";

export function MachineStatusBadge({ status }: { status: MachineStatus | string }) {
  const norm = (status || "").toLowerCase().trim();
  if (norm === "warning" || norm === "alert" || norm === "degraded") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-950/80 text-amber-400 border border-amber-800/80">
        <AlertTriangle className="w-3.5 h-3.5" />
        Warning
      </span>
    );
  }
  if (norm === "maintenance" || norm === "under maintenance" || norm === "repair" || norm === "offline") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-950/80 text-rose-400 border border-rose-800/80 animate-pulse">
        <Wrench className="w-3.5 h-3.5" />
        Maintenance
      </span>
    );
  }
  if (norm === "idle" || norm === "standby" || norm === "ready") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
        <Clock className="w-3.5 h-3.5" />
        Idle
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/80">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
      Running
    </span>
  );
}

export function RiskIndicator({
  riskLevel,
  riskScore,
  showMeter = true,
}: {
  riskLevel: MachineRiskLevel;
  riskScore: number;
  showMeter?: boolean;
}) {
  const getRiskColor = (level: MachineRiskLevel) => {
    switch (level) {
      case "Critical":
        return {
          text: "text-rose-300",
          bg: "bg-rose-500/20 text-rose-200 border-rose-500/60 shadow-sm",
          bar: "bg-rose-500",
        };
      case "High":
        return {
          text: "text-amber-300",
          bg: "bg-amber-500/20 text-amber-200 border-amber-500/60 shadow-sm",
          bar: "bg-amber-500",
        };
      case "Medium":
        return {
          text: "text-yellow-300",
          bg: "bg-yellow-500/20 text-yellow-200 border-yellow-500/60 shadow-sm",
          bar: "bg-yellow-500",
        };
      case "Low":
        return {
          text: "text-emerald-300",
          bg: "bg-emerald-500/20 text-emerald-200 border-emerald-500/60 shadow-sm",
          bar: "bg-emerald-500",
        };
      default:
        return {
          text: "text-cyan-300",
          bg: "bg-cyan-500/20 text-cyan-200 border-cyan-500/60 shadow-sm",
          bar: "bg-cyan-500",
        };
    }
  };

  const style = getRiskColor(riskLevel);

  const safeScore = Number(riskScore) || 0;

  return (
    <div className="inline-flex flex-col items-center gap-1">
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold font-mono border ${style.bg}`}
      >
        <span>{safeScore}%</span>
        <span>—</span>
        <span>{riskLevel || "Low"} Risk</span>
      </span>

      {showMeter && (
        <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${style.bar}`}
            style={{ width: `${Math.min(safeScore, 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}
