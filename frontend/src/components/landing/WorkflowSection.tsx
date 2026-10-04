"use client";

import { useState } from "react";
import { Sparkles, Database, Code2, FlaskConical, Wrench, ArrowRight } from "lucide-react";

export default function WorkflowSection() {
  const [activeStage, setActiveStage] = useState(0);

  const stages = [
    {
      step: "01",
      name: "PLAN",
      tagline: "Architecture Decomposition",
      hoverText: "Breaks the task into concrete implementation steps before generating any code.",
      desc: "Decomposes the high-level user prompt into an ordered 3-5 milestone plan with input/output contracts and safety checkpoints.",
      icon: Sparkles,
      color: "text-[#F6D58A]",
      bgGlow: "bg-[#F6D58A]/10",
      border: "border-[#F6D58A]/30",
    },
    {
      step: "02",
      name: "ANALYZE",
      tagline: "Workspace & Dependency Discovery",
      hoverText: "Inspects the repository, dependencies, and relevant files.",
      desc: "Recursively indexes repository files, detects languages, test suites (pytest/unittest), and identifies exact candidate files for modification.",
      icon: Database,
      color: "text-[#F6D58A]",
      bgGlow: "bg-[#F6D58A]/10",
      border: "border-[#F6D58A]/30",
    },
    {
      step: "03",
      name: "CODE",
      tagline: "Targeted Refactoring",
      hoverText: "Generates targeted changes using project context.",
      desc: "Generates precise unified diffs and modular changes grounded in existing imports, types, and project coding conventions.",
      icon: Code2,
      color: "text-[#F0A43C]",
      bgGlow: "bg-[#F0A43C]/10",
      border: "border-[#F0A43C]/30",
    },
    {
      step: "04",
      name: "TEST",
      tagline: "Isolated Sandbox Execution",
      hoverText: "Executes the project's test suite in an isolated sandbox.",
      desc: "Runs test suites in a controlled subprocess with strict timeouts, capturing structured exit codes, stdout, and error tracebacks.",
      icon: FlaskConical,
      color: "text-[#F2F2F0]",
      bgGlow: "bg-white/10",
      border: "border-white/20",
    },
    {
      step: "05",
      name: "REFLECT ↺",
      tagline: "Self-Correction & Repair",
      hoverText: "Diagnoses failures and creates a corrective iteration.",
      desc: "When tests fail, parses traceback logs, diagnoses the exact defect, and routes repair instructions back to the coding stage (up to 3 iterations).",
      icon: Wrench,
      color: "text-[#F6D58A]",
      bgGlow: "bg-[#F6D58A]/10",
      border: "border-[#F6D58A]/30",
    },
  ];

  const current = stages[activeStage];

  return (
    <section id="workflow" className="py-24 border-b border-white/[0.08] bg-transparent relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mb-14">
          <span className="text-xs font-mono uppercase tracking-wider text-[#F0A43C] font-semibold mb-2 block">
            Autonomous Pipeline
          </span>
          <h2 className="font-serif font-semibold text-4xl sm:text-6xl md:text-7xl text-[#F2F2F0] leading-[1.05] tracking-[-0.01em]">
            From task to verified implementation.
          </h2>
          <p className="mt-4 text-[#A6A6A3] text-base sm:text-lg leading-relaxed font-sans">
            Every step is a specialized node in a LangGraph state machine with explicit validation,
            deterministic transitions, and loop limits. Hover or click any node to inspect its responsibility.
          </p>
        </div>

        {/* 5 Connected Stages (Horizontal grid with interactive hover) */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5 relative mb-8">
          {stages.map((stage, idx) => {
            const Icon = stage.icon;
            const isHovered = activeStage === idx;

            return (
              <div
                key={stage.step}
                onMouseEnter={() => setActiveStage(idx)}
                onClick={() => setActiveStage(idx)}
                className={`relative p-5 rounded-xl border transition-all cursor-pointer select-none flex flex-col justify-between ${
                  isHovered
                    ? `${stage.bgGlow} ${stage.border} shadow-lg shadow-black/50 scale-[1.02]`
                    : "bg-[#111214] border-white/[0.08] hover:border-white/[0.16]"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono font-bold text-[#6B6B6B]">
                      {stage.step}
                    </span>
                    <Icon className={`w-4 h-4 ${stage.color}`} />
                  </div>

                  <h3 className="text-base font-bold text-[#F2F2F0] tracking-tight">
                    {stage.name}
                  </h3>
                  <div className="text-[11px] font-mono text-[#A6A6A3] mt-1 mb-2">
                    {stage.tagline}
                  </div>
                </div>

                <div className="pt-2 border-t border-white/[0.06] text-[11px] font-mono text-[#6B6B6B]">
                  {stage.hoverText}
                </div>

                {/* Arrow connector for desktop */}
                {idx < stages.length - 1 && (
                  <div className="hidden md:block absolute -right-3.5 top-1/2 -translate-y-1/2 z-20 text-[#6B6B6B]/70 pointer-events-none">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Detailed Inspector Panel for Selected Stage */}
        <div className="p-6 rounded-xl border border-white/[0.08] bg-[#111214] shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[#F0A43C] font-bold">STAGE {current.step} INSPECTOR:</span>
              <span className="text-[#F2F2F0] font-semibold">{current.name} — {current.tagline}</span>
            </div>
            <p className="text-[#A6A6A3] font-sans text-xs sm:text-sm leading-relaxed max-w-3xl">
              {current.desc}
            </p>
          </div>
          <div className="px-3 py-1.5 rounded bg-[#0D0E10] border border-white/[0.08] text-[11px] text-[#F6D58A] shrink-0 font-mono">
            State Transition Validated ✓
          </div>
        </div>
      </div>
    </section>
  );
}
