"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ErpLayout } from "@/components/layout/erp-layout";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { KPIStatCard } from "@/components/dashboard/kpi-stat-card";
import { ProductionTrendChart } from "@/components/dashboard/production-trend-chart";
import { ProductProductionChart } from "@/components/dashboard/product-production-chart";
import { MachineStatusCard } from "@/components/dashboard/machine-status-card";
import { QualityOverview } from "@/components/dashboard/quality-overview";
import { InventoryAlerts } from "@/components/dashboard/inventory-alerts";
import { ProductionOrdersTable } from "@/components/dashboard/production-orders-table";
import { AIOperationsInsights } from "@/components/dashboard/ai-operations-insights";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import {
  DASHBOARD_KPIS,
  PRODUCTION_TREND_DATA,
  PRODUCT_PRODUCTION_DATA,
  MACHINE_STATUS_DATA,
  QUALITY_OVERVIEW_DATA,
  INVENTORY_ALERTS_DATA,
  RECENT_PRODUCTION_ORDERS,
  AI_OPERATIONS_INSIGHTS,
  RECENT_ACTIVITY_DATA,
} from "@/lib/mock-data/dashboard";
import { Database, CheckCircle2 } from "lucide-react";

export default function DashboardPage() {
  const [lastUpdated, setLastUpdated] = useState<string>("Just now");
  const [kpiList, setKpiList] = useState(DASHBOARD_KPIS);
  const [productProduction, setProductProduction] = useState(PRODUCT_PRODUCTION_DATA);
  const [inventoryAlerts, setInventoryAlerts] = useState(INVENTORY_ALERTS_DATA);
  const [recentActivities, setRecentActivities] = useState(RECENT_ACTIVITY_DATA);
  const [productionOrders, setProductionOrders] = useState(RECENT_PRODUCTION_ORDERS);
  const [machineStatus, setMachineStatus] = useState(MACHINE_STATUS_DATA);
  const [qualityOverview, setQualityOverview] = useState(QUALITY_OVERVIEW_DATA);
  const [aiInsights, setAiInsights] = useState(AI_OPERATIONS_INSIGHTS);
  const [isDbLive, setIsDbLive] = useState<boolean>(false);

  const fetchDashboardData = useCallback(async (isMounted?: () => boolean) => {
    try {
      const res = await fetch("/api/dashboard");
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();

      if ((!isMounted || isMounted()) && data.status === "success") {
        if (data.kpis && data.kpis.length > 0) setKpiList(data.kpis);
        if (data.productProductionData && data.productProductionData.length > 0) {
          setProductProduction(data.productProductionData);
        }
        if (data.inventoryAlerts && data.inventoryAlerts.length > 0) {
          setInventoryAlerts(data.inventoryAlerts);
        }
        if (data.recentActivities && data.recentActivities.length > 0) {
          setRecentActivities(data.recentActivities);
        }
        if (data.productionOrders && data.productionOrders.length > 0) {
          setProductionOrders(data.productionOrders);
        }
        if (data.machineStatusData && data.machineStatusData.length > 0) {
          setMachineStatus(data.machineStatusData);
        }
        if (data.qualityOverviewData) {
          setQualityOverview(data.qualityOverviewData);
        }
        if (data.aiInsightsData && data.aiInsightsData.length > 0) {
          setAiInsights(data.aiInsightsData);
        }
        setIsDbLive(true);
      }
    } catch (err) {
      console.warn("Using default telemetry:", err);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    fetchDashboardData(() => mounted);
    const interval = setInterval(() => fetchDashboardData(() => mounted), 4000);
    const handleFocus = () => fetchDashboardData(() => mounted);
    window.addEventListener("focus", handleFocus);

    return () => {
      mounted = false;
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, [fetchDashboardData]);

  const handleRefresh = () => {
    fetchDashboardData();
    const timeString = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    setLastUpdated(timeString);
  };

  return (
    <ErpLayout>
      <div className="space-y-6 pb-6">
        {/* 1. Page Header with Date Range & Refresh Button */}
        <DashboardHeader onRefresh={handleRefresh} lastUpdated={lastUpdated} />

        {/* Live Database Sync Indicator */}
        {isDbLive && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium w-fit shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <Database className="w-3.5 h-3.5 text-blue-600" />
            <span className="font-semibold">Live System Database Connected</span>
          </div>
        )}

        {/* 2. 6 KPI Cards */}
        <section aria-label="Key Performance Indicators">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
            {kpiList.map((kpi) => (
              <KPIStatCard key={kpi.id} data={kpi} />
            ))}
          </div>
        </section>

        {/* 3 & 4. Production Charts Row (Production Trend & Production by Product) */}
        <section aria-label="Production Performance">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-7">
              <ProductionTrendChart data={PRODUCTION_TREND_DATA} />
            </div>
            <div className="lg:col-span-5">
              <ProductProductionChart data={productProduction} />
            </div>
          </div>
        </section>

        {/* 9. AI Operations Insights (High-Priority Anomaly Detection & Advice) */}
        <section aria-label="AI Operations Insights">
          <AIOperationsInsights insights={aiInsights} />
        </section>

        {/* 5 & 6. Machine Status & Quality Overview Row */}
        <section aria-label="Machines and Quality">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-6">
              <MachineStatusCard machines={machineStatus} />
            </div>
            <div className="lg:col-span-6">
              <QualityOverview data={qualityOverview} />
            </div>
          </div>
        </section>

        {/* 7 & 10. Inventory Alerts & Recent Activity Row */}
        <section aria-label="Inventory and Activity">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-6">
              <InventoryAlerts items={inventoryAlerts} />
            </div>
            <div className="lg:col-span-6">
              <RecentActivity activities={recentActivities} />
            </div>
          </div>
        </section>

        {/* 8. Recent Production Orders Table */}
        <section aria-label="Production Orders">
          <ProductionOrdersTable orders={productionOrders} />
        </section>
      </div>
    </ErpLayout>
  );
}
