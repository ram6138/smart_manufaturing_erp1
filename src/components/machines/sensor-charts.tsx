"use client";

import React from "react";
import { MachineItem } from "@/types/machines";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
} from "recharts";
import {
  Thermometer,
  Activity,
  Zap,
  Radio,
  Gauge,
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

  const isVibHigh = (selectedMachine?.currentVibration || 0) > 3.5;
  const isTempHigh =
    (selectedMachine?.currentTemperature || 0) >=
    (selectedMachine?.sensorHistory?.[0]?.temperatureThreshold || 200);

  const CustomTempTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const temp = payload.find((p: any) => p.dataKey === "temperature")?.value || 0;
      const limit = payload.find((p: any) => p.dataKey === "temperatureThreshold")?.value || 0;

      return (
        <div className="p-3.5 rounded-xl bg-slate-950/95 border border-cyan-500/40 shadow-2xl backdrop-blur-md text-xs space-y-2 min-w-[170px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span className="text-[11px] font-mono text-slate-400">Timestamp</span>
            <span className="font-mono font-bold text-white">{label}</span>
          </div>
          <div className="flex justify-between items-center text-cyan-300">
            <span className="flex items-center gap-1.5 font-medium">
              <Thermometer className="w-3.5 h-3.5 text-cyan-400" /> Temperature:
            </span>
            <span className="font-mono font-bold text-sm text-cyan-300">{temp}°C</span>
          </div>
          <div className="flex justify-between items-center text-slate-400 text-[10px]">
            <span>Safe Limit:</span>
            <span className="font-mono text-rose-400 font-semibold">{limit}°C</span>
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
        <div className="p-3.5 rounded-xl bg-slate-950/95 border border-rose-500/40 shadow-2xl backdrop-blur-md text-xs space-y-2 min-w-[170px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span className="text-[11px] font-mono text-slate-400">Timestamp</span>
            <span className="font-mono font-bold text-white">{label}</span>
          </div>
          <div className="flex justify-between items-center text-rose-300">
            <span className="flex items-center gap-1.5 font-medium">
              <Activity className="w-3.5 h-3.5 text-rose-400" /> RMS Velocity:
            </span>
            <span className="font-mono font-bold text-sm text-rose-400">{vib} mm/s</span>
          </div>
          <div className="flex justify-between items-center text-slate-400 text-[10px]">
            <span>ISO Limit:</span>
            <span className="font-mono text-amber-400 font-semibold">{limit} mm/s</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-5 sm:p-7 rounded-2xl bg-[#0b1329] border border-slate-800/90 shadow-2xl space-y-6">
      {/* 1. Header & Machine Segmented Tab Navigation */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Sensor Monitoring Telemetry (Last 24 Hours)
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Real-time IoT time-series signals for temperature fluctuations, vibration RMS velocity & motor load
          </p>
        </div>

        {/* Segmented Machine Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 p-1 bg-slate-950/80 rounded-xl border border-slate-800/90 max-w-full">
          {machines.map((m) => {
            const isSelected = m.id === selectedMachine?.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => onSelectMachine(m.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold shadow-md shadow-cyan-500/30 ring-1 ring-cyan-400/50"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                }`}
              >
                <span className="font-mono">{m.machineCode}</span>
                <span className="opacity-80 ml-1">• {m.machineName.split(" ")[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Active Machine Telemetry HUD Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 shadow-inner">
        {/* Machine Identity */}
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 rounded-lg bg-cyan-500/15 border border-cyan-500/30 font-mono font-extrabold text-sm text-cyan-300 tracking-wide shadow-sm">
            {selectedMachine?.machineCode}
          </span>
          <div>
            <div className="font-bold text-white text-sm flex items-center gap-2">
              <span>{selectedMachine?.machineName}</span>
              <span className="text-xs font-normal text-slate-400 hidden sm:inline">
                ({selectedMachine?.location})
              </span>
            </div>
          </div>
        </div>

        {/* Real-time Telemetry Stats Chips */}
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap text-xs">
          {/* Live Temp */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800">
            <Thermometer className={`w-3.5 h-3.5 ${isTempHigh ? "text-rose-400 animate-pulse" : "text-cyan-400"}`} />
            <span className="text-slate-400 text-[11px]">Live Temp:</span>
            <strong className={`font-mono ${isTempHigh ? "text-rose-400 font-extrabold" : "text-white"}`}>
              {selectedMachine?.currentTemperature}°C
            </strong>
          </div>

          {/* Live Vib */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800">
            <Activity className={`w-3.5 h-3.5 ${isVibHigh ? "text-rose-400 animate-pulse" : "text-emerald-400"}`} />
            <span className="text-slate-400 text-[11px]">Live Vib:</span>
            <strong className={`font-mono ${isVibHigh ? "text-rose-400 font-extrabold" : "text-emerald-400"}`}>
              {selectedMachine?.currentVibration} mm/s
            </strong>
          </div>

          {/* Motor Load */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800">
            <Gauge className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400 text-[11px]">Motor Load:</span>
            <strong className="font-mono text-cyan-300 font-bold">
              {selectedMachine?.currentMotorLoad}%
            </strong>
          </div>
        </div>
      </div>

      {/* 3. High-Tech Twin Telemetry Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Thermal Chart Card */}
        <div className="p-5 rounded-2xl bg-[#070e20] border border-slate-800/90 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Thermometer className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Thermal Sensor Telemetry (°C)
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              Safe Limit: {selectedMachine?.sensorHistory?.[0]?.temperatureThreshold || 68}°C
            </span>
          </div>

          <div className="w-full h-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 12, right: 12, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="sensorThermalGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.45} />
                    <stop offset="60%" stopColor="#0284c7" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#0284c7" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} vertical={false} />
                <XAxis dataKey="hourLabel" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip content={<CustomTempTooltip />} />
                {/* Safe Limit Threshold Line */}
                <Line
                  type="monotone"
                  dataKey="temperatureThreshold"
                  stroke="#f43f5e"
                  strokeDasharray="4 4"
                  strokeWidth={1.8}
                  dot={false}
                />
                {/* Live Temperature Wave */}
                <Area
                  type="monotone"
                  dataKey="temperature"
                  name="Temperature"
                  stroke="#22d3ee"
                  strokeWidth={2.5}
                  fill="url(#sensorThermalGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vibration Chart Card */}
        <div className="p-5 rounded-2xl bg-[#070e20] border border-slate-800/90 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <Activity className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Vibration RMS Velocity (mm/s)
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
              ISO Limit: {selectedMachine?.sensorHistory?.[0]?.vibrationThreshold || 4.5} mm/s
            </span>
          </div>

          <div className="w-full h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 12, right: 12, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="vibGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#f43f5e" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} vertical={false} />
                <XAxis dataKey="hourLabel" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip content={<CustomVibTooltip />} />
                {/* ISO Vibration Limit Line */}
                <Line
                  type="monotone"
                  dataKey="vibrationThreshold"
                  stroke="#eab308"
                  strokeDasharray="4 4"
                  strokeWidth={1.8}
                  dot={false}
                />
                {/* Live Vibration Wave */}
                <Line
                  type="monotone"
                  dataKey="vibration"
                  name="Vibration RMS"
                  stroke={isVibHigh ? "#f43f5e" : "#10b981"}
                  strokeWidth={2.5}
                  dot={{ r: 3.5, fill: isVibHigh ? "#f43f5e" : "#10b981", strokeWidth: 1.5, stroke: "#070e20" }}
                  activeDot={{ r: 6, fill: isVibHigh ? "#f43f5e" : "#10b981" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
