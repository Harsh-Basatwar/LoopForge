"use client";

import Link from "next/link";
import { Cpu } from "lucide-react";

export default function Footer() {
  return (
    <footer className="py-12 bg-[#0A0A0B] border-t border-white/[0.08] text-xs text-[#6B6B6B] font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-[#111214] border border-white/[0.08] flex items-center justify-center">
              <Cpu className="w-3.5 h-3.5 text-[#F0A43C]" />
            </div>
            <span className="font-semibold text-[#F2F2F0]">
              AI Software Engineering Assistant
            </span>
          </div>

          {/* Minimal Nav */}
          <div className="flex items-center gap-6 font-mono text-[11px] text-[#A6A6A3]">
            <Link href="/workspace" className="hover:text-[#F2F2F0] transition-colors">
              Workspace
            </Link>
            <a href="#how-it-works" className="hover:text-[#F2F2F0] transition-colors">
              How It Works
            </a>
            <a href="#workflow" className="hover:text-[#F2F2F0] transition-colors">
              Workflow
            </a>
            <a href="#architecture" className="hover:text-[#F2F2F0] transition-colors">
              Architecture
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#F2F2F0] transition-colors"
            >
              GitHub
            </a>
          </div>

          <div className="font-mono text-[11px] text-[#6B6B6B]">
            © 2026 Autonomous LangGraph System
          </div>
        </div>

        {/* Animated Workflow Status Line */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between text-[10px] font-mono text-[#6B6B6B] gap-2">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
            <span>Pipeline: PLAN → ANALYZE → CODE → TEST → REFLECT ↺</span>
          </div>
          <span className="text-[#F6D58A]">Self-Correcting Autonomous Developer Tool</span>
        </div>
      </div>
    </footer>
  );
}
