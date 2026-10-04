"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, RotateCw, ShieldCheck, ArrowRight } from "lucide-react";

export default function ProductStatement() {
  const [mode, setMode] = useState<"generate" | "verify">("generate");

  useEffect(() => {
    const timer = setInterval(() => {
      setMode((prev) => (prev === "generate" ? "verify" : "generate"));
    }, 3800);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="how-it-works" className="py-24 border-b border-white/[0.08] bg-transparent relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Editorial Heading with Transformation Morph */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="text-xs font-mono uppercase tracking-wider text-[#F6D58A] mb-3 block font-semibold">
            Execution vs Speculation
          </span>
          <h2 className="font-serif font-semibold text-4xl sm:text-6xl md:text-7xl text-[#F2F2F0] leading-[1.05] tracking-[-0.01em]">
            It doesn&apos;t just generate code.
          </h2>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 font-serif font-semibold text-3xl sm:text-5xl md:text-6xl tracking-[-0.01em]">
            <span className="text-[#A6A6A3]">IT</span>
            <div className="relative inline-flex items-center px-4 py-1 rounded-lg border border-white/[0.08] bg-[#111214] font-mono text-lg sm:text-2xl not-italic">
              <span
                className={`transition-all duration-300 font-bold ${
                  mode === "generate"
                    ? "text-[#EF4444] opacity-100 scale-100"
                    : "text-[#22C55E] opacity-100 scale-100"
                }`}
              >
                {mode === "generate" ? "GENERATE" : "VERIFY"}
              </span>
              <span className="text-[10px] font-mono text-[#6B6B6B] ml-2.5 uppercase hidden sm:inline">
                {mode === "generate" ? "Prediction" : "State Machine"}
              </span>
            </div>
            <span className="text-[#F2F2F0]">THE RESULT.</span>
          </div>

          <p className="mt-6 text-base sm:text-lg text-[#A6A6A3] leading-relaxed font-sans max-w-2xl mx-auto">
            Most AI coding tools stop at text prediction. This system executes tests in an isolated
            sandbox, inspects failures, and iterates until the solution is proven correct.
          </p>

          {/* Toggle pill buttons */}
          <div className="mt-6 inline-flex rounded-lg border border-white/[0.08] bg-[#111214] p-1 font-mono text-xs">
            <button
              type="button"
              onClick={() => setMode("generate")}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                mode === "generate"
                  ? "bg-[#181A1D] text-[#EF4444] font-semibold border border-white/[0.08]"
                  : "text-[#6B6B6B] hover:text-[#F2F2F0]"
              }`}
            >
              Conventional: Generate
            </button>
            <button
              type="button"
              onClick={() => setMode("verify")}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                mode === "verify"
                  ? "bg-[#181A1D] text-[#22C55E] font-semibold border border-white/[0.08]"
                  : "text-[#6B6B6B] hover:text-[#F2F2F0]"
              }`}
            >
              Autonomous: Verify ↺
            </button>
          </div>
        </div>

        {/* Visual Comparison Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Typical Coding Assistant */}
          <div
            className={`p-6 sm:p-8 rounded-xl border transition-all ${
              mode === "generate"
                ? "border-[#EF4444]/40 bg-[#111214] shadow-xl shadow-black/50"
                : "border-white/[0.06] bg-[#111214]/60 opacity-80"
            } flex flex-col justify-between`}
          >
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-6">
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-[#6B6B6B]">
                    Conventional Approach
                  </div>
                  <h3 className="text-lg font-bold text-[#F2F2F0] mt-0.5">
                    Single-Turn Prediction
                  </h3>
                </div>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30">
                  Unverified
                </span>
              </div>

              {/* Flow Sequence */}
              <div className="flex flex-col gap-3 font-mono text-xs text-[#A6A6A3]">
                <div className="p-3 rounded-lg bg-[#0D0E10] border border-white/[0.06] flex items-center justify-between">
                  <span>1. User Prompt</span>
                  <span className="text-[#6B6B6B]">Input</span>
                </div>
                <div className="flex justify-center text-[#6B6B6B]">↓</div>
                <div className="p-3 rounded-lg bg-[#0D0E10] border border-white/[0.06] flex items-center justify-between">
                  <span>2. LLM Text Generation</span>
                  <span className="text-[#6B6B6B]">Code String</span>
                </div>
                <div className="flex justify-center text-[#6B6B6B]">↓</div>
                <div className="p-3 rounded-lg bg-[#0D0E10] border border-[#EF4444]/40 text-[#EF4444] flex items-center justify-between">
                  <span>3. Done (Developer debugging required)</span>
                  <XCircle className="w-4 h-4 text-[#EF4444] shrink-0" />
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-white/[0.08] text-xs text-[#6B6B6B] leading-relaxed font-mono">
              Blind to runtime errors, missing imports, and broken unit tests. The human remains the debugger.
            </div>
          </div>

          {/* AI Software Engineering Assistant */}
          <div
            className={`p-6 sm:p-8 rounded-xl border transition-all ${
              mode === "verify"
                ? "border-[#F0A43C]/50 bg-[#111214] shadow-2xl shadow-black/60 scale-[1.01]"
                : "border-white/[0.08] bg-[#111214]"
            } flex flex-col justify-between`}
          >
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-6">
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-[#F0A43C] font-semibold">
                    Autonomous Engineering
                  </div>
                  <h3 className="text-lg font-bold text-[#F2F2F0] mt-0.5">
                    Closed-Loop State Machine
                  </h3>
                </div>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30 flex items-center gap-1 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified
                </span>
              </div>

              {/* Dynamic State Machine Flow */}
              <div className="grid grid-cols-2 gap-2.5 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-[#0D0E10] border border-white/[0.06] text-[#F2F2F0]">
                  <span className="text-[10px] text-[#6B6B6B] block">STAGE 01</span>
                  <span className="font-semibold text-[#F6D58A]">Structured Plan</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#0D0E10] border border-white/[0.06] text-[#F2F2F0]">
                  <span className="text-[10px] text-[#6B6B6B] block">STAGE 02</span>
                  <span className="font-semibold text-[#3B82F6]">Repo Analyzer</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#0D0E10] border border-white/[0.06] text-[#F2F2F0]">
                  <span className="text-[10px] text-[#6B6B6B] block">STAGE 03</span>
                  <span className="font-semibold text-[#F0A43C]">Targeted Coding</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#0D0E10] border border-white/[0.06] text-[#F2F2F0]">
                  <span className="text-[10px] text-[#6B6B6B] block">STAGE 04</span>
                  <span className="font-semibold text-[#F2F2F0] flex items-center gap-1">
                    Pytest Sandbox
                  </span>
                </div>
              </div>

              {/* Dynamic Feedback Loop Indicator */}
              <div className="mt-3 p-3 rounded-lg bg-[#181A1D] border border-white/[0.08] flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2 text-[#F6D58A]">
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                  <span>On Failure: Self-Correction Loop</span>
                </div>
                <span className="text-[#22C55E] font-semibold text-[11px]">Up to 3 Iterations</span>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-white/[0.08] text-xs text-[#A6A6A3] leading-relaxed font-mono">
              Executes in an isolated sandbox, diagnoses stack traces, and only presents verified diffs for human approval.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
