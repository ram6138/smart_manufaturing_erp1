"use client";

import React from "react";
import { InventoryAlertItem, InventoryStatusType } from "@/types/dashboard";
import { Boxes, AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";

interface InventoryAlertsProps {
  items: InventoryAlertItem[];
}

export function InventoryAlerts({ items }: InventoryAlertsProps) {
  const getStatusBadge = (status: InventoryStatusType) => {
    switch (status) {
      case "Healthy":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/80">
            <CheckCircle2 className="w-3 h-3" />
            Healthy
          </span>
        );
      case "Low Stock":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-950/80 text-amber-400 border border-amber-800/80">
            <AlertTriangle className="w-3 h-3" />
            Low Stock
          </span>
        );
      case "Critical":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-950/80 text-rose-400 border border-rose-800/80">
            <ShieldAlert className="w-3 h-3" />
            Critical
          </span>
        );
      default:
        return null;
    }
  };

  const getStockBarColor = (status: InventoryStatusType) => {
    switch (status) {
      case "Healthy":
        return "bg-emerald-500";
      case "Low Stock":
        return "bg-amber-500";
      case "Critical":
        return "bg-rose-500 animate-pulse";
      default:
        return "bg-cyan-500";
    }
  };

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800/90 shadow-md flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Boxes className="w-4 h-4 text-emerald-400" />
            Inventory Alerts
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Raw materials & packaging stock levels against reorder thresholds
          </p>
        </div>
        <span className="text-xs font-mono text-amber-400 font-semibold">
          {items.filter((i) => i.status !== "Healthy").length} Need Restock
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
              <th className="pb-2.5 font-semibold">Material / Item</th>
              <th className="pb-2.5 font-semibold text-right">Available</th>
              <th className="pb-2.5 font-semibold text-right">Reorder Level</th>
              <th className="pb-2.5 font-semibold text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="py-3 pr-2">
                  <div className="font-semibold text-white">{item.material}</div>
                  <div className="text-[11px] text-slate-400">{item.category}</div>
                </td>

                <td className="py-3 px-2 text-right whitespace-nowrap">
                  <div className="font-mono font-bold text-slate-200">
                    {item.availableQuantity.toLocaleString()} {item.unit}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    ~{item.daysOfSupplyRemaining} days supply
                  </div>
                </td>

                <td className="py-3 px-2 text-right whitespace-nowrap font-mono text-slate-400">
                  {item.reorderLevel.toLocaleString()} {item.unit}
                </td>

                <td className="py-3 pl-2 text-center whitespace-nowrap">
                  {getStatusBadge(item.status)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
