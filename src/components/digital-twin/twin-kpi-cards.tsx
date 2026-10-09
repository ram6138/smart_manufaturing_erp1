"use client";

import React from "react";
import { SimulationResults } from "@/types/digital-twin";
import {
  Boxes,
  Clock,
  Gauge,
  AlertTriangle,
  TrendingUp,
  IndianRupee,
  CheckCircle2,
  XCircle,
  ShieldAlert,
} from "lucide-react";

interface TwinKpiCardsProps {
  results: SimulationResults | null;
  productUnit?: string;
}

export function TwinKpiCards({ results, productUnit = "Units" }: TwinKpiCardsProps) {
  if (!results) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { title: "Simulated Demand", icon: Boxes, color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
          { title: "Net Available Time", icon: Clock, color: "text-cyan-700", bg: "bg-cyan-50 border-cyan-200" },
          { title: "Estimated Capacity", icon: Gauge, color: "text-purple-700", bg: "bg-purple-50 border-purple-200" },
          { title: "Shortfall / Surplus", icon: AlertTriangle, color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
          { title: "Delivery Lag", icon: TrendingUp, color: "text-indigo-700", bg: "bg-indigo-50 border-indigo-200" },
          { title: "Cost Impact", icon: IndianRupee, color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
        ].map((item, idx) => (
          <div
            key={idx}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between"
          >
            <div className="flex items-center justify-between gap-1 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 truncate">
                {item.title}
              </span>
              <div className={`p-1.5 rounded-lg border ${item.bg}`}>
                <item.icon className={`w-4 h-4 ${item.color}`} />
              </div>
            </div>
            <div className="text-xl font-extrabold font-mono text-slate-400">--</div>
            <span className="text-xs font-medium text-slate-500 mt-1">Awaiting scenario run</span>
          </div>
        ))}
      </div>
    );
  }

  const isShortfall = (results.productionShortfall || 0) > 0;
  const isSurplus = (results.productionSurplus || 0) > 0;
  const delayHours = results.estimatedDelayHours || 0;
  const costImpact = results.estimatedCostImpact || 0;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
      {/* 1. Simulated Demand */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-xs hover:border-blue-400 transition-all flex flex-col justify-between">
        <div className="flex items-start justify-between gap-1 mb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Simulated Demand
          </span>
          <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/60 border border-blue-300 text-blue-800 dark:text-blue-200 shrink-0">
            <Boxes className="w-4 h-4" />
          </div>
        </div>
        <div className="my-1.5">
          <span className="text-2xl font-black font-mono text-slate-900 dark:text-white">
            {results.simulatedDemand.toLocaleString()}
          </span>
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-1.5">{productUnit}</span>
        </div>
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
          Base: {results.originalDemand.toLocaleString()} {productUnit}
        </span>
      </div>

      {/* 2. Net Operating Hours */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-xs hover:border-cyan-400 transition-all flex flex-col justify-between">
        <div className="flex items-start justify-between gap-1 mb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Operating Time
          </span>
          <div className="p-1.5 rounded-lg bg-cyan-100 dark:bg-cyan-900/60 border border-cyan-300 text-cyan-800 dark:text-cyan-200 shrink-0">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="my-1.5">
          <span className="text-2xl font-black font-mono text-slate-900 dark:text-white">
            {results.netOperatingHours}
          </span>
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-1.5">Hours</span>
        </div>
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 truncate">
          {results.downtimeHours > 0 ? `-${results.downtimeHours}h downtime` : "0h downtime"} • {results.extraShiftHours > 0 ? `+${results.extraShiftHours}h shift` : "Standard shift"}
        </span>
      </div>

      {/* 3. Estimated Capacity */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-xs hover:border-purple-400 transition-all flex flex-col justify-between">
        <div className="flex items-start justify-between gap-1 mb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Est. Capacity
          </span>
          <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/60 border border-purple-300 text-purple-800 dark:text-purple-200 shrink-0">
            <Gauge className="w-4 h-4" />
          </div>
        </div>
        <div className="my-1.5">
          <span className="text-2xl font-black font-mono text-slate-900 dark:text-white">
            {results.estimatedCapacity !== null ? results.estimatedCapacity.toLocaleString() : "N/A"}
          </span>
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-1.5">{productUnit}</span>
        </div>
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 truncate">
          {results.throughputRatePerHour ? `@ ${results.throughputRatePerHour} ${productUnit}/hr` : "No throughput rate"}
        </span>
      </div>

      {/* 4. Shortfall / Surplus */}
      <div
        className={`p-4 rounded-2xl border-2 shadow-xs transition-all flex flex-col justify-between ${
          isShortfall
            ? "bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 hover:border-rose-500"
            : isSurplus
            ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 hover:border-emerald-500"
            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
        }`}
      >
        <div className="flex items-start justify-between gap-1 mb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Balance
          </span>
          <div
            className={`p-1.5 rounded-lg border shrink-0 ${
              isShortfall
                ? "bg-rose-200 border-rose-400 text-rose-900 dark:bg-rose-900 dark:text-rose-100"
                : "bg-emerald-200 border-emerald-400 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-100"
            }`}
          >
            {isShortfall ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          </div>
        </div>
        <div className="my-1.5">
          <span
            className={`text-2xl font-black font-mono ${
              isShortfall ? "text-rose-700 dark:text-rose-400" : isSurplus ? "text-emerald-700 dark:text-emerald-400" : "text-slate-900 dark:text-white"
            }`}
          >
            {isShortfall
              ? `-${results.productionShortfall?.toLocaleString()}`
              : `+${results.productionSurplus?.toLocaleString()}`}
          </span>
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-1.5">{productUnit}</span>
        </div>
        <span
          className={`text-xs font-extrabold uppercase tracking-wider ${
            isShortfall ? "text-rose-800 dark:text-rose-300" : "text-emerald-800 dark:text-emerald-300"
          }`}
        >
          {isShortfall ? "Shortfall Deficit" : "Capacity Buffer"}
        </span>
      </div>

      {/* 5. Delivery Lag */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-xs hover:border-indigo-400 transition-all flex flex-col justify-between">
        <div className="flex items-start justify-between gap-1 mb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Delivery Lag
          </span>
          <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 border border-indigo-300 text-indigo-800 dark:text-indigo-200 shrink-0">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="my-1.5">
          <span
            className={`text-2xl font-black font-mono ${
              delayHours > 0 ? "text-amber-700 dark:text-amber-400" : "text-emerald-700 dark:text-emerald-400"
            }`}
          >
            {delayHours > 0 ? `+${delayHours}` : "0.0"}
          </span>
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-1.5">Hours</span>
        </div>
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
          {delayHours > 0 ? "Production delay expected" : "On-schedule target"}
        </span>
      </div>

      {/* 6. Cost Impact */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-400 transition-all flex flex-col justify-between">
        <div className="flex items-start justify-between gap-1 mb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Cost Impact
          </span>
          <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 border border-emerald-300 text-emerald-800 dark:text-emerald-200 shrink-0">
            <IndianRupee className="w-4 h-4" />
          </div>
        </div>
        <div className="my-1.5">
          <span
            className={`text-2xl font-black font-mono ${
              costImpact > 0 ? "text-amber-700 dark:text-amber-400" : "text-emerald-700 dark:text-emerald-400"
            }`}
          >
            {costImpact > 0 ? `+₹${costImpact.toLocaleString()}` : `₹${costImpact.toLocaleString()}`}
          </span>
        </div>
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
          Est. total: ₹{results.simulatedCost?.toLocaleString() || "0"}
        </span>
      </div>
    </div>
  );
}
