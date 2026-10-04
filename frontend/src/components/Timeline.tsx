"use client";

import { AgentEvent } from "@/types";
import { Check, Loader2, X, Clock, FileCode2 } from "lucide-react";

interface Props {
  events: AgentEvent[];
}

export default function Timeline({ events }: Props) {
  if (!events || events.length === 0) {
    return (
      <div className="p-6 text-center text-[#6B6B6B] font-mono text-xs border border-dashed border-white/[0.08] rounded-xl bg-[#111214]">
        Waiting for agent execution events...
      </div>
    );
  }

  return (
    <div className="bg-[#111214] border border-white/[0.08] rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 mb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#F6D58A]" />
          <h3 className="text-sm font-semibold text-[#F2F2F0]">Agent Execution Timeline</h3>
        </div>
        <span className="text-[11px] font-mono text-[#6B6B6B]">
          {events.length} event{events.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
        {events.map((evt, idx) => {
          const isSuccess = evt.status === "completed";
          const isRunning = evt.status === "running";
          const isFailed = evt.status === "failed";

          return (
            <div key={evt.id || idx} className="flex items-start gap-3 relative group">
              {/* Connector line */}
              {idx < events.length - 1 && (
                <div className="absolute left-[39px] top-6 bottom-[-16px] w-[1px] bg-white/[0.08]" />
              )}

              {/* Timestamp */}
              <span className="text-[11px] font-mono text-[#6B6B6B] w-14 shrink-0 pt-0.5">
                {evt.timestamp}
              </span>

              {/* Status Badge */}
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 z-10 ${
                  isSuccess
                    ? "bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/40"
                    : isRunning
                    ? "bg-[#F0A43C]/20 text-[#F0A43C] border border-[#F0A43C]/40 animate-pulse"
                    : isFailed
                    ? "bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/40"
                    : "bg-[#181A1D] text-[#6B6B6B] border border-white/[0.08]"
                }`}
              >
                {isSuccess && <Check className="w-3 h-3 stroke-[3]" />}
                {isRunning && <Loader2 className="w-3 h-3 animate-spin" />}
                {isFailed && <X className="w-3 h-3 stroke-[3]" />}
                {!isSuccess && !isRunning && !isFailed && <span className="w-1.5 h-1.5 rounded-full bg-[#6B6B6B]" />}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#F2F2F0] capitalize">
                    {evt.node === "reflector" ? "Reflection Agent" : `${evt.node} Agent`}
                  </span>
                  {evt.metadata?.iteration !== undefined && (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#0A0A0B] text-[#A6A6A3] border border-white/[0.06]">
                      iter {evt.metadata.iteration}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#F2F2F0]/80 font-mono mt-0.5 break-words leading-relaxed">
                  {evt.message}
                </p>

                {/* Metadata tags */}
                {evt.metadata && Object.keys(evt.metadata).length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {evt.metadata.files_touched && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-[#0A0A0B] border border-white/[0.08] text-[#F0A43C]">
                        <FileCode2 className="w-3 h-3" />
                        {evt.metadata.files_touched.join(", ")}
                      </span>
                    )}
                    {evt.metadata.passed !== undefined && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#22C55E]/15 border border-[#22C55E]/30 text-[#22C55E]">
                        ✓ {evt.metadata.passed} passed
                      </span>
                    )}
                    {evt.metadata.failed !== undefined && evt.metadata.failed > 0 && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#EF4444]/15 border border-[#EF4444]/30 text-[#EF4444]">
                        ✗ {evt.metadata.failed} failed
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
