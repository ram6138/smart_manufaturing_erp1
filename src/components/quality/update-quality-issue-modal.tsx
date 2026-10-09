"use client";

import React, { useState, useEffect } from "react";
import { QualityDefect, DefectStatus } from "@/types/quality";
import {
  X,
  FileEdit,
  AlertTriangle,
  CheckCircle2,
  Wrench,
  HelpCircle,
} from "lucide-react";

interface UpdateQualityIssueModalProps {
  defect: QualityDefect | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedDefect: QualityDefect) => void;
}

export function UpdateQualityIssueModal({
  defect,
  isOpen,
  onClose,
  onSave,
}: UpdateQualityIssueModalProps) {
  const [status, setStatus] = useState<DefectStatus>("Open");
  const [rootCause, setRootCause] = useState("");
  const [correctiveAction, setCorrectiveAction] = useState("");
  const [assignedEngineer, setAssignedEngineer] = useState("");

  useEffect(() => {
    if (defect) {
      setStatus(defect.status);
      setRootCause(defect.rootCause || "");
      setCorrectiveAction(defect.correctiveAction || "");
      setAssignedEngineer(defect.assignedEngineer || "Elena Rostova (QA Lead)");
    }
  }, [defect]);

  if (!isOpen || !defect) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: QualityDefect = {
      ...defect,
      status,
      rootCause: rootCause.trim(),
      correctiveAction: correctiveAction.trim(),
      assignedEngineer: assignedEngineer.trim(),
    };
    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 max-h-[88vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <FileEdit className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Update Quality Issue (CAPA)</h3>
              <p className="text-xs text-slate-400">
                {defect.qualityDefectId} • {defect.product} ({defect.defectType})
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs overflow-y-auto flex-1 pr-2 custom-scrollbar">
          {/* Status Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Non-Conformance Status *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(["Open", "Investigating", "Resolved", "Closed"] as DefectStatus[]).map((st) => {
                const isSelected = status === st;
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatus(st)}
                    className={`py-2 px-3 rounded-lg font-semibold border transition-all text-center ${
                      isSelected
                        ? st === "Open"
                          ? "bg-rose-500/20 border-rose-500 text-rose-300"
                          : st === "Investigating"
                          ? "bg-amber-500/20 border-amber-500 text-amber-300"
                          : st === "Resolved"
                          ? "bg-blue-500/20 border-blue-500 text-blue-300"
                          : "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {st}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Assigned Engineer */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Assigned QA / Process Engineer
            </label>
            <input
              type="text"
              value={assignedEngineer}
              onChange={(e) => setAssignedEngineer(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Root Cause */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Root Cause Analysis (5-Why / Fishbone) *
            </label>
            <textarea
              rows={3}
              value={rootCause}
              onChange={(e) => setRootCause(e.target.value)}
              placeholder="Describe what mechanism caused the non-conformance..."
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-cyan-500 resize-none leading-relaxed"
            />
          </div>

          {/* Corrective Action */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Corrective & Preventive Action (CAPA) *
            </label>
            <textarea
              rows={3}
              value={correctiveAction}
              onChange={(e) => setCorrectiveAction(e.target.value)}
              placeholder="Detail actions taken to prevent recurrence and verify effectiveness..."
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-cyan-500 resize-none leading-relaxed"
            />
          </div>

          {/* Notice */}
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-slate-400 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              Saving will update the quality defect registry and recalculate overall plant quality score in mock state.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 active:bg-cyan-500 rounded-lg transition-colors shadow-lg shadow-cyan-500/20"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
