"use client";

import React from "react";
import { MachineStatusItem, MachineStatusType } from "@/types/dashboard";
import { Wrench, CheckCircle2, AlertTriangle, Clock, Activity } from "lucide-react";

interface MachineStatusCardProps {
  machines: MachineStatusItem[];
}

export function MachineStatusCard({ machines }: MachineStatusCardProps) {
  const getStatusBadge = (status: MachineStatusType) => {
    switch (status) {
      case "Running":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/80">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Running
          </span>
        );
      case "Warning":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-950/80 text-amber-400 border border-amber-800/80">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Warning
          </span>
        );
      case "Idle":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            Idle
          </span>
        );
      case "Maintenance":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-950/80 text-rose-400 border border-rose-800/80">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            Maintenance
          </span>
        );
      default:
        return null;
    }
  };

  const getUtilizationColor = (val: number, status: MachineStatusType) => {
    if (status === "Maintenance") return "bg-rose-500";
    if (status === "Warning") return "bg-amber-500";
    if (val >= 90) return "bg-cyan-500";
    if (val >= 70) return "bg-blue-500";
    return "bg-slate-500";
  };

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800/90 shadow-md flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Wrench className="w-4 h-4 text-cyan-400" />
            Machine Status
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Live telemetry & equipment utilization across plant lines
          </p>
        </div>
        <span className="text-xs font-mono text-cyan-400/80">
          {machines.length} Assets Monitored
        </span>
      </div>

      {/* Table / List View */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
              <th className="pb-2.5 font-semibold">Machine</th>
              <th className="pb-2.5 font-semibold">Status</th>
              <th className="pb-2.5 font-semibold">Utilization</th>
              <th className="pb-2.5 font-semibold text-right">Downtime</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {machines.map((machine) => (
              <tr key={machine.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="py-3 pr-2">
                  <div className="font-semibold text-white">{machine.name}</div>
                  <div className="text-[11px] text-slate-400 truncate max-w-[140px] sm:max-w-[200px]">
                    {machine.type}
                  </div>
                </td>

                <td className="py-3 px-2 whitespace-nowrap">
                  {getStatusBadge(machine.status)}
                </td>

                <td className="py-3 px-2">
                  <div className="w-28 sm:w-36">
                    <div className="flex justify-between items-center text-[11px] mb-1 font-mono">
                      <span className="text-slate-300 font-medium">
                        {machine.utilization}%
                      </span>
                      {machine.temperature && (
                        <span className="text-slate-500 text-[10px]">
                          {machine.temperature}
                        </span>
                      )}
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${getUtilizationColor(
                          machine.utilization,
                          machine.status
                        )}`}
                        style={{ width: `${machine.utilization}%` }}
                      />
                    </div>
                  </div>
                </td>

                <td className="py-3 pl-2 text-right whitespace-nowrap font-mono text-slate-300">
                  <span
                    className={
                      machine.downtime.startsWith("0")
                        ? "text-emerald-400"
                        : "text-amber-400 font-semibold"
                    }
                  >
                    {machine.downtime}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
