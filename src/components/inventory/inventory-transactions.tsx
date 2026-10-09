"use client";

import React from "react";
import { InventoryTransaction, InventoryTransactionType } from "@/types/inventory";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Sliders,
  ArrowLeftRight,
  RotateCcw,
  Clock,
  History,
} from "lucide-react";

interface InventoryTransactionsProps {
  transactions: InventoryTransaction[];
}

export function InventoryTransactions({ transactions }: InventoryTransactionsProps) {
  const getTransactionBadge = (type: InventoryTransactionType | string) => {
    const norm = (type || "").toLowerCase();
    if (norm.includes("receipt") || norm.includes("inbound")) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/80">
          <ArrowDownLeft className="w-3 h-3" />
          Receipt
        </span>
      );
    }
    if (norm.includes("consumption") || norm.includes("issue") || norm.includes("batch")) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-950/80 text-rose-400 border border-rose-800/80">
          <ArrowUpRight className="w-3 h-3" />
          Consumption
        </span>
      );
    }
    if (norm.includes("adjustment")) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-950/80 text-amber-400 border border-amber-800/80">
          <Sliders className="w-3 h-3" />
          Adjustment
        </span>
      );
    }
    if (norm.includes("transfer")) {
      const isOut = norm.includes("out");
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-950/80 text-blue-400 border border-blue-800/80">
          <ArrowLeftRight className="w-3 h-3" />
          {isOut ? "Transfer Out" : norm.includes("in") ? "Transfer In" : "Transfer"}
        </span>
      );
    }
    if (norm.includes("return")) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-950/80 text-purple-400 border border-purple-800/80">
          <RotateCcw className="w-3 h-3" />
          Return
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
        {type}
      </span>
    );
  };

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800/90 shadow-md space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <History className="w-4 h-4 text-cyan-400" />
            Recent Inventory Transactions
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit trail of inbound receipts, batch issuances, transfers & cycle count adjustments
          </p>
        </div>
        <span className="text-xs font-mono text-cyan-400/80">
          {transactions.length} Transactions Logged
        </span>
      </div>

      {/* Transactions Table */}
      <div className="max-h-[520px] overflow-y-auto overflow-x-auto custom-scrollbar border border-slate-200 rounded-xl">
        <table className="w-full text-left text-xs">
          <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-xs">
            <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
              <th className="py-3 px-3 font-semibold">Transaction ID</th>
              <th className="py-3 px-3 font-semibold">Date & Time</th>
              <th className="py-3 px-3 font-semibold">Material Item</th>
              <th className="py-3 px-3 font-semibold">Warehouse</th>
              <th className="py-3 px-3 font-semibold text-center">Type</th>
              <th className="py-3 px-3 font-semibold text-right">Quantity</th>
              <th className="py-3 px-3 font-semibold">Reference</th>
              <th className="py-3 px-3 font-semibold">Notes / User</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {transactions.map((trx) => {
              const isPositive = trx.quantity > 0;

              return (
                <tr key={trx.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 pr-3 font-mono font-bold text-cyan-400 whitespace-nowrap">
                    {trx.transactionId}
                  </td>

                  <td className="py-3.5 px-3 text-slate-400 whitespace-nowrap font-mono text-[11px]">
                    {new Date(trx.date).toLocaleDateString([], { month: "short", day: "numeric" })}{" "}
                    {new Date(trx.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </td>

                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <div className="font-semibold text-white">{trx.itemName}</div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {trx.itemCode}
                    </div>
                  </td>

                  <td className="py-3.5 px-3 text-slate-300 whitespace-nowrap">
                    {trx.warehouse}
                  </td>

                  <td className="py-3.5 px-3 text-center whitespace-nowrap">
                    {getTransactionBadge(trx.transactionType)}
                  </td>

                  <td className="py-3.5 px-3 text-right whitespace-nowrap font-mono font-bold">
                    <span className={isPositive ? "text-emerald-400" : "text-rose-400"}>
                      {isPositive ? `+${trx.quantity.toLocaleString()}` : trx.quantity.toLocaleString()} {trx.unit}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 font-mono text-slate-300 whitespace-nowrap">
                    {trx.reference}
                  </td>

                  <td className="py-3.5 pl-3 text-slate-400 text-[11px]">
                    <div className="text-slate-300">{trx.notes}</div>
                    <div className="text-[10px] text-slate-500">{trx.performedBy}</div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
