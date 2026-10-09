"use client";

import React from "react";
import { QualityOverviewData } from "@/types/dashboard";
import { CheckCircle2, XCircle, AlertOctagon, Layers } from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";

interface QualityOverviewProps {
  data: QualityOverviewData;
}

export function QualityOverview({ data }: QualityOverviewProps) {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 shadow-xl text-xs space-y-1 font-sans">
          <p className="font-bold text-white">{item.name}</p>
          <div className="flex justify-between items-center gap-4 text-slate-300">
            <span>Defects:</span>
            <span className="font-mono font-bold text-rose-400">{item.count} units</span>
          </div>
          <div className="flex justify-between items-center gap-4 text-slate-400 text-[11px]">
            <span>Defect Share:</span>
            <span className="font-mono">{item.percentage}%</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800/90 shadow-md flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-purple-400" />
            Quality Overview
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            QA checkpoint logs & defect categorization
          </p>
        </div>
        <span className="text-xs font-mono text-emerald-400 font-semibold">
          {(100 - (data.rejectionRate || 0)).toFixed(1)}% Pass Rate
        </span>
      </div>

      {/* 4 Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
        {/* Passed */}
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Passed</span>
          </div>
          <p className="text-lg font-bold text-white font-mono">
            {data.passedInspections.toLocaleString()}
          </p>
          <span className="text-[10px] text-emerald-400 font-medium">
            {(100 - (data.rejectionRate || 0)).toFixed(1)}% of checks
          </span>
        </div>

        {/* Failed */}
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <XCircle className="w-3.5 h-3.5 text-rose-400" />
            <span>Failed</span>
          </div>
          <p className="text-lg font-bold text-white font-mono">{data.failedInspections}</p>
          <span className="text-[10px] text-rose-400 font-medium">Quarantined</span>
        </div>

        {/* Rejection Rate */}
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <AlertOctagon className="w-3.5 h-3.5 text-amber-400" />
            <span>Rejection Rate</span>
          </div>
          <p className="text-lg font-bold text-white font-mono">{data.rejectionRate}%</p>
          <span className="text-[10px] text-slate-400">Target &lt; 3.0%</span>
        </div>

        {/* Total Defects */}
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <Layers className="w-3.5 h-3.5 text-purple-400" />
            <span>Total Defects</span>
          </div>
          <p className="text-lg font-bold text-white font-mono">{data.totalDefects}</p>
          <span className="text-[10px] text-slate-400">Scrap logged</span>
        </div>
      </div>

      {/* Small Chart & Defect Breakdown */}
      <div className="pt-3 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
        {/* Donut Chart */}
        <div className="sm:col-span-4 h-32 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<CustomTooltip />} />
              <Pie
                data={data.defects}
                dataKey="count"
                nameKey="name"
                innerRadius={32}
                outerRadius={52}
                paddingAngle={3}
              >
                {data.defects.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Defect Categories Progress Bars */}
        <div className="sm:col-span-8 space-y-2">
          {data.defects.map((defect) => (
            <div key={defect.name} className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-medium flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: defect.color }}
                  />
                  {defect.name}
                </span>
                <span className="font-mono text-slate-400">
                  <strong className="text-slate-200">{defect.count}</strong> ({defect.percentage}%)
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${defect.percentage}%`,
                    backgroundColor: defect.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
