"use client";

import React, { useState, useEffect, useRef } from "react";
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
  const modalBodyRef = useRef<HTMLDivElement>(null);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Native non-passive wheel listener to guarantee mouse wheel scrolling inside the modal
  useEffect(() => {
    const bodyEl = modalBodyRef.current;
    if (!isOpen || !bodyEl) return;

    const onWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        e.stopPropagation();
        bodyEl.scrollTop += e.deltaY;
      }
    };

    bodyEl.addEventListener("wheel", onWheel, { passive: false });
    return () => bodyEl.removeEventListener("wheel", onWheel);
  }, [isOpen]);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm">
      <div
        style={{ backgroundColor: "#ffffff" }}
        className="relative w-full max-w-5xl border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-900"
      >
        {/* Header Bar */}
        <div
          style={{ backgroundColor: "#ffffff" }}
          className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-200 shrink-0"
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-50/80 border border-cyan-200 text-cyan-500 flex items-center justify-center shadow-sm">
              <Cpu className="w-6 h-6 text-cyan-500" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  {machine.machineName}
                </h2>
                <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-[#0e7490] text-cyan-100 font-bold border border-cyan-700 shadow-xs">
                  {machine.machineCode}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#78350f] text-amber-100 font-bold border border-amber-900/40 shadow-xs">
                  {machine.machineType}
                </span>
                <MachineStatusBadge status={machine.status} />
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                <span className="font-mono">ID: {machine.machineCode}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {machine.location}
                </span>
                <span>•</span>
                <span>Bakery Core</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onScheduleMaintenance(machine.id)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#06b6d4] hover:bg-[#0891b2] active:bg-[#0e7490] text-white transition-all shadow-sm cursor-pointer"
            >
              <Wrench className="w-3.5 h-3.5 text-white" />
              <span>Schedule MNT</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Selector */}
        <div
          style={{ backgroundColor: "#ffffff" }}
          className="flex items-center gap-6 px-6 pt-1 border-b border-slate-200 shrink-0"
        >
          <button
            onClick={() => setActiveTab("overview")}
            className={`py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "overview"
                ? "border-cyan-500 text-cyan-500 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Gauge className="w-3.5 h-3.5" />
            <span>Overview & Sensors</span>
          </button>
          <button
            onClick={() => setActiveTab("sensors")}
            className={`py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "sensors"
                ? "border-cyan-500 text-cyan-500 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Health Trends (24h)</span>
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "history"
                ? "border-cyan-500 text-cyan-500 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Maintenance History ({machine.maintenanceHistory.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div
          style={{ backgroundColor: "#ffffff" }}
          ref={modalBodyRef}
          className="p-6 overflow-y-auto overscroll-contain space-y-6 flex-1 min-h-0 bg-slate-50/50"
        >
          {activeTab === "overview" && (
            <>
              {/* Machine Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div style={{ backgroundColor: "#ffffff" }} className="p-4 rounded-xl border border-slate-200 shadow-xs">
                  <div className="text-xs text-slate-500 flex items-center gap-1.5 mb-1 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Installation Date</span>
                  </div>
                  <div className="text-sm font-bold text-slate-900">
                    {formatDate(machine.installationDate)}
                  </div>
                </div>

                <div style={{ backgroundColor: "#ffffff" }} className="p-4 rounded-xl border border-slate-200 shadow-xs">
                  <div className="text-xs text-slate-500 flex items-center gap-1.5 mb-1 font-medium">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Operating Hours</span>
                  </div>
                  <div className="text-sm font-bold text-slate-900">
                    {machine.operatingHours.toLocaleString()} hrs
                  </div>
                </div>

                <div style={{ backgroundColor: "#ffffff" }} className="p-4 rounded-xl border border-slate-200 shadow-xs">
                  <div className="text-xs text-slate-500 flex items-center gap-1.5 mb-1 font-medium">
                    <History className="w-3.5 h-3.5 text-slate-400" />
                    <span>Last Maintenance</span>
                  </div>
                  <div className="text-sm font-bold text-slate-900">
                    {formatDate(machine.lastMaintenanceDate)}
                  </div>
                </div>

                <div style={{ backgroundColor: "#ffffff" }} className="p-4 rounded-xl border border-slate-200 shadow-xs">
                  <div className="text-xs text-cyan-600 flex items-center gap-1.5 mb-1 font-medium">
                    <Clock className="w-3.5 h-3.5 text-cyan-500" />
                    <span>Next Maintenance</span>
                  </div>
                  <div className="text-sm font-bold text-cyan-600">
                    {formatDate(machine.nextMaintenanceDate)}
                  </div>
                </div>
              </div>

              {/* Current Sensor Readings */}
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-500" />
                  <span>Current Sensor Readings</span>
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                  {/* Temperature */}
                  <div style={{ backgroundColor: "#ffffff" }} className="p-4 rounded-xl border border-slate-200 shadow-xs relative">
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-2 font-medium">
                      <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                        <Thermometer className="w-3.5 h-3.5 text-rose-500" />
                        Temperature
                      </span>
                      <span className="font-mono text-[11px] text-slate-400">Target: 200 - 220 °C</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold text-slate-900">
                        {machine.currentTemperature}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">°C</span>
                    </div>
                    <div className="w-full bg-slate-900 h-1.5 rounded-full mt-3 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-pink-500 to-rose-500 transition-all"
                        style={{ width: `${Math.min(100, (machine.currentTemperature / 250) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Vibration */}
                  <div style={{ backgroundColor: "#ffffff" }} className="p-4 rounded-xl border border-slate-200 shadow-xs relative">
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-2 font-medium">
                      <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                        <Activity className="w-3.5 h-3.5 text-cyan-500" />
                        Vibration (RMS)
                      </span>
                      <span className="font-mono text-[11px] text-slate-400">Max: 5.0 mm/s</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold text-slate-900">
                        {machine.currentVibration}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">mm/s</span>
                    </div>
                    <div className="w-full bg-slate-900 h-1.5 rounded-full mt-3 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-pink-500 to-rose-600 transition-all"
                        style={{ width: `${Math.min(100, (machine.currentVibration / 6) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Motor Load */}
                  <div style={{ backgroundColor: "#ffffff" }} className="p-4 rounded-xl border border-slate-200 shadow-xs relative">
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-2 font-medium">
                      <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                        <Gauge className="w-3.5 h-3.5 text-amber-500" />
                        Motor Load
                      </span>
                      <span className="font-mono text-[11px] text-slate-400">Nominal: 60 - 85%</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold text-slate-900">
                        {machine.currentMotorLoad}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">%</span>
                    </div>
                    <div className="w-full bg-slate-900 h-1.5 rounded-full mt-3 overflow-hidden">
                      <div
                        className="h-full bg-amber-500 transition-all"
                        style={{ width: `${machine.currentMotorLoad}%` }}
                      />
                    </div>
                  </div>

                  {/* Power Consumption */}
                  <div style={{ backgroundColor: "#ffffff" }} className="p-4 rounded-xl border border-slate-200 shadow-xs relative">
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-2 font-medium">
                      <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                        <Zap className="w-3.5 h-3.5 text-yellow-500" />
                        Power Consumption
                      </span>
                      <span className="font-mono text-[11px] text-slate-400">Nominal: 45 - 55 kW</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold text-slate-900">
                        {machine.currentPower}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">kW</span>
                    </div>
                    <div className="w-full bg-slate-900 h-1.5 rounded-full mt-3 overflow-hidden">
                      <div
                        className="h-full bg-amber-500 transition-all"
                        style={{ width: `${Math.min(100, (machine.currentPower / 60) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Next Scheduled Preventive Maintenance / AI Analysis Box */}
              <div style={{ backgroundColor: "#ffffff" }} className="p-5 rounded-xl border border-slate-200 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-500" />
                    <span className="text-xs font-bold uppercase tracking-wider text-cyan-600">
                      Next Scheduled Preventive Maintenance
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-3 py-1 rounded-full bg-[#78350f] text-amber-100 font-bold border border-amber-900/40 shadow-xs">
                      Due: {formatDate(machine.nextMaintenanceDate)} (Risk: {machine.prediction.riskLevel.toUpperCase()})
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-slate-500 block mb-1 font-bold">
                      Main Tasks & Risk Factors:
                    </span>
                    <p style={{ backgroundColor: "#f8fafc" }} className="text-slate-800 font-medium p-3 rounded-xl border border-slate-200">
                      {machine.prediction.mainRiskFactor}
                    </p>
                    <span className="text-[11px] uppercase tracking-wider text-slate-500 block mt-3 mb-1 font-bold">
                      Health Pattern Prediction:
                    </span>
                    <p style={{ backgroundColor: "#f8fafc" }} className="text-slate-700 p-3 rounded-xl border border-slate-200 leading-relaxed">
                      &quot;{machine.prediction.prediction}&quot;
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-slate-500 block mb-1 font-bold">
                      Recommended Action:
                    </span>
                    <p style={{ backgroundColor: "#f1f5f9" }} className="text-slate-800 font-medium p-3 rounded-xl border border-slate-200 leading-relaxed">
                      {machine.prediction.recommendedAction}
                    </p>
                    <div style={{ backgroundColor: "#f8fafc" }} className="mt-3 flex items-center justify-between p-3 rounded-xl border border-slate-200 text-slate-600">
                      <span>Prediction Window: <strong className="text-slate-900 font-bold">{machine.prediction.predictedFailureWindow}</strong></span>
                      <span>Confidence: <strong className="text-cyan-600 font-bold">{machine.prediction.confidenceScore}%</strong></span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === "sensors" && (
            <div className="space-y-6">
              {/* Temperature Trend */}
              <div style={{ backgroundColor: "#ffffff" }} className="p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Thermometer className="w-4 h-4 text-rose-500" />
                    <h4 className="text-sm font-bold text-slate-900">Temperature Profile (24h Trend)</h4>
                  </div>
                  <span className="text-xs text-slate-500 font-mono">Limit: {machine.sensorHistory[0]?.temperatureThreshold}°C</span>
                </div>
                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={machine.sensorHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="detTempGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="hourLabel" stroke="#64748b" fontSize={11} />
                      <YAxis stroke="#64748b" fontSize={11} domain={["dataMin - 5", "dataMax + 10"]} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "10px", color: "#f8fafc" }}
                        formatter={(val: any) => [`${val} °C`, "Temperature"]}
                      />
                      <Area type="monotone" dataKey="temperature" stroke="#f43f5e" strokeWidth={2.5} fill="url(#detTempGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Vibration Trend */}
              <div style={{ backgroundColor: "#ffffff" }} className="p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-cyan-600" />
                    <h4 className="text-sm font-bold text-slate-900">Vibration Velocity (24h Trend)</h4>
                  </div>
                  <span className="text-xs text-slate-500 font-mono">Limit: {machine.sensorHistory[0]?.vibrationThreshold} mm/s</span>
                </div>
                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={machine.sensorHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="detVibGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="hourLabel" stroke="#64748b" fontSize={11} />
                      <YAxis stroke="#64748b" fontSize={11} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "10px", color: "#f8fafc" }}
                        formatter={(val: any) => [`${val} mm/s`, "Vibration"]}
                      />
                      <Area type="monotone" dataKey="vibration" stroke="#06b6d4" strokeWidth={2.5} fill="url(#detVibGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Motor Load Trend */}
              <div style={{ backgroundColor: "#ffffff" }} className="p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-amber-500" />
                    <h4 className="text-sm font-bold text-slate-900">Motor Load (%) & Power Draw (kW)</h4>
                  </div>
                </div>
                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={machine.sensorHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="hourLabel" stroke="#64748b" fontSize={11} />
                      <YAxis stroke="#64748b" fontSize={11} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "10px", color: "#f8fafc" }}
                      />
                      <Line type="monotone" dataKey="motorLoad" name="Motor Load %" stroke="#f59e0b" strokeWidth={2.5} dot={false} />
                      <Line type="monotone" dataKey="powerConsumption" name="Power kW" stroke="#10b981" strokeWidth={2.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeTab === "history" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Service Logs & Work Orders
                </h3>
                <button
                  onClick={() => onScheduleMaintenance(machine.id)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-600 text-slate-950 transition-colors cursor-pointer shadow-sm"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>+ Add Service Record</span>
                </button>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm" style={{ backgroundColor: "#ffffff" }}>
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr style={{ backgroundColor: "#f8fafc" }} className="border-b border-slate-200 text-slate-600 uppercase tracking-wider font-bold">
                      <th className="py-3.5 px-4">Maintenance ID</th>
                      <th className="py-3.5 px-4">Date</th>
                      <th className="py-3.5 px-4">Type</th>
                      <th className="py-3.5 px-4">Description</th>
                      <th className="py-3.5 px-4">Technician</th>
                      <th className="py-3.5 px-4">Downtime</th>
                      <th className="py-3.5 px-4">Cost</th>
                      <th className="py-3.5 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    {machine.maintenanceHistory.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-slate-400 font-medium">
                          No prior maintenance records found for this equipment.
                        </td>
                      </tr>
                    ) : (
                      machine.maintenanceHistory.map((rec) => (
                        <tr key={rec.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3.5 px-4 font-mono text-cyan-600 font-bold">
                            {rec.maintenanceId}
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 font-medium">{formatDate(rec.date)}</td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                                rec.type === "Preventive"
                                  ? "bg-cyan-50 text-cyan-700 border-cyan-200"
                                  : rec.type === "Corrective"
                                  ? "bg-rose-50 text-rose-700 border-rose-200"
                                  : "bg-purple-50 text-purple-700 border-purple-200"
                              }`}
                            >
                              {rec.type}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 max-w-xs text-slate-700 font-medium">{rec.description}</td>
                          <td className="py-3.5 px-4 whitespace-nowrap font-bold text-slate-900">
                            {rec.technician}
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap font-mono text-slate-700 font-medium">
                            {rec.downtimeHours} hrs
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap font-mono font-bold text-emerald-600">
                            ${rec.cost.toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                                rec.status === "Completed"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : rec.status === "In Progress"
                                  ? "bg-amber-50 text-amber-700 border-amber-200"
                                  : "bg-blue-50 text-blue-700 border-blue-200"
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
        <div
          style={{ backgroundColor: "#ffffff" }}
          className="p-4 border-t border-slate-200 flex items-center justify-end text-xs text-slate-500 shrink-0"
        >
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-50/50 hover:bg-cyan-100/60 border border-cyan-200 text-cyan-700 font-semibold transition-all shadow-xs cursor-pointer"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}
