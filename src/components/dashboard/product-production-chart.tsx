"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { ProductProductionItem } from "@/types/dashboard";
import { Cookie, PieChart } from "lucide-react";

interface ProductProductionChartProps {
  data: ProductProductionItem[];
}

export function ProductProductionChart({ data }: ProductProductionChartProps) {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item: ProductProductionItem = payload[0].payload;
      return (
        <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl text-xs space-y-1.5 font-sans min-w-[170px]">
          <p className="font-bold text-white border-b border-slate-800 pb-1">{item.product}</p>
          <div className="flex justify-between items-center text-cyan-400">
            <span>Produced:</span>
            <span className="font-mono font-bold">{item.quantity.toLocaleString()} {item.unit}</span>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span>Target:</span>
            <span className="font-mono">{item.target.toLocaleString()} {item.unit}</span>
          </div>
          <div className="flex justify-between items-center pt-1 border-t border-slate-800 text-[11px]">
            <span className="text-slate-400">Catalog Share:</span>
            <span className="font-mono font-bold text-slate-200">{item.share}%</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800/90 shadow-md flex flex-col justify-between">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Production by Product
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Output volume by SKU line for the current period
          </p>
        </div>
        <span className="text-xs font-mono text-cyan-400/80 self-start sm:self-auto">
          {data.length} SKUs Active
        </span>
      </div>

      {/* Bar Chart */}
      <div className="w-full h-72 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} horizontal={false} />

            <XAxis
              type="number"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "#334155" }}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
            />

            <YAxis
              type="category"
              dataKey="product"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "#334155" }}
              width={120}
              tickFormatter={(val) =>
                val.length > 15 ? `${val.substring(0, 13)}...` : val
              }
            />

            <Tooltip content={<CustomTooltip />} />

            <Bar dataKey="quantity" radius={[0, 6, 6, 0]} barSize={16}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fillColor} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend / SKU quick summary */}
      <div className="mt-2 pt-3 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
        {data.map((item) => (
          <div key={item.product} className="flex items-center gap-1.5 truncate">
            <span
              className="w-2.5 h-2.5 rounded-sm shrink-0"
              style={{ backgroundColor: item.fillColor }}
            />
            <span className="text-slate-400 truncate">{item.product.replace(" Biscuit", "")}:</span>
            <span className="font-mono font-semibold text-slate-200">
              {(item.quantity / 1000).toFixed(1)}k
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
