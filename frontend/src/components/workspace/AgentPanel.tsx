"use client";

import React from "react";
import { Task, AgentEvent, FileNode } from "@/types";
import DiffViewer from "@/components/DiffViewer";
import TestPanel from "@/components/TestPanel";
import FileTree from "@/components/FileTree";
import {
  Activity,
  FileDiff,
  Terminal,
  FolderTree,
  Check,
  FileCode,
  X,
} from "lucide-react";

interface AgentPanelProps {
  activeTask: Task | null;
  events: AgentEvent[];
  activeTab: "agent" | "diff" | "tests" | "files";
  onTabChange: (tab: "agent" | "diff" | "tests" | "files") => void;
  fileTree: FileNode[];
  selectedFilePath: string;
  selectedFileContent: string;
  onSelectFile: (path: string) => void;
  onApprovePlan: () => void;
  onApproveChanges: () => void;
  onRejectChanges: () => void;
  onClose: () => void;
}

export default function AgentPanel({
  activeTask,
  events,
  activeTab,
  onTabChange,
  fileTree,
  selectedFilePath,
  selectedFileContent,
  onSelectFile,
  onApprovePlan,
  onApproveChanges,
  onRejectChanges,
  onClose,
}: AgentPanelProps) {
  // Workflow nodes mapped to our semantic roles
  const nodes = [
    { id: "planner", label: "Planner", color: "#F6D58A" },
    { id: "analyzer", label: "Repository Analyzer", color: "#F6D58A" },
    { id: "coder", label: "Coding Agent", color: "#F0A43C" },
    { id: "tester", label: "Test Agent", color: "#F2F2F0" },
    { id: "reflector", label: "Reflection Agent", color: "#F6D58A" },
  ];

  const getNodeState = (nodeId: string) => {
    if (!activeTask) return "pending";

    const lastEvent = [...events].reverse().find((e) => e.node === nodeId);
    if (lastEvent) {
      return lastEvent.status;
    }

    if (activeTask.status === "completed") return "completed";
    return "pending";
  };

  const getNodeIcon = (state: string) => {
    switch (state) {
      case "completed":
        return <span className="text-[#22C55E] font-mono font-bold text-xs">✓</span>;
      case "running":
        return <span className="text-[#F0A43C] font-mono font-bold text-xs animate-pulse">●</span>;
      case "failed":
        return <span className="text-[#EF4444] font-mono font-bold text-xs">!</span>;
      default:
        return <span className="text-[#6B6B6B] font-mono text-xs">○</span>;
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay for screens < 1024px */}
      <div
        className="fixed inset-0 bg-black/75 z-40 lg:hidden backdrop-blur-xs"
        onClick={onClose}
        aria-hidden="true"
      />

      <aside className="fixed inset-y-0 right-0 z-50 w-full sm:w-[460px] lg:static lg:w-80 xl:w-96 bg-[#0A0A0B] border-l border-white/[0.08] flex flex-col shrink-0 select-none shadow-2xl">
        {/* Top Tab Bar & Close Action */}
        <div className="h-12 border-b border-white/[0.08] px-2.5 flex items-center justify-between shrink-0 bg-[#0D0E10]">
          <div className="flex items-center gap-1 overflow-x-auto text-xs sm:text-sm font-medium">
            <button
              onClick={() => onTabChange("agent")}
              className={`px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer min-h-[38px] ${
                activeTab === "agent"
                  ? "bg-[#181A1D] text-[#F0A43C] font-semibold border border-[#F0A43C]/30"
                  : "text-[#A6A6A3] hover:text-[#F2F2F0]"
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Agent</span>
            </button>

            <button
              onClick={() => onTabChange("diff")}
              className={`px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer min-h-[38px] ${
                activeTab === "diff"
                  ? "bg-[#181A1D] text-[#F0A43C] font-semibold border border-[#F0A43C]/30"
                  : "text-[#A6A6A3] hover:text-[#F2F2F0]"
              }`}
            >
              <FileDiff className="w-3.5 h-3.5" />
              <span>Changes</span>
              {activeTask && activeTask.generated_changes.length > 0 && (
                <span className="text-[11px] text-[#F0A43C] font-bold">
                  ({activeTask.generated_changes.length})
                </span>
              )}
            </button>

            <button
              onClick={() => onTabChange("tests")}
              className={`px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer min-h-[38px] ${
                activeTab === "tests"
                  ? "bg-[#181A1D] text-[#F0A43C] font-semibold border border-[#F0A43C]/30"
                  : "text-[#A6A6A3] hover:text-[#F2F2F0]"
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Tests</span>
            </button>

            <button
              onClick={() => onTabChange("files")}
              className={`px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer min-h-[38px] ${
                activeTab === "files"
                  ? "bg-[#181A1D] text-[#F0A43C] font-semibold border border-[#F0A43C]/30"
                  : "text-[#A6A6A3] hover:text-[#F2F2F0]"
              }`}
            >
              <FolderTree className="w-3.5 h-3.5" />
              <span>Files</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center text-[#8C8C88] hover:text-[#F2F2F0] rounded-lg hover:bg-[#181A1D] transition-colors cursor-pointer shrink-0 ml-1"
            title="Close panel"
            aria-label="Close right panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {/* AGENT TAB */}
        {activeTab === "agent" && (
          <div className="p-4 sm:p-5 space-y-6">
            {/* Agent State Machine Nodes */}
            <div className="bg-[#111214] border border-white/[0.08] rounded-xl p-4 space-y-3.5 shadow-sm">
              <div className="flex items-center justify-between text-sm border-b border-white/[0.08] pb-2.5 font-medium">
                <span className="text-[#8C8C88] uppercase text-[13px] tracking-wider font-semibold">
                  Autonomous Pipeline
                </span>
                {activeTask && (
                  <span className="text-[#8C8C88] text-xs sm:text-[13px]">
                    Iteration {activeTask.iteration}/{activeTask.max_iterations}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                {nodes.map((n) => {
                  const state = getNodeState(n.id);
                  return (
                    <div
                      key={n.id}
                      className="flex items-center justify-between text-sm py-2 px-3 rounded-lg bg-[#0D0E10] border border-white/[0.06]"
                    >
                      <span className="text-[#F2F2F0] text-[15px] sm:text-base font-medium">
                        {n.label}
                      </span>
                      <div className="flex items-center gap-2">
                        {getNodeIcon(state)}
                        <span
                          className={`text-xs sm:text-[13px] capitalize font-medium ${
                            state === "completed"
                              ? "text-[#22C55E]"
                              : state === "running"
                              ? "text-[#F0A43C]"
                              : state === "failed"
                              ? "text-[#EF4444]"
                              : "text-[#8C8C88]"
                          }`}
                        >
                          {state}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Checkpoint actions in Agent Tab */}
              {activeTask?.status === "awaiting_plan_approval" && (
                <div className="pt-3 border-t border-white/[0.08] space-y-2.5">
                  <div className="text-sm text-[#F6D58A] font-medium">
                    Plan requires approval before starting
                  </div>
                  <button
                    onClick={onApprovePlan}
                    className="w-full bg-[#F0A43C] hover:bg-[#F5B85D] text-[#0A0A0B] font-semibold py-2 px-3 rounded-lg text-sm sm:text-[15px] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    <span>Approve Plan</span>
                  </button>
                </div>
              )}

              {activeTask?.status === "awaiting_approval" && (
                <div className="pt-3 border-t border-white/[0.08] space-y-2.5">
                  <div className="text-sm text-[#F6D58A] font-medium">
                    {activeTask.generated_changes.length} files modified & tested
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={onRejectChanges}
                      className="flex-1 bg-[#0D0E10] hover:bg-[#181A1D] text-[#A6A6A3] hover:text-[#F2F2F0] py-2 px-3 rounded-lg text-sm font-medium border border-white/[0.08] cursor-pointer"
                    >
                      Reject
                    </button>
                    <button
                      onClick={onApproveChanges}
                      className="flex-1 bg-[#22C55E] hover:bg-[#22C55E]/90 text-[#0A0A0B] font-semibold py-2 px-3 rounded-lg text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Check className="w-4 h-4 stroke-[2.5]" />
                      <span>Accept</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Real-time Activity Timeline */}
            <div className="bg-[#111214] border border-white/[0.08] rounded-xl p-4 space-y-3 shadow-sm">
              <div className="flex items-center justify-between text-sm border-b border-white/[0.08] pb-2.5 font-medium">
                <span className="text-[#8C8C88] uppercase text-[13px] tracking-wider font-semibold">
                  Activity Timeline
                </span>
                <span className="text-[#8C8C88] text-xs sm:text-[13px]">
                  {events.length} events
                </span>
              </div>

              {events.length === 0 ? (
                <div className="text-[#8C8C88] text-sm italic py-5 text-center">
                  Waiting for task events...
                </div>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto text-sm">
                  {events.map((evt) => (
                    <div
                      key={evt.id}
                      className="border-l-2 border-white/[0.12] pl-3 py-1 space-y-1"
                    >
                      <div className="flex items-center justify-between text-xs text-[#8C8C88]">
                        <span className="uppercase text-[#F0A43C] font-semibold text-xs tracking-wide">
                          {evt.node}
                        </span>
                        <span className="font-mono text-xs text-[#8C8C88]">
                          {new Date(evt.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </span>
                      </div>
                      <div className="text-[#F2F2F0] text-sm sm:text-[15px] leading-relaxed">{evt.message}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* CHANGES TAB */}
        {activeTab === "diff" && (
          <div className="p-3.5 h-full flex flex-col">
            {activeTask && activeTask.generated_changes.length > 0 ? (
              <DiffViewer
                changes={activeTask.generated_changes}
                taskStatus={activeTask.status}
                onApprove={onApproveChanges}
                onReject={onRejectChanges}
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-[#8C8C88] text-sm leading-relaxed">
                <FileDiff className="w-10 h-10 text-[#8C8C88] mb-3" />
                <span className="font-medium text-[#F2F2F0]">No code changes generated yet.</span>
                <span className="text-[13px] text-[#8C8C88] mt-1.5 max-w-xs">
                  Changes appear here when the Coding Agent writes code.
                </span>
              </div>
            )}
          </div>
        )}

        {/* TESTS TAB */}
        {activeTab === "tests" && (
          <div className="p-3.5 h-full flex flex-col">
            {activeTask?.test_results ? (
              <TestPanel
                results={activeTask.test_results}
                isRunning={activeTask.status === "testing"}
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-[#8C8C88] text-sm leading-relaxed">
                <Terminal className="w-10 h-10 text-[#8C8C88] mb-3" />
                <span className="font-medium text-[#F2F2F0]">No test executions recorded.</span>
                <span className="text-[13px] text-[#8C8C88] mt-1.5 max-w-xs">
                  Test output streams here when the Test Agent runs pytest.
                </span>
              </div>
            )}
          </div>
        )}

        {/* FILES TAB */}
        {activeTab === "files" && (
          <div className="p-3.5 h-full flex flex-col space-y-3.5">
            <div className="text-[13px] uppercase tracking-wider text-[#8C8C88] font-semibold">
              Repository Files
            </div>
            <div className="flex-1 overflow-y-auto bg-[#0D0E10] border border-white/[0.06] rounded-xl p-2.5">
              <FileTree
                tree={fileTree}
                onSelectFile={onSelectFile}
                selectedPath={selectedFilePath}
              />
            </div>
            {selectedFilePath && (
              <div className="bg-[#0D0E10] border border-white/[0.06] rounded-xl p-3.5 max-h-56 overflow-y-auto font-mono text-xs">
                <div className="text-[#F0A43C] font-semibold pb-1.5 border-b border-white/[0.08] mb-2 flex items-center gap-2 text-[13px]">
                  <FileCode className="w-4 h-4" />
                  <span className="truncate">{selectedFilePath}</span>
                </div>
                <pre className="text-xs sm:text-[13px] text-[#F2F2F0] overflow-x-auto whitespace-pre leading-relaxed">
                  {selectedFileContent || "(Empty or binary file)"}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
    </>
  );
}
