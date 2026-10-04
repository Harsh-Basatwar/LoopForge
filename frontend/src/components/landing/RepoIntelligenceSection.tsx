"use client";

import { useState, useEffect } from "react";
import { Folder, FolderOpen, FileCode2, FlaskConical, Search, FileCheck, CheckCircle2, ArrowRight } from "lucide-react";
import InteractiveCard from "./InteractiveCard";

interface FileNode {
  path: string;
  name: string;
  type: "file" | "folder" | "test";
  status: "idle" | "searching" | "read" | "target";
  depth: number;
}

const REPO_FILES: FileNode[] = [
  { path: "src", name: "src", type: "folder", status: "idle", depth: 0 },
  { path: "src/auth", name: "auth", type: "folder", status: "idle", depth: 1 },
  { path: "src/auth/service.py", name: "service.py", type: "file", status: "target", depth: 2 },
  { path: "src/auth/routes.py", name: "routes.py", type: "file", status: "read", depth: 2 },
  { path: "src/users", name: "users", type: "folder", status: "idle", depth: 1 },
  { path: "src/users/model.py", name: "model.py", type: "file", status: "read", depth: 2 },
  { path: "src/payments", name: "payments", type: "folder", status: "idle", depth: 1 },
  { path: "src/payments/service.py", name: "service.py", type: "file", status: "idle", depth: 2 },
  { path: "tests", name: "tests", type: "folder", status: "idle", depth: 0 },
  { path: "tests/test_auth.py", name: "test_auth.py", type: "test", status: "target", depth: 1 },
  { path: "tests/test_users.py", name: "test_users.py", type: "test", status: "read", depth: 1 },
];

const ANALYSIS_ACTIONS = [
  {
    step: "01",
    action: "search_repository()",
    result: "Scanned 42 project files; identified Python/FastAPI codebase",
    time: "24ms",
  },
  {
    step: "02",
    action: "read_file(\"src/auth/service.py\")",
    result: "Parsed AST; found existing User and Session dependencies",
    time: "12ms",
  },
  {
    step: "03",
    action: "inspect_dependencies()",
    result: "Detected pyjwt and passlib in pyproject.toml",
    time: "18ms",
  },
  {
    step: "04",
    action: "identify_test_files()",
    result: "Located tests/test_auth.py with 18 existing test cases",
    time: "15ms",
  },
  {
    step: "05",
    action: "construct_context()",
    result: "Assembled isolated context bundle (1,420 tokens)",
    time: "8ms",
  },
];

export default function RepoIntelligenceSection() {
  const [activeActionIndex, setActiveActionIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveActionIndex((prev) => (prev + 1) % ANALYSIS_ACTIONS.length);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="repo-intelligence" className="py-24 border-b border-white/[0.08] bg-transparent relative z-10 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <span className="text-xs font-mono uppercase tracking-wider text-[#F6D58A] font-semibold mb-2 block">
            Repository Intelligence
          </span>
          <h2 className="font-serif font-semibold text-4xl sm:text-6xl md:text-7xl text-[#F2F2F0] leading-[1.05] tracking-[-0.01em]">
            It understands the codebase before it changes it.
          </h2>
          <p className="mt-4 text-[#A6A6A3] text-base sm:text-lg leading-relaxed font-sans">
            Instead of hallucinating edits against an unknown workspace, the agent indexes the AST, reads
            dependencies, identifies test suites, and locates precise targets.
          </p>
        </div>

        {/* 2-Column Split: Animated Repository Explorer on Left, Action Log on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: Repository Tree (6 cols) */}
          <InteractiveCard
            variant="tilt"
            className="lg:col-span-6 rounded-xl border border-white/[0.08] bg-[#111214] shadow-xl overflow-hidden flex flex-col justify-between hover:border-white/[0.14]"
          >
            <div className="h-10 bg-[#0D0E10] border-b border-white/[0.08] px-4 flex items-center justify-between font-mono text-xs">
              <div className="flex items-center gap-2 text-[#F2F2F0]">
                <FolderOpen className="w-3.5 h-3.5 text-[#F6D58A]" />
                <span>ecommerce-auth-api</span>
              </div>
              <span className="text-[10px] text-[#F0A43C] font-semibold bg-[#F0A43C]/10 border border-[#F0A43C]/25 px-2 py-0.5 rounded">
                AST Index Active
              </span>
            </div>

            <div className="p-4 space-y-1 font-mono text-xs overflow-y-auto">
              {REPO_FILES.map((file) => {
                const isTarget = file.status === "target";
                const isRead = file.status === "read";

                return (
                  <div
                    key={file.path}
                    className={`flex items-center justify-between py-1 px-2 rounded transition-colors ${
                      isTarget
                        ? "bg-[#F0A43C]/15 text-[#F0A43C] border border-[#F0A43C]/30 font-medium"
                        : isRead
                        ? "text-[#F6D58A] bg-[#F6D58A]/5"
                        : "text-[#A6A6A3] hover:text-[#F2F2F0]"
                    }`}
                    style={{ paddingLeft: `${file.depth * 16 + 8}px` }}
                  >
                    <div className="flex items-center gap-2">
                      {file.type === "folder" ? (
                        <Folder className="w-3.5 h-3.5 text-[#F6D58A]" />
                      ) : file.type === "test" ? (
                        <FlaskConical className="w-3.5 h-3.5 text-[#6B6B6B]" />
                      ) : (
                        <FileCode2 className="w-3.5 h-3.5 text-[#6B6B6B]" />
                      )}
                      <span>{file.name}</span>
                    </div>

                    <div className="text-[10px] font-mono">
                      {isTarget && (
                        <span className="px-1.5 py-0.5 rounded bg-[#F0A43C]/20 text-[#F0A43C] font-semibold">
                          Target
                        </span>
                      )}
                      {isRead && (
                        <span className="text-[#F6D58A]/70">Context Read</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="h-10 bg-[#0D0E10] border-t border-white/[0.08] px-4 flex items-center justify-between text-[11px] font-mono text-[#6B6B6B]">
              <span>Indexed: 42 files (12 models, 18 tests)</span>
              <span className="text-[#22C55E]">Graph Root Verified</span>
            </div>
          </InteractiveCard>

          {/* Right Column: Simulated Action Stream (6 cols) */}
          <InteractiveCard
            variant="spotlight"
            revealDelay={120}
            className="lg:col-span-6 rounded-xl border border-white/[0.08] bg-[#111214] p-6 flex flex-col justify-between shadow-xl hover:border-white/[0.14]"
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-5 font-mono text-xs">
                <span className="text-[#6B6B6B] uppercase font-semibold">Repository Analyzer Node</span>
                <span className="text-[10px] text-[#F6D58A] bg-[#F6D58A]/10 border border-[#F6D58A]/30 px-2 py-0.5 rounded">
                  LangGraph Subgraph
                </span>
              </div>

              {/* Action Log List */}
              <div className="space-y-3 font-mono">
                {ANALYSIS_ACTIONS.map((item, idx) => {
                  const isActive = idx === activeActionIndex;
                  const isDone = idx <= activeActionIndex;

                  return (
                    <div
                      key={item.step}
                      className={`p-3 rounded-lg border transition-all ${
                        isActive
                          ? "bg-[#181A1D] border-[#F0A43C]/50 text-[#F2F2F0] shadow-sm"
                          : isDone
                          ? "bg-[#0D0E10] border-white/[0.06] text-[#A6A6A3]"
                          : "bg-[#0A0A0B]/40 border-white/[0.03] text-[#6B6B6B]"
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          {isDone ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E] shrink-0" />
                          ) : (
                            <Search className="w-3.5 h-3.5 text-[#6B6B6B] shrink-0" />
                          )}
                          <span className={`font-semibold ${isActive ? "text-[#F0A43C]" : "text-[#F2F2F0]"}`}>
                            {item.action}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#6B6B6B]">{item.time}</span>
                      </div>
                      <p className="text-[11px] text-[#A6A6A3] mt-1.5 pl-5.5 leading-relaxed">
                        {item.result}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-white/[0.08] flex items-center justify-between text-xs font-mono">
              <span className="text-[#A6A6A3]">Output Contract:</span>
              <span className="text-[#F6D58A] font-semibold">AgentState.relevant_files</span>
            </div>
          </InteractiveCard>
        </div>
      </div>
    </section>
  );
}
