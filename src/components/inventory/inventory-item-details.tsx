"use client";

import React from "react";
import {
  ComputedInventoryItem,
  InventoryTransaction,
} from "@/types/inventory";
import { InventoryStatusBadge } from "./inventory-status-badge";
import {
  X,
  Boxes,
  Building2,
  IndianRupee,
  TrendingUp,
  History,
  Calendar,
  Lock,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

interface InventoryItemDetailsProps {
  item: ComputedInventoryItem | null;
  transactions: InventoryTransaction[];
  onClose: () => void;
  onOpenPurchaseRequest: (item: ComputedInventoryItem) => void;
  onOpenAdjustment: (item: ComputedInventoryItem) => void;
}

export function InventoryItemDetails({
  item,
  transactions,
  onClose,
  onOpenPurchaseRequest,
  onOpenAdjustment,
}: InventoryItemDetailsProps) {
  if (!item) return null;

  // Filter transactions for this specific item by SKU code or ID
  const itemTransactions = transactions.filter(
    (t) => t.itemId === item.id || t.itemCode === item.itemCode
  );

  // Generate simulated 7-day movement data for this item
  const movementData = [
    { day: "Sep 25", stock: Math.round(item.quantityOnHand * 0.92) },
    { day: "Sep 26", stock: Math.round(item.quantityOnHand * 0.88) },
    { day: "Sep 27", stock: Math.round(item.quantityOnHand * 0.84) },
    { day: "Sep 28", stock: Math.round(item.quantityOnHand * 1.05) },
    { day: "Sep 29", stock: Math.round(item.quantityOnHand * 0.98) },
    { day: "Sep 30", stock: Math.round(item.quantityOnHand * 0.94) },
    { day: "Today", stock: item.quantityOnHand },
  ];

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in overflow-y-auto"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-7 text-slate-100 space-y-6"
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-extrabold text-cyan-400">
                {item.itemCode}
              </span>
              <InventoryStatusBadge status={item.status} />
              <span className="px-2 py-0.5 rounded text-[10px] bg-slate-950 border border-slate-800 text-slate-400 font-mono">
                {item.category}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white">{item.itemName}</h2>
            <p className="text-xs text-slate-400">
              {item.warehouse} • Bin Location: <strong className="text-slate-200">{item.locationBin}</strong>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Inventory Stock Numbers Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
              Available Stock
            </span>
            <span className="text-base font-bold font-mono text-emerald-400">
              {item.availableQuantity.toLocaleString()} {item.unit}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
              Reorder Level
            </span>
            <span className="text-base font-bold font-mono text-slate-300">
              {item.reorderLevel.toLocaleString()} {item.unit}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
              Stock Valuation
            </span>
            <span className="text-base font-bold font-mono text-white">
              ₹{item.stockValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* 2. Procurement & Reorder Parameters */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-2">
          <div className="font-semibold text-slate-300 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
            <IndianRupee className="w-3.5 h-3.5 text-emerald-400" />
            Costing & Reorder Thresholds
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            <div>
              <span className="text-slate-400 block">Unit Cost:</span>
              <span className="font-mono font-semibold text-slate-200">₹{item.unitCost.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Reorder Level:</span>
              <span className="font-mono font-semibold text-slate-200">{item.reorderLevel.toLocaleString()} {item.unit}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Min. Order Qty:</span>
              <span className="font-mono font-semibold text-slate-200">{item.minOrderQuantity.toLocaleString()} {item.unit}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Supplier Lead Time:</span>
              <span className="font-mono font-semibold text-cyan-400">{item.leadTimeDays} days</span>
            </div>
          </div>
        </div>

        {/* 3. Stock Movement Chart */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              Stock Movement (Last 7 Days)
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">Telemetry</span>
          </div>

          <div className="w-full h-44 p-3 rounded-xl bg-slate-950/80 border border-slate-800">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={movementData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="itemMovementGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
                <XAxis dataKey="day" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono">
                          <p className="font-bold text-white">{label}</p>
                          <p className="text-cyan-400">{payload[0].value?.toLocaleString()} {item.unit}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area type="monotone" dataKey="stock" stroke="#06b6d4" strokeWidth={2} fill="url(#itemMovementGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. Recent Item Transactions Table */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <History className="w-4 h-4 text-purple-400" />
              Recent Transactions for this SKU
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">
              {itemTransactions.length} events
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/70">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3 font-semibold">Date</th>
                  <th className="py-2.5 px-3 font-semibold">Type</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Quantity</th>
                  <th className="py-2.5 px-3 font-semibold">Reference / Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {itemTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-slate-500 text-xs">
                      No recent ledger movements recorded for this item.
                    </td>
                  </tr>
                ) : (
                  itemTransactions.map((trx) => (
                    <tr key={trx.id} className="hover:bg-slate-800/30">
                      <td className="py-2 px-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                        {new Date(trx.date).toLocaleDateString([], { month: "short", day: "numeric" })}
                      </td>
                      <td className="py-2 px-3 text-slate-200">
                        {trx.transactionType}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold whitespace-nowrap">
                        <span className={trx.quantity > 0 ? "text-emerald-400" : "text-rose-400"}>
                          {trx.quantity > 0 ? `+${trx.quantity.toLocaleString()}` : trx.quantity.toLocaleString()} {trx.unit}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-slate-400 text-[11px]">
                        <span className="font-mono text-slate-300">{trx.reference}</span> • {trx.notes}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="pt-3 border-t border-slate-800 flex flex-wrap justify-end gap-2.5">
          <button
            onClick={() => {
              onClose();
              onOpenAdjustment(item);
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
          >
            Adjust Stock Count
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenPurchaseRequest(item);
            }}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-xs font-bold text-white shadow-md transition"
          >
            Create Purchase Request
          </button>
        </div>
      </div>
    </div>
  );
}
