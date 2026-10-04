"use client";

import { TestResult } from "@/types";
import { FlaskConical, CheckCircle2, XCircle, Terminal } from "lucide-react";

interface Props {
  results?: TestResult | null;
  isRunning?: boolean;
}

export default function TestPanel({ results, isRunning }: Props) {
  if (isRunning) {
    return (
      <div className="bg-[#111214] border border-white/[0.08] rounded-xl p-5 text-center">
        <div className="flex items-center justify-center gap-2 text-[#F0A43C] font-mono text-xs mb-2 animate-pulse">
          <FlaskConical className="w-4 h-4 animate-spin" />
          <span>Executing test runner in isolated sandbox...</span>
        </div>
        <p className="text-[11px] text-[#6B6B6B]">Checking imports, running pytest suite and validating outputs</p>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="p-6 text-center text-[#6B6B6B] font-mono text-xs border border-dashed border-white/[0.08] rounded-xl bg-[#111214]">
        No test results yet. The Test Agent will run tests automatically after the Coding Agent finishes.
      </div>
    );
  }

  const isPassed = results.status === "passed" && results.failed === 0;

  return (
    <div className="bg-[#111214] border border-white/[0.08] rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 mb-3">
        <div className="flex items-center gap-2">
          <FlaskConical className="w-4 h-4 text-[#F0A43C]" />
          <h3 className="text-sm font-semibold text-[#F2F2F0]">Sandbox Test Results</h3>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
              isPassed
                ? "bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30"
                : "bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30"
            }`}
          >
            {isPassed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
            {isPassed ? "PASSED" : "FAILED"}
          </span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-[#0D0E10] p-2.5 rounded-lg border border-white/[0.06]">
          <span className="text-[10px] text-[#6B6B6B] font-mono uppercase block">Passed</span>
          <span className="text-base font-semibold text-[#22C55E] font-mono">{results.passed}</span>
        </div>
        <div className="bg-[#0D0E10] p-2.5 rounded-lg border border-white/[0.06]">
          <span className="text-[10px] text-[#6B6B6B] font-mono uppercase block">Failed</span>
          <span className={`text-base font-semibold font-mono ${results.failed > 0 ? "text-[#EF4444]" : "text-[#6B6B6B]"}`}>
            {results.failed}
          </span>
        </div>
        <div className="bg-[#0D0E10] p-2.5 rounded-lg border border-white/[0.06]">
          <span className="text-[10px] text-[#6B6B6B] font-mono uppercase block">Duration</span>
          <span className="text-base font-semibold text-[#F6D58A] font-mono">{results.duration_ms}ms</span>
        </div>
      </div>

      {/* Terminal Output */}
      <div>
        <div className="flex items-center gap-1.5 text-[11px] text-[#A6A6A3] font-mono mb-1.5">
          <Terminal className="w-3.5 h-3.5 text-[#6B6B6B]" />
          <span>Command: </span>
          <code className="text-[#F0A43C] bg-[#0A0A0B] px-1.5 py-0.5 rounded border border-white/[0.06]">{results.command}</code>
        </div>
        <pre className="p-3 bg-[#0D0E10] border border-white/[0.06] rounded-lg text-[11px] font-mono text-[#F2F2F0]/90 whitespace-pre-wrap max-h-[220px] overflow-y-auto">
          {results.output || "No output recorded"}
        </pre>
      </div>
    </div>
  );
}
