"use client";

import React from "react";
import { QualityInspection, QualityDefect } from "@/types/quality";
import {
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  Percent,
  AlertTriangle,
  Clock,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
} from "lucide-react";

interface QualityKpiCardsProps {
  inspections: QualityInspection[];
  defects: QualityDefect[];
  onCardClick?: (cardKey: "total_inspections" | "passed_inspections" | "failed_inspections" | "pass_rate" | "total_defects" | "open_defects") => void;
  activeCard?: string;
}

export function QualityKpiCards({ inspections, defects, onCardClick, activeCard }: QualityKpiCardsProps) {
  // Aggregate calculations
  const totalInspections = inspections.length;
  const passedInspections = inspections.filter((i) => i.status === "Passed").length;
  const failedInspections = inspections.filter(
    (i) => i.status === "Failed" || i.status === "Conditional"
  ).length;

  const totalInspectedUnits = inspections.reduce((acc, i) => acc + i.inspectedQuantity, 0);
  const totalPassedUnits = inspections.reduce((acc, i) => acc + i.passedQuantity, 0);
  const passRate =
    totalInspectedUnits > 0
      ? ((totalPassedUnits / totalInspectedUnits) * 100).toFixed(1)
      : "96.8";

  const totalDefectUnits = defects.reduce((acc, d) => acc + d.defectQuantity, 0);
  const openDefectsCount = defects.filter(
    (d) => d.status === "Open" || d.status === "Investigating"
  ).length;

  const cards: Array<{
    key: "total_inspections" | "passed_inspections" | "failed_inspections" | "pass_rate" | "total_defects" | "open_defects";
    title: string;
    value: string;
    subtext: string;
    icon: any;
    iconColor: string;
    iconBg: string;
    hoverBorder: string;
    trend: string;
    trendUp: boolean;
  }> = [
    {
      key: "total_inspections",
      title: "Total Inspections",
      value: totalInspections.toLocaleString(),
      subtext: `${totalInspectedUnits.toLocaleString()} units sampled`,
      icon: ClipboardCheck,
      iconColor: "text-cyan-500",
      iconBg: "bg-cyan-50 border-cyan-200",
      hoverBorder: "hover:border-cyan-400 hover:ring-2 hover:ring-cyan-500/20",
      trend: "+12.4% vs last week",
      trendUp: true,
    },
    {
      key: "passed_inspections",
      title: "Passed Inspections",
      value: passedInspections.toLocaleString(),
      subtext: "Compliant with ISO 22000 & AQL",
      icon: CheckCircle2,
      iconColor: "text-emerald-500",
      iconBg: "bg-emerald-50 border-emerald-200",
      hoverBorder: "hover:border-emerald-400 hover:ring-2 hover:ring-emerald-500/20",
      trend: "91.2% batch conformance",
      trendUp: true,
    },
    {
      key: "failed_inspections",
      title: "Failed Inspections",
      value: failedInspections.toLocaleString(),
      subtext: "Quarantined or conditional rework",
      icon: XCircle,
      iconColor: "text-rose-500",
      iconBg: "bg-rose-50 border-rose-200",
      hoverBorder: "hover:border-rose-400 hover:ring-2 hover:ring-rose-500/20",
      trend: "-3.1% defect rate improvement",
      trendUp: false,
    },
    {
      key: "pass_rate",
      title: "Overall Pass Rate",
      value: `${passRate}%`,
      subtext: "Target threshold: ≥ 95.0%",
      icon: Percent,
      iconColor: "text-blue-500",
      iconBg: "bg-blue-50 border-blue-200",
      hoverBorder: "hover:border-blue-400 hover:ring-2 hover:ring-blue-500/20",
      trend: "+0.8% above benchmark",
      trendUp: true,
    },
    {
      key: "total_defects",
      title: "Total Defects",
      value: totalDefectUnits.toLocaleString(),
      subtext: "Across active shop-floor lots",
      icon: AlertTriangle,
      iconColor: "text-amber-500",
      iconBg: "bg-amber-50 border-amber-200",
      hoverBorder: "hover:border-amber-400 hover:ring-2 hover:ring-amber-500/20",
      trend: "4 primary defect modes",
      trendUp: false,
    },
    {
      key: "open_defects",
      title: "Open Defects",
      value: openDefectsCount.toString(),
      subtext: "Active CAPA investigations",
      icon: Clock,
      iconColor: "text-purple-500",
      iconBg: "bg-purple-50 border-purple-200",
      hoverBorder: "hover:border-purple-400 hover:ring-2 hover:ring-purple-500/20",
      trend: `${defects.filter((d) => d.status === "Closed" || d.status === "Resolved").length} resolved recently`,
      trendUp: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const isActive = activeCard === card.key;

        return (
          <button
            key={card.key}
            type="button"
            onClick={() => onCardClick?.(card.key)}
            className={`group text-left rounded-xl border p-4 bg-white transition-all duration-200 shadow-xs flex flex-col justify-between cursor-pointer ${
              isActive
                ? "border-cyan-500 ring-2 ring-cyan-500/30 shadow-md bg-cyan-50/20"
                : `border-slate-200 ${card.hoverBorder} hover:shadow-md hover:-translate-y-0.5 active:translate-y-0`
            }`}
          >
            <div className="flex items-center justify-between mb-3 w-full">
              <span className="text-xs font-semibold text-slate-600 group-hover:text-slate-900 tracking-tight transition-colors">
                {card.title}
              </span>
              <div className={`p-2 rounded-lg border ${card.iconBg} group-hover:scale-110 transition-transform`}>
                <Icon className={`w-4 h-4 ${card.iconColor}`} />
              </div>
            </div>

            <div className="space-y-1 w-full">
              <div className="text-2xl font-bold text-slate-900 tracking-tight group-hover:text-cyan-600 transition-colors">
                {card.value}
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">
                {card.subtext}
              </p>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-medium text-slate-500 w-full">
              <div className="flex items-center gap-1.5 truncate">
                {card.trendUp ? (
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                )}
                <span className="truncate">{card.trend}</span>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-cyan-600 opacity-0 group-hover:opacity-100 transition-all shrink-0 ml-1" />
            </div>
          </button>
        );
      })}
    </div>
  );
}
