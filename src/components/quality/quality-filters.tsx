"use client";

import React from "react";
import { QualityFilterState, PRODUCT_NAMES, DefectTypeName, QUALITY_INSPECTORS } from "@/types/quality";
import {
  Search,
  RotateCcw,
  SlidersHorizontal,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Package,
  User,
} from "lucide-react";

interface QualityFiltersProps {
  filters: QualityFilterState;
  onFilterChange: (newFilters: Partial<QualityFilterState>) => void;
  onResetFilters: () => void;
  totalInspections: number;
  filteredCount: number;
}

const DEFECT_TYPES: DefectTypeName[] = [
  "Burnt Product",
  "Broken Product",
  "Incorrect Weight",
  "Packaging Defect",
];

export function QualityFilters({
  filters,
  onFilterChange,
  onResetFilters,
  totalInspections,
  filteredCount,
}: QualityFiltersProps) {
  const isFiltered =
    filters.searchQuery !== "" ||
    filters.product !== "all" ||
    filters.status !== "all" ||
    filters.defectType !== "all" ||
    (filters.inspector && filters.inspector !== "all") ||
    filters.dateRange !== "all";

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur-sm shadow-md space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search inspection #, PO #, batch code, or inspector..."
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950/90 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {/* Product Filter */}
          <div className="relative">
            <select
              value={filters.product}
              onChange={(e) => onFilterChange({ product: e.target.value })}
              className="w-full px-3 py-2.5 bg-slate-950/90 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500 appearance-none cursor-pointer pr-8"
            >
              <option value="all">All Products</option>
              {PRODUCT_NAMES.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 text-[10px]">
              ▼
            </div>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={filters.status}
              onChange={(e) => onFilterChange({ status: e.target.value })}
              className="w-full px-3 py-2.5 bg-slate-950/90 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500 appearance-none cursor-pointer pr-8"
            >
              <option value="all">All Statuses</option>
              <option value="Passed">Passed</option>
              <option value="Failed">Failed</option>
              <option value="Conditional">Conditional</option>
              <option value="Pending">Pending</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 text-[10px]">
              ▼
            </div>
          </div>

          {/* Inspector Filter */}
          <div className="relative">
            <select
              value={filters.inspector || "all"}
              onChange={(e) => onFilterChange({ inspector: e.target.value })}
              className="w-full px-3 py-2.5 bg-slate-950/90 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500 appearance-none cursor-pointer pr-8"
            >
              <option value="all">All Inspectors</option>
              {QUALITY_INSPECTORS.map((insp) => (
                <option key={insp} value={insp}>
                  {insp}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 text-[10px]">
              ▼
            </div>
          </div>

          {/* Defect Type Filter */}
          <div className="relative">
            <select
              value={filters.defectType}
              onChange={(e) => onFilterChange({ defectType: e.target.value })}
              className="w-full px-3 py-2.5 bg-slate-950/90 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500 appearance-none cursor-pointer pr-8"
            >
              <option value="all">All Defect Modes</option>
              {DEFECT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 text-[10px]">
              ▼
            </div>
          </div>

          {/* Date Range Filter */}
          <div className="relative">
            <select
              value={filters.dateRange}
              onChange={(e) => onFilterChange({ dateRange: e.target.value })}
              className="w-full px-3 py-2.5 bg-slate-950/90 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500 appearance-none cursor-pointer pr-8"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 text-[10px]">
              ▼
            </div>
          </div>
        </div>
      </div>

      {/* Filter status row & Reset */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
        <div className="text-slate-400 flex items-center gap-2">
          <span>
            Showing <strong className="text-white">{filteredCount}</strong> of{" "}
            <strong className="text-white">{totalInspections}</strong> inspection records
          </span>
          {isFiltered && (
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 font-semibold border border-cyan-500/30 text-[11px]">
              Filters Active
            </span>
          )}
        </div>

        {isFiltered && (
          <button
            onClick={onResetFilters}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-xs font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>
    </div>
  );
}
