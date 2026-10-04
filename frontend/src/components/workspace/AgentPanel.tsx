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
    <aside className="w-80 md:w-96 bg-[#0A0A0B] border-l border-white/[0.08] flex flex-col shrink-0 select-none z-20">
      {/* Top Tab Bar & Close Action */}
      <div className="h-11 border-b border-white/[0.08] px-2 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1 overflow-x-auto text-xs font-mono">
          <button
            onClick={() => onTabChange("agent")}
            className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === "agent"
                ? "bg-[#181A1D] text-[#F0A43C] font-medium border border-[#F0A43C]/30"
                : "text-[#A6A6A3] hover:text-[#F2F2F0]"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Agent</span>
          </button>

          <button
            onClick={() => onTabChange("diff")}
            className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === "diff"
                ? "bg-[#181A1D] text-[#F0A43C] font-medium border border-[#F0A43C]/30"
                : "text-[#A6A6A3] hover:text-[#F2F2F0]"
            }`}
          >
            <FileDiff className="w-3.5 h-3.5" />
            <span>Changes</span>
            {activeTask && activeTask.generated_changes.length > 0 && (
              <span className="text-[10px] text-[#F0A43C] font-bold">
                ({activeTask.generated_changes.length})
              </span>
            )}
          </button>

          <button
            onClick={() => onTabChange("tests")}
            className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === "tests"
                ? "bg-[#181A1D] text-[#F0A43C] font-medium border border-[#F0A43C]/30"
                : "text-[#A6A6A3] hover:text-[#F2F2F0]"
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Tests</span>
          </button>

          <button
            onClick={() => onTabChange("files")}
            className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === "files"
                ? "bg-[#181A1D] text-[#F0A43C] font-medium border border-[#F0A43C]/30"
                : "text-[#A6A6A3] hover:text-[#F2F2F0]"
            }`}
          >
            <FolderTree className="w-3.5 h-3.5" />
            <span>Files</span>
          </button>
        </div>

        <button
          onClick={onClose}
          className="p-1 text-[#6B6B6B] hover:text-[#F2F2F0] rounded hover:bg-[#111214] transition-colors"
          title="Close panel"
          aria-label="Close right panel"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {/* AGENT TAB */}
        {activeTab === "agent" && (
          <div className="p-4 space-y-5">
            {/* Agent State Machine Nodes */}
            <div className="bg-[#111214] border border-white/[0.08] rounded-xl p-3.5 space-y-3">
              <div className="flex items-center justify-between text-xs border-b border-white/[0.08] pb-2 font-mono">
                <span className="text-[#A6A6A3] uppercase text-[10px] tracking-wider">
                  Autonomous Pipeline
                </span>
                {activeTask && (
                  <span className="text-[#6B6B6B] text-[11px]">
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
                      className="flex items-center justify-between text-xs py-1 px-2 rounded bg-[#0D0E10] border border-white/[0.06]"
                    >
                      <span className="text-[#F2F2F0] font-mono text-[11px]">
                        {n.label}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {getNodeIcon(state)}
                        <span
                          className={`text-[10px] font-mono capitalize ${
                            state === "completed"
                              ? "text-[#22C55E]"
                              : state === "running"
                              ? "text-[#F0A43C]"
                              : state === "failed"
                              ? "text-[#EF4444]"
                              : "text-[#6B6B6B]"
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
                <div className="pt-2 border-t border-white/[0.08] space-y-2">
                  <div className="text-[11px] text-[#F6D58A] font-mono">
                    Plan requires approval before starting
                  </div>
                  <button
                    onClick={onApprovePlan}
                    className="w-full bg-[#F0A43C] hover:bg-[#F5B85D] text-[#0A0A0B] font-semibold py-1.5 px-3 rounded-lg text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Approve Plan</span>
                  </button>
                </div>
              )}

              {activeTask?.status === "awaiting_approval" && (
                <div className="pt-2 border-t border-white/[0.08] space-y-2">
                  <div className="text-[11px] text-[#F6D58A] font-mono">
                    {activeTask.generated_changes.length} files modified & tested
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={onRejectChanges}
                      className="flex-1 bg-[#0D0E10] hover:bg-[#181A1D] text-[#A6A6A3] hover:text-[#F2F2F0] py-1.5 px-2 rounded-lg text-xs font-mono border border-white/[0.08] cursor-pointer"
                    >
                      Reject
                    </button>
                    <button
                      onClick={onApproveChanges}
                      className="flex-1 bg-[#22C55E] hover:bg-[#22C55E]/90 text-[#0A0A0B] font-semibold py-1.5 px-2 rounded-lg text-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Accept</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Real-time Activity Timeline */}
            <div className="bg-[#111214] border border-white/[0.08] rounded-xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between text-xs border-b border-white/[0.08] pb-2 font-mono">
                <span className="text-[#A6A6A3] uppercase text-[10px] tracking-wider">
                  Activity Timeline
                </span>
                <span className="text-[#6B6B6B] text-[10px]">
                  {events.length} events
                </span>
              </div>

              {events.length === 0 ? (
                <div className="text-[#6B6B6B] text-[11px] font-mono italic py-4 text-center">
                  Waiting for task events...
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto font-mono text-[11px]">
                  {events.map((evt) => (
                    <div
                      key={evt.id}
                      className="border-l-2 border-white/[0.12] pl-2.5 py-0.5 space-y-0.5"
                    >
                      <div className="flex items-center justify-between text-[10px] text-[#6B6B6B]">
                        <span className="uppercase text-[#F0A43C] font-semibold">
                          {evt.node}
                        </span>
                        <span>
                          {new Date(evt.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </span>
                      </div>
                      <div className="text-[#F2F2F0] leading-snug">{evt.message}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* CHANGES TAB */}
        {activeTab === "diff" && (
          <div className="p-3 h-full flex flex-col">
            {activeTask && activeTask.generated_changes.length > 0 ? (
              <DiffViewer
                changes={activeTask.generated_changes}
                taskStatus={activeTask.status}
                onApprove={onApproveChanges}
                onReject={onRejectChanges}
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#6B6B6B] font-mono text-xs">
                <FileDiff className="w-8 h-8 text-[#6B6B6B] mb-2" />
                <span>No code changes generated yet.</span>
                <span className="text-[11px] text-[#6B6B6B] mt-1">
                  Changes appear here when the Coding Agent writes code.
                </span>
              </div>
            )}
          </div>
        )}

        {/* TESTS TAB */}
        {activeTab === "tests" && (
          <div className="p-3 h-full flex flex-col">
            {activeTask?.test_results ? (
              <TestPanel
                results={activeTask.test_results}
                isRunning={activeTask.status === "testing"}
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#6B6B6B] font-mono text-xs">
                <Terminal className="w-8 h-8 text-[#6B6B6B] mb-2" />
                <span>No test executions recorded.</span>
                <span className="text-[11px] text-[#6B6B6B] mt-1">
                  Test output streams here when the Test Agent runs pytest.
                </span>
              </div>
            )}
          </div>
        )}

        {/* FILES TAB */}
        {activeTab === "files" && (
          <div className="p-3 h-full flex flex-col space-y-3">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#6B6B6B]">
              Repository Files
            </div>
            <div className="flex-1 overflow-y-auto bg-[#0D0E10] border border-white/[0.06] rounded-xl p-2">
              <FileTree
                tree={fileTree}
                onSelectFile={onSelectFile}
                selectedPath={selectedFilePath}
              />
            </div>
            {selectedFilePath && (
              <div className="bg-[#0D0E10] border border-white/[0.06] rounded-xl p-3 max-h-48 overflow-y-auto font-mono text-xs">
                <div className="text-[#F0A43C] font-medium pb-1 border-b border-white/[0.08] mb-1.5 flex items-center gap-1.5">
                  <FileCode className="w-3.5 h-3.5" />
                  <span className="truncate">{selectedFilePath}</span>
                </div>
                <pre className="text-[11px] text-[#F2F2F0] overflow-x-auto whitespace-pre">
                  {selectedFileContent || "(Empty or binary file)"}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
