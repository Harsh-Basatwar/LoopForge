"use client";

import { useState, useEffect, useRef } from "react";
import {
  Terminal,
  FolderTree,
  ListOrdered,
  Code2,
  FlaskConical,
  AlertTriangle,
  RotateCw,
  CheckCircle2,
  Check,
  Search,
  ArrowRight,
} from "lucide-react";
import InteractiveCard from "./InteractiveCard";

interface WorkflowStep {
  number: string;
  title: string;
  subtitle: string;
  desc: string;
  badge: string;
}

const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    number: "01",
    title: "Understand",
    subtitle: "Repository Analysis",
    desc: "Deep AST and filesystem indexing discovers relevant modules, detects test frameworks, and understands dependency graphs.",
    badge: "Indexed in <100ms",
  },
  {
    number: "02",
    title: "Plan",
    subtitle: "Structured Architecture",
    desc: "Deconstructs ambiguous prompts into an actionable, numbered plan before touching code, preventing premature edits.",
    badge: "Ordered Task List",
  },
  {
    number: "03",
    title: "Build",
    subtitle: "Targeted Code Generation",
    desc: "Creates minimal, unified diffs that preserve incumbent styling, imports, and architectural patterns.",
    badge: "Unified Diffs",
  },
  {
    number: "04",
    title: "Execute",
    subtitle: "Sandbox Test Runner",
    desc: "Runs automated test commands in an isolated subprocess with strict timeouts and sanitized host environment variables.",
    badge: "Subprocess Sandbox",
  },
  {
    number: "05",
    title: "Diagnose",
    subtitle: "Failure Analysis",
    desc: "When assertions fail, extracts traceback logs and synthesizes precise root-cause diagnoses rather than repeating the same mistake.",
    badge: "Root-Cause Diagnosis",
  },
  {
    number: "06",
    title: "Improve",
    subtitle: "Closed-Loop Refinement",
    desc: "Autonomous self-correction cycles up to the configured limit, ensuring all tests pass before presenting for human review.",
    badge: "Auto-Heal (Max 3)",
  },
];

export default function Capabilities() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [testCountStage4, setTestCountStage4] = useState({ passed: 0, failed: 0 });
  const [testCountStage6, setTestCountStage6] = useState(0);

  // Animated test counters when entering execution and improvement stages
  useEffect(() => {
    if (activeStepIndex === 3) {
      setTestCountStage4({ passed: 0, failed: 0 });
      let p = 0;
      const t = setInterval(() => {
        p += 5;
        if (p >= 47) {
          setTestCountStage4({ passed: 47, failed: 2 });
          clearInterval(t);
        } else {
          setTestCountStage4({ passed: p, failed: 0 });
        }
      }, 50);
      return () => clearInterval(t);
    } else if (activeStepIndex === 5) {
      setTestCountStage6(0);
      let p = 0;
      const t = setInterval(() => {
        p += 5;
        if (p >= 49) {
          setTestCountStage6(49);
          clearInterval(t);
        } else {
          setTestCountStage6(p);
        }
      }, 40);
      return () => clearInterval(t);
    }
  }, [activeStepIndex]);

  // High-performance RAF scroll tracker for sticky progress
  useEffect(() => {
    let animationFrameId: number;

    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const totalScrollable = rect.height - window.innerHeight;

      if (totalScrollable <= 0) return;

      const currentScroll = -rect.top;
      const rawProgress = currentScroll / totalScrollable;
      const clampedProgress = Math.max(0, Math.min(1, rawProgress));

      setScrollProgress(clampedProgress);

      // Divide [0, 1] into 6 equal stages
      const stepCount = WORKFLOW_STEPS.length;
      const step = Math.min(stepCount - 1, Math.floor(clampedProgress * stepCount));
      setActiveStepIndex(step);
    };

    const onScroll = () => {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(handleScroll);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Smooth click navigation to corresponding scroll height
  const scrollToStep = (index: number) => {
    if (!sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    const totalScrollable = rect.height - window.innerHeight;
    const targetScrollTop =
      window.scrollY + rect.top + (index / WORKFLOW_STEPS.length) * totalScrollable + 20;

    window.scrollTo({
      top: targetScrollTop,
      behavior: "smooth",
    });
  };

  const current = WORKFLOW_STEPS[activeStepIndex];

  return (
    <section
      id="capabilities"
      ref={sectionRef}
      className="relative z-10 bg-[#0A0A0B] border-b border-white/[0.08] scroll-mt-20"
      style={{ height: "600vh" }}
    >
      {/* Dynamic Background Glow based on current active step */}
      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-700 ${
          activeStepIndex === 0
            ? "bg-[radial-gradient(ellipse_60%_50%_at_70%_50%,rgba(246,213,138,0.04),transparent)] opacity-100"
            : activeStepIndex === 1
            ? "bg-[radial-gradient(ellipse_60%_50%_at_70%_50%,rgba(246,213,138,0.04),transparent)] opacity-100"
            : activeStepIndex === 2
            ? "bg-[radial-gradient(ellipse_60%_50%_at_70%_50%,rgba(240,164,60,0.05),transparent)] opacity-100"
            : activeStepIndex === 3
            ? "bg-[radial-gradient(ellipse_60%_50%_at_70%_50%,rgba(255,255,255,0.03),transparent)] opacity-100"
            : activeStepIndex === 4
            ? "bg-[radial-gradient(ellipse_60%_50%_at_70%_50%,rgba(239,68,68,0.05),transparent)] opacity-100"
            : "bg-[radial-gradient(ellipse_60%_50%_at_70%_50%,rgba(34,197,94,0.05),transparent)] opacity-100"
        }`}
      />

      {/* Pinned Sticky Viewport Container */}
      <div className="sticky top-0 h-screen w-full flex flex-col justify-center overflow-hidden z-20">
        {/* Continuous Top Scroll Progress Line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/[0.06]">
          <div
            className="h-full bg-gradient-to-r from-[#F6D58A] via-[#F0A43C] to-[#22C55E] transition-all duration-75"
            style={{ width: `${Math.round(scrollProgress * 100)}%` }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-4 flex flex-col justify-between h-[92vh]">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-white/[0.08]">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-[#F0A43C] font-semibold block">
                Autonomous Engineering Pipeline
              </span>
              <h2 className="font-serif font-semibold text-2xl sm:text-3xl text-[#F2F2F0] tracking-[-0.01em] leading-tight">
                Scroll to inspect the agent&apos;s internal process.
              </h2>
            </div>

            {/* Step Counter Indicator */}
            <div className="flex items-center gap-3 font-mono text-xs text-[#A6A6A3]">
              <span className="px-2.5 py-1 rounded-md bg-[#111214] border border-white/[0.08] text-[#F2F2F0]">
                Stage 0{activeStepIndex + 1} / 06
              </span>
              <span className="text-[#6B6B6B] hidden sm:inline">•</span>
              <span className="text-[#F6D58A] hidden sm:inline">
                {Math.round(scrollProgress * 100)}% Through Pipeline
              </span>
            </div>
          </div>

          {/* Main 2-Column Split: Narrative Rail on Left + Dynamic Live Observation on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center flex-1 my-4 overflow-hidden">
            {/* Left Column: Vertical Narrative Navigation Rail (5 cols) */}
            <div className="lg:col-span-5 flex flex-col justify-center space-y-2 relative pr-2">
              {/* Continuous vertical connecting line */}
              <div className="absolute left-[15px] top-6 bottom-6 w-[2px] bg-white/[0.08] hidden sm:block" />
              <div
                className="absolute left-[15px] top-6 w-[2px] bg-[#F0A43C] transition-all duration-150 hidden sm:block"
                style={{
                  height: `${(activeStepIndex / (WORKFLOW_STEPS.length - 1)) * 82}%`,
                }}
              />

              {WORKFLOW_STEPS.map((step, idx) => {
                const isActive = activeStepIndex === idx;
                const isPassed = activeStepIndex > idx;

                return (
                  <button
                    key={step.number}
                    type="button"
                    onClick={() => scrollToStep(idx)}
                    className={`group w-full text-left p-3 sm:pl-10 sm:pr-4 rounded-xl border transition-all cursor-pointer relative select-none ${
                      isActive
                        ? "bg-[#111214] border-[#F0A43C] shadow-xl shadow-black/50 scale-[1.01]"
                        : isPassed
                        ? "bg-[#0D0E10]/60 border-white/[0.06] hover:bg-[#111214]/40"
                        : "bg-transparent border-transparent hover:bg-white/[0.02]"
                    }`}
                  >
                    {/* Node Dot / Status Icon */}
                    <div className="absolute left-2.5 top-1/2 -translate-y-1/2 hidden sm:flex items-center justify-center">
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-mono font-bold transition-all ${
                          isActive
                            ? "bg-[#F0A43C] text-[#0A0A0B] ring-4 ring-[#F0A43C]/20"
                            : isPassed
                            ? "bg-[#22C55E] text-[#0A0A0B]"
                            : "bg-[#0D0E10] border border-white/[0.14] text-[#6B6B6B]"
                        }`}
                      >
                        {isPassed ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : step.number}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-bold tracking-tight transition-colors ${
                            isActive
                              ? "text-[#F2F2F0]"
                              : isPassed
                              ? "text-[#A6A6A3]"
                              : "text-[#6B6B6B]"
                          }`}
                        >
                          {step.title}
                        </span>
                        <span className="text-[11px] font-mono text-[#F6D58A]">
                          • {step.subtitle}
                        </span>
                      </div>

                      {isActive && (
                        <span className="text-[10px] font-mono uppercase bg-[#F0A43C]/15 border border-[#F0A43C]/30 text-[#F0A43C] px-2 py-0.5 rounded font-semibold">
                          Active
                        </span>
                      )}
                    </div>

                    {/* Description expanded on active state */}
                    <p
                      className={`text-xs text-[#A6A6A3] mt-1 font-sans leading-relaxed transition-all ${
                        isActive ? "opacity-100 max-h-20" : "opacity-0 max-h-0 sm:opacity-50 sm:max-h-5 overflow-hidden truncate"
                      }`}
                    >
                      {step.desc}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Right Column: Dynamic Live Observation Panel (7 cols) */}
            <InteractiveCard
              variant="subtle"
              className="lg:col-span-7 rounded-2xl border border-white/[0.08] bg-[#111214] shadow-2xl overflow-hidden h-[480px] lg:h-[520px]"
              innerClassName="h-full flex flex-col justify-between"
            >
              {/* Header Bar */}
              <div className="h-10 bg-[#0D0E10] border-b border-white/[0.08] px-4 flex items-center justify-between font-mono text-xs">
                <div className="flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-[#F0A43C]" />
                  <span className="text-[#F2F2F0] font-medium text-[11px]">
                    engine / {current.title.toLowerCase()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
                  <span className="text-[10px] text-[#A6A6A3]">Live Observation</span>
                </div>
              </div>

              {/* Dynamic Body Content per Active Step */}
              <div className="p-6 flex-1 flex flex-col justify-between overflow-y-auto">
                {/* Header Information */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-base font-bold text-[#F2F2F0] font-sans">
                      {current.subtitle}
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0D0E10] border border-white/[0.08] text-[#F6D58A]">
                      {current.badge}
                    </span>
                  </div>
                  <p className="text-xs text-[#A6A6A3] font-sans leading-relaxed">
                    {current.desc}
                  </p>
                </div>

                {/* Animated Dynamic Presentation Area */}
                <div className="my-4 rounded-xl bg-[#0D0E10] border border-white/[0.08] p-4 font-mono text-xs text-[#F2F2F0] min-h-[220px] flex flex-col justify-between">
                  {/* STAGE 01: UNDERSTAND */}
                  {activeStepIndex === 0 && (
                    <div className="space-y-2.5 animate-fadeIn">
                      <div className="text-[#6B6B6B] text-[11px]">
                        $ analyzer.index_workspace(path=&quot;./&quot;)
                      </div>
                      <div className="flex items-center gap-2 text-[#F6D58A] font-semibold text-xs">
                        <Search className="w-3.5 h-3.5 animate-pulse" />
                        <span>Scanning AST and directory topology: 42 files discovered</span>
                      </div>
                      <div className="space-y-1.5 pl-3 border-l-2 border-white/[0.08] text-[11px] text-[#A6A6A3]">
                        <div className="flex items-center gap-2 text-[#22C55E]">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Pytest suite detected in tests/test_auth.py</span>
                        </div>
                        <div className="flex items-center gap-2 text-[#F2F2F0]">
                          <Check className="w-3.5 h-3.5 text-[#22C55E] stroke-[3]" />
                          <span>Identified target module: src/auth/service.py</span>
                        </div>
                        <div className="flex items-center gap-2 text-[#6B6B6B]">
                          <span>Dependency graph: FastAPI • PyJWT • Passlib</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STAGE 02: PLAN */}
                  {activeStepIndex === 1 && (
                    <div className="space-y-2.5 animate-fadeIn">
                      <div className="text-[#6B6B6B] text-[11px]">
                        $ planner.create_plan(task=&quot;Add JWT authentication&quot;)
                      </div>
                      <div className="text-[#F6D58A] font-semibold text-xs flex items-center gap-1.5">
                        <ListOrdered className="w-3.5 h-3.5 text-[#F6D58A]" />
                        <span>✓ 5 Sequential implementation steps generated</span>
                      </div>
                      <div className="space-y-1 text-[11px] text-[#A6A6A3] pl-3 border-l-2 border-[#F6D58A]/30">
                        <div>01. Inspect existing User model and password hashing</div>
                        <div>02. Implement create_access_token() with HS256 algorithm</div>
                        <div>03. Add expiration timedelta payload claim</div>
                        <div>04. Hook token creation into login route handler</div>
                        <div>05. Execute pytest test_auth.py to verify assertions</div>
                      </div>
                    </div>
                  )}

                  {/* STAGE 03: BUILD */}
                  {activeStepIndex === 2 && (
                    <div className="space-y-2 animate-fadeIn">
                      <div className="flex items-center justify-between text-[#6B6B6B] text-[11px] pb-1 border-b border-white/[0.06]">
                        <span>src/auth/service.py</span>
                        <span className="text-[#22C55E]">+4 additions, -1 deletion</span>
                      </div>
                      <pre className="text-[11px] leading-relaxed overflow-x-auto whitespace-pre">
                        <span className="text-[#EF4444] block">-def login(user):</span>
                        <span className="text-[#22C55E] block">+def login(user, password):</span>
                        <span className="text-[#22C55E] block">+    if not pwd_context.verify(password, user.hashed_password):</span>
                        <span className="text-[#22C55E] block">+        raise HTTPException(status_code=401)</span>
                        <span className="text-[#22C55E] block">+    token = create_access_token(user.id)</span>
                        <span className="text-[#22C55E] block">{'+    return {"access_token": token}'}</span>
                      </pre>
                    </div>
                  )}

                  {/* STAGE 04: EXECUTE */}
                  {activeStepIndex === 3 && (
                    <div className="space-y-2.5 animate-fadeIn">
                      <div className="text-[#6B6B6B] text-[11px]">$ pytest tests/test_auth.py -v</div>
                      <div className="space-y-1 text-[11px]">
                        <div className="text-[#22C55E] flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>test_user_lookup PASSED</span>
                        </div>
                        <div className="text-[#22C55E] flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>test_password_hash PASSED</span>
                        </div>
                        <div className="text-[#EF4444] font-semibold flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>test_token_expiry FAILED (TypeError: user_id must be str)</span>
                        </div>
                        <div className="text-[#EF4444] font-semibold flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>test_missing_claim FAILED (KeyError: &apos;exp&apos;)</span>
                        </div>
                      </div>
                      <div className="pt-2 text-xs font-semibold text-[#F2F2F0] flex items-center justify-between border-t border-white/[0.06]">
                        <span>{testCountStage4.passed} passed, {testCountStage4.failed} failed</span>
                        <span className="text-[10px] text-[#6B6B6B]">Execution: 2.84s</span>
                      </div>
                    </div>
                  )}

                  {/* STAGE 05: DIAGNOSE */}
                  {activeStepIndex === 4 && (
                    <div className="space-y-2.5 animate-fadeIn">
                      <div className="text-[#EF4444] text-[11px] font-semibold">
                        ✕ Traceback detected in test_auth.py
                      </div>
                      <div className="text-[#F6D58A] text-xs font-semibold flex items-center gap-1.5">
                        <RotateCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Reflection Agent: Diagnosing failure root cause...</span>
                      </div>
                      <div className="p-3 rounded-lg bg-[#0A0A0B] border border-white/[0.08] text-[11px] text-[#A6A6A3] space-y-1">
                        <div className="text-[#F2F2F0] font-semibold">Root Cause Identified:</div>
                        <div>1. `user_id` was passed as integer; PyJWT requires explicit `str(user_id)`.</div>
                        <div>2. Missing `exp` claim in token payload required by authentication middleware.</div>
                        <div className="text-[#F6D58A] font-semibold pt-1">
                          &gt;&gt; Prescribing targeted patch to Coding Agent...
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STAGE 06: IMPROVE */}
                  {activeStepIndex === 5 && (
                    <div className="space-y-2.5 animate-fadeIn">
                      <div className="flex items-center justify-between text-xs text-[#F6D58A] font-semibold">
                        <span>Iteration 2 / 3: Applying correction patch</span>
                        <span className="text-[10px] text-[#22C55E]">Auto-Heal Active</span>
                      </div>
                      <div className="text-[#6B6B6B] text-[11px]">$ pytest tests/test_auth.py -v</div>
                      <div className="p-2.5 rounded-lg bg-[#22C55E]/10 border border-[#22C55E]/30 text-xs text-[#22C55E] font-bold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{testCountStage6} passed, 0 failed in 0.18s ✓</span>
                      </div>
                      <div className="space-y-0.5 text-[11px] text-[#A6A6A3] pl-3 border-l-2 border-[#22C55E]/40">
                        <div>✓ Authentication flow passed</div>
                        <div>✓ Expiry validation passed</div>
                        <div>✓ All regression tests verified</div>
                      </div>
                      <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between">
                        <span className="text-xs font-bold text-[#F6D58A] uppercase tracking-wider">
                          READY FOR REVIEW
                        </span>
                        <span className="text-[10px] font-mono text-[#22C55E] bg-[#22C55E]/20 px-2 py-0.5 rounded font-semibold">
                          100% Pass Rate
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Status Bar */}
                <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs font-mono text-[#6B6B6B]">
                  <span>LangGraph Node: {current.title.toLowerCase()}_node</span>
                  <span className="text-[#F2F2F0]">State Verified ✓</span>
                </div>
              </div>
            </InteractiveCard>
          </div>

          {/* Bottom Prompt / Scroll Helper */}
          <div className="flex items-center justify-between text-[11px] font-mono text-[#6B6B6B] pt-2 border-t border-white/[0.06]">
            <span>Scroll down to advance pipeline</span>
            <span className="text-[#F0A43C]">
              {activeStepIndex === 5 ? "Pipeline Complete — Ready for Review" : "Autonomous Execution in Progress"}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
