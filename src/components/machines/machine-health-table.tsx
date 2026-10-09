"use client";

import React from "react";
import { MachineItem } from "@/types/machines";
import { MachineStatusBadge, RiskIndicator } from "./risk-indicator";
import { MachineStatusDropdown } from "./machine-status-dropdown";
import {
  Eye,
  Wrench,
  Thermometer,
  Activity,
  Clock,
  Cpu,
  Calendar,
} from "lucide-react";

interface MachineHealthTableProps {
  machines: MachineItem[];
  onViewMachine: (machine: MachineItem) => void;
  onScheduleMaintenance?: (machine: MachineItem) => void;
  onUpdateStatus?: (machineId: string, newStatus: "Running" | "Idle" | "Maintenance" | "Warning") => void;
}

export function MachineHealthTable({
  machines,
  onViewMachine,
  onScheduleMaintenance,
  onUpdateStatus,
}: MachineHealthTableProps) {
  if (machines.length === 0) {
    return (
      <div className="p-8 rounded-2xl bg-slate-900/80 border border-slate-800 text-center space-y-2">
        <Cpu className="w-8 h-8 text-slate-500 mx-auto" />
        <h3 className="text-sm font-semibold text-white">No machines found</h3>
        <p className="text-xs text-slate-400">
          Try adjusting your search criteria or resetting your active filters.
        </p>
      </div>
    );
  }

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800/90 shadow-md space-y-4">
      {/* Table Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            Machine Health & Sensor Master
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time thermal metrics, vibration thresholds, maintenance intervals & failure risk
          </p>
        </div>
        <span className="text-xs font-mono text-cyan-400/80">
          {machines.length} Equipment Registered
        </span>
      </div>

      {/* Desktop & Tablet Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
              <th className="pb-3 font-semibold">Machine</th>
              <th className="pb-3 font-semibold">Status</th>
              <th className="pb-3 font-semibold text-right">Temperature</th>
              <th className="pb-3 font-semibold text-right">Vibration</th>
              <th className="pb-3 font-semibold text-right">Operating Hrs</th>
              <th className="pb-3 font-semibold text-right">Downtime</th>
              <th className="pb-3 font-semibold text-center">Last Maint.</th>
              <th className="pb-3 font-semibold text-center">Next Maint.</th>
              <th className="pb-3 font-semibold text-center">Risk Level</th>
              <th className="pb-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {machines.map((machine) => {
              const tempLimit = machine.sensorHistory?.[0]?.temperatureThreshold ?? 85;
              const vibLimit = machine.sensorHistory?.[0]?.vibrationThreshold ?? 4.0;
              const isHighTemp = machine.currentTemperature >= tempLimit || machine.status === "Warning";
              const isHighVib = machine.currentVibration >= vibLimit || (machine.status === "Warning" && machine.currentVibration > 3.5);

              return (
                <tr
                  key={machine.id}
                  className="hover:bg-slate-800/40 transition-colors group"
                >
                  {/* Machine Code & Name */}
                  <td className="py-3.5 pr-3 whitespace-nowrap">
                    <div className="font-mono font-bold text-cyan-400">
                      {machine.machineCode}
                    </div>
                    <div className="font-semibold text-white">
                      {machine.machineName}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {machine.machineType}
                    </div>
                  </td>

                  {/* Status Badge with Interactive Dropdown */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    {onUpdateStatus ? (
                      <MachineStatusDropdown
                        machineId={machine.id}
                        status={machine.status}
                        onStatusChange={onUpdateStatus}
                      />
                    ) : (
                      <MachineStatusBadge status={machine.status} />
                    )}
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                      {machine.utilization}% util.
                    </div>
                  </td>

                  {/* Temperature */}
                  <td className="py-3.5 px-3 text-right whitespace-nowrap">
                    <div
                      className={`font-mono font-bold ${
                        machine.status === "Maintenance"
                          ? "text-slate-500"
                          : isHighTemp
                          ? "text-amber-400 font-extrabold"
                          : "text-slate-200"
                      }`}
                    >
                      {machine.status === "Maintenance"
                        ? "Offline"
                        : `${Number(machine.currentTemperature ?? 0).toFixed(1)}°C`}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {machine.status === "Maintenance" ? "Ambient" : "Thermal sensor"}
                    </div>
                  </td>

                  {/* Vibration */}
                  <td className="py-3.5 px-3 text-right whitespace-nowrap">
                    <div
                      className={`font-mono font-bold ${
                        machine.status === "Maintenance"
                          ? "text-slate-500"
                          : isHighVib
                          ? "text-rose-400 font-extrabold"
                          : "text-emerald-400"
                      }`}
                    >
                      {machine.status === "Maintenance"
                        ? "0.0 mm/s"
                        : `${Number(machine.currentVibration ?? 0).toFixed(2)} mm/s`}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {machine.status === "Maintenance" ? "Static" : "RMS velocity"}
                    </div>
                  </td>

                  {/* Operating Hours */}
                  <td className="py-3.5 px-3 text-right font-mono text-slate-300 whitespace-nowrap">
                    {Number(machine.operatingHours ?? 0).toLocaleString()} hrs
                  </td>

                  {/* Downtime */}
                  <td className="py-3.5 px-3 text-right whitespace-nowrap font-mono">
                    <span
                      className={
                        (Number(machine.downtimeMinutes) || 0) > 30
                          ? "text-rose-400 font-bold"
                          : (Number(machine.downtimeMinutes) || 0) > 0
                          ? "text-amber-400"
                          : "text-emerald-400"
                      }
                    >
                      {machine.downtimeMinutes ?? 0} mins
                    </span>
                  </td>

                  {/* Last Maintenance */}
                  <td className="py-3.5 px-3 text-center text-slate-400 whitespace-nowrap font-mono text-[11px]">
                    {machine.lastMaintenanceDate}
                  </td>

                  {/* Next Maintenance */}
                  <td className="py-3.5 px-3 text-center whitespace-nowrap font-mono text-[11px]">
                    <span
                      className={
                        machine.nextMaintenanceDate === "2026-10-01"
                          ? "text-rose-400 font-bold"
                          : machine.nextMaintenanceDate === "2026-10-02"
                          ? "text-amber-400 font-semibold"
                          : "text-slate-300"
                      }
                    >
                      {machine.nextMaintenanceDate}
                    </span>
                  </td>

                  {/* Risk Level & Score */}
                  <td className="py-3.5 px-3 text-center whitespace-nowrap">
                    <RiskIndicator
                      riskLevel={machine.riskLevel}
                      riskScore={Number(machine.riskScore ?? 0)}
                    />
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 pl-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end">
                      {/* View details */}
                      <button
                        onClick={() => onViewMachine(machine)}
                        className="p-1.5 rounded-lg bg-cyan-950/90 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/60 transition shadow-sm cursor-pointer"
                        title="View Telemetry & Maintenance History"
                        aria-label="View Machine"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Layout */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {machines.map((machine) => (
          <div
            key={machine.id}
            className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="font-mono text-xs font-bold text-cyan-400">
                  {machine.machineCode}
                </span>
                <h3 className="text-sm font-semibold text-white mt-0.5">
                  {machine.machineName}
                </h3>
                <span className="text-[11px] text-slate-400">
                  {machine.machineType}
                </span>
              </div>
              <div className="flex flex-col items-end gap-1">
                {onUpdateStatus ? (
                  <MachineStatusDropdown
                    machineId={machine.id}
                    status={machine.status}
                    onStatusChange={onUpdateStatus}
                  />
                ) : (
                  <MachineStatusBadge status={machine.status} />
                )}
                <span className="text-[10px] font-mono text-slate-400">
                  {machine.utilization}% util.
                </span>
              </div>
            </div>

            {/* Sensor numbers grid */}
            <div className="grid grid-cols-3 gap-2 text-xs py-2 border-y border-slate-800/80">
              <div>
                <span className="text-[10px] uppercase text-slate-500 block">Temperature</span>
                <span className="font-mono font-bold text-slate-200">
                  {machine.status === "Maintenance" ? "Offline" : `${Number(machine.currentTemperature ?? 0).toFixed(1)}°C`}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-slate-500 block">Vibration</span>
                <span
                  className={`font-mono font-bold ${
                    Number(machine.currentVibration ?? 0) > 3.0 ? "text-rose-400" : "text-emerald-400"
                  }`}
                >
                  {machine.status === "Maintenance" ? "0.0 mm/s" : `${Number(machine.currentVibration ?? 0).toFixed(2)} mm/s`}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-slate-500 block">Risk Score</span>
                <span className="font-mono font-bold text-orange-400">
                  {Number(machine.riskScore ?? 0)}%
                </span>
              </div>
            </div>

            {/* Next maintenance date */}
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Next Maintenance:</span>
              <span className="font-mono text-cyan-400 font-semibold">
                {machine.nextMaintenanceDate}
              </span>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={() => onViewMachine(machine)}
                className="w-full px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-xs font-semibold text-white border border-cyan-600 flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-white" />
                <span>View Details</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
