"use client";

import React, { useState } from "react";
import { MachineItem, MaintenanceRecord } from "@/types/machines";
import { MachineStatusBadge } from "./risk-indicator";
import { RiskIndicator } from "./risk-indicator";
import {
  X,
  Cpu,
  Thermometer,
  Activity,
  Zap,
  Gauge,
  Calendar,
  Clock,
  MapPin,
  Wrench,
  Sparkles,
  History,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Info,
} from "lucide-react";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface MachineDetailsProps {
  machine: MachineItem | null;
  isOpen: boolean;
  onClose: () => void;
  onScheduleMaintenance: (machineId: string) => void;
}

export function MachineDetails({
  machine,
  isOpen,
  onClose,
  onScheduleMaintenance,
}: MachineDetailsProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "sensors" | "history">("overview");

  if (!isOpen || !machine) return null;

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-800 bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {machine.machineName}
                </h2>
                <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800/50">
                  {machine.machineCode}
                </span>
                <MachineStatusBadge status={machine.status} />
              </div>
              <p className="text-xs sm:text-sm text-slate-400 flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  {machine.location}
                </span>
                <span>•</span>
                <span>{machine.machineType}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onScheduleMaintenance(machine.id)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors shadow-sm"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Schedule MNT</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-800 bg-slate-950/40 shrink-0">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "overview"
                ? "border-cyan-400 text-cyan-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Gauge className="w-3.5 h-3.5" />
            <span>Overview & Sensors</span>
          </button>
          <button
            onClick={() => setActiveTab("sensors")}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "sensors"
                ? "border-cyan-400 text-cyan-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Health Trends (24h)</span>
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "history"
                ? "border-cyan-400 text-cyan-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Maintenance History ({machine.maintenanceHistory.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === "overview" && (
            <>
              {/* Machine Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800">
                  <div className="text-xs text-slate-400 flex items-center gap-1 mb-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>Installation Date</span>
                  </div>
                  <div className="text-sm font-semibold text-slate-200">
                    {formatDate(machine.installationDate)}
                  </div>
                </div>

                <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800">
                  <div className="text-xs text-slate-400 flex items-center gap-1 mb-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Operating Hours</span>
                  </div>
                  <div className="text-sm font-semibold text-white">
                    {machine.operatingHours.toLocaleString()} hrs
                  </div>
                </div>

                <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800">
                  <div className="text-xs text-slate-400 flex items-center gap-1 mb-1">
                    <History className="w-3.5 h-3.5 text-slate-500" />
                    <span>Last Maintenance</span>
                  </div>
                  <div className="text-sm font-semibold text-slate-200">
                    {formatDate(machine.lastMaintenanceDate)}
                  </div>
                </div>

                <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800">
                  <div className="text-xs text-slate-400 flex items-center gap-1 mb-1">
                    <Wrench className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Next Maintenance</span>
                  </div>
                  <div className="text-sm font-semibold text-cyan-300">
                    {formatDate(machine.nextMaintenanceDate)}
                  </div>
                </div>
              </div>

              {/* Current Sensor Readings */}
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span>Current Sensor Readings</span>
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                  {/* Temperature */}
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 relative overflow-hidden">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span className="flex items-center gap-1.5">
                        <Thermometer className="w-4 h-4 text-rose-400" />
                        Temperature
                      </span>
                      <span className="font-mono text-[11px] text-slate-500">24h Peak: 92°C</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-white">
                        {machine.currentTemperature}
                      </span>
                      <span className="text-xs text-slate-400">°C</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          machine.currentTemperature > 100
                            ? "bg-rose-500"
                            : machine.currentTemperature > 75
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                        }`}
                        style={{ width: `${Math.min(100, (machine.currentTemperature / 250) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Vibration */}
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 relative overflow-hidden">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span className="flex items-center gap-1.5">
                        <Activity className="w-4 h-4 text-cyan-400" />
                        Vibration (RMS)
                      </span>
                      <span className="font-mono text-[11px] text-slate-500">ISO 10816</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-white">
                        {machine.currentVibration}
                      </span>
                      <span className="text-xs text-slate-400">mm/s</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          machine.currentVibration > 4.5
                            ? "bg-rose-500"
                            : machine.currentVibration > 3.0
                            ? "bg-amber-500"
                            : "bg-cyan-500"
                        }`}
                        style={{ width: `${Math.min(100, (machine.currentVibration / 6) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Motor Load */}
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 relative overflow-hidden">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span className="flex items-center gap-1.5">
                        <Gauge className="w-4 h-4 text-amber-400" />
                        Motor Load
                      </span>
                      <span className="font-mono text-[11px] text-slate-500">Nominal: 75%</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-white">
                        {machine.currentMotorLoad}
                      </span>
                      <span className="text-xs text-slate-400">%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          machine.currentMotorLoad > 90
                            ? "bg-rose-500"
                            : machine.currentMotorLoad > 75
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                        }`}
                        style={{ width: `${machine.currentMotorLoad}%` }}
                      />
                    </div>
                  </div>

                  {/* Power Consumption */}
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 relative overflow-hidden">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span className="flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-yellow-400" />
                        Power Consumption
                      </span>
                      <span className="font-mono text-[11px] text-slate-500">3-Phase kW</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-white">
                        {machine.currentPower}
                      </span>
                      <span className="text-xs text-slate-400">kW</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                      <div
                        className="h-full bg-yellow-500 transition-all"
                        style={{ width: `${Math.min(100, (machine.currentPower / 60) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Prediction Box */}
              <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/20">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-cyan-300">
                      Predictive Failure Analysis (Prototype AI)
                    </span>
                  </div>
                  <RiskIndicator riskScore={machine.prediction.riskScore} riskLevel={machine.prediction.riskLevel} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block mb-1">Main Risk Factor</span>
                    <p className="text-slate-200 font-medium bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                      {machine.prediction.mainRiskFactor}
                    </p>
                    <span className="text-slate-400 block mt-2.5 mb-1">Health Pattern Prediction</span>
                    <p className="text-slate-300 bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                      &quot;{machine.prediction.prediction}&quot;
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-1">Recommended Action</span>
                    <p className="text-cyan-200 font-medium bg-cyan-950/30 p-2.5 rounded-lg border border-cyan-900/40">
                      {machine.prediction.recommendedAction}
                    </p>
                    <div className="mt-2.5 flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400">
                      <span>Prediction Window: <strong className="text-white">{machine.prediction.predictedFailureWindow}</strong></span>
                      <span>Confidence: <strong className="text-cyan-400">{machine.prediction.confidenceScore}%</strong></span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === "sensors" && (
            <div className="space-y-6">
              {/* Temperature Trend */}
              <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Thermometer className="w-4 h-4 text-rose-400" />
                    <h4 className="text-sm font-semibold text-white">Temperature Profile (24h Trend)</h4>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">Limit: {machine.sensorHistory[0]?.temperatureThreshold}°C</span>
                </div>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={machine.sensorHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="detTempGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="hourLabel" stroke="#64748b" fontSize={11} />
                      <YAxis stroke="#64748b" fontSize={11} domain={["dataMin - 5", "dataMax + 10"]} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px" }}
                        formatter={(val: any) => [`${val} °C`, "Temperature"]}
                      />
                      <Area type="monotone" dataKey="temperature" stroke="#f43f5e" strokeWidth={2} fill="url(#detTempGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Vibration Trend */}
              <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    <h4 className="text-sm font-semibold text-white">Vibration Velocity (24h Trend)</h4>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">Limit: {machine.sensorHistory[0]?.vibrationThreshold} mm/s</span>
                </div>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={machine.sensorHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="detVibGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="hourLabel" stroke="#64748b" fontSize={11} />
                      <YAxis stroke="#64748b" fontSize={11} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px" }}
                        formatter={(val: any) => [`${val} mm/s`, "Vibration"]}
                      />
                      <Area type="monotone" dataKey="vibration" stroke="#06b6d4" strokeWidth={2} fill="url(#detVibGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Motor Load Trend */}
              <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-amber-400" />
                    <h4 className="text-sm font-semibold text-white">Motor Load (%) & Power Draw (kW)</h4>
                  </div>
                </div>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={machine.sensorHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="hourLabel" stroke="#64748b" fontSize={11} />
                      <YAxis stroke="#64748b" fontSize={11} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px" }}
                      />
                      <Line type="monotone" dataKey="motorLoad" name="Motor Load %" stroke="#f59e0b" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="powerConsumption" name="Power kW" stroke="#10b981" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeTab === "history" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Service Logs & Work Orders
                </h3>
                <button
                  onClick={() => onScheduleMaintenance(machine.id)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>+ Add Service Record</span>
                </button>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                      <th className="py-3 px-4">Maintenance ID</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Description</th>
                      <th className="py-3 px-4">Technician</th>
                      <th className="py-3 px-4">Downtime</th>
                      <th className="py-3 px-4">Cost</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {machine.maintenanceHistory.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-6 text-center text-slate-500">
                          No prior maintenance records found for this equipment.
                        </td>
                      </tr>
                    ) : (
                      machine.maintenanceHistory.map((rec) => (
                        <tr key={rec.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-4 font-mono text-cyan-400 font-semibold">
                            {rec.maintenanceId}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">{formatDate(rec.date)}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                                rec.type === "Preventive"
                                  ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
                                  : rec.type === "Corrective"
                                  ? "bg-rose-500/15 text-rose-300 border border-rose-500/30"
                                  : "bg-purple-500/15 text-purple-300 border border-purple-500/30"
                              }`}
                            >
                              {rec.type}
                            </span>
                          </td>
                          <td className="py-3 px-4 max-w-xs">{rec.description}</td>
                          <td className="py-3 px-4 whitespace-nowrap font-medium text-slate-200">
                            {rec.technician}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap font-mono">
                            {rec.downtimeHours} hrs
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap font-mono font-semibold text-emerald-400">
                            ${rec.cost.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                                rec.status === "Completed"
                                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                  : rec.status === "In Progress"
                                  ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                                  : "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                              }`}
                            >
                              {rec.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>
            Database schema target: <code className="text-cyan-400">machines</code> & <code className="text-cyan-400">machine_sensor_readings</code>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}
