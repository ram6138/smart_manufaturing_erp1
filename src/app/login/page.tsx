import React, { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";
import {
  Cpu,
  Activity,
  Layers,
  ShieldCheck,
  Zap,
  Sparkles,
  Bot,
} from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 text-slate-900 selection:bg-cyan-100 selection:text-cyan-900">
      {/* Background ambient lighting & grid */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(14,165,233,0.08),rgba(255,255,255,0))] z-0" />
      <div className="fixed inset-0 pointer-events-none bg-[linear-gradient(to_right,#0f172a08_1px,transparent_1px),linear-gradient(to_bottom,#0f172a08_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] z-0" />

      {/* Top Navbar Header */}
      <header className="relative z-10 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center shadow-md shadow-cyan-600/20">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
                Smart Manufacturing ERP
                <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-cyan-50 text-cyan-800 border border-cyan-200">
                  AI v1.0
                </span>
              </span>
              <p className="text-[11px] text-slate-500">Enterprise Operations Platform</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500">
            <div className="hidden md:flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-medium text-slate-700">Core Engine Online</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="relative z-10 flex-1 flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Hero & Value Proposition */}
          <div className="hidden lg:flex lg:col-span-6 flex-col justify-center space-y-6 pr-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-semibold text-cyan-700 shadow-xs w-fit">
              <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
              Next-Gen Factory Intelligence
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Intelligent Production &{" "}
              <span className="bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-600 bg-clip-text text-transparent">
                Autonomous ERP
              </span>
            </h1>

            <p className="text-base text-slate-600 leading-relaxed max-w-lg">
              Synchronize shop floor work orders, warehouse inventory, predictive machine
              maintenance, and quality control with unified role-based governance.
            </p>

            {/* Feature Highlights */}
            <div className="grid grid-cols-2 gap-3 pt-2 max-w-lg">
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                <div className="flex items-center gap-2 text-cyan-700 font-semibold text-xs mb-1">
                  <Activity className="w-4 h-4 text-cyan-600" />
                  <span>Real-time Shopfloor</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Track batch progression and operator capacities seamlessly.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                <div className="flex items-center gap-2 text-blue-700 font-semibold text-xs mb-1">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <span>Unified Inventory</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Automated BOM tracking & raw material depletion checks.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                <div className="flex items-center gap-2 text-purple-700 font-semibold text-xs mb-1">
                  <Bot className="w-4 h-4 text-purple-600" />
                  <span>AI Predictive Insights</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Pre-emptive maintenance alerts and yield optimization.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                <div className="flex items-center gap-2 text-emerald-700 font-semibold text-xs mb-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Role-Based Security</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Multi-tier access for 9 specialized factory departments.
                </p>
              </div>
            </div>

            {/* System Status pill */}
            <div className="flex items-center gap-3 pt-2 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-cyan-600" />
                <span>Next.js App Router Architecture</span>
              </div>
              <span>•</span>
              <span>Live System Connection</span>
            </div>
          </div>

          {/* Right Column: Login Form */}
          <div className="lg:col-span-6 w-full">
            <Suspense
              fallback={
                <div className="w-full max-w-md mx-auto p-8 rounded-2xl bg-white border border-slate-200 text-center text-slate-500 text-sm shadow-sm">
                  Loading authentication portal...
                </div>
              }
            >
              <LoginForm />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
}
