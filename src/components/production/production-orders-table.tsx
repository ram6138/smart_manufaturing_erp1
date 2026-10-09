"use client";

import React from "react";
import { ProductionOrder } from "@/types/production";
import {
  ProductionPriorityBadge,
  ProductionStatusBadge,
} from "./status-badge";
import {
  Eye,
  Edit2,
  Play,
  Pause,
  CheckCircle,
  MoreVertical,
  ClipboardList,
  Wrench,
  Clock,
  Layers,
} from "lucide-react";

interface ProductionOrdersTableProps {
  orders: ProductionOrder[];
  onViewOrder: (order: ProductionOrder) => void;
  onEditOrder: (order: ProductionOrder) => void;
  onTogglePauseOrder: (orderId: string) => void;
  onCompleteOrder: (orderId: string) => void;
}

export function ProductionOrdersTable({
  orders,
  onViewOrder,
  onEditOrder,
  onTogglePauseOrder,
  onCompleteOrder,
}: ProductionOrdersTableProps) {
  if (orders.length === 0) {
    return (
      <div className="p-8 rounded-2xl bg-slate-900/80 border border-slate-800 text-center space-y-2">
        <ClipboardList className="w-8 h-8 text-slate-500 mx-auto" />
        <h3 className="text-sm font-semibold text-white">No production orders found</h3>
        <p className="text-xs text-slate-400">
          Try adjusting your search criteria or resetting your active filters.
        </p>
      </div>
    );
  }

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800/90 shadow-md space-y-4">
      {/* Table Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-cyan-400" />
            Production Orders Catalog
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Active shop floor batches, machine routing & execution state
          </p>
        </div>
        <span className="text-xs font-mono text-cyan-400/80">
          {orders.length} Records Loaded
        </span>
      </div>

      {/* Desktop & Tablet Table View */}
      <div className="hidden md:block max-h-[520px] overflow-y-auto overflow-x-auto custom-scrollbar border border-slate-200 rounded-xl">
        <table className="w-full text-left text-xs">
          <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-xs">
            <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
              <th className="py-3 px-3 font-semibold">Order / Batch</th>
              <th className="py-3 px-3 font-semibold">Product SKU</th>
              <th className="py-3 px-3 font-semibold">Machine & Shift</th>
              <th className="py-3 px-3 font-semibold text-right">Planned</th>
              <th className="py-3 px-3 font-semibold text-right">Actual</th>
              <th className="py-3 px-3 font-semibold text-center">Status</th>
              <th className="py-3 px-3 font-semibold text-center">Priority</th>
              <th className="py-3 px-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {orders.map((order) => {
              const isPaused = order.status === "Paused";
              const isCompleted = order.status === "Completed";
              const isCancelled = order.status === "Cancelled";

              return (
                <tr
                  key={order.id}
                  className="hover:bg-slate-800/40 transition-colors group"
                >
                  {/* Order & Batch Number */}
                  <td className="py-3.5 pr-3 whitespace-nowrap">
                    <div className="font-mono font-bold text-cyan-400">
                      {order.orderNumber}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {order.batchNumber}
                    </div>
                  </td>

                  {/* Product */}
                  <td className="py-3.5 px-3">
                    <div className="font-semibold text-slate-200">{order.product}</div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {order.productSku}
                    </div>
                  </td>

                  {/* Machine & Shift */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <div className="text-slate-300 font-medium flex items-center gap-1">
                      <Wrench className="w-3 h-3 text-slate-500" />
                      {order.machine}
                    </div>
                    <div className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {order.shift?.includes("Shift") ? order.shift : `${order.shift || "Day"} Shift`}
                    </div>
                  </td>

                  {/* Planned Quantity */}
                  <td className="py-3.5 px-3 text-right font-mono text-slate-400 whitespace-nowrap">
                    {order.plannedQuantity.toLocaleString()} {order.unit}
                  </td>

                  {/* Actual Quantity */}
                  <td className="py-3.5 px-3 text-right font-mono font-bold text-white whitespace-nowrap">
                    {order.actualQuantity.toLocaleString()} {order.unit}
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-3 text-center whitespace-nowrap">
                    <ProductionStatusBadge status={order.status} />
                  </td>

                  {/* Priority Badge */}
                  <td className="py-3.5 px-3 text-center whitespace-nowrap">
                    <ProductionPriorityBadge priority={order.priority} />
                  </td>

                  {/* Actions Column */}
                  <td className="py-3.5 pl-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      {/* View Detail */}
                      <button
                        onClick={() => onViewOrder(order)}
                        className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition shadow-xs"
                        title="View Production Order Details"
                        aria-label="View Order"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => onEditOrder(order)}
                        className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition shadow-xs"
                        title="Edit Order Parameters"
                        aria-label="Edit Order"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Pause / Resume */}
                      {!isCompleted && !isCancelled && (
                        <button
                          onClick={() => onTogglePauseOrder(order.id)}
                          className={`p-1.5 rounded-lg border transition shadow-xs ${
                            isPaused
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                              : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                          }`}
                          title={isPaused ? "Resume Order" : "Pause Order"}
                          aria-label={isPaused ? "Resume" : "Pause"}
                        >
                          {isPaused ? (
                            <Play className="w-3.5 h-3.5" />
                          ) : (
                            <Pause className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}

                      {/* Complete */}
                      {!isCompleted && !isCancelled && (
                        <button
                          onClick={() => onCompleteOrder(order.id)}
                          className="p-1.5 rounded-lg bg-blue-50 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 text-blue-700 border border-blue-200 transition shadow-xs"
                          title="Mark Order Completed"
                          aria-label="Complete Order"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Layout */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {orders.map((order) => {
          const isPaused = order.status === "Paused";
          const isCompleted = order.status === "Completed";
          const isCancelled = order.status === "Cancelled";

          return (
            <div
              key={order.id}
              className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-mono text-xs font-bold text-cyan-400">
                    {order.orderNumber}
                  </span>
                  <h3 className="text-sm font-semibold text-white mt-0.5">
                    {order.product}
                  </h3>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Batch: {order.batchNumber}
                  </span>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <ProductionStatusBadge status={order.status} />
                  <ProductionPriorityBadge priority={order.priority} />
                </div>
              </div>

              {/* Progress & metrics */}
              <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-slate-800/80">
                <div>
                  <span className="text-[10px] uppercase text-slate-500 block">
                    Planned Target
                  </span>
                  <span className="font-mono font-bold text-slate-200">
                    {order.plannedQuantity.toLocaleString()} {order.unit}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase text-slate-500 block">
                    Actual Output
                  </span>
                  <span className="font-mono font-bold text-emerald-400">
                    {order.actualQuantity.toLocaleString()} {order.unit}
                  </span>
                </div>
              </div>

              {/* Machine & Shift info */}
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>{order.machine}</span>
                <span>{order.shift?.includes("Shift") ? order.shift : `${order.shift || "Day"} Shift`}</span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  onClick={() => onViewOrder(order)}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white border border-blue-600 flex items-center gap-1.5 shadow-xs"
                >
                  <Eye className="w-3.5 h-3.5 text-white" />
                  <span>View Details</span>
                </button>

                <button
                  onClick={() => onEditOrder(order)}
                  className="p-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 shadow-xs"
                  title="Edit"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>

                {!isCompleted && !isCancelled && (
                  <button
                    onClick={() => onTogglePauseOrder(order.id)}
                    className="p-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 shadow-xs"
                    title={isPaused ? "Resume" : "Pause"}
                  >
                    {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                  </button>
                )}

                {!isCompleted && !isCancelled && (
                  <button
                    onClick={() => onCompleteOrder(order.id)}
                    className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 shadow-xs"
                    title="Complete"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
