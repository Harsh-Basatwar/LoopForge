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
      <div className="bg-[#111214] border border-white/[0.08] rounded-xl p-6 text-center">
        <div className="flex items-center justify-center gap-2.5 text-[#F0A43C] text-sm sm:text-[15px] mb-2 animate-pulse font-medium">
          <FlaskConical className="w-4 h-4 animate-spin" />
          <span>Executing test runner in isolated sandbox...</span>
        </div>
        <p className="text-[13px] text-[#8C8C88]">Checking imports, running pytest suite and validating outputs</p>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="p-7 text-center text-[#8C8C88] text-sm border border-dashed border-white/[0.08] rounded-xl bg-[#111214] leading-relaxed">
        No test results yet. The Test Agent will run tests automatically after the Coding Agent finishes.
      </div>
    );
  }

  const isPassed = results.status === "passed" && results.failed === 0;

  return (
    <div className="bg-[#111214] border border-white/[0.08] rounded-xl p-4 sm:p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-3.5">
        <div className="flex items-center gap-2.5">
          <FlaskConical className="w-5 h-5 text-[#F0A43C]" />
          <h3 className="text-base sm:text-lg font-semibold text-[#F2F2F0]">Sandbox Test Results</h3>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1.5 ${
              isPassed
                ? "bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30"
                : "bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30"
            }`}
          >
            {isPassed ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            {isPassed ? "PASSED" : "FAILED"}
          </span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-[#0D0E10] p-3 rounded-xl border border-white/[0.06]">
          <span className="text-xs sm:text-[13px] text-[#8C8C88] uppercase block tracking-wider font-medium">Passed</span>
          <span className="text-2xl sm:text-[26px] font-bold text-[#22C55E] block mt-0.5">{results.passed}</span>
        </div>
        <div className="bg-[#0D0E10] p-3 rounded-xl border border-white/[0.06]">
          <span className="text-xs sm:text-[13px] text-[#8C8C88] uppercase block tracking-wider font-medium">Failed</span>
          <span className={`text-2xl sm:text-[26px] font-bold block mt-0.5 ${results.failed > 0 ? "text-[#EF4444]" : "text-[#8C8C88]"}`}>
            {results.failed}
          </span>
        </div>
        <div className="bg-[#0D0E10] p-3 rounded-xl border border-white/[0.06]">
          <span className="text-xs sm:text-[13px] text-[#8C8C88] uppercase block tracking-wider font-medium">Duration</span>
          <span className="text-2xl sm:text-[26px] font-bold text-[#F6D58A] block mt-0.5">{results.duration_ms}ms</span>
        </div>
      </div>

      {/* Terminal Output */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-[#A6A6A3]">
          <Terminal className="w-4 h-4 text-[#8C8C88]" />
          <span>Command: </span>
          <code className="font-mono text-[#F0A43C] bg-[#0A0A0B] px-2 py-0.5 rounded border border-white/[0.06] text-xs sm:text-[13px]">{results.command}</code>
        </div>
        <pre className="p-3.5 bg-[#0D0E10] border border-white/[0.06] rounded-xl text-xs sm:text-[13px] font-mono text-[#F2F2F0]/90 whitespace-pre-wrap max-h-[260px] overflow-y-auto leading-relaxed">
          {results.output || "No output recorded"}
        </pre>
      </div>
    </div>
  );
}
