"use client";

import React, { Suspense, useEffect, useRef } from "react";
import { LoginForm } from "@/components/auth/login-form";
import gsap from "gsap";
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
  const containerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".gsap-fade-in", {
        opacity: 0,
        y: 28,
        duration: 0.85,
        stagger: 0.1,
        ease: "power3.out",
      });

      if (formRef.current) {
        gsap.from(formRef.current, {
          opacity: 0,
          scale: 0.96,
          y: 24,
          duration: 0.9,
          delay: 0.25,
          ease: "power3.out",
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen relative flex flex-col justify-between text-white selection:bg-cyan-500 selection:text-white overflow-x-hidden">
      {/* Background Video (Continuous Loop) */}
      <div className="fixed inset-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="w-full h-full object-cover scale-105"
        >
          <source
            src="https://res.cloudinary.com/n0c7bqpd/video/upload/v1791496862/Animate_corporate_technology_ill__20261009032757_q1ayo5.mp4"
            type="video/mp4"
          />
        </video>
        {/* Left side black gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/65 via-45% to-black/15" />
      </div>

      {/* Top Navbar Header */}
      <header className="relative z-10 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md gsap-fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-md shadow-cyan-500/20">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                Smart Manufacturing ERP
                <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  AI v1.0
                </span>
              </span>
              <p className="text-[11px] text-slate-400">Enterprise Operations Platform</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400">
            <div className="hidden md:flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-medium text-slate-200">Core Engine Online</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="relative z-10 flex-1 flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Hero & Value Proposition in Guaranteed Pure White */}
          <div className="hidden lg:flex lg:col-span-6 flex-col justify-center space-y-6 pr-4 text-white">
            <div className="gsap-fade-in inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/80 text-xs font-semibold text-cyan-300 shadow-sm w-fit">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Next-Gen Factory Intelligence
            </div>

            <h1
              style={{ color: "#ffffff" }}
              className="gsap-fade-in text-4xl sm:text-5xl font-extrabold tracking-tight !text-white leading-tight drop-shadow-lg"
            >
              Intelligent Production &{" "}
              <span style={{ color: "#ffffff" }} className="!text-white">
                Autonomous ERP
              </span>
            </h1>

            <p
              style={{ color: "#ffffff" }}
              className="gsap-fade-in text-base sm:text-lg !text-white font-medium leading-relaxed max-w-lg drop-shadow-md"
            >
              Synchronize shop floor work orders, warehouse inventory, predictive machine
              maintenance, and quality control with unified role-based governance.
            </p>

            {/* Feature Highlights */}
            <div className="gsap-fade-in grid grid-cols-2 gap-3 pt-2 max-w-lg">
              <div className="p-3.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700/80 shadow-md">
                <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs mb-1">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span>Real-time Shopfloor</span>
                </div>
                <p className="text-[11px] text-slate-300 font-medium">
                  Track batch progression and operator capacities seamlessly.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700/80 shadow-md">
                <div className="flex items-center gap-2 text-sky-300 font-bold text-xs mb-1">
                  <Layers className="w-4 h-4 text-sky-400" />
                  <span>Unified Inventory</span>
                </div>
                <p className="text-[11px] text-slate-300 font-medium">
                  Automated BOM tracking & raw material depletion checks.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700/80 shadow-md">
                <div className="flex items-center gap-2 text-purple-300 font-bold text-xs mb-1">
                  <Bot className="w-4 h-4 text-purple-400" />
                  <span>AI Predictive Insights</span>
                </div>
                <p className="text-[11px] text-slate-300 font-medium">
                  Pre-emptive maintenance alerts and yield optimization.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700/80 shadow-md">
                <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs mb-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Role-Based Security</span>
                </div>
                <p className="text-[11px] text-slate-300 font-medium">
                  Multi-tier access for 9 specialized factory departments.
                </p>
              </div>
            </div>

            {/* System Status pill */}
            <div className="gsap-fade-in flex items-center gap-3 pt-2 text-xs text-slate-300 font-medium">
              <div className="flex items-center gap-1.5 text-cyan-300">
                <Zap className="w-4 h-4 text-cyan-400" />
                <span>Next.js App Router Architecture</span>
              </div>
              <span>•</span>
              <span className="text-white">Live System Connection</span>
            </div>
          </div>

          {/* Right Column: Login Form */}
          <div ref={formRef} className="lg:col-span-6 w-full">
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
