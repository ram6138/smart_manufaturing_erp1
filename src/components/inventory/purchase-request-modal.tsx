"use client";

import React, { useState, useEffect } from "react";
import { ComputedInventoryItem } from "@/types/inventory";
import { X, ShoppingCart, Send, CheckCircle2 } from "lucide-react";

interface PurchaseRequestModalProps {
  item: ComputedInventoryItem | null;
  allItems?: ComputedInventoryItem[];
  onClose: () => void;
  onSubmitRequest: (params: {
    itemCode: string;
    itemName: string;
    currentAvailableQuantity: number;
    reorderLevel: number;
    requestedQuantity: number;
    unit: string;
    reason: string;
  }) => void;
}

export function PurchaseRequestModal({
  item,
  allItems = [],
  onClose,
  onSubmitRequest,
}: PurchaseRequestModalProps) {
  const [selectedItemId, setSelectedItemId] = useState<string>("");
  const [requestedQuantity, setRequestedQuantity] = useState<number>(0);
  const [reason, setReason] = useState<string>("Low Stock Reorder");

  useEffect(() => {
    if (item) {
      setSelectedItemId(item.id);
      const deficit = Math.max(0, item.reorderLevel - item.availableQuantity);
      setRequestedQuantity(item.minOrderQuantity || Math.max(1000, deficit * 2));
      setReason(
        item.status === "Critical"
          ? "Critical Stock Replenishment"
          : "Standard Reorder Cycle"
      );
    } else {
      setSelectedItemId("");
    }
  }, [item]);

  if (!item) return null;

  const currentItem = (selectedItemId && allItems.find((i) => i.id === selectedItemId)) || item;

  const handleItemChange = (newId: string) => {
    setSelectedItemId(newId);
    const target = allItems.find((i) => i.id === newId);
    if (target) {
      const deficit = Math.max(0, target.reorderLevel - target.availableQuantity);
      setRequestedQuantity(target.minOrderQuantity || Math.max(1000, deficit * 2));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitRequest({
      itemCode: currentItem.itemCode,
      itemName: currentItem.itemName,
      currentAvailableQuantity: currentItem.availableQuantity,
      reorderLevel: currentItem.reorderLevel,
      requestedQuantity,
      unit: currentItem.unit,
      reason,
    });
    onClose();
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 text-slate-100 space-y-5"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Create Purchase Request</h3>
              <p className="text-xs text-slate-400 font-mono">
                Procurement Gateway • Requisition Draft
              </p>
            </div>
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Item Selector if allItems is available */}
          {allItems.length > 1 && (
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300 uppercase tracking-wider text-[10px]">
                Select Inventory Item
              </label>
              <select
                value={currentItem.id}
                onChange={(e) => handleItemChange(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 font-medium focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer"
              >
                {allItems.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.itemName} ({i.itemCode}) — [{i.warehouse}] — Stock: {i.availableQuantity} {i.unit}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Item Overview Pill */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Selected SKU:</span>
              <span className="font-bold text-white font-mono">{currentItem.itemCode} ({currentItem.itemName})</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-800/80">
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Available Stock</span>
                <span className="font-mono font-bold text-cyan-400">
                  {currentItem.availableQuantity.toLocaleString()} {currentItem.unit}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 uppercase block">Reorder Level</span>
                <span className="font-mono text-slate-300">
                  {currentItem.reorderLevel.toLocaleString()} {currentItem.unit}
                </span>
              </div>
            </div>
          </div>

          {/* Requested Quantity */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="font-semibold text-slate-300 uppercase tracking-wider text-[10px]">
                Requested Quantity ({currentItem.unit})
              </label>
              <span className="text-[10px] text-slate-500 font-mono">
                MOQ: {currentItem.minOrderQuantity.toLocaleString()} {currentItem.unit}
              </span>
            </div>
            <input
              type="number"
              min={100}
              step={100}
              required
              value={requestedQuantity}
              onChange={(e) => setRequestedQuantity(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          {/* Reason */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300 uppercase tracking-wider text-[10px]">
              Requisition Reason & Justification
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 font-medium focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer"
            >
              <option value="Critical Stock Replenishment">Critical Stock Replenishment</option>
              <option value="Low Stock Reorder">Low Stock Reorder</option>
              <option value="Upcoming Production Order Spike">Upcoming Production Order Spike</option>
              <option value="Buffer Stock for Long Lead Time">Buffer Stock for Long Lead Time</option>
              <option value="Supplier Bulk Discount Volume">Supplier Bulk Discount Volume</option>
            </select>
          </div>

          {/* Integration notice */}
          <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400 leading-snug">
            Drafting this request will dispatch an automated notification to the <strong>Procurement Manager</strong> with estimated lead time of <strong>{currentItem.leadTimeDays} days</strong>.
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-xs font-bold text-white shadow-md transition"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Create Request</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
