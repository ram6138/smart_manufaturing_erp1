"use client";

import React, { useState } from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Sidebar } from "@/components/layout/sidebar";
import { TopHeader } from "@/components/layout/top-header";
import { ManufacturingCopilot } from "@/components/chatbot/manufacturing-copilot";
import { X } from "lucide-react";

interface ErpLayoutProps {
  children: React.ReactNode;
}

export function ErpLayout({ children }: ErpLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex bg-slate-50 text-slate-900 selection:bg-cyan-100 selection:text-cyan-900">
        {/* Desktop Fixed Sidebar */}
        <div className="hidden lg:flex lg:flex-shrink-0 h-screen sticky top-0 z-40">
          <Sidebar />
        </div>

        {/* Mobile Sidebar Overlay Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Slide-out panel */}
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white border-r border-slate-200 animate-in slide-in-from-left duration-200 shadow-2xl">
              {/* Close Button */}
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="absolute top-4 right-3 p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition z-50"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>

              <Sidebar onNavClick={() => setMobileMenuOpen(false)} />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <TopHeader onToggleMobileMenu={() => setMobileMenuOpen(true)} />

          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50">
            <div className="max-w-7xl mx-auto space-y-6">{children}</div>
          </main>
        </div>

        {/* Global Floating AI Copilot Chatbot */}
        <ManufacturingCopilot />
      </div>
    </ProtectedRoute>
  );
}
