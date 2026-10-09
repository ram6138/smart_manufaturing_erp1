"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { ErpLayout } from "@/components/layout/erp-layout";
import { MachineItem, MachineFilterState, MaintenanceRecord, MaintenanceAlert } from "@/types/machines";
import { INITIAL_MACHINES, INITIAL_MAINTENANCE_ALERTS } from "@/lib/mock-data/machines";
import { MachineKpiCards, normalizeMachineStatus } from "@/components/machines/machine-kpi-cards";
import { MachineFilters } from "@/components/machines/machine-filters";
import { MachineHealthTable } from "@/components/machines/machine-health-table";
import { SensorCharts } from "@/components/machines/sensor-charts";
import { PredictiveMaintenanceCard } from "@/components/machines/predictive-maintenance-card";
import { MaintenanceAlerts } from "@/components/machines/maintenance-alerts";
import { MachineDetails } from "@/components/machines/machine-details";
import { ScheduleMaintenanceModal } from "@/components/machines/schedule-maintenance-modal";
import {
  Wrench,
  Sparkles,
  RefreshCw,
  Plus,
  CheckCircle2,
  Calendar,
} from "lucide-react";

export default function MachinesPage() {
  const [machines, setMachines] = useState<MachineItem[]>(INITIAL_MACHINES);
  const [alerts, setAlerts] = useState<MaintenanceAlert[]>(INITIAL_MAINTENANCE_ALERTS);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Filter state
  const [filters, setFilters] = useState<MachineFilterState>({
    searchQuery: "",
    machineType: "all",
    status: "all",
    riskLevel: "all",
  });

  // Selected machine for Sensor Monitoring section
  const [activeChartMachineId, setActiveChartMachineId] = useState<string>("mch_001");
  const [activeKpiCard, setActiveKpiCard] = useState<string>("total");

  // Modal states
  const [selectedMachineForDetails, setSelectedMachineForDetails] = useState<MachineItem | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [preselectedScheduleMachineId, setPreselectedScheduleMachineId] = useState<string | null>(null);

  // Toast / notification state
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch live machine data from PostgreSQL API
  const fetchMachines = useCallback(async () => {
    try {
      const res = await fetch("/api/machines");
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();

      if (data.status === "success" && data.machines && data.machines.length > 0) {
        setMachines(data.machines);
        if (data.alerts) setAlerts(data.alerts);
      }
    } catch (err: any) {
      console.warn("Using fallback machine data:", err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const res = await fetch("/api/machines", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        const data = await res.json();
        if (data.status === "success" && isMounted && data.machines?.length > 0) {
          setMachines(data.machines);
          if (data.alerts) setAlerts(data.alerts);
        }
      } catch (err: any) {
        console.warn("Using fallback machine data:", err.message);
      }
    }

    load();
    const interval = setInterval(load, 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Handle KPI card clicks for quick filter toggling and smooth navigation
  const handleKpiCardClick = (cardId: string) => {
    setActiveKpiCard(cardId);
    if (cardId === "total") {
      setFilters((prev) => ({ ...prev, status: "all", riskLevel: "all" }));
    } else if (cardId === "running") {
      setFilters((prev) => ({ ...prev, status: "Running", riskLevel: "all" }));
    } else if (cardId === "idle") {
      setFilters((prev) => ({ ...prev, status: "Idle", riskLevel: "all" }));
    } else if (cardId === "maintenance") {
      setFilters((prev) => ({ ...prev, status: "Maintenance", riskLevel: "all" }));
    } else if (cardId === "warning") {
      setFilters((prev) => ({ ...prev, status: "Warning", riskLevel: "all" }));
    } else if (cardId === "high_risk") {
      setFilters((prev) => ({ ...prev, status: "all", riskLevel: "High" }));
    }

    // Smoothly scroll down to the filtered machines table
    setTimeout(() => {
      const el = document.getElementById("machines-table-section");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 50);
  };

  // Dynamic Filter Options derived from live machines
  const availableMachineTypes = useMemo(() => {
    const set = new Set<string>();
    machines.forEach((m) => {
      if (m.machineType && m.machineType.trim()) set.add(m.machineType.trim());
    });
    return Array.from(set);
  }, [machines]);

  const availableStatuses = useMemo(() => {
    const set = new Set<string>();
    machines.forEach((m) => {
      if (m.status) set.add(normalizeMachineStatus(m.status));
    });
    return Array.from(set);
  }, [machines]);

  const availableRiskLevels = useMemo(() => {
    const set = new Set<string>();
    machines.forEach((m) => {
      if (m.riskLevel && m.riskLevel.trim()) set.add(m.riskLevel.trim());
    });
    return Array.from(set);
  }, [machines]);

  // Filter logic
  const filteredMachines = useMemo(() => {
    return machines.filter((machine) => {
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase().trim();
        const matchesCode = (machine.machineCode || "").toLowerCase().includes(query);
        const matchesName = (machine.machineName || "").toLowerCase().includes(query);
        const matchesType = (machine.machineType || "").toLowerCase().includes(query);
        const matchesLocation = (machine.location || "").toLowerCase().includes(query);
        if (!matchesCode && !matchesName && !matchesType && !matchesLocation) {
          return false;
        }
      }

      if (filters.machineType !== "all") {
        const target = filters.machineType.toLowerCase().trim();
        const cur = (machine.machineType || "").toLowerCase().trim();
        if (cur !== target && !cur.includes(target) && !target.includes(cur)) return false;
      }

      if (filters.status !== "all") {
        const target = filters.status.toLowerCase().trim();
        const cur = normalizeMachineStatus(machine.status).toLowerCase().trim();
        if (cur !== target) return false;
      }

      if (filters.riskLevel !== "all") {
        const target = filters.riskLevel.toLowerCase().trim();
        const cur = (machine.riskLevel || "").toLowerCase().trim();
        if (target === "high" && (cur === "high" || cur === "critical")) {
          return true;
        }
        if (cur !== target) return false;
      }

      return true;
    });
  }, [machines, filters]);

  // Handlers
  const handleOpenDetails = (machine: MachineItem) => {
    setSelectedMachineForDetails(machine);
    setIsDetailsOpen(true);
  };

  const handleOpenDetailsById = (machineId: string) => {
    const found = machines.find((m) => m.id === machineId);
    if (found) {
      setSelectedMachineForDetails(found);
      setIsDetailsOpen(true);
      setActiveChartMachineId(found.id);
    }
  };

  const handleOpenScheduleModal = (machineId?: string) => {
    setPreselectedScheduleMachineId(machineId || null);
    setIsScheduleModalOpen(true);
  };

  const handleScheduleSuccess = async (newRecord: MaintenanceRecord) => {
    try {
      await fetch("/api/machines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "scheduleMaintenance",
          machineId: parseInt(newRecord.machineId),
          maintenanceDate: newRecord.date,
          type: newRecord.type,
          notes: newRecord.description,
          technician: newRecord.technician,
        }),
      });
      fetchMachines();
    } catch (e) {
      console.warn(e);
    }

    setSuccessToast(`Work order ${newRecord.maintenanceId} successfully scheduled!`);
    setTimeout(() => {
      setSuccessToast(null);
    }, 4500);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchMachines().finally(() => {
      setIsRefreshing(false);
      setSuccessToast("Sensor streams & AI predictive health scores updated");
      setTimeout(() => setSuccessToast(null), 3500);
    });
  };

  return (
    <ErpLayout>
      <div className="space-y-6 pb-12">
        {/* Toast Notification */}
        {successToast && (
          <div className="fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-emerald-950 border border-emerald-500 text-emerald-200 rounded-xl shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top duration-300">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-sm font-medium">{successToast}</span>
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Machines & Predictive Maintenance
              </h1>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Live factory machines, sensor streams, predictive maintenance & service logs.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing || isLoading}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-all shadow-sm disabled:opacity-50"
              title="Refresh sensor streams"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isRefreshing || isLoading ? "animate-spin" : ""}`} />
              <span>{isRefreshing || isLoading ? "Syncing..." : "Sync Telemetry"}</span>
            </button>

            <button
              onClick={() => handleOpenScheduleModal()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-cyan-500/20 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule Maintenance</span>
            </button>
          </div>
        </div>

        {/* 1. MACHINE KPI CARDS */}
        <MachineKpiCards
          machines={machines}
          activeCardId={activeKpiCard}
          onCardClick={handleKpiCardClick}
        />

        {/* 2. MAINTENANCE ALERTS */}
        <MaintenanceAlerts
          alerts={alerts}
          onViewMachine={handleOpenDetailsById}
          onScheduleMaintenance={handleOpenScheduleModal}
        />

        {/* 3. MACHINE FILTERS */}
        <MachineFilters
          filters={filters}
          onFilterChange={(newFilters) => {
            setFilters((prev) => ({ ...prev, ...newFilters }));
            setActiveKpiCard("");
          }}
          onResetFilters={() => {
            setFilters({
              searchQuery: "",
              machineType: "all",
              status: "all",
              riskLevel: "all",
            });
            setActiveKpiCard("total");
          }}
          totalMachines={machines.length}
          filteredCount={filteredMachines.length}
          availableMachineTypes={availableMachineTypes}
          availableStatuses={availableStatuses}
          availableRiskLevels={availableRiskLevels}
        />

        {/* 4. MACHINE STATUS OVERVIEW & HEALTH TABLE */}
        <div id="machines-table-section" className="scroll-mt-20">
          <MachineHealthTable
            machines={filteredMachines}
            onViewMachine={handleOpenDetails}
            onScheduleMaintenance={(m) => handleOpenScheduleModal(m.id)}
          />
        </div>

        {/* 5. PREDICTIVE MAINTENANCE (AI / ML PROTOTYPE LAYER) */}
        <PredictiveMaintenanceCard
          machines={machines}
          onViewMachine={(m) => handleOpenDetails(m)}
          onScheduleMaintenance={(m) => handleOpenScheduleModal(m.id)}
        />

        {/* 6. SENSOR MONITORING (24h Interactive Recharts) */}
        <SensorCharts
          machines={machines}
          selectedMachineId={activeChartMachineId}
          onSelectMachine={setActiveChartMachineId}
        />

        {/* MODALS */}
        <MachineDetails
          machine={selectedMachineForDetails}
          isOpen={isDetailsOpen}
          onClose={() => {
            setIsDetailsOpen(false);
            setSelectedMachineForDetails(null);
          }}
          onScheduleMaintenance={(machineId) => {
            setIsDetailsOpen(false);
            handleOpenScheduleModal(machineId);
          }}
        />

        <ScheduleMaintenanceModal
          isOpen={isScheduleModalOpen}
          onClose={() => {
            setIsScheduleModalOpen(false);
            setPreselectedScheduleMachineId(null);
          }}
          machines={machines}
          preselectedMachineId={preselectedScheduleMachineId}
          onScheduleSuccess={handleScheduleSuccess}
        />
      </div>
    </ErpLayout>
  );
}
