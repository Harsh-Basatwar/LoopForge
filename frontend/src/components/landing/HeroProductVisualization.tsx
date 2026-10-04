"use client";

import { useState, useEffect, useRef } from "react";
import {
  Check,
  Loader2,
  Play,
  Pause,
  FileCode2,
  FolderOpen,
  FlaskConical,
} from "lucide-react";

interface StepState {
  stage: string;
  activeNode: "planner" | "analyzer" | "coder" | "tester" | "reflector" | "completed";
  iteration: number;
  activityMsg: string;
  codeSnippet: string;
  testOutcome: { passed: number; failed: number; status: "idle" | "running" | "failed" | "passed" };
  reflectionNote?: string;
}

const SIMULATED_STAGES: StepState[] = [
  {
    stage: "01. Plan",
    activeNode: "planner",
    iteration: 1,
    activityMsg: "Planner generated 4-step implementation plan for JWT auth",
    codeSnippet: "# Inspecting authentication entrypoint\nfrom fastapi import FastAPI, Depends, HTTPException",
    testOutcome: { passed: 0, failed: 0, status: "idle" },
  },
  {
    stage: "02. Analyze",
    activeNode: "analyzer",
    iteration: 1,
    activityMsg: "Repository Analyzer indexed 24 files; identified src/auth/service.py",
    codeSnippet: "# Target file: src/auth/service.py\n# Dependencies: pyjwt, passlib[bcrypt]",
    testOutcome: { passed: 0, failed: 0, status: "idle" },
  },
  {
    stage: "03. Code (Initial)",
    activeNode: "coder",
    iteration: 1,
    activityMsg: "Coding Agent generated initial token creation logic",
    codeSnippet: "def create_access_token(user_id):\n    # Initial implementation\n    return jwt.encode({'sub': user_id}, SECRET_KEY)",
    testOutcome: { passed: 0, failed: 0, status: "idle" },
  },
  {
    stage: "04. Test (Failed)",
    activeNode: "tester",
    iteration: 1,
    activityMsg: "Test Agent ran pytest; 2 assertion failures detected in test_auth.py",
    codeSnippet: "FAILED test_auth.py::test_token_expiry - TypeError: user_id must be str\nFAILED test_auth.py::test_missing_claim - KeyError: 'exp'",
    testOutcome: { passed: 47, failed: 2, status: "failed" },
  },
  {
    stage: "05. Reflect",
    activeNode: "reflector",
    iteration: 1,
    activityMsg: "Reflection Agent diagnosed missing 'exp' claim and integer user_id casting",
    codeSnippet: "// Diagnosis: Token payload requires explicit string casting str(user_id)\n// and standard exp timestamp delta.",
    testOutcome: { passed: 47, failed: 2, status: "failed" },
    reflectionNote: "Diagnosed: Cast user_id to str and add timedelta exp expiration.",
  },
  {
    stage: "06. Code (Correction)",
    activeNode: "coder",
    iteration: 2,
    activityMsg: "Coding Agent applied self-correction patch to src/auth/service.py",
    codeSnippet: "def create_access_token(user_id, expires_delta=None):\n+   payload = {'sub': str(user_id), 'exp': datetime.utcnow() + delta}\n+   return jwt.encode(payload, SECRET_KEY, algorithm='HS256')",
    testOutcome: { passed: 47, failed: 0, status: "running" },
  },
  {
    stage: "07. Verified",
    activeNode: "completed",
    iteration: 2,
    activityMsg: "Test Agent confirmed all 49/49 tests passing. Task complete.",
    codeSnippet: "==================== 49 passed in 0.18s ====================\n✓ Token encoding\n✓ Expiry validation\n✓ Protected endpoint",
    testOutcome: { passed: 49, failed: 0, status: "passed" },
  },
];

export default function HeroProductVisualization() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [animatedPassed, setAnimatedPassed] = useState(0);
  const [animatedFailed, setAnimatedFailed] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });

  // Autonomous loop with tuned pacing
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % SIMULATED_STAGES.length);
    }, 3200);
    return () => clearInterval(timer);
  }, [isPaused]);

  // Smooth test counter animation per stage
  useEffect(() => {
    const target = SIMULATED_STAGES[currentIdx].testOutcome;
    if (target.status === "idle") {
      setAnimatedPassed(0);
      setAnimatedFailed(0);
      return;
    }

    setAnimatedPassed(0);
    setAnimatedFailed(0);
    let p = 0;
    const stepInterval = setInterval(() => {
      p += 5;
      if (p >= target.passed) {
        setAnimatedPassed(target.passed);
        setAnimatedFailed(target.failed);
        clearInterval(stepInterval);
      } else {
        setAnimatedPassed(p);
      }
    }, 45);

    return () => clearInterval(stepInterval);
  }, [currentIdx]);

  // Subtle mouse perspective depth on desktop
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({
      rotateX: -y * 5, // max 2.5deg
      rotateY: x * 6,  // max 3deg
    });
  };

  const handleMouseLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0 });
  };

  const current = SIMULATED_STAGES[currentIdx];

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="w-full max-w-5xl mx-auto rounded-xl border border-white/[0.08] bg-[#111214] shadow-2xl overflow-hidden text-left font-sans select-none transition-transform duration-300 ease-out"
      style={{
        transform: `perspective(1200px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
      }}
    >
      {/* Top Application Bar */}
      <div className="h-10 bg-[#0D0E10] border-b border-white/[0.08] px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 mr-2">
            <span className="w-2.5 h-2.5 rounded-full bg-white/[0.12]" />
            <span className="w-2.5 h-2.5 rounded-full bg-white/[0.12]" />
            <span className="w-2.5 h-2.5 rounded-full bg-white/[0.12]" />
          </div>
          <span className="text-[11px] font-mono font-medium text-[#F2F2F0]">
            workspace / auth-service
          </span>
          <span className="text-[10px] font-mono text-[#6B6B6B] hidden sm:inline">
            (Python • FastAPI • LangGraph)
          </span>
        </div>

        {/* Live Simulation Controls & Scrubber */}
        <div className="flex items-center gap-2">
          {/* Step dots */}
          <div className="hidden sm:flex items-center gap-1 mr-2">
            {SIMULATED_STAGES.map((s, idx) => (
              <button
                key={s.stage}
                type="button"
                onClick={() => setCurrentIdx(idx)}
                className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                  currentIdx === idx
                    ? "bg-[#F0A43C] scale-125"
                    : "bg-white/20 hover:bg-white/40"
                }`}
                title={s.stage}
              />
            ))}
          </div>

          <span className="text-[10px] font-mono text-[#F0A43C] hidden sm:inline">
            Step {currentIdx + 1} of {SIMULATED_STAGES.length}
          </span>
          <button
            type="button"
            onClick={() => setIsPaused(!isPaused)}
            className="flex items-center gap-1 text-[11px] font-mono text-[#A6A6A3] hover:text-[#F2F2F0] px-2 py-0.5 rounded border border-white/[0.08] bg-[#111214] hover:bg-[#181A1D] transition-colors cursor-pointer"
          >
            {isPaused ? <Play className="w-3 h-3 fill-[#F2F2F0]" /> : <Pause className="w-3 h-3" />}
            <span>{isPaused ? "Resume" : "Pause"}</span>
          </button>
        </div>
      </div>

      {/* Main 3-Column Mini Workspace */}
      <div className="grid grid-cols-1 md:grid-cols-12 min-h-[380px]">
        {/* Left Column: Repository Tree (3 cols) */}
        <div className="md:col-span-3 border-r border-white/[0.08] bg-[#0A0A0B]/70 p-3 hidden md:flex flex-col justify-between">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#6B6B6B] mb-2 font-semibold">
              Repository
            </div>
            <div className="space-y-1 font-mono text-xs">
              <div className="flex items-center gap-1.5 text-[#F2F2F0] py-0.5">
                <FolderOpen className="w-3.5 h-3.5 text-[#F6D58A]" />
                <span>src/auth</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#F0A43C] bg-[#F0A43C]/10 border border-[#F0A43C]/30 rounded px-1.5 py-0.5 ml-3 font-medium">
                <FileCode2 className="w-3.5 h-3.5 text-[#F0A43C]" />
                <span className="truncate">service.py</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#A6A6A3] py-0.5 ml-3">
                <FileCode2 className="w-3.5 h-3.5 text-[#6B6B6B]" />
                <span className="truncate">models.py</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#F2F2F0] py-0.5 mt-2">
                <FolderOpen className="w-3.5 h-3.5 text-[#F6D58A]" />
                <span>tests</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#A6A6A3] py-0.5 ml-3">
                <FlaskConical className="w-3.5 h-3.5 text-[#6B6B6B]" />
                <span className="truncate">test_auth.py</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-white/[0.08] text-[10px] font-mono text-[#6B6B6B]">
            Branch: <span className="text-[#F2F2F0]">main</span>
          </div>
        </div>

        {/* Center Column: Task, Activity & Code Viewer (6 cols) */}
        <div className="md:col-span-6 p-4 flex flex-col justify-between border-b md:border-b-0 md:border-r border-white/[0.08] bg-[#111214]">
          {/* Task Description */}
          <div>
            <div className="flex items-center justify-between text-xs pb-2 border-b border-white/[0.08] mb-3">
              <span className="text-[#A6A6A3] font-mono text-[11px]">Active Task</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#181A1D] text-[#F6D58A] border border-white/[0.08]">
                Iteration {current.iteration}/3
              </span>
            </div>
            <div className="text-sm font-semibold text-[#F2F2F0]">
              Add JWT authentication to FastAPI service
            </div>
            <p className="text-xs text-[#A6A6A3] mt-0.5 font-mono">
              Generate token encoder, validate expiry timestamps, and verify test assertions.
            </p>
          </div>

          {/* Code & Diff Window */}
          <div className="my-3 rounded-lg border border-white/[0.08] bg-[#0D0E10] p-3 font-mono text-xs overflow-hidden">
            <div className="flex items-center justify-between text-[10px] text-[#6B6B6B] pb-1.5 border-b border-white/[0.08] mb-2">
              <span>src/auth/service.py</span>
              <span className="text-[#F0A43C] font-semibold">{current.stage}</span>
            </div>
            <pre className="text-[#F2F2F0]/90 overflow-x-auto leading-relaxed whitespace-pre font-mono text-[11px]">
              {current.codeSnippet}
            </pre>
          </div>

          {/* Live Activity Notice */}
          <div className="flex items-center gap-2 p-2 rounded-lg bg-[#181A1D] border border-white/[0.08] text-xs font-mono">
            <div className="w-2 h-2 rounded-full bg-[#F0A43C] animate-pulse shrink-0" />
            <span className="text-[#F2F2F0] text-[11px] truncate">{current.activityMsg}</span>
          </div>
        </div>

        {/* Right Column: Agent Workflow State & Test Outcome (3 cols) */}
        <div className="md:col-span-3 p-3 bg-[#0D0E10] flex flex-col justify-between">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#6B6B6B] mb-2.5 font-semibold">
              Agent State
            </div>

            {/* State List */}
            <div className="space-y-1.5 text-xs font-mono">
              {[
                { id: "planner", label: "Planner" },
                { id: "analyzer", label: "Analyzer" },
                { id: "coder", label: "Coding Agent" },
                { id: "tester", label: "Test Agent" },
                { id: "reflector", label: "Reflection" },
              ].map((node) => {
                const isActive = current.activeNode === node.id;
                const isPast =
                  current.activeNode === "completed" ||
                  (node.id === "planner" && current.activeNode !== "planner") ||
                  (node.id === "analyzer" && !["planner", "analyzer"].includes(current.activeNode));

                return (
                  <div
                    key={node.id}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded border transition-all ${
                      isActive
                        ? "bg-[#F0A43C]/15 border-[#F0A43C]/50 text-[#F0A43C] font-semibold"
                        : "bg-[#0A0A0B]/60 border-white/[0.06] text-[#A6A6A3]"
                    }`}
                  >
                    <span>{node.label}</span>
                    <span>
                      {isActive && <Loader2 className="w-3 h-3 text-[#F0A43C] animate-spin" />}
                      {isPast && <Check className="w-3 h-3 text-[#22C55E] stroke-[2.5]" />}
                      {!isActive && !isPast && <span className="w-1.5 h-1.5 rounded-full bg-[#6B6B6B]" />}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Test Status Box */}
          <div className="mt-3 p-2.5 rounded-lg border border-white/[0.08] bg-[#0A0A0B]">
            <div className="text-[10px] font-mono text-[#6B6B6B] uppercase">Test Verification</div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs font-mono text-[#F2F2F0]">
                {animatedPassed} passed
                {animatedFailed > 0 && (
                  <span className="text-[#EF4444] ml-1">({animatedFailed} failed)</span>
                )}
              </span>
              {current.testOutcome.status === "passed" && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30">
                  PASSED
                </span>
              )}
              {current.testOutcome.status === "failed" && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30">
                  REFLECT ↺
                </span>
              )}
              {current.testOutcome.status === "idle" && (
                <span className="text-[10px] font-mono text-[#6B6B6B]">PENDING</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
