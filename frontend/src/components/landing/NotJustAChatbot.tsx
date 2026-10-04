"use client";

import { MessageSquareCode, Cpu } from "lucide-react";
import InteractiveCard from "./InteractiveCard";

export default function NotJustAChatbot() {
  return (
    <section className="py-24 border-b border-white/[0.08] bg-transparent relative z-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-16">
          <span className="text-xs font-mono uppercase tracking-wider text-[#F6D58A] font-semibold mb-2 block">
            System Architecture
          </span>
          <h2 className="font-serif font-semibold text-3xl sm:text-5xl md:text-6xl text-[#F2F2F0] leading-[1.05] tracking-[-0.01em]">
            A chat interface is only the surface.
          </h2>
          <p className="mt-4 text-[#A6A6A3] text-base sm:text-lg leading-relaxed font-sans">
            Underneath it is a stateful engineering workflow that coordinates planning, repository
            analysis, implementation, sandbox execution, and self-correction.
          </p>
        </div>

        {/* Dual Layer Architectural Reveal */}
        <InteractiveCard
          variant="spotlight"
          className="rounded-xl border border-white/[0.08] bg-[#111214] p-6 sm:p-8 shadow-2xl relative overflow-hidden font-mono text-xs hover:border-white/[0.14]"
        >
          {/* Layer 1: Surface Chat Layer */}
          <div className="p-4 rounded-xl border border-white/[0.08] bg-[#0D0E10] mb-6">
            <div className="flex items-center justify-between text-[#A6A6A3] text-[11px] mb-3">
              <div className="flex items-center gap-2">
                <MessageSquareCode className="w-3.5 h-3.5 text-[#F0A43C]" />
                <span className="font-semibold text-[#F2F2F0]">Layer 1: Developer Interaction Surface</span>
              </div>
              <span className="text-[#6B6B6B]">Natural Language Task Submission</span>
            </div>
            <div className="p-2.5 rounded bg-[#0A0A0B] border border-white/[0.06] text-[#F2F2F0]">
              &gt; Add input validation to the Fibonacci generator and verify with pytest
            </div>
          </div>

          {/* Transition Connector */}
          <div className="flex flex-col items-center my-3">
            <span className="text-[10px] text-[#F0A43C] uppercase tracking-wider mb-1 font-semibold">
              ▼ Dispatched into LangGraph State Machine
            </span>
            <div className="w-0.5 h-6 bg-[#F0A43C]/50" />
          </div>

          {/* Layer 2: Deep Engineering Engine */}
          <div className="p-5 rounded-xl border border-[#F0A43C]/30 bg-[#181A1D]">
            <div className="flex items-center justify-between text-[11px] mb-4 text-[#F0A43C]">
              <div className="flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-[#F0A43C]" />
                <span className="font-semibold text-[#F2F2F0]">Layer 2: Autonomous Engineering Engine</span>
              </div>
              <span className="text-[#F6D58A]">Stateful Agent Nodes</span>
            </div>

            {/* Structured Nodes Representation */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px]">
              <div className="p-3 rounded-lg bg-[#0D0E10] border border-white/[0.06]">
                <div className="text-[#F6D58A] uppercase text-[9px] font-semibold">Planner</div>
                <div className="font-semibold text-[#F2F2F0] mt-1">Multi-Step Plan</div>
                <div className="text-[10px] text-[#A6A6A3] mt-0.5">3-5 step architectural plan</div>
              </div>

              <div className="p-3 rounded-lg bg-[#0D0E10] border border-white/[0.06]">
                <div className="text-[#F6D58A] uppercase text-[9px] font-semibold">Analyzer</div>
                <div className="font-semibold text-[#F2F2F0] mt-1">Repo Indexing</div>
                <div className="text-[10px] text-[#A6A6A3] mt-0.5">Scans files & pytest dependencies</div>
              </div>

              <div className="p-3 rounded-lg bg-[#0D0E10] border border-white/[0.06]">
                <div className="text-[#F0A43C] uppercase text-[9px] font-semibold">Coding Agent</div>
                <div className="font-semibold text-[#F2F2F0] mt-1">Unified Git Diff</div>
                <div className="text-[10px] text-[#A6A6A3] mt-0.5">Generates precise code additions</div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 text-[11px]">
              <div className="p-3 rounded-lg bg-[#0D0E10] border border-white/[0.06]">
                <div className="text-[#F2F2F0] uppercase text-[9px] font-semibold">Execution Sandbox</div>
                <div className="font-semibold text-[#F6D58A] mt-1">Subprocess Pytest Runner</div>
                <div className="text-[10px] text-[#A6A6A3] mt-0.5">Controlled timeouts & sanitized environment</div>
              </div>

              <div className="p-3 rounded-lg bg-[#0D0E10] border border-[#22C55E]/30 bg-[#22C55E]/10">
                <div className="text-[#22C55E] uppercase text-[9px] font-semibold">Reflection & Self-Correction</div>
                <div className="font-semibold text-[#22C55E] mt-1">Closed-Loop Repair</div>
                <div className="text-[10px] text-[#F2F2F0]/80 mt-0.5">Iterates until test assertions pass</div>
              </div>
            </div>
          </div>
        </InteractiveCard>
      </div>
    </section>
  );
}
