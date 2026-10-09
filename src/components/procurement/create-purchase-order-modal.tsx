"use client";

import React, { useState, useEffect } from "react";
import {
  PurchaseOrderItem,
  SupplierItem,
  MaterialCategory,
  PurchaseRequest,
} from "@/types/procurement";
import {
  X,
  ShoppingCart,
  Calendar,
  Building,
  CreditCard,
  IndianRupee,
  CheckCircle2,
  Package,
} from "lucide-react";

interface CreatePurchaseOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newPo: PurchaseOrderItem) => void;
  suppliers: SupplierItem[];
  prefilledFromRequest?: PurchaseRequest | null;
}

const CATEGORIES: MaterialCategory[] = [
  "Raw Materials",
  "Packaging",
  "Spare Parts",
  "Maintenance",
  "Operations",
];

export function CreatePurchaseOrderModal({
  isOpen,
  onClose,
  onSubmit,
  suppliers,
  prefilledFromRequest,
}: CreatePurchaseOrderModalProps) {
  const [selectedSupplierId, setSelectedSupplierId] = useState(suppliers[0]?.id || "sup_001");
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split("T")[0]);
  const [expectedDelivery, setExpectedDelivery] = useState(
    new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().split("T")[0]
  );
  const [paymentTerms, setPaymentTerms] = useState("Net 30 Days");
  const [material, setMaterial] = useState("Wheat Flour (Refined)");
  const [category, setCategory] = useState<MaterialCategory>("Raw Materials");
  const [quantity, setQuantity] = useState<number>(15000);
  const [unit, setUnit] = useState("kg");
  const [unitPrice, setUnitPrice] = useState<number>(32);
  const [taxPercent, setTaxPercent] = useState<number>(5);
  const [notes, setNotes] = useState("Direct dock delivery at Receiving Bay 1. Certificate of Analysis (CoA) required with shipment.");

  useEffect(() => {
    if (prefilledFromRequest) {
      setMaterial(prefilledFromRequest.material);
      setCategory(prefilledFromRequest.category);
      setQuantity(prefilledFromRequest.quantity);
      setUnit(prefilledFromRequest.unit);
      setUnitPrice(prefilledFromRequest.estimatedUnitCost || 30);
      setExpectedDelivery(prefilledFromRequest.requiredDate);
      const matchedSup = suppliers.find(
        (s) => s.supplierName === prefilledFromRequest.supplierPreference
      );
      if (matchedSup) {
        setSelectedSupplierId(matchedSup.id);
      }
      setNotes(`Generated from Requisition ${prefilledFromRequest.requestId}. ${prefilledFromRequest.notes || ""}`);
    }
  }, [prefilledFromRequest, suppliers]);

  if (!isOpen) return null;

  const subtotal = (Number(quantity) || 0) * (Number(unitPrice) || 0);
  const taxAmount = (subtotal * (Number(taxPercent) || 0)) / 100;
  const totalAmount = subtotal + taxAmount;

  const selectedSupplier = suppliers.find((s) => s.id === selectedSupplierId) || suppliers[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const poNumber = `PO-2026-0${randomSuffix}`;

    const newPo: PurchaseOrderItem = {
      id: `po_${Date.now()}`,
      poNumber,
      supplierId: selectedSupplier.id,
      supplierName: selectedSupplier.supplierName,
      orderDate,
      expectedDelivery,
      paymentTerms,
      buyer: "Rajesh Sharma (Procurement Head)",
      items: [
        {
          id: `item_${Date.now()}`,
          material: material.trim(),
          category,
          quantity: Number(quantity) || 1,
          receivedQuantity: 0,
          unit,
          unitPrice: Number(unitPrice) || 0,
          taxPercent: Number(taxPercent) || 0,
          totalPrice: totalAmount,
        },
      ],
      subtotal,
      taxAmount,
      totalAmount,
      paidAmount: 0,
      paymentStatus: "Pending",
      deliveryStatus: "Not Shipped",
      poStatus: "Approved",
      notes: notes.trim(),
    };

    onSubmit(newPo);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Create Purchase Order</h3>
              <p className="text-xs text-slate-400">
                Generate official vendor order with commercial tax calculations
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs overflow-y-auto flex-1 pr-1">
          {/* Supplier Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Contracted Supplier *
            </label>
            <select
              value={selectedSupplierId}
              onChange={(e) => setSelectedSupplierId(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
              required
            >
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.supplierName} ({s.category} • On-Time: {s.onTimeDeliveryRate}%)
                </option>
              ))}
            </select>
          </div>

          {/* Dates & Payment Terms */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                PO Date *
              </label>
              <input
                type="date"
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Expected Delivery *
              </label>
              <input
                type="date"
                value={expectedDelivery}
                onChange={(e) => setExpectedDelivery(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Payment Terms *
              </label>
              <select
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
              >
                <option value="Net 15 Days">Net 15 Days</option>
                <option value="Net 30 Days">Net 30 Days</option>
                <option value="Net 45 Days">Net 45 Days</option>
                <option value="Advance 50%, Net 15">Advance 50%, Net 15</option>
                <option value="100% Advance">100% Advance</option>
              </select>
            </div>
          </div>

          {/* Material & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Material / Line Item *
              </label>
              <input
                type="text"
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                placeholder="e.g. Wheat Flour (Refined)"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as MaterialCategory)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quantity, Unit, Price, Tax */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Quantity *
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 font-mono font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Unit *
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200"
              >
                <option value="kg">kg</option>
                <option value="boxes">boxes</option>
                <option value="rolls">rolls</option>
                <option value="liters">liters</option>
                <option value="units">units</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-emerald-400 mb-1">
                Unit Price (₹) *
              </label>
              <input
                type="number"
                min="0.1"
                step="0.5"
                value={unitPrice}
                onChange={(e) => setUnitPrice(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-900 border border-emerald-500/40 rounded-lg text-emerald-400 font-mono font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                GST / Tax (%) *
              </label>
              <select
                value={taxPercent}
                onChange={(e) => setTaxPercent(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 font-mono"
              >
                <option value="0">0% (Nil)</option>
                <option value="5">5% (GST)</option>
                <option value="12">12% (GST)</option>
                <option value="18">18% (GST)</option>
                <option value="28">28% (GST)</option>
              </select>
            </div>
          </div>

          {/* Pricing Summary Box */}
          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal:</span>
              <span className="font-mono">₹{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Tax ({taxPercent}%):</span>
              <span className="font-mono">₹{taxAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between pt-1.5 border-t border-slate-800 font-bold text-white">
              <span>Grand Total PO Amount:</span>
              <span className="text-emerald-400 font-mono text-sm">
                ₹{totalAmount.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 active:bg-emerald-500 rounded-lg transition-colors shadow-lg shadow-emerald-500/20 flex items-center gap-1.5"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Issue Purchase Order</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
