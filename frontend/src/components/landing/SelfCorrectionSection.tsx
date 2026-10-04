"use client";

import { useState, useEffect } from "react";
import { RotateCw, AlertTriangle, Lightbulb, Code2, CheckCircle2 } from "lucide-react";

export default function SelfCorrectionSection() {
  const [activeCycle, setActiveCycle] = useState(0);

  const cycleSteps = [
    {
      id: "fail",
      title: "Test Execution Fails",
      type: "error",
      badge: "Iteration 1",
      icon: AlertTriangle,
      code: "FAILED test_math_utils.py::test_fibonacci_negative_error\nAssertionError: Expected ValueError, but got None\n  File 'math_utils.py', line 4, in fibonacci",
      note: "Initial implementation returned 0 for negative inputs instead of raising ValueError.",
    },
    {
      id: "diagnose",
      title: "Reflection Node Diagnoses",
      type: "reflect",
      badge: "Reflection Agent",
      icon: Lightbulb,
      code: "Diagnosis Report:\n1. Root cause: Missing guard clause for n < 0.\n2. Fix prescription: Add `if n < 0: raise ValueError('n must be non-negative')`\n3. Target file: math_utils.py",
      note: "Parses compiler & test tracebacks to isolate the exact defect without guessing blindly.",
    },
    {
      id: "patch",
      title: "Coding Agent Applies Fix",
      type: "code",
      badge: "Iteration 2",
      icon: Code2,
      code: " def fibonacci(n: int) -> int:\n+    if n < 0:\n+        raise ValueError('n must be non-negative')\n     if n in (0, 1):\n         return n",
      note: "Synthesizes surgical patch without altering the rest of the working implementation.",
    },
    {
      id: "pass",
      title: "Tests Re-run & Verified",
      type: "success",
      badge: "Verified Pass",
      icon: CheckCircle2,
      code: "==================== 4 passed in 0.04s ====================\n✓ test_fibonacci_zero PASSED\n✓ test_fibonacci_base_cases PASSED\n✓ test_fibonacci_negative_error PASSED\n✓ test_fibonacci_large PASSED",
      note: "Subprocess test sandbox confirms 100% test suite passage. Ready for user approval.",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveCycle((prev) => (prev + 1) % cycleSteps.length);
    }, 3400);
    return () => clearInterval(timer);
  }, [cycleSteps.length]);

  const current = cycleSteps[activeCycle];

  return (
    <section id="self-correction" className="py-24 border-b border-white/[0.08] bg-transparent relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <span className="text-xs font-mono uppercase tracking-wider text-[#F0A43C] font-semibold mb-2 block">
            Self-Correction Engine
          </span>
          <h2 className="font-serif font-semibold text-4xl sm:text-6xl md:text-7xl text-[#F2F2F0] leading-[1.05] tracking-[-0.01em]">
            When something breaks, it doesn&apos;t stop.
          </h2>
          <p className="mt-4 text-[#A6A6A3] text-base sm:text-lg leading-relaxed font-sans">
            Bugs are normal in software engineering. Rather than forcing you to act as the debugger,
            the assistant captures the error traceback, reflects on the defect, and loops back into
            the coding agent to apply a verified fix.
          </p>
        </div>

        {/* Technical Curved Loop Visualization with Animated SVG Beam */}
        <div className="mb-12 p-6 rounded-xl border border-white/[0.08] bg-[#111214] shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-6 font-mono text-xs">
            <span className="text-[#6B6B6B] uppercase font-semibold">Cyclic State Machine</span>
            <span className="text-[#F6D58A] flex items-center gap-1.5">
              <RotateCw className="w-3.5 h-3.5 animate-spin" />
              <span>Feedback Loop Active (max_iterations = 3)</span>
            </span>
          </div>

          {/* SVG Animated Connector Flow */}
          <div className="relative mb-6 hidden md:block">
            <svg className="w-full h-10 overflow-visible" viewBox="0 0 800 40" fill="none">
              {/* Background Path */}
              <path
                d="M 100 20 L 300 20 L 500 20 L 700 20 C 760 20, 760 -10, 400 -10 C 140 -10, 140 20, 100 20"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
              {/* Animated Traveling Pulse Beam */}
              <path
                d="M 100 20 L 300 20 L 500 20 L 700 20 C 760 20, 760 -10, 400 -10 C 140 -10, 140 20, 100 20"
                stroke="#F0A43C"
                strokeWidth="2"
                className="animate-beam"
              />
            </svg>
          </div>

          {/* Connected Circular Flow Display */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative">
            {[
              { label: "1. CODE", sub: "Targeted Diff", color: "text-[#F0A43C]" },
              { label: "2. TEST", sub: "Detect Failure", color: "text-[#EF4444]" },
              { label: "3. REFLECT", sub: "Diagnose Root Cause", color: "text-[#F6D58A]" },
              { label: "4. FIX ↺", sub: "Re-generate & Pass", color: "text-[#22C55E]" },
            ].map((node, i) => {
              const isCurrent = activeCycle === i;
              return (
                <div
                  key={node.label}
                  className={`p-4 rounded-lg border transition-all text-center ${
                    isCurrent
                      ? "bg-[#181A1D] border-[#F0A43C] shadow-md shadow-black/50 scale-[1.02]"
                      : "bg-[#0D0E10] border-white/[0.06] opacity-75"
                  }`}
                >
                  <div className={`font-mono text-xs font-bold ${node.color}`}>{node.label}</div>
                  <div className="text-[11px] text-[#A6A6A3] mt-1 font-mono">{node.sub}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4 Interactive Step Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {cycleSteps.map((step, idx) => {
            const isSelected = activeCycle === idx;
            const Icon = step.icon;

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => setActiveCycle(idx)}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? step.type === "error"
                      ? "bg-[#EF4444]/10 border-[#EF4444] shadow-md shadow-black/40"
                      : step.type === "reflect"
                      ? "bg-[#F6D58A]/10 border-[#F6D58A] shadow-md shadow-black/40"
                      : step.type === "code"
                      ? "bg-[#F0A43C]/10 border-[#F0A43C] shadow-md shadow-black/40"
                      : "bg-[#22C55E]/10 border-[#22C55E] shadow-md shadow-black/40"
                    : "bg-[#111214] border-white/[0.08] hover:border-white/[0.14]"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono uppercase text-[#6B6B6B]">
                    Step 0{idx + 1}
                  </span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                      step.type === "error"
                        ? "text-[#EF4444] border-[#EF4444]/30 bg-[#EF4444]/15"
                        : step.type === "reflect"
                        ? "text-[#F6D58A] border-[#F6D58A]/30 bg-[#F6D58A]/15"
                        : step.type === "code"
                        ? "text-[#F0A43C] border-[#F0A43C]/30 bg-[#F0A43C]/15"
                        : "text-[#22C55E] border-[#22C55E]/30 bg-[#22C55E]/15"
                    }`}
                  >
                    {step.badge}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-[#F2F2F0] shrink-0" />
                  <span className="text-xs font-bold text-[#F2F2F0] font-sans truncate">{step.title}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Code Inspection & Diagnostic Window */}
        <div className="rounded-xl border border-white/[0.08] bg-[#111214] p-6 shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-4 font-mono text-xs">
            <span className="text-[#F2F2F0] font-medium">{current.title}</span>
            <span className="text-[#A6A6A3] text-[11px]">{current.note}</span>
          </div>
          <pre className="p-4 rounded-lg bg-[#0D0E10] border border-white/[0.08] text-xs font-mono text-[#F2F2F0] overflow-x-auto leading-relaxed whitespace-pre select-text">
            {current.code}
          </pre>
        </div>
      </div>
    </section>
  );
}
