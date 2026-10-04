"use client";

import { useState, useEffect } from "react";
import { Sparkles, Database, Code2, FlaskConical, Wrench, CheckCircle2, RotateCw } from "lucide-react";
import InteractiveCard from "./InteractiveCard";

export default function ArchitectureVisual() {
  const [selectedNode, setSelectedNode] = useState<string>("coder");
  const [isAutoCycle, setIsAutoCycle] = useState(true);

  const nodeDetails: Record<
    string,
    { title: string; type: string; inputs: string; outputs: string; description: string }
  > = {
    planner: {
      title: "Planner Node",
      type: "Sequential Graph Node",
      inputs: "task: str, repo_metadata: dict",
      outputs: "plan: list[str], status: 'analyzing'",
      description: "Decomposes the high-level task into concrete implementation steps with clear ordering.",
    },
    analyzer: {
      title: "Repository Analyzer",
      type: "Filesystem & AST Node",
      inputs: "project_path: str, plan: list[str]",
      outputs: "repository_context: dict (files, dependencies, tests)",
      description: "Discovers existing source modules, package managers, test configurations, and function signatures.",
    },
    coder: {
      title: "Coding Agent",
      type: "Targeted Diff Generator",
      inputs: "plan, repo_context, errors: list[str]",
      outputs: "generated_changes: list[FileChange], unified_diff",
      description: "Applies targeted file edits, computes unified diffs, and prepares changes for test validation.",
    },
    tester: {
      title: "Test Agent",
      type: "Isolated Subprocess Sandbox",
      inputs: "workspace_path, generated_changes",
      outputs: "test_results: TestResult (exit_code, passed, failed, duration_ms)",
      description: "Executes the test suite (pytest/unittest) in an isolated process with strict timeouts and error parsing.",
    },
    reflector: {
      title: "Reflection / Debug Node",
      type: "Iterative Repair Loop",
      inputs: "errors, test_results.output, iteration: int",
      outputs: "errors: list (diagnoses and repair instructions)",
      description: "When tests fail, analyzes failure logs and generates explicit corrective instructions for the Coder.",
    },
  };

  const nodeKeys = ["planner", "analyzer", "coder", "tester", "reflector"];

  useEffect(() => {
    if (!isAutoCycle) return;
    const timer = setInterval(() => {
      setSelectedNode((prev) => {
        const nextIdx = (nodeKeys.indexOf(prev) + 1) % nodeKeys.length;
        return nodeKeys[nextIdx];
      });
    }, 3800);
    return () => clearInterval(timer);
  }, [isAutoCycle, nodeKeys]);

  const current = nodeDetails[selectedNode] || nodeDetails.tester;

  return (
    <section id="architecture" className="py-24 border-b border-white/[0.08] bg-transparent relative z-10 scroll-mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12">
          <span className="text-xs font-mono uppercase tracking-wider text-[#F6D58A] font-semibold mb-2 block">
            State Machine Architecture
          </span>
          <h2 className="font-serif font-semibold text-4xl sm:text-6xl md:text-7xl text-[#F2F2F0] leading-[1.05] tracking-[-0.01em]">
            A deterministic system diagram.
          </h2>
          <p className="mt-4 text-[#A6A6A3] text-base sm:text-lg leading-relaxed font-sans">
            Under the conversation is an explicit LangGraph state machine. Click any node in the graph below to inspect its schema contract, input parameters, and state transitions.
          </p>
        </div>

        {/* Technical Diagram Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Interactive Graph Canvas (7 cols) */}
          <InteractiveCard variant="spotlight" className="lg:col-span-7 p-6 rounded-xl border border-white/[0.08] bg-[#111214] font-mono text-xs flex flex-col items-center relative overflow-hidden shadow-2xl hover:border-white/[0.14]">
            {/* Auto Cycle Indicator */}
            <div className="w-full flex items-center justify-between pb-3 mb-4 border-b border-white/[0.06] text-[10px] text-[#6B6B6B]">
              <span className="uppercase font-semibold">Compiled LangGraph Topology</span>
              <button
                type="button"
                onClick={() => setIsAutoCycle(!isAutoCycle)}
                className="flex items-center gap-1.5 text-[#F0A43C] hover:text-[#F5B85D] transition-colors cursor-pointer"
              >
                <RotateCw className={`w-3 h-3 ${isAutoCycle ? "animate-spin" : ""}`} />
                <span>{isAutoCycle ? "Auto-Walking Graph" : "Manual Mode"}</span>
              </button>
            </div>

            {/* Planner */}
            <button
              type="button"
              onClick={() => {
                setIsAutoCycle(false);
                setSelectedNode("planner");
              }}
              className={`w-56 p-3 rounded-lg border text-center transition-all cursor-pointer ${
                selectedNode === "planner"
                  ? "bg-[#F6D58A]/15 border-[#F6D58A] text-[#F6D58A] shadow-md shadow-black/40 scale-105"
                  : "bg-[#0D0E10] border-white/[0.08] text-[#A6A6A3] hover:border-white/[0.16]"
              }`}
            >
              <div className="flex items-center justify-center gap-1.5 font-bold">
                <Sparkles className="w-3.5 h-3.5 text-[#F6D58A]" />
                <span>PLANNER</span>
              </div>
              <span className="text-[10px] text-[#6B6B6B] block mt-0.5">plan_task()</span>
            </button>

            {/* Connector 1 */}
            <div className="h-6 w-0.5 bg-white/[0.12] relative overflow-hidden">
              {selectedNode === "planner" && <div className="absolute inset-0 bg-[#F0A43C] animate-pulse" />}
            </div>

            {/* Analyzer */}
            <button
              type="button"
              onClick={() => {
                setIsAutoCycle(false);
                setSelectedNode("analyzer");
              }}
              className={`w-56 p-3 rounded-lg border text-center transition-all cursor-pointer ${
                selectedNode === "analyzer"
                  ? "bg-[#3B82F6]/15 border-[#3B82F6] text-[#3B82F6] shadow-md shadow-black/40 scale-105"
                  : "bg-[#0D0E10] border-white/[0.08] text-[#A6A6A3] hover:border-white/[0.16]"
              }`}
            >
              <div className="flex items-center justify-center gap-1.5 font-bold">
                <Database className="w-3.5 h-3.5 text-[#3B82F6]" />
                <span>REPO ANALYZER</span>
              </div>
              <span className="text-[10px] text-[#6B6B6B] block mt-0.5">analyze_repository()</span>
            </button>

            {/* Connector 2 */}
            <div className="h-6 w-0.5 bg-white/[0.12] relative overflow-hidden">
              {selectedNode === "analyzer" && <div className="absolute inset-0 bg-[#F0A43C] animate-pulse" />}
            </div>

            {/* Coding Agent */}
            <button
              type="button"
              onClick={() => {
                setIsAutoCycle(false);
                setSelectedNode("coder");
              }}
              className={`w-56 p-3 rounded-lg border text-center transition-all cursor-pointer ${
                selectedNode === "coder"
                  ? "bg-[#F0A43C]/15 border-[#F0A43C] text-[#F0A43C] shadow-md shadow-black/40 scale-105"
                  : "bg-[#0D0E10] border-white/[0.08] text-[#A6A6A3] hover:border-white/[0.16]"
              }`}
            >
              <div className="flex items-center justify-center gap-1.5 font-bold">
                <Code2 className="w-3.5 h-3.5 text-[#F0A43C]" />
                <span>CODING AGENT</span>
              </div>
              <span className="text-[10px] text-[#6B6B6B] block mt-0.5">generate_code_solution()</span>
            </button>

            {/* Connector 3 */}
            <div className="h-6 w-0.5 bg-white/[0.12] relative overflow-hidden">
              {selectedNode === "coder" && <div className="absolute inset-0 bg-[#F0A43C] animate-pulse" />}
            </div>

            {/* Test Agent */}
            <button
              type="button"
              onClick={() => {
                setIsAutoCycle(false);
                setSelectedNode("tester");
              }}
              className={`w-56 p-3 rounded-lg border text-center transition-all cursor-pointer ${
                selectedNode === "tester"
                  ? "bg-white/15 border-white text-[#F2F2F0] shadow-md shadow-black/40 scale-105"
                  : "bg-[#0D0E10] border-white/[0.08] text-[#A6A6A3] hover:border-white/[0.16]"
              }`}
            >
              <div className="flex items-center justify-center gap-1.5 font-bold">
                <FlaskConical className="w-3.5 h-3.5 text-[#F2F2F0]" />
                <span>TEST AGENT</span>
              </div>
              <span className="text-[10px] text-[#6B6B6B] block mt-0.5">run_tests() [pytest]</span>
            </button>

            {/* Split Conditional Fork */}
            <div className="w-64 flex flex-col items-center mt-2">
              <div className="w-full flex justify-between px-10 text-[10px] text-[#6B6B6B] font-mono">
                <span>[if test fails]</span>
                <span>[if tests pass]</span>
              </div>
              <div className="w-48 h-4 border-t-2 border-x-2 border-white/[0.08] mt-1" />
            </div>

            {/* Branch Row: Reflector on Left vs Done on Right */}
            <div className="w-72 flex items-start justify-between">
              {/* Reflector */}
              <button
                type="button"
                onClick={() => {
                  setIsAutoCycle(false);
                  setSelectedNode("reflector");
                }}
                className={`w-32 p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                  selectedNode === "reflector"
                    ? "bg-[#EF4444]/15 border-[#EF4444] text-[#EF4444] shadow-md shadow-black/40 scale-105"
                    : "bg-[#0D0E10] border-white/[0.08] text-[#A6A6A3] hover:border-white/[0.16]"
                }`}
              >
                <div className="flex items-center justify-center gap-1 font-bold text-[11px]">
                  <Wrench className="w-3 h-3 text-[#EF4444]" />
                  <span>REFLECT</span>
                </div>
                <span className="text-[9px] text-[#EF4444]/80 block mt-0.5">↺ Loop to Coder</span>
              </button>

              {/* Pass / Done */}
              <div className="w-32 p-2.5 rounded-lg border border-[#22C55E]/30 bg-[#22C55E]/15 text-[#22C55E] text-center">
                <div className="flex items-center justify-center gap-1 font-bold text-[11px]">
                  <CheckCircle2 className="w-3 h-3 text-[#22C55E]" />
                  <span>VERIFIED</span>
                </div>
                <span className="text-[9px] text-[#22C55E]/80 block mt-0.5">Diff Review</span>
              </div>
            </div>
          </InteractiveCard>

          {/* Node Contract Inspector (5 cols) */}
          <InteractiveCard variant="spotlight" revealDelay={120} className="lg:col-span-5 p-6 rounded-xl border border-white/[0.08] bg-[#111214] font-mono text-xs shadow-2xl hover:border-white/[0.14]">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-4">
              <div>
                <span className="text-[10px] uppercase text-[#F0A43C] font-semibold block">
                  Node Inspector
                </span>
                <h3 className="text-sm font-bold text-[#F2F2F0]">{current.title}</h3>
              </div>
              <span className="text-[10px] text-[#6B6B6B] bg-[#0D0E10] px-2 py-0.5 rounded border border-white/[0.06]">
                {current.type}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-[10px] text-[#6B6B6B] uppercase block mb-1">State Input Contract</span>
                <pre className="p-2.5 rounded bg-[#0D0E10] border border-white/[0.06] text-[#F0A43C] text-[11px] overflow-x-auto whitespace-pre">
                  {current.inputs}
                </pre>
              </div>

              <div>
                <span className="text-[10px] text-[#6B6B6B] uppercase block mb-1">State Output Contract</span>
                <pre className="p-2.5 rounded bg-[#0D0E10] border border-white/[0.06] text-[#22C55E] text-[11px] overflow-x-auto whitespace-pre">
                  {current.outputs}
                </pre>
              </div>

              <div>
                <span className="text-[10px] text-[#6B6B6B] uppercase block mb-1">Role & Responsibility</span>
                <p className="text-[#A6A6A3] font-sans text-xs leading-relaxed">
                  {current.description}
                </p>
              </div>
            </div>
          </InteractiveCard>
        </div>
      </div>
    </section>
  );
}
