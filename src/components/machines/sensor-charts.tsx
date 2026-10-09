"use client";

import React, { useState } from "react";
import { MachineItem } from "@/types/machines";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import {
  Thermometer,
  Activity,
  Zap,
  Cpu,
  Sliders,
  AlertTriangle,
} from "lucide-react";

interface SensorChartsProps {
  machines: MachineItem[];
  selectedMachineId: string;
  onSelectMachine: (id: string) => void;
}

export function SensorCharts({
  machines,
  selectedMachineId,
  onSelectMachine,
}: SensorChartsProps) {
  const selectedMachine =
    machines.find((m) => m.id === selectedMachineId) || machines[0];

  const data = selectedMachine?.sensorHistory || [];

  const CustomTempTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const temp = payload.find((p: any) => p.dataKey === "temperature")?.value || 0;
      const limit = payload.find((p: any) => p.dataKey === "temperatureThreshold")?.value || 0;

      return (
        <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 shadow-xl text-xs space-y-1 font-sans">
          <p className="font-bold text-white border-b border-slate-800 pb-1">Time: {label}</p>
          <div className="flex justify-between items-center gap-4 text-cyan-400">
            <span>Current Reading:</span>
            <span className="font-mono font-bold">{temp}°C</span>
          </div>
          <div className="flex justify-between items-center gap-4 text-slate-400 text-[10px]">
            <span>Safe Threshold:</span>
            <span className="font-mono">{limit}°C</span>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomVibTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const vib = payload.find((p: any) => p.dataKey === "vibration")?.value || 0;
      const limit = payload.find((p: any) => p.dataKey === "vibrationThreshold")?.value || 0;

      return (
        <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 shadow-xl text-xs space-y-1 font-sans">
          <p className="font-bold text-white border-b border-slate-800 pb-1">Time: {label}</p>
          <div className="flex justify-between items-center gap-4 text-rose-400">
            <span>RMS Vibration:</span>
            <span className="font-mono font-bold">{vib} mm/s</span>
          </div>
          <div className="flex justify-between items-center gap-4 text-slate-400 text-[10px]">
            <span>ISO 10816 Limit:</span>
            <span className="font-mono">{limit} mm/s</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800/90 shadow-md space-y-5">
      {/* Section Header & Machine Selector Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            Sensor Monitoring Telemetry (Last 24 Hours)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time IoT time-series signals for temperature fluctuations, vibration RMS velocity & motor load
          </p>
        </div>

        {/* Machine Pill Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
          {machines.map((m) => {
            const isSelected = m.id === selectedMachine?.id;
            return (
              <button
                key={m.id}
                onClick={() => onSelectMachine(m.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${isSelected
                    ? "bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20"
                    : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700"
                  }`}
              >
                {m.machineCode} • {m.machineName.split(" ")[0]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Machine Sensor Header info */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
        <div className="flex items-center gap-3">
          <span className="font-bold text-white text-sm font-mono text-cyan-400">
            {selectedMachine?.machineCode}
          </span>
          <span className="font-semibold text-slate-200">
            {selectedMachine?.machineName}
          </span>
          <span className="text-slate-400 hidden sm:inline">
            ({selectedMachine?.location})
          </span>
        </div>

        <div className="flex items-center gap-4 font-mono text-[11px]">
          <div>
            <span className="text-slate-500">Live Temp: </span>
            <strong className="text-white">{selectedMachine?.currentTemperature}°C</strong>
          </div>
          <div>
            <span className="text-slate-500">Live Vib: </span>
            <strong
              className={
                selectedMachine?.currentVibration > 3.0
                  ? "text-rose-400"
                  : "text-emerald-400"
              }
            >
              {selectedMachine?.currentVibration} mm/s
            </strong>
          </div>
          <div>
            <span className="text-slate-500">Motor Load: </span>
            <strong className="text-cyan-400">{selectedMachine?.currentMotorLoad}%</strong>
          </div>
        </div>
      </div>

      {/* 2 Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* 1. Temperature Telemetry (24h) */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/90 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Thermometer className="w-4 h-4 text-cyan-400" />
              Thermal Sensor Telemetry (°C)
            </h3>
            <span className="text-[10px] font-mono text-cyan-400">
              Safe Limit: {selectedMachine?.sensorHistory[0]?.temperatureThreshold}°C
            </span>
          </div>

          <div className="w-full h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="sensorTempGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
                <XAxis dataKey="hourLabel" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip content={<CustomTempTooltip />} />
                <Line
                  type="monotone"
                  dataKey="temperatureThreshold"
                  stroke="#f43f5e"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  dot={false}
                />
                <Area
                  type="monotone"
                  dataKey="temperature"
                  name="Temperature"
                  stroke="#06b6d4"
                  strokeWidth={2.5}
                  fill="url(#sensorTempGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Vibration Telemetry (24h) */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/90 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-rose-400" />
              Vibration RMS Velocity (mm/s)
            </h3>
            <span className="text-[10px] font-mono text-rose-400">
              ISO Limit: {selectedMachine?.sensorHistory[0]?.vibrationThreshold} mm/s
            </span>
          </div>

          <div className="w-full h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
                <XAxis dataKey="hourLabel" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip content={<CustomVibTooltip />} />
                <Line
                  type="monotone"
                  dataKey="vibrationThreshold"
                  name="Vibration Threshold"
                  stroke="#eab308"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="vibration"
                  name="Vibration RMS"
                  stroke={selectedMachine?.currentVibration > 3.0 ? "#f43f5e" : "#10b981"}
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "#10b981" }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
