"use client";

import React, { useState, useEffect, useRef } from "react";
import { MachineItem, MaintenanceRecord, MaintenanceType } from "@/types/machines";
import {
  X,
  Wrench,
  Calendar,
  User,
  FileText,
  Clock,
  IndianRupee,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

interface ScheduleMaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  machines: MachineItem[];
  preselectedMachineId?: string | null;
  onScheduleSuccess: (newRecord: MaintenanceRecord) => void;
}

export function ScheduleMaintenanceModal({
  isOpen,
  onClose,
  machines,
  preselectedMachineId,
  onScheduleSuccess,
}: ScheduleMaintenanceModalProps) {
  const [selectedMachineId, setSelectedMachineId] = useState<string>("");
  const [maintenanceType, setMaintenanceType] = useState<MaintenanceType>("Preventive");
  const [scheduledDate, setScheduledDate] = useState<string>("");
  const [technician, setTechnician] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [estimatedHours, setEstimatedHours] = useState<string>("");
  const [estimatedCost, setEstimatedCost] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hoursInputRef = useRef<HTMLInputElement>(null);
  const costInputRef = useRef<HTMLInputElement>(null);

  const hoursRef = useRef(estimatedHours);
  hoursRef.current = estimatedHours;
  const costRef = useRef(estimatedCost);
  costRef.current = estimatedCost;

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Non-passive native wheel listener for Hours input (prevents background scroll)
  useEffect(() => {
    const hoursEl = hoursInputRef.current;
    if (!isOpen || !hoursEl) return;

    const onHoursWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const current = parseFloat(hoursRef.current) || 0;
      const step = 0.5;
      if (e.deltaY < 0) {
        const next = Math.min(48, Number((current + step).toFixed(1)));
        setEstimatedHours(String(next));
      } else {
        const next = Math.max(0.5, Number((current - step).toFixed(1)));
        setEstimatedHours(String(next));
      }
    };

    hoursEl.addEventListener("wheel", onHoursWheel, { passive: false });
    return () => hoursEl.removeEventListener("wheel", onHoursWheel);
  }, [isOpen]);

  // Non-passive native wheel listener for Cost input (prevents background scroll)
  useEffect(() => {
    const costEl = costInputRef.current;
    if (!isOpen || !costEl) return;

    const onCostWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const current = parseFloat(costRef.current) || 0;
      const step = 25;
      if (e.deltaY < 0) {
        const next = current + step;
        setEstimatedCost(String(next));
      } else {
        const next = Math.max(0, current - step);
        setEstimatedCost(String(next));
      }
    };

    costEl.addEventListener("wheel", onCostWheel, { passive: false });
    return () => costEl.removeEventListener("wheel", onCostWheel);
  }, [isOpen]);

  // Initialize only when modal opens (do NOT re-run on background polling updates)
  useEffect(() => {
    if (isOpen) {
      if (preselectedMachineId) {
        setSelectedMachineId(preselectedMachineId);
      } else {
        setSelectedMachineId("");
      }
      setScheduledDate("");
      setTechnician("");
      setDescription("");
      setEstimatedHours("");
      setEstimatedCost("");
      setMaintenanceType("Preventive");
      setError("");
      setIsSubmitting(false);
    }
  }, [isOpen, preselectedMachineId]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMachineId) {
      setError("Please select a target machine.");
      return;
    }
    if (!scheduledDate) {
      setError("Please pick a scheduled maintenance date.");
      return;
    }
    if (!technician.trim()) {
      setError("Please enter the assigned technician name.");
      return;
    }
    if (!description.trim()) {
      setError("Please describe the maintenance scope and work details.");
      return;
    }

    setIsSubmitting(true);

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newRecord: MaintenanceRecord = {
      id: `mnt_${Date.now()}`,
      maintenanceId: `MNT-2026-${randomSuffix}`,
      machineId: selectedMachineId,
      date: new Date(scheduledDate).toISOString(),
      type: maintenanceType,
      description: description.trim(),
      technician: technician.trim(),
      downtimeHours: Number(estimatedHours) || 1.5,
      cost: Number(estimatedCost) || 200,
      status: "Scheduled",
    };

    setTimeout(() => {
      onScheduleSuccess(newRecord);
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  const selectedMachine = machines.find((m) => m.id === selectedMachineId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-6 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Schedule Maintenance Work Order</h3>
              <p className="text-xs text-slate-400">Create planned preventive or corrective service record</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Machine Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Target Machine *
            </label>
            <select
              value={selectedMachineId}
              onChange={(e) => setSelectedMachineId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer [color-scheme:dark]"
            >
              <option value="" disabled className="text-slate-500">
                -- Select Target Machine --
              </option>
              {machines.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.machineCode} — {m.machineName} ({m.status} | Risk: {m.riskScore}%)
                </option>
              ))}
            </select>
            {selectedMachine && (
              <p className="text-xs text-slate-400 mt-1">
                Location: <span className="text-slate-300">{selectedMachine.location}</span> | Current Risk:{" "}
                <span
                  className={
                    selectedMachine.riskScore >= 75
                      ? "text-rose-400 font-semibold"
                      : selectedMachine.riskScore >= 45
                      ? "text-amber-400 font-semibold"
                      : "text-emerald-400 font-semibold"
                  }
                >
                  {selectedMachine.riskScore}% ({selectedMachine.riskLevel})
                </span>
              </p>
            )}
          </div>

          {/* Maintenance Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Maintenance Type *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["Preventive", "Corrective", "Inspection"] as MaintenanceType[]).map((type) => {
                const isSelected = maintenanceType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setMaintenanceType(type)}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all text-center cursor-pointer ${
                      isSelected
                        ? "bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-sm"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                    }`}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Scheduled Date & Technician */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Scheduled Date *
              </label>
              <div className="relative">
                <input
                  type="date"
                  placeholder="YYYY-MM-DD"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  onClick={(e) => {
                    try {
                      (e.target as HTMLInputElement).showPicker?.();
                    } catch {}
                  }}
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-cyan-500 transition-colors [color-scheme:dark] cursor-pointer"
                />
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Assigned Technician *
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Viktor Vance (Chief Mech Tech)"
                  value={technician}
                  onChange={(e) => setTechnician(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Estimated Downtime & Cost */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Est. Downtime (Hours)
              </label>
              <div className="relative">
                <input
                  ref={hoursInputRef}
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="48"
                  placeholder="e.g. 2.0"
                  value={estimatedHours}
                  onChange={(e) => setEstimatedHours(e.target.value)}
                  title="Scroll mouse wheel up/down to increment/decrement hours"
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                />
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Est. Cost (₹ INR)
              </label>
              <div className="relative">
                <input
                  ref={costInputRef}
                  type="number"
                  step="25"
                  min="0"
                  placeholder="e.g. 250"
                  value={estimatedCost}
                  onChange={(e) => setEstimatedCost(e.target.value)}
                  title="Scroll mouse wheel up/down to increment/decrement cost"
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                />
                <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Work Description & Scope *
            </label>
            <div className="relative">
              <textarea
                rows={3}
                placeholder="e.g. Multi-point lubrication, sensor calibration & drive alignment check..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-cyan-500 transition-colors resize-none"
              />
            </div>
          </div>

          {/* Notice */}
          <div className="bg-slate-950/60 rounded-lg p-3 border border-slate-800 text-xs text-slate-400 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              This will update the machine record and log a scheduled work order.
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 active:bg-cyan-500 rounded-lg transition-colors shadow-lg shadow-cyan-500/20 disabled:opacity-60 flex items-center gap-1.5"
            >
              <Wrench className="w-4 h-4" />
              <span>{isSubmitting ? "Creating..." : "Confirm Work Order"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
