"use client";

import React, { useState } from "react";
import { ProcurementAlert } from "@/types/procurement";
import {
  AlertTriangle,
  AlertOctagon,
  Info,
  Clock,
  ArrowRight,
  ShieldAlert,
  Send,
  CheckCircle2,
  Settings,
  Mail,
  Zap,
  Loader2,
  ExternalLink,
  X,
} from "lucide-react";

const TARGET_EMAIL = "uttamthakur90400@gmail.com";

interface ProcurementAlertsProps {
  alerts: ProcurementAlert[];
  onViewAlertEntity?: (alert: ProcurementAlert) => void;
}

export function ProcurementAlerts({
  alerts,
  onViewAlertEntity,
}: ProcurementAlertsProps) {
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchedAlertId, setDispatchedAlertId] = useState<string | null>(null);
  const [lastDispatchedTime, setLastDispatchedTime] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [customWebhookUrl, setCustomWebhookUrl] = useState("");

  const triggerN8nWorkflow = async (targetAlerts?: ProcurementAlert[]) => {
    setIsDispatching(true);
    setStatusMessage(null);

    const payloadAlerts = targetAlerts || alerts;

    try {
      const res = await fetch("/api/procurement/alerts/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientEmail: TARGET_EMAIL,
          webhookUrl: customWebhookUrl || undefined,
          alerts: payloadAlerts,
        }),
      });

      const data = await res.json();
      if (res.ok && data.status === "success") {
        const timeStr = new Date().toLocaleTimeString();
        setLastDispatchedTime(timeStr);
        setStatusMessage(
          `n8n Workflow triggered! Alert summary dispatched to ${TARGET_EMAIL} at ${timeStr}`
        );
      } else {
        setStatusMessage(data.message || "Failed to trigger n8n workflow");
      }
    } catch (err: any) {
      setStatusMessage("Error connecting to automation service");
    } finally {
      setIsDispatching(false);
      setTimeout(() => {
        setStatusMessage(null);
      }, 6000);
    }
  };

  const dispatchSingleAlert = async (alert: ProcurementAlert) => {
    setDispatchedAlertId(alert.id);
    await triggerN8nWorkflow([alert]);
    setTimeout(() => {
      setDispatchedAlertId(null);
    }, 3000);
  };

  const getSeverityBadge = (severity: ProcurementAlert["severity"]) => {
    switch (severity) {
      case "Critical":
      case "High":
        return {
          icon: AlertOctagon,
          badgeClass: "bg-rose-500/15 text-rose-400 border border-rose-500/30",
          cardBorder: "border-rose-500/30 hover:border-rose-500/50 bg-rose-950/10",
        };
      case "Medium":
        return {
          icon: AlertTriangle,
          badgeClass: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
          cardBorder: "border-amber-500/30 hover:border-amber-500/50 bg-amber-950/10",
        };
      case "Low":
      default:
        return {
          icon: Info,
          badgeClass: "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30",
          cardBorder: "border-cyan-500/30 hover:border-cyan-500/50 bg-cyan-950/5",
        };
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 sm:p-6 backdrop-blur-sm shadow-md space-y-4">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-bold text-white tracking-tight">
                Procurement Alerts
              </h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {alerts.length} Active
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Contract milestones, supplier delivery delays, and critical buffer inventory triggers
            </p>
          </div>
        </div>

        {/* n8n Automation Bar & Quick Trigger */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Recipient Indicator */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/40 border border-cyan-800/50 text-xs text-cyan-300">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <Mail className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-mono text-[11px] text-cyan-200">
              {TARGET_EMAIL}
            </span>
          </div>

          {/* Trigger Workflow Button */}
          <button
            type="button"
            onClick={() => triggerN8nWorkflow()}
            disabled={isDispatching || alerts.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 transition-all shadow-md shadow-cyan-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDispatching ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Zap className="w-3.5 h-3.5 text-slate-950 fill-current" />
            )}
            <span>{isDispatching ? "Triggering..." : "Trigger n8n Workflow"}</span>
          </button>

          {/* n8n Settings Modal Opener */}
          <button
            type="button"
            onClick={() => setIsConfigOpen(true)}
            title="n8n Automation Settings"
            className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Live Status Toast Banner */}
      {statusMessage && (
        <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-200 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium">{statusMessage}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-emerald-400 hover:text-emerald-200"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Alerts List */}
      <div className="space-y-3">
        {alerts.map((alert, idx) => {
          const config = getSeverityBadge(alert.severity);
          const Icon = config.icon;
          const isThisAlertDispatched = dispatchedAlertId === alert.id;

          return (
            <div
              key={alert.id || `alert_${idx}`}
              className={`rounded-xl border p-4 transition-all duration-200 ${config.cardBorder}`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                {/* Left */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="mt-0.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold ${config.badgeClass}`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {alert.severity}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">
                        {alert.relatedEntity}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {alert.timestamp}
                      </span>
                    </div>

                    <p className="text-sm text-slate-200 mb-2 leading-relaxed font-medium">
                      {alert.reason}
                    </p>

                    <div className="flex items-start gap-2 bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/70 text-xs">
                      <span className="text-slate-400 font-medium shrink-0">Action:</span>
                      <span className="text-slate-300">{alert.recommendedAction}</span>
                    </div>
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2 self-end md:self-center shrink-0 pt-2 md:pt-0">
                  {/* Dispatch Single Alert to Manager */}
                  <button
                    type="button"
                    onClick={() => dispatchSingleAlert(alert)}
                    disabled={isDispatching || isThisAlertDispatched}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 border border-blue-500/30 hover:border-blue-500/50 transition-all shadow-sm disabled:opacity-50"
                    title={`Trigger n8n workflow for this alert to ${TARGET_EMAIL}`}
                  >
                    {isThisAlertDispatched ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Send className="w-3.5 h-3.5 text-blue-400" />
                    )}
                    <span>{isThisAlertDispatched ? "Sent to Manager" : "Dispatch (n8n)"}</span>
                  </button>

                  {/* View Entity Button */}
                  {onViewAlertEntity && (
                    <button
                      type="button"
                      onClick={() => onViewAlertEntity(alert)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 hover:text-cyan-300 border border-cyan-500/30 hover:border-cyan-500/50 transition-all shadow-sm"
                    >
                      <span>View Entity</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* n8n Configuration Modal */}
      {isConfigOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-white">
                    n8n Automation Settings
                  </h4>
                  <p className="text-xs text-slate-400">
                    Procurement SLA & automated email alert workflow
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsConfigOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Procurement Manager Email (Recipient)
                </label>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 font-mono text-cyan-300">
                  <Mail className="w-4 h-4 text-cyan-400" />
                  <span>{TARGET_EMAIL}</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  External n8n Webhook URL (Optional / Test)
                </label>
                <input
                  type="url"
                  placeholder="https://n8n.your-instance.com/webhook/procurement-alerts"
                  value={customWebhookUrl}
                  onChange={(e) => setCustomWebhookUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono text-xs"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  If left blank, dispatches directly via ERP internal automation pipeline and `/api/procurement/alerts/webhook`.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between text-slate-300 font-semibold">
                  <span>n8n Polling / Webhook Endpoint</span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                    Active
                  </span>
                </div>
                <code className="block font-mono text-[11px] text-cyan-300 bg-slate-900/90 p-2 rounded border border-slate-800 break-all select-all">
                  GET/POST /api/procurement/alerts/webhook
                </code>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsConfigOpen(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  triggerN8nWorkflow();
                  setIsConfigOpen(false);
                }}
                disabled={isDispatching}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all shadow-md"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Test Dispatch</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

