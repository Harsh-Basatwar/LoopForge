"use client";

import { useState } from "react";
import { Terminal, Play, CheckCircle2, RotateCw, ArrowRight, Check, AlertCircle } from "lucide-react";
import Link from "next/link";

interface DemoTask {
  id: string;
  title: string;
  category: string;
  prompt: string;
  targetFile: string;
  plan: string[];
  codeDiff: string;
  tests: { total: number; passed: number; time: string };
}

const DEMO_TASKS: DemoTask[] = [
  {
    id: "fix-test",
    title: "Fix a failing test",
    category: "Debugging",
    prompt: "Fix test_math_utils.py::test_fibonacci_negative_error which fails with unhandled TypeError.",
    targetFile: "math_utils.py",
    plan: [
      "Inspect test failure traceback in test_math_utils.py",
      "Locate negative index validation in math_utils.py",
      "Add explicit ValueError check for negative n",
      "Run pytest to verify all 4 tests pass",
    ],
    codeDiff: " def fibonacci(n: int) -> int:\n+    if n < 0:\n+        raise ValueError('n must be non-negative')\n     if n in (0, 1): return n",
    tests: { total: 4, passed: 4, time: "0.04s" },
  },
  {
    id: "add-auth",
    title: "Add authentication",
    category: "Feature",
    prompt: "Add JWT token generation and expiry validation to the FastAPI user service.",
    targetFile: "src/auth/service.py",
    plan: [
      "Inspect existing User and Session models in src/auth/",
      "Implement create_access_token() with HS256 algorithm",
      "Add datetime expiration claim to JWT payload",
      "Execute pytest tests/test_auth.py",
    ],
    codeDiff: "+def create_access_token(user_id: int, delta: timedelta) -> str:\n+    payload = {'sub': str(user_id), 'exp': datetime.utcnow() + delta}\n+    return jwt.encode(payload, SECRET_KEY, algorithm='HS256')",
    tests: { total: 18, passed: 18, time: "0.12s" },
  },
  {
    id: "refactor-service",
    title: "Refactor a service",
    category: "Refactoring",
    prompt: "Refactor synchronous payment processing into an async handler without modifying public API.",
    targetFile: "src/payments/service.py",
    plan: [
      "Analyze callers in routes.py to verify async signature compatibility",
      "Refactor PaymentGateway client to use httpx.AsyncClient",
      "Preserve existing return dictionary format",
      "Run full test suite to guarantee zero regression",
    ],
    codeDiff: "-def process_charge(card_token: str, amount: int) -> dict:\n+async def process_charge(card_token: str, amount: int) -> dict:\n+    async with httpx.AsyncClient() as client:\n+        return await client.post('/charges', json={'token': card_token})",
    tests: { total: 22, passed: 22, time: "0.21s" },
  },
  {
    id: "add-validation",
    title: "Add API validation",
    category: "Security",
    prompt: "Add Pydantic schema validation for username length, email format, and password complexity.",
    targetFile: "src/users/schemas.py",
    plan: [
      "Inspect incoming request body in src/users/routes.py",
      "Define UserRegisterSchema with EmailStr and regex password validator",
      "Hook schema into route dependency injection",
      "Verify pytest tests/test_validation.py",
    ],
    codeDiff: "+class UserCreate(BaseModel):\n+    username: str = Field(min_length=3, max_length=32)\n+    email: EmailStr\n+    password: str = Field(min_length=8)",
    tests: { total: 12, passed: 12, time: "0.09s" },
  },
  {
    id: "write-tests",
    title: "Write unit tests",
    category: "Testing",
    prompt: "Generate comprehensive pytest test cases for the palindrome detection utility.",
    targetFile: "tests/test_palindrome.py",
    plan: [
      "Inspect is_palindrome() implementation and edge cases",
      "Generate test cases for case-insensitivity, whitespace, and punctuation",
      "Include negative assertion tests for non-palindromes",
      "Execute pytest in sandbox to verify 100% test coverage",
    ],
    codeDiff: "+def test_palindrome_with_punctuation():\n+    assert is_palindrome('A man, a plan, a canal: Panama') is True\n+    assert is_palindrome('hello world') is False",
    tests: { total: 9, passed: 9, time: "0.06s" },
  },
];

export default function InteractiveDemo() {
  const [selectedTaskIndex, setSelectedTaskIndex] = useState(0);
  const [executionState, setExecutionState] = useState<"idle" | "analyzing" | "planned" | "testing" | "passed">("idle");

  const task = DEMO_TASKS[selectedTaskIndex];

  const handleSelectTask = (idx: number) => {
    setSelectedTaskIndex(idx);
    setExecutionState("idle");
  };

  const handleRunDemo = () => {
    setExecutionState("analyzing");
    setTimeout(() => {
      setExecutionState("planned");
      setTimeout(() => {
        setExecutionState("testing");
        setTimeout(() => {
          setExecutionState("passed");
        }, 1200);
      }, 1000);
    }, 800);
  };

  return (
    <section id="demo" className="py-24 border-b border-white/[0.08] bg-transparent relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <span className="text-xs font-mono uppercase tracking-wider text-[#F6D58A] font-semibold mb-2 block">
            Interactive Experience
          </span>
          <h2 className="font-serif font-semibold text-4xl sm:text-6xl md:text-7xl text-[#F2F2F0] leading-[1.05] tracking-[-0.01em]">
            Try the workflow.
          </h2>
          <p className="mt-4 text-[#A6A6A3] text-base sm:text-lg leading-relaxed font-sans">
            Select a common software engineering task below to observe how the autonomous LangGraph
            pipeline decomposes, modifies, executes, and verifies the solution.
          </p>
        </div>

        {/* Task Selection Pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          {DEMO_TASKS.map((t, idx) => {
            const isSelected = selectedTaskIndex === idx;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => handleSelectTask(idx)}
                className={`px-3.5 py-2 rounded-lg text-xs font-mono transition-all border cursor-pointer ${
                  isSelected
                    ? "bg-[#F0A43C] text-[#0A0A0B] font-bold border-[#F0A43C] shadow-sm"
                    : "bg-[#111214] text-[#A6A6A3] hover:text-[#F2F2F0] border-white/[0.08] hover:border-white/[0.14]"
                }`}
              >
                <span className="mr-1.5 opacity-70">[{t.category}]</span>
                <span>{t.title}</span>
              </button>
            );
          })}
        </div>

        {/* Interactive Terminal Window */}
        <div className="rounded-xl border border-white/[0.08] bg-[#111214] overflow-hidden shadow-2xl font-mono text-xs">
          {/* Top Bar */}
          <div className="h-10 bg-[#0D0E10] border-b border-white/[0.08] px-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-[#F0A43C]" />
              <span className="text-[#F2F2F0] font-medium text-[11px]">Workflow Simulation Console</span>
            </div>
            <span className="text-[10px] text-[#6B6B6B] hidden sm:inline">
              Controlled demonstration • Isolated sandbox
            </span>
          </div>

          <div className="p-6 space-y-5">
            {/* Task Prompt Box */}
            <div className="p-3.5 rounded-lg bg-[#0D0E10] border border-white/[0.06] text-xs">
              <span className="text-[#6B6B6B] uppercase block text-[10px] font-semibold mb-1">User Task</span>
              <p className="text-[#F2F2F0] font-mono leading-relaxed font-medium">{task.prompt}</p>
            </div>

            {/* Run Button if Idle */}
            {executionState === "idle" && (
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleRunDemo}
                  className="flex items-center gap-2 bg-[#F0A43C] hover:bg-[#F5B85D] text-[#0A0A0B] font-bold px-4 py-2 rounded-lg text-xs transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-[#0A0A0B]" />
                  <span>Execute Workflow Simulation</span>
                </button>
                <span className="text-[11px] text-[#6B6B6B]">Click to start autonomous pipeline</span>
              </div>
            )}

            {/* Step 1: Analyzing */}
            {executionState !== "idle" && (
              <div className="space-y-3 font-mono text-xs">
                {/* Repository Analyzer Log */}
                <div className="p-3 rounded-lg bg-[#0D0E10] border border-white/[0.06] flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#F6D58A]">
                    <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
                    <span>Repository Analyzer: target file located at &apos;{task.targetFile}&apos;</span>
                  </div>
                  <span className="text-[10px] text-[#6B6B6B]">Indexed AST</span>
                </div>

                {/* Planner Output */}
                <div className="p-3 rounded-lg bg-[#0D0E10] border border-white/[0.06] space-y-2">
                  <div className="text-[10px] text-[#F6D58A] uppercase font-semibold">Structured Implementation Plan</div>
                  <div className="space-y-1 text-[#A6A6A3] text-[11px]">
                    {task.plan.map((step, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-[#6B6B6B]">0{i + 1}.</span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Code Diff Generated */}
                <div className="p-3 rounded-lg bg-[#0A0A0B] border border-white/[0.08] space-y-1">
                  <div className="text-[10px] text-[#F0A43C] uppercase font-semibold pb-1 border-b border-white/[0.06]">
                    Generated Code Patch ({task.targetFile})
                  </div>
                  <pre className="text-[#22C55E] text-[11px] overflow-x-auto whitespace-pre py-1 leading-relaxed">
                    {task.codeDiff}
                  </pre>
                </div>

                {/* Test Result Indicator */}
                {executionState === "testing" && (
                  <div className="p-3 rounded-lg bg-[#0D0E10] border border-[#F0A43C]/30 flex items-center gap-2 text-[#F0A43C]">
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Executing pytest in isolated sandbox...</span>
                  </div>
                )}

                {executionState === "passed" && (
                  <div className="p-3 rounded-lg bg-[#22C55E]/10 border border-[#22C55E]/30 flex items-center justify-between text-xs text-[#22C55E]">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span className="font-bold">
                        All {task.tests.passed} / {task.tests.total} tests passed ({task.tests.time})
                      </span>
                    </div>
                    <span className="text-[10px] font-mono uppercase bg-[#22C55E]/20 px-2 py-0.5 rounded font-semibold">
                      Verified
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Bottom Call to Action once passed */}
            {executionState === "passed" && (
              <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between">
                <span className="text-[11px] text-[#A6A6A3]">
                  Ready to test on your own repository?
                </span>
                <Link
                  href="/workspace"
                  className="flex items-center gap-1.5 text-xs font-bold text-[#F0A43C] hover:text-[#F5B85D] transition-colors"
                >
                  <span>Open Full Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
