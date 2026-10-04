"use client";

import { Cpu, Server, Layout, ShieldAlert } from "lucide-react";
import InteractiveCard from "./InteractiveCard";

export default function TechnicalCredibility() {
  const stack = [
    {
      name: "LangGraph",
      role: "Stateful Agent Orchestration",
      desc: "Cyclic state-machine runtime with memory checkpointing, explicit conditional branching, and deterministic loop limits.",
      icon: Cpu,
    },
    {
      name: "FastAPI",
      role: "Low-Latency Execution Backend",
      desc: "Asynchronous Python API server powering background workflow dispatch and real-time Server-Sent Events (SSE).",
      icon: Server,
    },
    {
      name: "Next.js & TypeScript",
      role: "Desktop-First Workspace",
      desc: "App router interface with instant file-tree exploration, syntax-highlighted diffs, and live timeline rendering.",
      icon: Layout,
    },
    {
      name: "Subprocess Sandbox",
      role: "Execution Isolation",
      desc: "Sanitized environment variables, strict timeouts, and directory scoping prevent side-effects on host systems.",
      icon: ShieldAlert,
    },
  ];

  return (
    <section className="py-24 border-b border-white/[0.08] bg-transparent relative z-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-16">
          <span className="text-xs font-mono uppercase tracking-wider text-[#F6D58A] font-semibold mb-2 block">
            Engineering Foundations
          </span>
          <h2 className="font-serif font-semibold text-3xl sm:text-5xl md:text-6xl text-[#F2F2F0] leading-[1.05] tracking-[-0.01em]">
            Engineered with modern infrastructure.
          </h2>
          <p className="mt-4 text-[#A6A6A3] text-base sm:text-lg leading-relaxed font-sans">
            Built from proven developer infrastructure tools rather than experimental wrappers.
          </p>
        </div>

        {/* 4 Infrastructure Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stack.map((item, idx) => {
            const Icon = item.icon;
            return (
              <InteractiveCard
                key={item.name}
                variant="interactive"
                revealDelay={idx * 80}
                className="p-5 rounded-xl border border-white/[0.08] bg-[#111214] flex flex-col justify-between hover:border-white/[0.14] transition-colors"
              >
                <div>
                  <div className="w-8 h-8 rounded-lg bg-[#0D0E10] border border-white/[0.06] flex items-center justify-center text-[#F0A43C] mb-4">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-[#F2F2F0]">{item.name}</h3>
                  <div className="text-[11px] font-mono text-[#F6D58A] mt-0.5 mb-2.5">
                    {item.role}
                  </div>
                </div>
                <p className="text-xs text-[#A6A6A3] font-sans leading-relaxed">
                  {item.desc}
                </p>
              </InteractiveCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}
