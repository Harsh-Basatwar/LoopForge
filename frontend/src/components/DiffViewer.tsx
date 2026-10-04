"use client";

import { useState } from "react";
import { FileCode, CheckCircle2, XCircle, Ban, Eye, SplitSquareVertical } from "lucide-react";
import { FileChange } from "@/types";

interface Props {
  changes: FileChange[];
  taskStatus: string;
  onApprove?: () => void;
  onReject?: () => void;
  onCancel?: () => void;
  isProcessing?: boolean;
}

export default function DiffViewer({
  changes,
  taskStatus,
  onApprove,
  onReject,
  onCancel,
  isProcessing,
}: Props) {
  const [selectedFileIdx, setSelectedFileIdx] = useState(0);
  const [viewMode, setViewMode] = useState<"diff" | "full">("diff");

  if (!changes || changes.length === 0) {
    return (
      <div className="p-8 text-center text-[#6B6B6B] text-xs border border-dashed border-white/[0.08] rounded-xl bg-[#111214]">
        No code changes generated yet. Submit a task or wait for the Coding Agent.
      </div>
    );
  }

  const activeChange = changes[selectedFileIdx] || changes[0];

  const renderDiffLines = (diffStr: string) => {
    if (!diffStr) return <div className="text-[#6B6B6B] p-4 text-xs">No diff available (new file)</div>;
    const lines = diffStr.split("\n");

    return (
      <div className="font-mono text-xs overflow-x-auto select-text">
        {lines.map((line, idx) => {
          let bgClass = "bg-transparent text-[#F2F2F0]/90";

          if (line.startsWith("+") && !line.startsWith("+++")) {
            bgClass = "bg-[#22C55E]/10 text-[#22C55E] border-l-2 border-[#22C55E]";
          } else if (line.startsWith("-") && !line.startsWith("---")) {
            bgClass = "bg-[#EF4444]/10 text-[#EF4444] border-l-2 border-[#EF4444]";
          } else if (line.startsWith("@@")) {
            bgClass = "bg-[#F0A43C]/10 text-[#F0A43C] font-bold border-l-2 border-[#F0A43C]";
          }

          return (
            <div key={idx} className={`flex items-start px-3 py-0.5 hover:bg-[#181A1D] ${bgClass}`}>
              <span className="w-8 shrink-0 text-xs select-none text-[#6B6B6B] text-right pr-3 font-mono">
                {idx + 1}
              </span>
              <pre className="whitespace-pre flex-1 font-mono">{line}</pre>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-[#111214] border border-white/[0.08] rounded-xl overflow-hidden shadow-sm flex flex-col">
      {/* Diff Header */}
      <div className="border-b border-white/[0.08] bg-[#0D0E10] p-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <FileCode className="w-4 h-4 text-[#F0A43C]" />
          <span className="text-sm sm:text-[15px] font-semibold text-[#F2F2F0]">Proposed Code Changes</span>
          <span className="text-xs px-2.5 py-0.5 rounded-md bg-[#181A1D] text-[#A6A6A3] border border-white/[0.06]">
            {changes.length} file{changes.length === 1 ? "" : "s"}
          </span>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 bg-[#0A0A0B] border border-white/[0.08] p-1 rounded-lg text-sm">
          <button
            type="button"
            onClick={() => setViewMode("diff")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs sm:text-sm transition-colors cursor-pointer ${
              viewMode === "diff"
                ? "bg-[#181A1D] text-[#F0A43C] font-semibold border border-white/[0.08]"
                : "text-[#A6A6A3] hover:text-[#F2F2F0]"
            }`}
          >
            <SplitSquareVertical className="w-3.5 h-3.5" />
            Unified Diff
          </button>
          <button
            type="button"
            onClick={() => setViewMode("full")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs sm:text-sm transition-colors cursor-pointer ${
              viewMode === "full"
                ? "bg-[#181A1D] text-[#F0A43C] font-semibold border border-white/[0.08]"
                : "text-[#A6A6A3] hover:text-[#F2F2F0]"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Full Content
          </button>
        </div>
      </div>

      {/* File Tabs */}
      <div className="flex items-center gap-1.5 px-3 pt-2 bg-[#0A0A0B] border-b border-white/[0.08] overflow-x-auto">
        {changes.map((c, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setSelectedFileIdx(idx)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-t-lg text-xs sm:text-sm border-t border-x transition-colors cursor-pointer ${
              selectedFileIdx === idx
                ? "bg-[#111214] border-white/[0.12] text-[#F2F2F0] font-semibold border-b-2 border-b-[#F0A43C]"
                : "border-transparent text-[#A6A6A3] hover:text-[#F2F2F0] hover:bg-[#111214]/50"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                c.change_type === "create" ? "bg-[#22C55E]" : "bg-[#F0A43C]"
              }`}
            />
            <span className="font-mono text-xs sm:text-[13px]">{c.path}</span>
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="p-3.5 bg-[#0D0E10] max-h-[400px] overflow-y-auto">
        {activeChange.description && (
          <div className="mb-2.5 p-2.5 rounded-lg bg-[#111214] border border-white/[0.08] text-sm text-[#F2F2F0]">
            <span className="font-semibold text-[#F6D58A]">Agent note: </span>
            {activeChange.description}
          </div>
        )}

        {viewMode === "diff" ? (
          renderDiffLines(activeChange.diff || activeChange.content)
        ) : (
          <pre className="p-3.5 bg-[#111214] border border-white/[0.08] rounded-xl text-xs sm:text-[13px] font-mono text-[#F2F2F0] whitespace-pre overflow-x-auto leading-relaxed">
            {activeChange.content}
          </pre>
        )}
      </div>

      {/* Human Approval Action Bar */}
      <div className="p-3.5 bg-[#0A0A0B] border-t border-white/[0.08] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="text-xs sm:text-sm text-[#A6A6A3] flex items-center gap-2">
          <span>Status: </span>
          <span className="text-[#F2F2F0] font-semibold uppercase">{taskStatus.replace("_", " ")}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          {onCancel && taskStatus !== "completed" && taskStatus !== "cancelled" && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isProcessing}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-lg border border-white/[0.08] hover:bg-[#111214] text-[#A6A6A3] hover:text-[#F2F2F0] text-xs sm:text-sm transition-colors cursor-pointer min-h-[44px]"
            >
              <Ban className="w-4 h-4" />
              Cancel Task
            </button>
          )}

          {onReject && ["awaiting_approval", "testing", "completed"].includes(taskStatus) && (
            <button
              type="button"
              onClick={onReject}
              disabled={isProcessing}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-lg border border-[#EF4444]/30 bg-[#EF4444]/10 hover:bg-[#EF4444]/20 text-[#EF4444] text-xs sm:text-sm transition-colors cursor-pointer font-medium min-h-[44px]"
            >
              <XCircle className="w-4 h-4" />
              Reject Changes
            </button>
          )}

          {onApprove && (
            <button
              type="button"
              onClick={onApprove}
              disabled={isProcessing}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#22C55E] hover:bg-[#22C55E]/90 text-[#0A0A0B] font-semibold text-xs sm:text-sm transition-all shadow-sm cursor-pointer min-h-[44px]"
            >
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              Approve & Apply Changes
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
