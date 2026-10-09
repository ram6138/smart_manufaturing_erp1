"use client";

import React, { useState, useMemo, useEffect } from "react";
import { ErpLayout } from "@/components/layout/erp-layout";
import {
  QualityInspection,
  QualityDefect,
  QualityAnomaly,
  QualityFilterState,
  ProductName,
  DefectStatus,
} from "@/types/quality";
import {
  INITIAL_INSPECTIONS,
  INITIAL_DEFECTS,
  INITIAL_ANOMALIES,
  QUALITY_TREND_30_DAYS,
  PRODUCT_QUALITY_BENCHMARKS,
} from "@/lib/mock-data/quality";
import { QualityKpiCards } from "@/components/quality/quality-kpi-cards";
import { QualityScore } from "@/components/quality/quality-score";
import { QualityFilters } from "@/components/quality/quality-filters";
import { QualityTrendChart } from "@/components/quality/quality-trend-chart";
import { DefectDistributionChart } from "@/components/quality/defect-distribution-chart";
import { ProductComparisonChart } from "@/components/quality/product-comparison-chart";
import { InspectionTable } from "@/components/quality/inspection-table";
import { DefectTable } from "@/components/quality/defect-table";
import { QualityAnomalies } from "@/components/quality/quality-anomalies";
import { InspectionDetails } from "@/components/quality/inspection-details";
import { UpdateQualityIssueModal } from "@/components/quality/update-quality-issue-modal";
import { NewInspectionModal } from "@/components/quality/new-inspection-modal";
import {
  Plus,
  RefreshCw,
  CheckCircle2,
  Sparkles,
  ClipboardCheck,
} from "lucide-react";

export default function QualityPage() {
  const [inspections, setInspections] = useState<QualityInspection[]>(INITIAL_INSPECTIONS);
  const [defects, setDefects] = useState<QualityDefect[]>(INITIAL_DEFECTS);
  const [anomalies, setAnomalies] = useState<QualityAnomaly[]>(INITIAL_ANOMALIES);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const res = await fetch("/api/quality", { cache: "no-store" });
        if (res.ok && isMounted) {
          const data = await res.json();
          if (data.status === "success" && isMounted && data.inspections?.length > 0) {
            const transformedInspections: QualityInspection[] = data.inspections.map((i: any) => {
              const prodName = (i.product || i.productName || 'Chocolate Biscuit') as ProductName;
              const inspNum = i.inspectionNumber || i.inspectionId || `INS-${String(i.id).padStart(4, '0')}`;
              const poId = i.productionOrderId || (i.batchNumber ? `PO-${i.batchNumber.replace('BAT-', '')}` : 'PO-2026-001');
              const defQuantity = Number(i.defectiveQuantity ?? i.failedQuantity ?? 0);
              const inspectedQty = Number(i.inspectedQuantity || 0);
              const passedQty = Number(i.passedQuantity || (inspectedQty - defQuantity));

              let statusNorm: "Passed" | "Failed" | "Conditional" | "Pending" = "Passed";
              const sRaw = (i.status || '').toLowerCase();
              if (sRaw.includes('fail') || sRaw.includes('reject')) {
                statusNorm = "Failed";
              } else if (sRaw.includes('conditional') || sRaw.includes('review') || sRaw.includes('note')) {
                statusNorm = "Conditional";
              } else if (sRaw.includes('pending')) {
                statusNorm = "Pending";
              } else {
                statusNorm = "Passed";
              }

              const itemDefects: QualityDefect[] = [];
              if (defQuantity > 0) {
                itemDefects.push({
                  id: `defect_${i.id}`,
                  qualityDefectId: `DEF-2026-${String(i.id).padStart(4, '0')}`,
                  inspectionId: String(i.id),
                  inspectionNumber: inspNum,
                  productionOrderId: poId,
                  product: prodName,
                  batchNumber: i.batchNumber || 'BAT-2026-001',
                  defectType: (i.defectType && i.defectType !== 'None' ? i.defectType : 'Quality Variance') as any,
                  defectQuantity: defQuantity,
                  severity: (i.severity && i.severity !== 'None' ? i.severity : 'Medium') as any,
                  rootCause: i.rootCause || 'Under investigation',
                  correctiveAction: i.correctiveAction || 'Quality hold and calibration',
                  status: (statusNorm === 'Passed' ? 'Closed' : 'Open') as DefectStatus,
                  detectedAt: i.inspectionDate || new Date().toISOString(),
                  assignedEngineer: i.inspectorName || 'Elena Rostova (QA Lead)',
                });
              }

              return {
                id: String(i.id),
                inspectionId: i.inspectionId || `INS-${String(i.id).padStart(4, '0')}`,
                inspectionNumber: inspNum,
                productionOrderId: poId,
                product: prodName,
                batchNumber: i.batchNumber || 'BAT-2026-001',
                inspectionDate: i.inspectionDate || new Date().toISOString(),
                inspectorEmployeeId: i.inspectorEmployeeId || 'EMP-QA-01',
                inspectorName: i.inspectorName || 'Anita Sharma (QA Lead)',
                inspectedQuantity: inspectedQty,
                passedQuantity: passedQty,
                failedQuantity: defQuantity,
                status: statusNorm,
                notes: i.correctiveAction || i.rootCause || '',
                defects: itemDefects,
              };
            });

            setInspections(transformedInspections);

            // Derive all active defects
            const allDefects: QualityDefect[] = [];
            transformedInspections.forEach((insp) => {
              if (insp.defects && insp.defects.length > 0) {
                allDefects.push(...insp.defects);
              }
            });
            if (allDefects.length > 0) {
              setDefects(allDefects);
            }
          }
        }
      } catch (e) {
        console.warn("Using default quality state", e);
      }
    }

    loadData();
    const interval = setInterval(loadData, 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Filter state
  const [filters, setFilters] = useState<QualityFilterState>({
    searchQuery: "",
    product: "all",
    status: "all",
    defectType: "all",
    inspector: "all",
    dateRange: "all",
  });

  // Modal states
  const [selectedInspectionForDetails, setSelectedInspectionForDetails] =
    useState<QualityInspection | null>(null);
  const [isInspectionDetailsOpen, setIsInspectionDetailsOpen] = useState(false);

  const [selectedDefectForUpdate, setSelectedDefectForUpdate] =
    useState<QualityDefect | null>(null);
  const [isUpdateIssueModalOpen, setIsUpdateIssueModalOpen] = useState(false);

  const [isNewInspectionModalOpen, setIsNewInspectionModalOpen] = useState(false);

  // Toast / sync state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filtered Inspections
  const filteredInspections = useMemo(() => {
    return inspections.filter((item) => {
      // Search
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase().trim();
        const matchesNum = (item.inspectionNumber || "").toLowerCase().includes(query);
        const matchesPo = (item.productionOrderId || "").toLowerCase().includes(query);
        const matchesBatch = (item.batchNumber || "").toLowerCase().includes(query);
        const matchesInspector = (item.inspectorName || "").toLowerCase().includes(query);
        const matchesProduct = (item.product || "").toLowerCase().includes(query);
        if (!matchesNum && !matchesPo && !matchesBatch && !matchesInspector && !matchesProduct) {
          return false;
        }
      }

      // Product
      if (filters.product !== "all" && item.product !== filters.product) {
        return false;
      }

      // Status
      if (filters.status !== "all" && item.status !== filters.status) {
        return false;
      }

      // Defect Type (matches if inspection contains a defect of that type)
      if (filters.defectType !== "all") {
        const hasDefectType = (item.defects || []).some((d) => d.defectType === filters.defectType);
        if (!hasDefectType) return false;
      }

      // Inspector
      if (filters.inspector && filters.inspector !== "all") {
        const itemInspector = (item.inspectorName || "").toLowerCase();
        const targetInspector = filters.inspector.toLowerCase();
        if (!itemInspector.includes(targetInspector)) {
          return false;
        }
      }

      // Date Range
      if (filters.dateRange !== "all") {
        const itemDate = new Date(item.inspectionDate);
        const now = new Date();
        if (filters.dateRange === "today") {
          const isToday =
            itemDate.getDate() === now.getDate() &&
            itemDate.getMonth() === now.getMonth() &&
            itemDate.getFullYear() === now.getFullYear();
          if (!isToday) return false;
        } else if (filters.dateRange === "7days") {
          const diffDays = (now.getTime() - itemDate.getTime()) / (1000 * 3600 * 24);
          if (diffDays > 7) return false;
        } else if (filters.dateRange === "30days") {
          const diffDays = (now.getTime() - itemDate.getTime()) / (1000 * 3600 * 24);
          if (diffDays > 30) return false;
        }
      }

      return true;
    });
  }, [inspections, filters]);

  // Handlers
  const handleOpenInspectionDetails = (inspection: QualityInspection) => {
    setSelectedInspectionForDetails(inspection);
    setIsInspectionDetailsOpen(true);
  };

  const handleOpenUpdateDefect = (defect: QualityDefect) => {
    setSelectedDefectForUpdate(defect);
    setIsUpdateIssueModalOpen(true);
  };

  const handleInvestigateDefect = async (defect: QualityDefect) => {
    setDefects((prev) =>
      prev.map((d) =>
        d.id === defect.id ? { ...d, status: "Investigating" as DefectStatus } : d
      )
    );
    setInspections((prev) =>
      prev.map((i) => ({
        ...i,
        defects: i.defects.map((d) =>
          d.id === defect.id ? { ...d, status: "Investigating" as DefectStatus } : d
        ),
      }))
    );
    setToastMessage(`Defect ${defect.qualityDefectId} status set to Investigating`);
    setTimeout(() => setToastMessage(null), 3500);

    try {
      await fetch("/api/quality", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inspectionId: defect.inspectionId,
          defectId: defect.id,
          status: "Investigating",
        }),
      });
    } catch (e) {
      console.error("Failed to persist defect status update:", e);
    }
  };

  const handleResolveDefect = async (defect: QualityDefect) => {
    setDefects((prev) =>
      prev.map((d) =>
        d.id === defect.id ? { ...d, status: "Resolved" as DefectStatus } : d
      )
    );
    setInspections((prev) =>
      prev.map((i) => ({
        ...i,
        defects: i.defects.map((d) =>
          d.id === defect.id ? { ...d, status: "Resolved" as DefectStatus } : d
        ),
      }))
    );
    setToastMessage(`Defect ${defect.qualityDefectId} successfully marked as Resolved`);
    setTimeout(() => setToastMessage(null), 3500);

    try {
      await fetch("/api/quality", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inspectionId: defect.inspectionId,
          defectId: defect.id,
          status: "Resolved",
        }),
      });
    } catch (e) {
      console.error("Failed to persist defect resolve update:", e);
    }
  };

  const handleSaveDefectUpdate = async (updatedDefect: QualityDefect) => {
    setDefects((prev) =>
      prev.map((d) => (d.id === updatedDefect.id ? updatedDefect : d))
    );
    setInspections((prev) =>
      prev.map((i) => ({
        ...i,
        defects: i.defects.map((d) =>
          d.id === updatedDefect.id ? updatedDefect : d
        ),
      }))
    );
    setToastMessage(`CAPA record for ${updatedDefect.qualityDefectId} updated successfully`);
    setTimeout(() => setToastMessage(null), 3500);

    try {
      await fetch("/api/quality", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inspectionId: updatedDefect.inspectionId,
          defectId: updatedDefect.id,
          status: updatedDefect.status,
          rootCause: updatedDefect.rootCause,
          correctiveAction: updatedDefect.correctiveAction,
          severity: updatedDefect.severity,
          assignedEngineer: updatedDefect.assignedEngineer,
        }),
      });
    } catch (e) {
      console.error("Failed to persist CAPA update:", e);
    }
  };

  const handleCreateInspection = async (
    newInspection: QualityInspection,
    newDefect?: QualityDefect
  ) => {
    setInspections((prev) => [newInspection, ...prev]);
    if (newDefect) {
      setDefects((prev) => [newDefect, ...prev]);
    }
    setToastMessage(`Inspection ${newInspection.inspectionNumber} recorded successfully!`);
    setTimeout(() => setToastMessage(null), 4000);

    try {
      const res = await fetch("/api/quality", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productionOrderId: newInspection.productionOrderId,
          productName: newInspection.product,
          batchNumber: newInspection.batchNumber,
          inspectorName: newInspection.inspectorName,
          inspectedQuantity: newInspection.inspectedQuantity,
          passedQuantity: newInspection.passedQuantity,
          failedQuantity: newInspection.failedQuantity,
          status: newInspection.status,
          notes: newInspection.notes,
          defectType: newDefect?.defectType || "None",
          defectSeverity: newDefect?.severity || "None",
          rootCause: newDefect?.rootCause || "",
          correctiveAction: newDefect?.correctiveAction || "",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.status === "success" && data.inspectionId) {
          // Re-sync with fresh database records
          fetch("/api/quality", { cache: "no-store" })
            .then((r) => r.json())
            .then((fresh) => {
              if (fresh.status === "success" && fresh.inspections?.length > 0) {
                // state will be automatically updated
              }
            })
            .catch(() => {});
        }
      }
    } catch (e) {
      console.error("Failed to persist inspection to backend:", e);
    }
  };

  const [activeKpiCard, setActiveKpiCard] = useState<string | undefined>(undefined);

  const handleKpiCardClick = (cardKey: "total_inspections" | "passed_inspections" | "failed_inspections" | "pass_rate" | "total_defects" | "open_defects") => {
    setActiveKpiCard(cardKey);

    if (cardKey === "total_inspections") {
      setFilters((prev) => ({ ...prev, status: "all" }));
      document.getElementById("inspections-table-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else if (cardKey === "passed_inspections") {
      setFilters((prev) => ({ ...prev, status: "Passed" }));
      document.getElementById("inspections-table-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else if (cardKey === "failed_inspections") {
      setFilters((prev) => ({ ...prev, status: "Failed" }));
      document.getElementById("inspections-table-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else if (cardKey === "pass_rate") {
      document.getElementById("quality-charts-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else if (cardKey === "total_defects" || cardKey === "open_defects") {
      document.getElementById("defects-table-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleFilterByProduct = (productName: string) => {
    setFilters((prev) => ({ ...prev, product: productName }));
    document.getElementById("inspections-table-section")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setToastMessage("Quality telemetry and statistical process charts re-synced");
      setTimeout(() => setToastMessage(null), 3500);
    }, 600);
  };

  return (
    <ErpLayout>
      <div className="space-y-6 pb-12">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-emerald-950 border border-emerald-500 text-emerald-200 rounded-xl shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top duration-300">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-sm font-medium">{toastMessage}</span>
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Quality Control
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                AQL & SPC Active
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Monitor product quality, defects, inspections and quality risks.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 text-xs font-medium transition-all shadow-xs cursor-pointer"
              title="Refresh quality metrics"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cyan-600 ${isRefreshing ? "animate-spin" : ""}`} />
              <span>{isRefreshing ? "Syncing..." : "Sync QA Data"}</span>
            </button>

            <button
              onClick={() => setIsNewInspectionModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>+ New Inspection</span>
            </button>
          </div>
        </div>

        {/* 1. QUALITY KPI CARDS (Clickable Navigation) */}
        <QualityKpiCards 
          inspections={inspections} 
          defects={defects} 
          onCardClick={handleKpiCardClick}
          activeCard={activeKpiCard}
        />

        {/* 2. QUALITY OVERVIEW & OVERALL QUALITY SCORE */}
        <QualityScore inspections={inspections} defects={defects} />

        {/* 3. QUALITY ANOMALIES (AI Quality Anomaly Detection Layer) */}
        <QualityAnomalies
          anomalies={anomalies}
          onInvestigateProduct={handleFilterByProduct}
        />

        {/* 4. QUALITY CHARTS SECTION: Quality Trend & Defect Distribution */}
        <div id="quality-charts-section" className="grid grid-cols-1 lg:grid-cols-12 gap-6 scroll-mt-24">
          <div className="lg:col-span-7">
            <QualityTrendChart data={QUALITY_TREND_30_DAYS} />
          </div>
          <div className="lg:col-span-5">
            <DefectDistributionChart defects={defects} />
          </div>
        </div>

        {/* 5. PRODUCT QUALITY COMPARISON BAR CHART */}
        <ProductComparisonChart data={PRODUCT_QUALITY_BENCHMARKS} />

        {/* 6. QUALITY FILTERS */}
        <div id="inspections-table-section" className="scroll-mt-24 space-y-6">
          <QualityFilters
            filters={filters}
            onFilterChange={(newFilters) => setFilters((prev) => ({ ...prev, ...newFilters }))}
            onResetFilters={() =>
              setFilters({
                searchQuery: "",
                product: "all",
                status: "all",
                defectType: "all",
                inspector: "all",
                dateRange: "all",
              })
            }
            totalInspections={inspections.length}
            filteredCount={filteredInspections.length}
          />

          {/* 7. RECENT QUALITY INSPECTION TABLE */}
          <InspectionTable
            inspections={filteredInspections}
            onViewInspection={handleOpenInspectionDetails}
          />
        </div>

        {/* 8. QUALITY DEFECT TABLE */}
        <div id="defects-table-section" className="scroll-mt-24">
          <DefectTable
            defects={defects}
            onViewDefect={(def) => {
              const parentInsp = inspections.find((i) => i.id === def.inspectionId);
              if (parentInsp) {
                handleOpenInspectionDetails(parentInsp);
              } else {
                handleOpenUpdateDefect(def);
              }
            }}
            onInvestigateDefect={handleInvestigateDefect}
            onResolveDefect={handleResolveDefect}
            onUpdateIssueModal={handleOpenUpdateDefect}
          />
        </div>

        {/* MODALS */}
        <InspectionDetails
          inspection={selectedInspectionForDetails}
          isOpen={isInspectionDetailsOpen}
          onClose={() => {
            setIsInspectionDetailsOpen(false);
            setSelectedInspectionForDetails(null);
          }}
          onUpdateDefect={(def) => {
            setIsInspectionDetailsOpen(false);
            handleOpenUpdateDefect(def);
          }}
        />

        <UpdateQualityIssueModal
          defect={selectedDefectForUpdate}
          isOpen={isUpdateIssueModalOpen}
          onClose={() => {
            setIsUpdateIssueModalOpen(false);
            setSelectedDefectForUpdate(null);
          }}
          onSave={handleSaveDefectUpdate}
        />

        <NewInspectionModal
          isOpen={isNewInspectionModalOpen}
          onClose={() => setIsNewInspectionModalOpen(false)}
          onSubmit={handleCreateInspection}
        />
      </div>
    </ErpLayout>
  );
}
