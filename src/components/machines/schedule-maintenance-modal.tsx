"use client";

import React, { useState, useEffect, useRef } from "react";
import { MachineItem, MaintenanceRecord, MaintenanceType } from "@/types/machines";
import {
  X,
  Wrench,
  Calendar as CalendarIcon,
  User,
  FileText,
  Clock,
  IndianRupee,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Search,
  ChevronLeft,
  ChevronRight,
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

  // Custom in-DOM dropdown states (prevents OS native window popups that cause black screen)
  const [isMachineDropdownOpen, setIsMachineDropdownOpen] = useState(false);
  const [machineSearch, setMachineSearch] = useState("");
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState<Date>(() => new Date());

  const hoursInputRef = useRef<HTMLInputElement>(null);
  const costInputRef = useRef<HTMLInputElement>(null);
  const machineDropdownRef = useRef<HTMLDivElement>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);

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

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        machineDropdownRef.current &&
        !machineDropdownRef.current.contains(e.target as Node)
      ) {
        setIsMachineDropdownOpen(false);
      }
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(e.target as Node)
      ) {
        setIsDatePickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Non-passive native wheel listener for Hours input
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

  // Non-passive native wheel listener for Cost input
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

  // Initialize only when modal opens
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
      setIsMachineDropdownOpen(false);
      setIsDatePickerOpen(false);
      setMachineSearch("");
      setViewMonth(new Date());
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

  // Filtered machines for custom dropdown
  const filteredMachinesList = machines.filter((m) => {
    if (!machineSearch.trim()) return true;
    const q = machineSearch.toLowerCase();
    return (
      (m.machineCode || "").toLowerCase().includes(q) ||
      (m.machineName || "").toLowerCase().includes(q) ||
      (m.location || "").toLowerCase().includes(q)
    );
  });

  // Calendar Helper functions
  const formatDateForDisplay = (dStr: string) => {
    if (!dStr) return "";
    try {
      const [y, m, d] = dStr.split("-").map(Number);
      const dt = new Date(y, m - 1, d);
      return dt.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dStr;
    }
  };

  const setPresetDate = (daysFromToday: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysFromToday);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    setScheduledDate(`${y}-${m}-${day}`);
    setIsDatePickerOpen(false);
  };

  // Calendar day grid calculation
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const calYear = viewMonth.getFullYear();
  const calMonth = viewMonth.getMonth();
  const totalDays = getDaysInMonth(calYear, calMonth);
  const firstDay = getFirstDayOfMonth(calYear, calMonth);
  const monthName = viewMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 overflow-visible">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 border border-blue-200 dark:bg-cyan-500/10 dark:border-cyan-500/20 text-blue-600 dark:text-cyan-400">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Schedule Maintenance Work Order</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Create planned preventive or corrective service record</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 rounded-lg text-rose-700 dark:text-rose-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Machine Selection (Custom in-DOM Dropdown) */}
          <div className="relative" ref={machineDropdownRef}>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Target Machine *
            </label>
            <button
              type="button"
              onClick={() => {
                setIsMachineDropdownOpen((prev) => !prev);
                setIsDatePickerOpen(false);
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-lg text-left text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 dark:focus:border-cyan-500 transition-all cursor-pointer shadow-sm"
            >
              {selectedMachine ? (
                <div className="flex items-center gap-2 truncate">
                  <span className="font-bold text-blue-600 dark:text-cyan-400 font-mono">{selectedMachine.machineCode}</span>
                  <span className="text-slate-900 dark:text-white font-medium truncate">— {selectedMachine.machineName}</span>
                  <span
                    className={`ml-1.5 text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                      selectedMachine.status === "Running"
                        ? "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-400"
                        : selectedMachine.status === "Warning"
                        ? "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-400"
                        : "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {selectedMachine.status}
                  </span>
                </div>
              ) : (
                <span className="text-slate-400 dark:text-slate-500">-- Select Target Machine --</span>
              )}
              <ChevronDown
                className={`w-4 h-4 text-slate-500 transition-transform shrink-0 ${
                  isMachineDropdownOpen ? "rotate-180 text-blue-600 dark:text-cyan-400" : ""
                }`}
              />
            </button>

            {/* Custom Dropdown Menu */}
            {isMachineDropdownOpen && (
              <div
                onWheel={(e) => e.stopPropagation()}
                className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl p-2 max-h-60 overflow-y-auto overscroll-contain space-y-1 animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="relative mb-2 px-1">
                  <input
                    type="text"
                    placeholder="Search machine code or name..."
                    value={machineSearch}
                    onChange={(e) => setMachineSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 dark:focus:border-cyan-500"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-3 top-2.5" />
                </div>

                {filteredMachinesList.length === 0 ? (
                  <div className="p-3 text-center text-xs text-slate-500">No matching machines</div>
                ) : (
                  filteredMachinesList.map((m) => {
                    const isCurrent = m.id === selectedMachineId;
                    return (
                      <div
                        key={m.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                          setSelectedMachineId(m.id);
                          setIsMachineDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-2.5 rounded-lg text-left text-xs transition-colors cursor-pointer select-none ${
                          isCurrent
                            ? "bg-blue-50 border border-blue-200 dark:bg-cyan-500/15 dark:border-cyan-500/30"
                            : "hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent"
                        }`}
                      >
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-blue-600 dark:text-cyan-400">{m.machineCode}</span>
                            <span className="font-semibold text-slate-900 dark:text-slate-100">{m.machineName}</span>
                          </div>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">{m.location || "Main Factory"}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
                              m.riskScore >= 75
                                ? "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/30"
                                : m.riskScore >= 45
                                ? "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30"
                                : "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30"
                            }`}
                          >
                            Risk {m.riskScore}%
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {selectedMachine && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Location: <span className="text-slate-700 dark:text-slate-300 font-medium">{selectedMachine.location}</span> | Current Risk:{" "}
                <span
                  className={
                    selectedMachine.riskScore >= 75
                      ? "text-rose-600 dark:text-rose-400 font-bold"
                      : selectedMachine.riskScore >= 45
                      ? "text-amber-600 dark:text-amber-400 font-bold"
                      : "text-emerald-600 dark:text-emerald-400 font-bold"
                  }
                >
                  {selectedMachine.riskScore}% ({selectedMachine.riskLevel})
                </span>
              </p>
            )}
          </div>

          {/* Maintenance Type */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Maintenance Type *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["Preventive", "Corrective", "Inspection"] as MaintenanceType[]).map((type) => {
                const isSelected = maintenanceType === type;
                return (
                  <div
                    key={type}
                    role="button"
                    tabIndex={0}
                    onClick={() => setMaintenanceType(type)}
                    className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all text-center cursor-pointer select-none ${
                      isSelected
                        ? "bg-blue-600 text-white border-blue-600 dark:bg-cyan-500/20 dark:border-cyan-500 dark:text-cyan-300 shadow-sm"
                        : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900"
                    }`}
                  >
                    {type}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Scheduled Date & Technician */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Custom Scheduled Date In-DOM Picker */}
            <div className="relative" ref={datePickerRef}>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Scheduled Date *
              </label>
              <button
                type="button"
                onClick={() => {
                  setIsDatePickerOpen((prev) => !prev);
                  setIsMachineDropdownOpen(false);
                }}
                className="w-full flex items-center justify-between pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-blue-500 dark:focus:border-cyan-500 transition-colors cursor-pointer text-left relative"
              >
                <CalendarIcon className="w-4 h-4 text-blue-600 dark:text-cyan-400 absolute left-3 top-2.5 pointer-events-none" />
                <span className={scheduledDate ? "text-slate-900 dark:text-slate-100 font-semibold" : "text-slate-400 dark:text-slate-500"}>
                  {scheduledDate ? formatDateForDisplay(scheduledDate) : "Pick date..."}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-500 transition-transform ${
                    isDatePickerOpen ? "rotate-180 text-blue-600 dark:text-cyan-400" : ""
                  }`}
                />
              </button>

              {/* In-DOM Calendar Dropdown */}
              {isDatePickerOpen && (
                <div
                  onWheel={(e) => e.stopPropagation()}
                  className="absolute left-0 right-0 sm:right-auto sm:w-72 top-full mt-1.5 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl p-3 animate-in fade-in zoom-in-95 duration-150"
                >
                  {/* Quick Preset Buttons */}
                  <div className="grid grid-cols-3 gap-1 pb-2.5 mb-2.5 border-b border-slate-200 dark:border-slate-800">
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setPresetDate(0)}
                      className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:bg-blue-50 hover:border-blue-300 dark:hover:border-cyan-500 text-[11px] text-slate-700 dark:text-slate-300 font-semibold text-center cursor-pointer"
                    >
                      Today
                    </div>
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setPresetDate(1)}
                      className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:bg-blue-50 hover:border-blue-300 dark:hover:border-cyan-500 text-[11px] text-slate-700 dark:text-slate-300 font-semibold text-center cursor-pointer"
                    >
                      Tomorrow
                    </div>
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setPresetDate(7)}
                      className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:bg-blue-50 hover:border-blue-300 dark:hover:border-cyan-500 text-[11px] text-slate-700 dark:text-slate-300 font-semibold text-center cursor-pointer"
                    >
                      +1 Week
                    </div>
                  </div>

                  {/* Calendar Header */}
                  <div className="flex items-center justify-between mb-2 px-1">
                    <button
                      type="button"
                      onClick={() => setViewMonth(new Date(calYear, calMonth - 1, 1))}
                      className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{monthName}</span>
                    <button
                      type="button"
                      onClick={() => setViewMonth(new Date(calYear, calMonth + 1, 1))}
                      className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Day Names */}
                  <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-1">
                    <span>Su</span>
                    <span>Mo</span>
                    <span>Tu</span>
                    <span>We</span>
                    <span>Th</span>
                    <span>Fr</span>
                    <span>Sa</span>
                  </div>

                  {/* Day Cells */}
                  <div className="grid grid-cols-7 gap-1 text-center text-xs">
                    {Array.from({ length: firstDay }).map((_, i) => (
                      <div key={`empty-${i}`} />
                    ))}
                    {Array.from({ length: totalDays }).map((_, i) => {
                      const dayNum = i + 1;
                      const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(
                        dayNum
                      ).padStart(2, "0")}`;
                      const isSelected = scheduledDate === dateStr;
                      const isToday =
                        new Date().toDateString() === new Date(calYear, calMonth, dayNum).toDateString();

                      return (
                        <div
                          key={dayNum}
                          role="button"
                          tabIndex={0}
                          onClick={() => {
                            setScheduledDate(dateStr);
                            setIsDatePickerOpen(false);
                          }}
                          className={`h-7 w-7 mx-auto rounded-lg flex items-center justify-center font-bold text-xs transition-all cursor-pointer select-none ${
                            isSelected
                              ? "bg-blue-600 text-white dark:bg-cyan-500 dark:text-slate-950 shadow-md shadow-blue-500/20"
                              : isToday
                              ? "border border-blue-500 text-blue-600 dark:text-cyan-400 hover:bg-blue-50 dark:hover:bg-slate-800"
                              : "text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                          }`}
                        >
                          {dayNum}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Assigned Technician *
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Viktor Vance (Chief Mech Tech)"
                  value={technician}
                  onChange={(e) => setTechnician(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-blue-500 dark:focus:border-cyan-500 transition-colors"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Estimated Downtime & Cost */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
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
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-blue-500 dark:focus:border-cyan-500 transition-colors"
                />
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
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
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-blue-500 dark:focus:border-cyan-500 transition-colors"
                />
                <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Work Description & Scope *
            </label>
            <div className="relative">
              <textarea
                rows={3}
                placeholder="e.g. Multi-point lubrication, sensor calibration & drive alignment check..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-blue-500 dark:focus:border-cyan-500 transition-colors resize-none"
              />
            </div>
          </div>

          {/* Notice */}
          <div className="bg-slate-50 dark:bg-slate-950/60 rounded-lg p-3 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <span>
              This will update the machine record and log a scheduled work order.
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 dark:bg-cyan-400 dark:hover:bg-cyan-300 dark:text-slate-950 rounded-lg transition-colors shadow-lg shadow-blue-500/20 dark:shadow-cyan-500/20 disabled:opacity-60 flex items-center gap-1.5 cursor-pointer"
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
