"use client";

import React, { useRef, useEffect } from "react";
import { Task, AgentEvent, FileChange } from "@/types";
import {
  CheckCircle2,
  AlertCircle,
  Cpu,
  FileCode,
  Terminal,
  ArrowRight,
  Check,
  FileDiff,
} from "lucide-react";

interface ChatAreaProps {
  activeTask: Task | null;
  events: AgentEvent[];
  onApprovePlan: () => void;
  onApproveChanges: () => void;
  onRejectChanges: () => void;
  onCancelTask: () => void;
  onOpenArtifactTab: (tab: "agent" | "diff" | "tests" | "files") => void;
  onSelectPreset: (prompt: string) => void;
}

export default function ChatArea({
  activeTask,
  events,
  onApprovePlan,
  onApproveChanges,
  onRejectChanges,
  onCancelTask,
  onOpenArtifactTab,
  onSelectPreset,
}: ChatAreaProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom as new events arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events, activeTask]);

  const presets = [
    {
      label: "Fix failing test",
      desc: "Diagnose and fix broken assertions in the test suite",
      prompt: "Inspect the failing tests in this repository, diagnose the assertion error, and apply a correction so all tests pass.",
    },
    {
      label: "Add JWT authentication",
      desc: "Implement token creation and protected routes",
      prompt: "Add JWT authentication to the existing FastAPI application. Keep current database models intact and add unit tests.",
    },
    {
      label: "Refactor service layer",
      desc: "Extract business logic into clean modular services",
      prompt: "Refactor the core calculation logic into a dedicated service layer with clear type annotations and docstrings.",
    },
    {
      label: "Write comprehensive unit tests",
      desc: "Increase test coverage for edge cases",
      prompt: "Write comprehensive pytest unit tests covering edge cases, invalid inputs, and boundary conditions.",
    },
    {
      label: "Debug performance bottleneck",
      desc: "Optimize memory or execution latency",
      prompt: "Profile the algorithm implementation and optimize time complexity from O(2^n) to O(n) using dynamic programming.",
    },
  ];

  if (!activeTask) {
    return (
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-12 flex flex-col justify-center items-center text-center">
        <div className="max-w-xl w-full">
          <div className="w-10 h-10 rounded-xl bg-[#111214] border border-white/[0.08] flex items-center justify-center mx-auto mb-5 text-[#F0A43C] shadow-sm">
            <Cpu className="w-5 h-5 stroke-[2]" />
          </div>

          <h2 className="text-2xl font-medium tracking-tight text-[#F2F2F0] mb-2.5">
            What should we build?
          </h2>
          <p className="text-sm text-[#A6A6A3] leading-relaxed mb-8">
            Give the agent a software task. It will inspect the project, create a plan,
            implement the changes, and verify the result through an autonomous LangGraph loop.
          </p>

          <div className="text-left mb-3">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#6B6B6B]">
              Suggested tasks
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
            {presets.map((p, idx) => (
              <button
                key={idx}
                onClick={() => onSelectPreset(p.prompt)}
                className="p-3 rounded-lg bg-[#111214] hover:bg-[#181A1D] border border-white/[0.08] hover:border-[#F0A43C]/40 text-left transition-all group"
              >
                <div className="text-xs font-medium text-[#F2F2F0] group-hover:text-[#F0A43C] flex items-center justify-between">
                  <span>{p.label}</span>
                  <ArrowRight className="w-3 h-3 text-[#6B6B6B] group-hover:text-[#F0A43C] group-hover:translate-x-0.5 transition-all" />
                </div>
                <div className="text-[11px] text-[#A6A6A3] mt-1 line-clamp-1">
                  {p.desc}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const isAwaitingPlan = activeTask.status === "awaiting_plan_approval";
  const isAwaitingChanges = activeTask.status === "awaiting_approval";
  const isCompleted = activeTask.status === "completed";

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-8 max-w-4xl w-full mx-auto"
    >
      {/* User Message (Authored Content Style) */}
      <div className="space-y-1.5 pt-2">
        <div className="flex items-center gap-2 text-[11px] font-mono text-[#6B6B6B]">
          <span className="font-semibold text-[#F2F2F0] uppercase tracking-wider">
            You
          </span>
          <span>&middot;</span>
          <span>{new Date(activeTask.created_at).toLocaleTimeString()}</span>
        </div>
        <div className="text-[#F2F2F0] text-[15px] leading-relaxed font-normal whitespace-pre-wrap pl-0.5">
          {activeTask.description || activeTask.title}
        </div>
      </div>

      {/* Assistant Response (Technical, Structured, Content-First) */}
      <div className="space-y-5 pt-3 border-t border-white/[0.08]">
        <div className="flex items-center gap-2 text-[11px] font-mono text-[#6B6B6B]">
          <div className="w-4 h-4 rounded bg-[#F0A43C]/15 border border-[#F0A43C]/30 flex items-center justify-center">
            <Cpu className="w-2.5 h-2.5 text-[#F0A43C]" />
          </div>
          <span className="font-semibold text-[#F2F2F0] tracking-wider">
            AI Engineering Assistant
          </span>
          <span>&middot;</span>
          <span className="capitalize text-[#A6A6A3] font-mono">
            {activeTask.status.replace(/_/g, " ")}
          </span>
        </div>

        {/* Narrative Statement */}
        <p className="text-sm text-[#F2F2F0]/90 leading-relaxed">
          I&apos;ve inspected the repository and current architecture. Here is the
          autonomous execution plan to satisfy your requirements.
        </p>

        {/* Structured Plan Card */}
        {activeTask.plan && activeTask.plan.length > 0 && (
          <div className="bg-[#111214] border border-white/[0.08] rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-medium text-[#F2F2F0] border-b border-white/[0.08] pb-2.5">
              <span className="font-mono text-xs uppercase tracking-wider text-[#A6A6A3]">
                Implementation Plan
              </span>
              <span className="text-[11px] font-mono text-[#6B6B6B]">
                {activeTask.plan.length} steps defined
              </span>
            </div>

            <ol className="space-y-2 text-xs text-[#F2F2F0]/90">
              {activeTask.plan.map((step, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="font-mono text-[11px] text-[#F6D58A] bg-[#F6D58A]/10 border border-[#F6D58A]/25 w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5">
                    0{idx + 1}
                  </span>
                  <span className="leading-snug pt-0.5">{step}</span>
                </li>
              ))}
            </ol>

            {/* Plan Approval Action Checkpoint */}
            {isAwaitingPlan && (
              <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between">
                <span className="text-xs text-[#F6D58A] font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#F6D58A] animate-pulse" />
                  Awaiting your approval to proceed
                </span>
                <button
                  onClick={onApprovePlan}
                  className="bg-[#F0A43C] hover:bg-[#F5B85D] text-[#0A0A0B] px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 shadow-sm font-semibold cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Approve Plan & Run</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Live Execution Events Stream (Subtle meaningful states, no fake CoT) */}
        {events.length > 0 && (
          <div className="space-y-2">
            <div className="text-[11px] font-mono uppercase tracking-wider text-[#6B6B6B]">
              Execution Progression
            </div>
            <div className="bg-[#0D0E10] border border-white/[0.06] rounded-lg p-3 space-y-2 max-h-56 overflow-y-auto font-mono text-xs">
              {events.map((evt) => {
                const isFail = evt.status === "failed";
                const isRunningState = evt.status === "running";
                const isSuccess = evt.status === "completed";

                return (
                  <div
                    key={evt.id}
                    className="flex items-start gap-2.5 text-[#F2F2F0]"
                  >
                    <span className="text-[10px] text-[#6B6B6B] shrink-0 mt-0.5">
                      {new Date(evt.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </span>

                    <span
                      className={`text-[10px] uppercase px-1.5 py-0.2 rounded border shrink-0 ${
                        evt.node === "planner"
                          ? "bg-[#F6D58A]/15 text-[#F6D58A] border-[#F6D58A]/30"
                          : evt.node === "analyzer"
                          ? "bg-[#F6D58A]/15 text-[#F6D58A] border-[#F6D58A]/30"
                          : evt.node === "coder"
                          ? "bg-[#F0A43C]/15 text-[#F0A43C] border-[#F0A43C]/30"
                          : evt.node === "tester"
                          ? "bg-white/10 text-[#F2F2F0] border-white/20"
                          : "bg-[#F6D58A]/15 text-[#F6D58A] border-[#F6D58A]/30"
                      }`}
                    >
                      {evt.node}
                    </span>

                    <span
                      className={`flex-1 text-[11px] leading-relaxed ${
                        isFail
                          ? "text-[#EF4444]"
                          : isSuccess
                          ? "text-[#F2F2F0]"
                          : "text-[#A6A6A3]"
                      }`}
                    >
                      {evt.message}
                    </span>

                    {isRunningState && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#F0A43C] animate-ping shrink-0 mt-1.5" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Test Results Summary Card */}
        {activeTask.test_results && (
          <div className="bg-[#111214] border border-white/[0.08] rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="font-mono text-xs uppercase tracking-wider text-[#A6A6A3] flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-[#22C55E]" />
                <span>Test Suite Verification</span>
              </span>
              <span
                className={`font-mono text-[11px] px-2 py-0.5 rounded border ${
                  activeTask.test_results.status === "passed"
                    ? "bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/30"
                    : "bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30"
                }`}
              >
                {activeTask.test_results.passed} passed &middot;{" "}
                {activeTask.test_results.failed} failed
              </span>
            </div>

            <p className="text-xs text-[#A6A6A3] font-mono">
              Command: <code className="text-[#F2F2F0]">{activeTask.test_results.command}</code>{" "}
              ({activeTask.test_results.duration_ms}ms)
            </p>

            {activeTask.test_results.failed > 0 && (
              <div className="bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-lg p-2.5 text-xs text-[#EF4444] space-y-1 font-mono">
                <div className="flex items-center gap-1.5 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 text-[#EF4444]" />
                  <span>Failures detected — Reflector agent engaged for self-correction:</span>
                </div>
                <pre className="text-[11px] text-[#F2F2F0]/80 overflow-x-auto p-1 max-h-24">
                  {activeTask.test_results.output}
                </pre>
              </div>
            )}

            <button
              onClick={() => onOpenArtifactTab("tests")}
              className="text-xs text-[#F0A43C] hover:text-[#F5B85D] flex items-center gap-1 font-mono transition-colors cursor-pointer"
            >
              <span>View full pytest execution logs in right panel</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Code Changes & Diff Preview Card */}
        {activeTask.generated_changes && activeTask.generated_changes.length > 0 && (
          <div className="bg-[#111214] border border-white/[0.08] rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="font-mono text-xs uppercase tracking-wider text-[#A6A6A3] flex items-center gap-1.5">
                <FileDiff className="w-3.5 h-3.5 text-[#F0A43C]" />
                <span>Generated Changes ({activeTask.generated_changes.length} files)</span>
              </span>
              <button
                onClick={() => onOpenArtifactTab("diff")}
                className="text-xs text-[#F0A43C] hover:text-[#F5B85D] flex items-center gap-1 font-mono transition-colors cursor-pointer"
              >
                <span>Inspect in Artifact panel</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-1.5">
              {activeTask.generated_changes.map((change, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs bg-[#181A1D] border border-white/[0.06] px-3 py-1.5 rounded-lg font-mono text-[#F2F2F0]"
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileCode className="w-3.5 h-3.5 text-[#6B6B6B] shrink-0" />
                    <span className="truncate">{change.path}</span>
                  </div>
                  <span
                    className={`text-[10px] uppercase px-1.5 py-0.2 rounded border ${
                      change.change_type === "create"
                        ? "bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/30"
                        : "bg-[#F0A43C]/15 text-[#F0A43C] border-[#F0A43C]/30"
                    }`}
                  >
                    {change.change_type}
                  </span>
                </div>
              ))}
            </div>

            {/* Approval Controls */}
            {isAwaitingChanges && (
              <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between">
                <span className="text-xs text-[#F6D58A] font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#F6D58A] animate-pulse" />
                  Review proposed diffs before applying to disk
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={onRejectChanges}
                    className="bg-[#111214] hover:bg-[#181A1D] text-[#A6A6A3] hover:text-[#F2F2F0] border border-white/[0.08] px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                  >
                    Reject
                  </button>
                  <button
                    onClick={onApproveChanges}
                    className="bg-[#22C55E] hover:bg-[#22C55E]/90 text-[#0A0A0B] px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Accept Changes</span>
                  </button>
                </div>
              </div>
            )}

            {isCompleted && (
              <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between text-xs text-[#22C55E] font-mono">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
                  <span>Changes verified & merged cleanly.</span>
                </span>
                <span className="text-[#6B6B6B] text-[11px]">
                  Completed in {activeTask.iteration} iterations
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
