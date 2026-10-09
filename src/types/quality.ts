// Matches PostgreSQL Schema Entities for Quality Control Module

export type InspectionStatus = "Passed" | "Failed" | "Conditional" | "Pending";

export type DefectSeverity = "Critical" | "High" | "Medium" | "Low";

export type DefectStatus = "Open" | "Investigating" | "Resolved" | "Closed";

export type DefectTypeName =
  | "Burnt Product"
  | "Broken Product"
  | "Incorrect Weight"
  | "Packaging Defect";

export const PRODUCT_NAMES = [
  "Classic Butter Biscuit",
  "Chocolate Biscuit",
  "Coconut Biscuit",
  "Cream Biscuit",
  "Marie Biscuit",
  "Salted Biscuit",
] as const;

export type ProductName = (typeof PRODUCT_NAMES)[number];

// Maps to `defect_types` table
export interface DefectType {
  defectTypeId: string;
  defectName: DefectTypeName;
  description: string;
  severity: DefectSeverity;
}
// Maps to `quality_defects` table
export interface QualityDefect {
  id: string;
  qualityDefectId: string; // e.g. DEF-2026-0142
  inspectionId: string; // foreign key to quality_inspections
  inspectionNumber: string;
  productionOrderId: string;
  product: ProductName;
  batchNumber: string;
  defectType: DefectTypeName;
  defectQuantity: number;
  severity: DefectSeverity;
  rootCause: string;
  correctiveAction: string;
  status: DefectStatus;
  detectedAt: string;
  assignedEngineer?: string;
}

// Maps to `quality_inspections` table
export interface QualityInspection {
  id: string;
  inspectionId: string;
  inspectionNumber: string; // e.g. QC-2026-0891
  productionOrderId: string; // e.g. PO-2026-001
  product: ProductName;
  batchNumber: string; // e.g. BATCH-2026-1001
  inspectionDate: string; // ISO string
  inspectorEmployeeId: string;
  inspectorName: string;
  inspectedQuantity: number;
  passedQuantity: number;
  failedQuantity: number;
  status: InspectionStatus;
  notes?: string;
  defects: QualityDefect[];
}

// Maps to `quality_anomalies` table (Future AI Anomaly Detection)
export interface QualityAnomaly {
  id: string;
  anomalyId: string;
  inspectionId?: string;
  product: ProductName;
  machineId?: string;
  machineName?: string;
  anomalyType: string;
  severity: DefectSeverity;
  date: string;
  reason: string;
  recommendedAction: string;
  detectedAt: string;
  confidenceScore?: number;
}

// Daily Trend point for 30-day Recharts chart
export interface QualityTrendPoint {
  date: string; // e.g. "Sep 02", "Sep 15"
  rawDate: string;
  inspectedQuantity: number;
  passedQuantity: number;
  failedQuantity: number;
  passRate: number; // %
}

// Defect Distribution slice
export interface DefectDistributionItem {
  name: DefectTypeName;
  count: number;
  percentage: number;
  color: string;
  severity: DefectSeverity;
}

// Product Quality Benchmark comparison
export interface ProductQualityComparison {
  product: ProductName;
  totalInspected: number;
  totalPassed: number;
  totalFailed: number;
  passRate: number; // %
  rejectionRate: number; // %
  defectCount: number;
}

export const QUALITY_INSPECTORS = [
  "Elena Rostova",
  "Marcus Brody",
  "David Chen",
  "Anita Sharma",
  "Viktor Vance",
  "Aarav Patel",
  "Mei Ling",
  "Carlos Mendez",
  "Raju",
] as const;

export type QualityInspectorName = (typeof QUALITY_INSPECTORS)[number];

// Filter State
export interface QualityFilterState {
  searchQuery: string;
  product: string; // "all" | ProductName
  status: string; // "all" | InspectionStatus
  defectType: string; // "all" | DefectTypeName
  inspector: string; // "all" | QualityInspectorName | string
  dateRange: string; // "all" | "today" | "7days" | "30days"
}
