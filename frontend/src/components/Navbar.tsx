"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Cpu, ArrowRight } from "lucide-react";
import { checkBackendHealth } from "@/lib/api";

export default function Navbar() {
  const [isBackendHealthy, setIsBackendHealthy] = useState<boolean | null>(null);

  useEffect(() => {
    checkBackendHealth().then(setIsBackendHealthy);
    const interval = setInterval(() => {
      checkBackendHealth().then(setIsBackendHealthy);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="border-b border-white/[0.08] bg-[#0A0A0B]/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group logo-hover" aria-label="LoopForge Home">
          <img
            src="/loopforge-logo.png"
            alt="LoopForge"
            className="h-7 w-auto object-contain transition-opacity duration-200 group-hover:opacity-90"
          />
          <span className="text-[11px] uppercase tracking-wider px-2 py-0.5 rounded bg-[#111214] text-[#F6D58A] border border-white/[0.08] hidden sm:inline-block font-medium">
            LangGraph
          </span>
        </Link>

        {/* Navigation & Status */}
        <div className="flex items-center gap-5">
          {/* Health indicator */}
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#111214] border border-white/[0.08] text-xs">
            <span
              className={`w-2 h-2 rounded-full ${
                isBackendHealthy === true
                  ? "bg-[#22C55E] animate-pulse"
                  : isBackendHealthy === false
                  ? "bg-[#EF4444]"
                  : "bg-[#6B6B6B]"
              }`}
            />
            <span className="text-[#A6A6A3] text-xs">
              Backend: {isBackendHealthy ? "Connected (Port 8000)" : "Connecting..."}
            </span>
          </div>

          <Link
            href="/workspace"
            className="flex items-center gap-2 bg-[#F0A43C] hover:bg-[#F5B85D] text-[#0A0A0B] font-semibold px-4 py-2 rounded-lg text-sm transition-all shadow-sm active:scale-95"
          >
            <span>Launch Workspace</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </Link>
        </div>
      </div>
    </header>
  );
}
