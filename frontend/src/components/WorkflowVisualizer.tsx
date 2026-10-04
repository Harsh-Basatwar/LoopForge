"use client";

import { useState } from "react";
import { Check, Loader2, AlertTriangle, RotateCw, Sparkles, Database, Code2, FlaskConical, Wrench } from "lucide-react";
import { Task } from "@/types";

interface Props {
  task?: Task | null;
  activeNode?: string;
  onSelectNode?: (nodeName: string) => void;
}

export default function WorkflowVisualizer({ task, activeNode, onSelectNode }: Props) {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const currentStatus = task?.status || "planning";

  const nodes = [
    {
      id: "planner",
      label: "Planner",
      desc: "Creates multi-step implementation plan",
      icon: Sparkles,
      color: "#F6D58A",
      status:
        currentStatus === "planning"
          ? "running"
          : task?.plan && task.plan.length > 0
          ? "completed"
          : "pending",
    },
    {
      id: "analyzer",
      label: "Analyzer",
      desc: "Scans repo files & test commands",
      icon: Database,
      color: "#F6D58A",
      status:
        currentStatus === "analyzing"
          ? "running"
          : ["coding", "testing", "debugging", "awaiting_approval", "completed"].includes(currentStatus)
          ? "completed"
          : "pending",
    },
    {
      id: "coder",
      label: "Coding Agent",
      desc: "Applies targeted code modifications",
      icon: Code2,
      color: "#F0A43C",
      status:
        currentStatus === "coding"
          ? "running"
          : ["testing", "debugging", "awaiting_approval", "completed"].includes(currentStatus)
          ? "completed"
          : "pending",
    },
    {
      id: "tester",
      label: "Test Agent",
      desc: "Executes test suite in sandbox",
      icon: FlaskConical,
      color: "#F2F2F0",
      status:
        currentStatus === "testing"
          ? "running"
          : task?.test_results
          ? task.test_results.status === "passed"
            ? "completed"
            : "failed"
          : "pending",
    },
    {
      id: "reflector",
      label: "Reflection",
      desc: "Diagnoses failures & computes fix",
      icon: Wrench,
      color: "#F6D58A",
      status:
        currentStatus === "debugging"
          ? "running"
          : task?.errors && task.errors.length > 0
          ? "completed"
          : "pending",
    },
  ];

  const handleNodeClick = (nodeId: string) => {
    setSelectedNode(nodeId === selectedNode ? null : nodeId);
    if (onSelectNode) onSelectNode(nodeId);
  };

  return (
    <div className="bg-[#111214] border border-white/[0.08] rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-[#F2F2F0]">LangGraph Agent Workflow</h3>
          <p className="text-xs text-[#A6A6A3]">Autonomous generate-test-reflect execution loop</p>
        </div>
        {task && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#0A0A0B] border border-[#F0A43C]/30 text-[#F0A43C]">
              Iteration {task.iteration}/{task.max_iterations}
            </span>
          </div>
        )}
      </div>

      {/* Nodes visual sequence */}
      <div className="flex flex-col gap-2.5">
        {nodes.map((n) => {
          const Icon = n.icon;
          const isSelected = selectedNode === n.id;
          const isCurrentActive = activeNode === n.id || n.status === "running";

          return (
            <div key={n.id} className="relative">
              <button
                type="button"
                onClick={() => handleNodeClick(n.id)}
                className={`w-full flex items-center justify-between p-3 rounded-lg border text-left transition-all cursor-pointer ${
                  isCurrentActive
                    ? "bg-[#F0A43C]/10 border-[#F0A43C]/50 shadow-xs animate-node-active"
                    : isSelected
                    ? "bg-[#181A1D] border-white/[0.14]"
                    : "bg-[#0D0E10] border-white/[0.06] hover:bg-[#181A1D]/50 hover:border-white/[0.12]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      n.status === "completed"
                        ? "bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30"
                        : n.status === "running"
                        ? "bg-[#F0A43C]/20 text-[#F0A43C] border border-[#F0A43C]/40"
                        : n.status === "failed"
                        ? "bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30"
                        : "bg-[#0A0A0B] text-[#6B6B6B] border border-white/[0.08]"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[#F2F2F0]">{n.label}</span>
                      {n.id === "reflector" && (
                        <span className="text-[10px] font-mono text-[#F6D58A] flex items-center gap-0.5">
                          <RotateCw className="w-2.5 h-2.5" /> loop
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#A6A6A3] leading-tight">{n.desc}</p>
                  </div>
                </div>

                {/* Status indicator */}
                <div>
                  {n.status === "completed" && (
                    <span className="w-5 h-5 rounded-full bg-[#22C55E]/15 text-[#22C55E] flex items-center justify-center">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                  {n.status === "running" && (
                    <span className="w-5 h-5 rounded-full bg-[#F0A43C]/20 text-[#F0A43C] flex items-center justify-center animate-spin">
                      <Loader2 className="w-3 h-3" />
                    </span>
                  )}
                  {n.status === "failed" && (
                    <span className="w-5 h-5 rounded-full bg-[#EF4444]/20 text-[#EF4444] flex items-center justify-center">
                      <AlertTriangle className="w-3 h-3" />
                    </span>
                  )}
                  {n.status === "pending" && (
                    <span className="w-3 h-3 rounded-full border border-white/[0.12] bg-[#0A0A0B] block" />
                  )}
                </div>
              </button>

              {/* Node detail drawer when clicked */}
              {isSelected && (
                <div className="mt-1.5 p-3 rounded-lg bg-[#0D0E10] border border-white/[0.08] text-xs font-mono text-[#F2F2F0]/90">
                  <div className="flex items-center justify-between text-[11px] text-[#A6A6A3] border-b border-white/[0.08] pb-1.5 mb-2">
                    <span>Node ID: {n.id}</span>
                    <span className="uppercase text-[10px] text-[#F0A43C]">{n.status}</span>
                  </div>
                  {n.id === "planner" && task?.plan && (
                    <div>
                      <p className="text-[#A6A6A3] mb-1">Generated Plan Steps:</p>
                      <ul className="list-disc pl-4 space-y-1 text-[#F2F2F0]">
                        {task.plan.map((step, sIdx) => (
                          <li key={sIdx}>{step}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {n.id === "coder" && task?.generated_changes && (
                    <div>
                      <p className="text-[#A6A6A3] mb-1">Files Changed:</p>
                      {task.generated_changes.map((c, cIdx) => (
                        <div key={cIdx} className="text-[#F0A43C]">
                          {c.change_type.toUpperCase()}: {c.path}
                        </div>
                      ))}
                    </div>
                  )}
                  {n.id === "tester" && task?.test_results && (
                    <div>
                      <p className="text-[#A6A6A3] mb-1">Test Outcome:</p>
                      <div className="text-[#F2F2F0]">
                        Passed: {task.test_results.passed} / Failed: {task.test_results.failed} (
                        {task.test_results.duration_ms}ms)
                      </div>
                    </div>
                  )}
                  {n.id === "reflector" && task?.errors && (
                    <div>
                      <p className="text-[#A6A6A3] mb-1">Diagnoses recorded: {task.errors.length}</p>
                      <div className="text-[#F6D58A] text-[11px]">
                        {task.errors[task.errors.length - 1] || "No failure recorded"}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
