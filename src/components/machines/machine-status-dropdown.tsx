"use client";

import React, { useState, useRef, useEffect } from "react";
import { MachineStatus } from "@/types/machines";
import {
  AlertTriangle,
  Clock,
  Wrench,
  ChevronDown,
  Check,
  Power,
  Play,
  Pause,
} from "lucide-react";

interface MachineStatusDropdownProps {
  machineId: string;
  status: MachineStatus | string;
  onStatusChange: (machineId: string, newStatus: "Running" | "Idle" | "Maintenance" | "Warning") => void;
  disabled?: boolean;
  size?: "sm" | "md";
}

export function MachineStatusDropdown({
  machineId,
  status,
  onStatusChange,
  disabled = false,
  size = "md",
}: MachineStatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const norm = (status || "Running").toLowerCase().trim();
  let currentStatus: "Running" | "Idle" | "Maintenance" | "Warning" = "Running";
  if (norm === "warning" || norm === "alert" || norm === "degraded") {
    currentStatus = "Warning";
  } else if (norm === "maintenance" || norm === "under maintenance" || norm === "repair" || norm === "offline") {
    currentStatus = "Maintenance";
  } else if (norm === "idle" || norm === "standby" || norm === "ready") {
    currentStatus = "Idle";
  } else {
    currentStatus = "Running";
  }

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (newStatus: "Running" | "Idle" | "Maintenance" | "Warning", e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    if (newStatus !== currentStatus) {
      onStatusChange(machineId, newStatus);
    }
  };

  const getBadgeStyle = () => {
    switch (currentStatus) {
      case "Warning":
        return "bg-amber-950/90 text-amber-300 border-amber-800/80 hover:bg-amber-900/90";
      case "Maintenance":
        return "bg-rose-950/90 text-rose-300 border-rose-800/80 hover:bg-rose-900/90";
      case "Idle":
        return "bg-slate-800/90 text-slate-300 border-slate-700 hover:bg-slate-750";
      case "Running":
      default:
        return "bg-emerald-950/90 text-emerald-300 border-emerald-800/80 hover:bg-emerald-900/90";
    }
  };

  const options: Array<{
    id: "Running" | "Idle" | "Maintenance" | "Warning";
    label: string;
    desc: string;
    icon: React.ReactNode;
    color: string;
  }> = [
    {
      id: "Running",
      label: "Running",
      desc: "Active production load & sensor telemetry",
      icon: <Play className="w-3.5 h-3.5 text-emerald-400" />,
      color: "text-emerald-400",
    },
    {
      id: "Idle",
      label: "Idle (Standby)",
      desc: "Zero motor load, ambient temperature",
      icon: <Pause className="w-3.5 h-3.5 text-slate-400" />,
      color: "text-slate-300",
    },
    {
      id: "Maintenance",
      label: "Maintenance",
      desc: "Offline for preventive / corrective service",
      icon: <Wrench className="w-3.5 h-3.5 text-rose-400" />,
      color: "text-rose-400",
    },
    {
      id: "Warning",
      label: "Warning",
      desc: "Anomalous vibration or thermal drift",
      icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />,
      color: "text-amber-400",
    },
  ];

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer shadow-xs select-none ${getBadgeStyle()} ${
          disabled ? "opacity-60 cursor-not-allowed" : ""
        }`}
        title="Click to change machine status (Running / Idle / Maintenance / Warning)"
      >
        {currentStatus === "Running" && (
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        )}
        {currentStatus === "Idle" && <Clock className="w-3.5 h-3.5 text-slate-400" />}
        {currentStatus === "Maintenance" && <Wrench className="w-3.5 h-3.5 text-rose-400 animate-pulse" />}
        {currentStatus === "Warning" && <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}

        <span>{currentStatus}</span>
        <ChevronDown className={`w-3 h-3 transition-transform duration-200 opacity-70 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute left-0 z-50 mt-1.5 w-60 rounded-xl bg-slate-900 border border-slate-700/80 shadow-2xl p-1.5 backdrop-blur-md animate-in fade-in zoom-in-95 duration-150"
          style={{ backgroundColor: "#0f172a" }}
        >
          <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
            Switch Machine State
          </div>
          <div className="py-1 space-y-0.5">
            {options.map((opt) => {
              const isSelected = opt.id === currentStatus;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={(e) => handleSelect(opt.id, e)}
                  className={`w-full flex items-start gap-2.5 px-2.5 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-slate-800 text-white"
                      : "hover:bg-slate-800/60 text-slate-300"
                  }`}
                >
                  <div className="mt-0.5 shrink-0">{opt.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-semibold ${opt.color}`}>
                        {opt.label}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                      {opt.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
