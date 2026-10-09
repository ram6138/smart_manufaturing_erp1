"use client";

import React from "react";
import {
  PurchaseRequest,
  RequestStatus,
  RequestPriority,
} from "@/types/procurement";
import {
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  AlertTriangle,
  Eye,
  PlusCircle,
  Building,
} from "lucide-react";

interface PurchaseRequestTableProps {
  requests: PurchaseRequest[];
  onApprove: (request: PurchaseRequest) => void;
  onReject: (request: PurchaseRequest) => void;
  onConvertToPo: (request: PurchaseRequest) => void;
  onViewDetails: (request: PurchaseRequest) => void;
  onSubmitPending?: (request: PurchaseRequest) => void;
}

export function RequestStatusBadge({ status }: { status: RequestStatus }) {
  switch (status) {
    case "Approved":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
          <CheckCircle2 className="w-3 h-3" />
          Approved
        </span>
      );
    case "Pending":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
          <Clock className="w-3 h-3" />
          Pending
        </span>
      );
    case "Converted to PO":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
          <ArrowRight className="w-3 h-3" />
          Converted to PO
        </span>
      );
    case "Rejected":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
          <XCircle className="w-3 h-3" />
          Rejected
        </span>
      );
    case "Draft":
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-500/15 text-slate-300 border border-slate-500/30">
          Draft
        </span>
      );
  }
}

export function RequestPriorityBadge({ priority }: { priority: RequestPriority }) {
  switch (priority) {
    case "Urgent":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-red-500/20 text-red-400 border border-red-500/40">
          <AlertTriangle className="w-3 h-3" />
          Urgent
        </span>
      );
    case "High":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
          High
        </span>
      );
    case "Normal":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30">
          Normal
        </span>
      );
    case "Low":
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-500/15 text-slate-400 border border-slate-500/30">
          Low
        </span>
      );
  }
}

export function PurchaseRequestTable({
  requests,
  onApprove,
  onReject,
  onConvertToPo,
  onViewDetails,
  onSubmitPending,
}: PurchaseRequestTableProps) {
  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  if (requests.length === 0) {
    return (
      <div className="p-8 rounded-2xl bg-slate-900/80 border border-slate-800 text-center space-y-2">
        <FileText className="w-8 h-8 text-slate-500 mx-auto" />
        <h3 className="text-sm font-semibold text-white">No purchase requests found</h3>
        <p className="text-xs text-slate-400">
          Try clearing search filters or create a new purchase requisition.
        </p>
      </div>
    );
  }

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800/90 shadow-md space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Purchase Requests</h3>
            <p className="text-xs text-slate-400">
              Departmental requisition demands, material approvals, and procurement order queue
            </p>
          </div>
        </div>
        <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-3 py-1 rounded-lg border border-cyan-800/40">
          {requests.length} Demands
        </span>
      </div>

      {/* Desktop Table */}
      <div className="hidden xl:block max-h-[520px] overflow-y-auto overflow-x-auto custom-scrollbar rounded-xl border border-slate-200">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-xs">
            <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
              <th className="py-3.5 px-4">Request ID</th>
              <th className="py-3.5 px-4">Requested By</th>
              <th className="py-3.5 px-4">Department</th>
              <th className="py-3.5 px-4">Material</th>
              <th className="py-3.5 px-4 text-right">Quantity</th>
              <th className="py-3.5 px-4">Required Date</th>
              <th className="py-3.5 px-4 text-right">Est. Cost</th>
              <th className="py-3.5 px-4 text-center">Priority</th>
              <th className="py-3.5 px-4 text-center">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {requests.map((r) => (
              <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3.5 px-4 font-mono font-bold text-cyan-400 whitespace-nowrap">
                  {r.requestId}
                </td>
                <td className="py-3.5 px-4 font-medium text-slate-200 whitespace-nowrap">
                  {r.requestedBy}
                </td>
                <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                  <span className="inline-flex items-center gap-1">
                    <Building className="w-3 h-3 text-slate-500" />
                    {r.department}
                  </span>
                </td>
                <td className="py-3.5 px-4 font-semibold text-white max-w-xs truncate" title={r.material}>
                  {r.material}
                </td>
                <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-200 whitespace-nowrap">
                  {(r.quantity ?? 0).toLocaleString()} {r.unit}
                </td>
                <td className="py-3.5 px-4 whitespace-nowrap text-slate-400">
                  {formatDate(r.requiredDate)}
                </td>
                <td className="py-3.5 px-4 text-right font-mono font-semibold text-emerald-400 whitespace-nowrap">
                  ₹{(r.estimatedTotalCost ?? 0).toLocaleString()}
                </td>
                <td className="py-3.5 px-4 text-center whitespace-nowrap">
                  <RequestPriorityBadge priority={r.priority} />
                </td>
                <td className="py-3.5 px-4 text-center whitespace-nowrap">
                  <RequestStatusBadge status={r.status} />
                </td>
                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1.5">
                    {r.status === "Draft" && (
                      <>
                        <button
                          type="button"
                          onClick={() => onSubmitPending ? onSubmitPending(r) : onApprove(r)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-400 border border-cyan-500/30 transition-colors"
                          title="Submit Draft to Pending Approval"
                        >
                          Submit
                        </button>
                        <button
                          type="button"
                          onClick={() => onReject(r)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 transition-colors"
                          title="Reject / Cancel Requisition"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {r.status === "Pending" && (
                      <>
                        <button
                          type="button"
                          onClick={() => onApprove(r)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 transition-colors"
                          title="Approve Requisition"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => onReject(r)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 transition-colors"
                          title="Reject Requisition"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {r.status === "Approved" && (
                      <button
                        type="button"
                        onClick={() => onConvertToPo(r)}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-400 border border-cyan-500/30 transition-colors flex items-center gap-1"
                        title="Convert Approved PR into Official PO"
                      >
                        <PlusCircle className="w-3 h-3" />
                        <span>Create PO</span>
                      </button>
                    )}
                    {r.status === "Rejected" && (
                      <button
                        type="button"
                        onClick={() => onSubmitPending ? onSubmitPending(r) : onApprove(r)}
                        className="px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                        title="Re-open Requisition to Pending"
                      >
                        Re-open
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onViewDetails(r)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
                      title="View Full Requisition Details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile / Tablet Card View */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 xl:hidden">
        {requests.map((r) => (
          <div
            key={r.id}
            className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-cyan-400 block">
                  {r.requestId}
                </span>
                <span className="font-semibold text-white text-sm">{r.material}</span>
                <span className="text-xs text-slate-500 block">
                  {r.department} • {r.requestedBy}
                </span>
              </div>
              <div className="flex flex-col items-end gap-1">
                <RequestStatusBadge status={r.status} />
                <RequestPriorityBadge priority={r.priority} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 py-2 border-y border-slate-800/80 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 block">Quantity</span>
                <span className="font-mono font-semibold text-slate-200">
                  {(r.quantity ?? 0).toLocaleString()} {r.unit}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 block">Est. Cost</span>
                <span className="font-mono font-bold text-emerald-400">
                  ₹{(r.estimatedTotalCost ?? 0).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-400">
                Required: {formatDate(r.requiredDate)}
              </span>
              <div className="flex items-center gap-1.5">
                {r.status === "Draft" && (
                  <>
                    <button
                      type="button"
                      onClick={() => onSubmitPending ? onSubmitPending(r) : onApprove(r)}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30"
                    >
                      Submit
                    </button>
                    <button
                      type="button"
                      onClick={() => onReject(r)}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30"
                    >
                      Reject
                    </button>
                  </>
                )}
                {r.status === "Pending" && (
                  <>
                    <button
                      type="button"
                      onClick={() => onApprove(r)}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => onReject(r)}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30"
                    >
                      Reject
                    </button>
                  </>
                )}
                {r.status === "Approved" && (
                  <button
                    type="button"
                    onClick={() => onConvertToPo(r)}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30"
                  >
                    Create PO
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onViewDetails(r)}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 cursor-pointer"
                  title="View Details"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
