"use client";

import { useState } from "react";
import { FileCode2, Check, AlertCircle, Play, FlaskConical } from "lucide-react";
import InteractiveCard from "./InteractiveCard";

export default function CodeDiffSection() {
  const [hoveredLine, setHoveredLine] = useState<number | null>(null);
  const [testState, setTestState] = useState<"failed" | "passed">("failed");

  const diffLines = [
    { type: "header", text: "--- a/src/auth/service.py", note: "Original source file" },
    { type: "header", text: "+++ b/src/auth/service.py", note: "Target implementation file" },
    { type: "chunk", text: "@@ -14,6 +14,12 @@ def login(user: User):", note: "Function signature update" },
    { type: "remove", text: "-def login(user):", note: "Removed: Missing password verification" },
    { type: "add", text: "+def login(user: User, password: str) -> dict:", note: "Added: Verified login signature" },
    { type: "add", text: "+    if not pwd_context.verify(password, user.hashed_password):", note: "Added: Cryptographic hash comparison" },
    { type: "add", text: "+        raise HTTPException(status_code=401, detail='Invalid credentials')", note: "Added: 401 Unauthorized guard" },
    { type: "add", text: "+    token = create_access_token(user.id)", note: "Added: JWT generation call" },
    { type: "add", text: "+    return {'access_token': token, 'token_type': 'bearer'}", note: "Added: OAuth2 compliant payload" },
    { type: "context", text: " ", note: "Context" },
    { type: "context", text: " def get_user_by_id(db: Session, user_id: int):", note: "Context" },
  ];

  return (
    <section id="code-diff" className="py-24 border-b border-white/[0.08] bg-transparent relative z-10 scroll-mt-20">
      <span id="diff-engine" className="absolute -top-20 pointer-events-none" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mb-16">
          <span className="text-xs font-mono uppercase tracking-wider text-[#F6D58A] font-semibold mb-2 block">
            Auditable Modifications & Verification
          </span>
          <h2 className="font-serif font-semibold text-4xl sm:text-6xl md:text-7xl text-[#F2F2F0] leading-[1.05] tracking-[-0.01em]">
            Then it writes the change and runs the tests.
          </h2>
          <p className="mt-4 text-[#A6A6A3] text-base sm:text-lg leading-relaxed font-sans">
            No silent file wipes or unseen hallucinations. Every file modification is expressed as a
            clean, reviewable unified diff and verified immediately in a sandboxed test runner.
          </p>
        </div>

        {/* 2-Column Grid: Code Editor (7 cols) + Test Runner (5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: Code Editor & Unified Diff (7 cols) */}
          <InteractiveCard variant="tilt" className="lg:col-span-7 rounded-xl border border-white/[0.08] bg-[#111214] overflow-hidden flex flex-col justify-between shadow-2xl hover:border-white/[0.14]">
            <div className="h-10 bg-[#0D0E10] border-b border-white/[0.08] px-4 flex items-center justify-between font-mono text-xs">
              <div className="flex items-center gap-2 text-[#F2F2F0]">
                <FileCode2 className="w-3.5 h-3.5 text-[#F0A43C]" />
                <span>src/auth/service.py</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[#22C55E] font-semibold bg-[#22C55E]/15 px-2 py-0.5 rounded border border-[#22C55E]/30">
                  +5 additions
                </span>
                <span className="text-[10px] text-[#EF4444] font-semibold bg-[#EF4444]/15 px-2 py-0.5 rounded border border-[#EF4444]/30">
                  -1 removal
                </span>
              </div>
            </div>

            {/* Diff Lines with Hover Tooltips */}
            <div className="p-3 bg-[#0D0E10] font-mono text-xs overflow-x-auto flex-1 select-text">
              {diffLines.map((line, idx) => {
                let rowBg = "text-[#A6A6A3]";
                if (line.type === "add") {
                  rowBg = "bg-[#22C55E]/10 text-[#22C55E] border-l-2 border-[#22C55E]";
                } else if (line.type === "remove") {
                  rowBg = "bg-[#EF4444]/10 text-[#EF4444] border-l-2 border-[#EF4444]";
                } else if (line.type === "chunk") {
                  rowBg = "text-[#F0A43C] font-semibold bg-[#F0A43C]/10 border-l-2 border-[#F0A43C]";
                } else if (line.type === "header") {
                  rowBg = "text-[#6B6B6B]";
                }

                return (
                  <div
                    key={idx}
                    onMouseEnter={() => setHoveredLine(idx)}
                    onMouseLeave={() => setHoveredLine(null)}
                    className={`relative px-3 py-0.5 leading-relaxed transition-colors cursor-crosshair ${rowBg}`}
                  >
                    <pre className="whitespace-pre font-mono text-[11px]">{line.text}</pre>
                    {hoveredLine === idx && line.note && (
                      <div className="hidden sm:block absolute right-4 top-1/2 -translate-y-1/2 bg-[#0A0A0B] border border-white/[0.14] text-[#F2F2F0] text-[10px] px-2 py-0.5 rounded shadow-lg pointer-events-none z-10 font-mono">
                        {line.note}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="h-10 bg-[#0D0E10] border-t border-white/[0.08] px-4 flex items-center justify-between text-xs font-mono text-[#A6A6A3]">
              <span>Review: Hover line for rationale</span>
              <span className="text-[#22C55E] font-semibold">[ Diff Validated ]</span>
            </div>
          </InteractiveCard>

          {/* Right Column: Sandboxed Test Runner (5 cols) */}
          <InteractiveCard variant="spotlight" revealDelay={100} className="lg:col-span-5 rounded-xl border border-white/[0.08] bg-[#111214] p-6 flex flex-col justify-between shadow-2xl hover:border-white/[0.14]">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-5 font-mono text-xs">
                <div>
                  <span className="text-[10px] uppercase text-[#6B6B6B] font-semibold">Test Runner Sandbox</span>
                  <h3 className="text-sm font-bold text-[#F2F2F0] mt-0.5">pytest tests/test_auth.py</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setTestState(testState === "failed" ? "passed" : "failed")}
                  className="text-[10px] font-mono text-[#F0A43C] hover:text-[#F5B85D] underline cursor-pointer"
                >
                  Toggle: {testState === "failed" ? "Simulate Pass" : "Simulate Fail"}
                </button>
              </div>

              {/* Counters */}
              <div className="grid grid-cols-2 gap-3 mb-5 font-mono">
                <div className="p-3 rounded-lg bg-[#0D0E10] border border-white/[0.06]">
                  <span className="text-[10px] text-[#6B6B6B] uppercase block">Passed</span>
                  <span className="text-2xl font-bold text-[#22C55E]">
                    {testState === "failed" ? "47" : "49"}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-[#0D0E10] border border-white/[0.06]">
                  <span className="text-[10px] text-[#6B6B6B] uppercase block">Failed</span>
                  <span className={`text-2xl font-bold ${testState === "failed" ? "text-[#EF4444]" : "text-[#6B6B6B]"}`}>
                    {testState === "failed" ? "2" : "0"}
                  </span>
                </div>
              </div>

              {/* Output Console */}
              <div className="p-3.5 rounded-lg bg-[#0A0A0B] border border-white/[0.08] font-mono text-[11px] space-y-2">
                <div className="text-[#6B6B6B]">$ pytest tests/test_auth.py -v</div>
                {testState === "failed" ? (
                  <div className="space-y-1">
                    <div className="text-[#22C55E]">✓ test_password_hash PASSED</div>
                    <div className="text-[#22C55E]">✓ test_user_lookup PASSED</div>
                    <div className="text-[#EF4444] font-semibold">
                      FAILED test_auth.py::test_invalid_token - 401 Expected
                    </div>
                    <div className="text-[#EF4444] font-semibold">
                      FAILED test_auth.py::test_expired_token - ExpiredSignatureError
                    </div>
                    <div className="pt-2 text-[#F6D58A] text-[10px]">
                      &gt;&gt; Failure routed to Reflection Agent...
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="text-[#22C55E]">✓ 49 passed in 0.18s</div>
                    <div className="text-[#22C55E]">✓ All assertions verified</div>
                    <div className="pt-2 text-[#22C55E] text-[10px] font-semibold">
                      &gt;&gt; Ready for human diff approval.
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs font-mono text-[#6B6B6B]">
              <span>Execution: Subprocess Sandbox</span>
              <span className="text-[#F2F2F0]">Exit Code: {testState === "failed" ? "1" : "0"}</span>
            </div>
          </InteractiveCard>
        </div>
      </div>
    </section>
  );
}
