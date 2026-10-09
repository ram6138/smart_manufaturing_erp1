"use client";

import React from "react";
import {
  OrderPriorityType,
  OrderStatusType,
  ProductionOrderItem,
} from "@/types/dashboard";
import { ClipboardList, ArrowUpRight, Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface ProductionOrdersTableProps {
  orders: ProductionOrderItem[];
}

export function ProductionOrdersTable({ orders }: ProductionOrdersTableProps) {
  const getStatusBadge = (status: OrderStatusType) => {
    switch (status) {
      case "Completed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/80">
            <CheckCircle2 className="w-3 h-3" />
            Completed
          </span>
        );
      case "In Progress":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-950/80 text-blue-400 border border-blue-800/80">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            In Progress
          </span>
        );
      case "Delayed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-950/80 text-rose-400 border border-rose-800/80">
            <AlertCircle className="w-3 h-3" />
            Delayed
          </span>
        );
      case "Scheduled":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
            <Clock className="w-3 h-3" />
            Scheduled
          </span>
        );
      default:
        return null;
    }
  };

  const getPriorityBadge = (priority: OrderPriorityType) => {
    switch (priority) {
      case "Urgent":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40">
            Urgent
          </span>
        );
      case "High":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
            High
          </span>
        );
      case "Normal":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
            Normal
          </span>
        );
      case "Low":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider bg-slate-800/50 text-slate-400 border border-slate-800">
            Low
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800/90 shadow-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-cyan-400" />
            Recent Production Orders
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Active shop floor batches and job execution progress
          </p>
        </div>

        <Link
          href="/production"
          className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition"
        >
          <span>View All Production Orders</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
              <th className="pb-3 font-semibold">Order Number</th>
              <th className="pb-3 font-semibold">Product SKU</th>
              <th className="pb-3 font-semibold text-right">Planned</th>
              <th className="pb-3 font-semibold text-right">Produced</th>
              <th className="pb-3 font-semibold text-center">Efficiency</th>
              <th className="pb-3 font-semibold text-center">Status</th>
              <th className="pb-3 font-semibold text-center">Priority</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="py-3.5 pr-3 font-mono font-semibold text-cyan-400 whitespace-nowrap">
                  {order.orderNumber}
                  <div className="text-[10px] text-slate-500 font-sans font-normal">
                    {order.targetLine}
                  </div>
                </td>

                <td className="py-3.5 px-3">
                  <div className="font-semibold text-slate-200">{order.product}</div>
                  <div className="text-[11px] text-slate-400">Due: {order.dueDate}</div>
                </td>

                <td className="py-3.5 px-3 text-right font-mono text-slate-400 whitespace-nowrap">
                  {order.plannedQuantity.toLocaleString()} {order.unit}
                </td>

                <td className="py-3.5 px-3 text-right font-mono font-bold text-white whitespace-nowrap">
                  {order.producedQuantity.toLocaleString()} {order.unit}
                </td>

                <td className="py-3.5 px-3 text-center whitespace-nowrap">
                  <div className="inline-flex flex-col items-center">
                    <span
                      className={`font-mono font-bold ${
                        order.efficiency >= 95
                          ? "text-emerald-400"
                          : order.efficiency > 0
                          ? "text-amber-400"
                          : "text-slate-500"
                      }`}
                    >
                      {order.efficiency}%
                    </span>
                    <div className="w-14 h-1 bg-slate-800 rounded-full overflow-hidden mt-1">
                      <div
                        className={`h-full rounded-full ${
                          order.efficiency >= 95
                            ? "bg-emerald-400"
                            : order.efficiency > 0
                            ? "bg-amber-400"
                            : "bg-slate-700"
                        }`}
                        style={{ width: `${Math.min(order.efficiency, 100)}%` }}
                      />
                    </div>
                  </div>
                </td>

                <td className="py-3.5 px-3 text-center whitespace-nowrap">
                  {getStatusBadge(order.status)}
                </td>

                <td className="py-3.5 pl-3 text-center whitespace-nowrap">
                  {getPriorityBadge(order.priority)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
