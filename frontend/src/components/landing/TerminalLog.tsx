"use client";

import { Terminal } from "lucide-react";
import InteractiveCard from "./InteractiveCard";

export default function TerminalLog() {
  const logEntries = [
    { time: "09:41:03", tag: "planner", color: "text-[#F6D58A]", msg: "Creating implementation plan for task: 'Add JWT authentication'" },
    { time: "09:41:07", tag: "repo", color: "text-[#F6D58A]", msg: "Inspected 24 workspace files; detected FastAPI & pytest suite" },
    { time: "09:41:15", tag: "coder", color: "text-[#F0A43C]", msg: "Modified src/auth/service.py (Iteration 1)" },
    { time: "09:41:22", tag: "test", color: "text-[#F2F2F0]", msg: "Running pytest -v --tb=short in sandbox" },
    { time: "09:41:28", tag: "test", color: "text-[#EF4444]", msg: "2 assertions failed (TypeError: user_id must be str)" },
    { time: "09:41:30", tag: "reflection", color: "text-[#F6D58A]", msg: "Diagnosing failure: explicit str(user_id) casting required in payload['sub']" },
    { time: "09:41:35", tag: "coder", color: "text-[#F0A43C]", msg: "Applying self-correction patch to src/auth/service.py (Iteration 2)" },
    { time: "09:41:44", tag: "test", color: "text-[#22C55E]", msg: "49/49 tests passed in 0.18s" },
    { time: "09:41:45", tag: "agent", color: "text-[#22C55E]", msg: "Task completed successfully • Awaiting developer approval" },
  ];

  return (
    <section className="py-20 border-b border-white/[0.08] bg-transparent relative z-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <InteractiveCard variant="tilt" className="rounded-xl border border-white/[0.08] bg-[#111214] overflow-hidden shadow-2xl font-mono text-xs">
          <div className="h-9 bg-[#0D0E10] border-b border-white/[0.08] px-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-[#F0A43C]" />
              <span className="text-[#A6A6A3] text-[11px]">stdout / execution.log</span>
            </div>
            <span className="text-[10px] text-[#6B6B6B]">Captured in Sandbox</span>
          </div>

          <div className="p-4 space-y-1.5 overflow-x-auto text-[11px]">
            <div className="text-[#6B6B6B] mb-2">$ agent run --task &quot;Add JWT authentication&quot;</div>
            {logEntries.map((entry, idx) => (
              <div key={idx} className="flex items-start gap-2.5 leading-relaxed">
                <span className="text-[#6B6B6B] shrink-0 select-none">{entry.time}</span>
                <span className={`uppercase font-bold text-[10px] w-20 shrink-0 ${entry.color}`}>
                  [{entry.tag}]
                </span>
                <span className="text-[#F2F2F0]/90">{entry.msg}</span>
              </div>
            ))}
          </div>
        </InteractiveCard>
      </div>
    </section>
  );
}
