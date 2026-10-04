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
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#F0A43C] to-[#EF4444] flex items-center justify-center shadow-md shadow-[#F0A43C]/20 group-hover:scale-105 transition-transform">
            <Cpu className="w-5 h-5 text-[#0A0A0B] stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#F2F2F0] tracking-tight text-base">
                AI Software Engineer
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#111214] text-[#F6D58A] border border-white/[0.08]">
                LangGraph
              </span>
            </div>
            <p className="text-[11px] text-[#A6A6A3] font-mono">Autonomous Self-Correcting Agent</p>
          </div>
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
            <span className="text-[#A6A6A3] font-mono text-[11px]">
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
