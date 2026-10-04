"use client";

import { useEffect, useRef, useState } from "react";

interface NodePoint {
  id: string;
  name: string;
  type: "module" | "test" | "agent" | "ast";
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  vx: number;
  vy: number;
  layer: 1 | 2 | 3;
  size: number;
  pulsePhase: number;
  active: boolean;
  activeTimer: number;
}

interface GraphEdge {
  from: string;
  to: string;
  pulseProgress: number;
  pulseSpeed: number;
  active: boolean;
}

interface FloatingTelemetry {
  id: string;
  text: string;
  kind: "code" | "file" | "test" | "git" | "diff";
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  vx: number;
  vy: number;
  opacity: number;
  maxOpacity: number;
  fadeIn: boolean;
  life: number;
  maxLife: number;
  layer: 2 | 3;
}

const FILE_PATHS = [
  "src/auth/service.py",
  "src/auth/routes.py",
  "src/users/model.py",
  "src/payments/service.py",
  "tests/test_auth.py",
  "tests/test_users.py",
  "pyproject.toml",
  "fastapi.middleware",
  "ast:FunctionDef[login]",
  "ast:Call[verify_pwd]",
];

const CODE_FRAGMENTS = [
  "pwd_context.verify(password, hash)",
  "token = create_access_token(user.id)",
  "pytest tests/test_auth.py -v",
  "+ authentication_enabled = True",
  "- def login(user):",
  "+ def login(user: User, password: str):",
  "raise HTTPException(status_code=401)",
  "git diff --unified=3 src/auth/",
  "AgentState.relevant_files.append()",
  "iteration: 2/3 [Reflection active]",
  "assert response.status_code == 200",
  "✓ 49 passed in 0.18s",
];

const GIT_REFERENCES = [
  "HEAD -> main [a71c4e2]",
  "commit 88f2b41 'fix: jwt expiry'",
  "+5 -1 src/auth/service.py",
  "branch: feat/autonomous-verify",
];

export default function AgentBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [activeSection, setActiveSection] = useState<string>("hero");
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const scrollRef = useRef(0);
  const reducedMotionRef = useRef(false);

  // Track active section and scroll position
  useEffect(() => {
    // Check reduced motion preference
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotionRef.current = mediaQuery.matches;
    const handleMotionChange = (e: MediaQueryListEvent) => {
      reducedMotionRef.current = e.matches;
    };
    mediaQuery.addEventListener("change", handleMotionChange);

    const handleScroll = () => {
      scrollRef.current = window.scrollY;

      const sections = [
        "demo",
        "capabilities",
        "architecture",
        "self-correction",
        "diff-engine",
        "code-diff",
        "repo-intelligence",
        "workflow",
        "how-it-works",
      ];

      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= window.innerHeight * 0.4 && rect.bottom >= window.innerHeight * 0.2) {
            setActiveSection(id);
            return;
          }
        }
      }
      if (window.scrollY < 400) {
        setActiveSection("hero");
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    // Mouse parallax for desktop
    const handleMouseMove = (e: MouseEvent) => {
      if (window.innerWidth < 1024) return;
      const nx = (e.clientX / window.innerWidth - 0.5) * 2;
      const ny = (e.clientY / window.innerHeight - 0.5) * 2;
      mouseRef.current.targetX = nx;
      mouseRef.current.targetY = ny;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    return () => {
      mediaQuery.removeEventListener("change", handleMotionChange);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // Canvas Simulation Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initGraph();
    };

    window.addEventListener("resize", handleResize);

    // Initial graph generation
    let nodes: NodePoint[] = [];
    let edges: GraphEdge[] = [];
    let telemetryItems: FloatingTelemetry[] = [];

    const initGraph = () => {
      nodes = [];
      edges = [];
      telemetryItems = [];

      // Create Software Engineering Nodes (AST, Modules, Tests, Agent Stages)
      const nodeDefs = [
        // Left flank nodes (Repository & AST)
        { id: "ast_root", name: "AST: Module", type: "ast", x: width * 0.08, y: height * 0.25, layer: 1 as const },
        { id: "mod_auth", name: "auth/service.py", type: "module", x: width * 0.16, y: height * 0.20, layer: 2 as const },
        { id: "mod_routes", name: "auth/routes.py", type: "module", x: width * 0.22, y: height * 0.35, layer: 2 as const },
        { id: "mod_model", name: "users/model.py", type: "module", x: width * 0.12, y: height * 0.48, layer: 1 as const },
        { id: "mod_pay", name: "payments/svc.py", type: "module", x: width * 0.07, y: height * 0.65, layer: 1 as const },
        { id: "test_auth", name: "test_auth.py", type: "test", x: width * 0.19, y: height * 0.60, layer: 2 as const },
        { id: "test_users", name: "test_users.py", type: "test", x: width * 0.14, y: height * 0.78, layer: 1 as const },

        // Right flank nodes (Agent Execution Pipeline & Sandbox)
        { id: "agent_plan", name: "planner_node", type: "agent", x: width * 0.82, y: height * 0.18, layer: 2 as const },
        { id: "agent_ana", name: "analyzer_node", type: "agent", x: width * 0.89, y: height * 0.32, layer: 1 as const },
        { id: "agent_code", name: "coding_agent", type: "agent", x: width * 0.84, y: height * 0.46, layer: 3 as const },
        { id: "agent_test", name: "pytest_sandbox", type: "agent", x: width * 0.91, y: height * 0.62, layer: 2 as const },
        { id: "agent_ref", name: "reflection_loop ↺", type: "agent", x: width * 0.81, y: height * 0.76, layer: 3 as const },
        { id: "agent_diff", name: "unified_diff", type: "module", x: width * 0.75, y: height * 0.58, layer: 2 as const },
      ];

      nodes = nodeDefs.map((def) => ({
        id: def.id,
        name: def.name,
        type: def.type as any,
        x: def.x,
        y: def.y,
        baseX: def.x,
        baseY: def.y,
        vx: (Math.random() - 0.5) * 0.12,
        vy: (Math.random() - 0.5) * 0.12,
        layer: def.layer,
        size: def.layer === 3 ? 3.5 : def.layer === 2 ? 2.5 : 2,
        pulsePhase: Math.random() * Math.PI * 2,
        active: false,
        activeTimer: 0,
      }));

      // Inter-node dependency edges
      const edgePairs = [
        ["ast_root", "mod_auth"],
        ["mod_auth", "mod_routes"],
        ["mod_auth", "mod_model"],
        ["mod_model", "test_users"],
        ["mod_routes", "test_auth"],
        ["mod_auth", "test_auth"],
        ["mod_pay", "mod_model"],
        // Agent pipeline edges
        ["agent_plan", "agent_ana"],
        ["agent_ana", "agent_code"],
        ["agent_code", "agent_test"],
        ["agent_test", "agent_ref"],
        ["agent_ref", "agent_code"],
        ["agent_code", "agent_diff"],
      ];

      edges = edgePairs.map(([from, to]) => ({
        from,
        to,
        pulseProgress: Math.random(),
        pulseSpeed: 0.003 + Math.random() * 0.003,
        active: true,
      }));

      // Initialize Floating Telemetry Tokens
      const allTelemetry: { text: string; kind: "code" | "file" | "test" | "git" | "diff" }[] = [
        ...FILE_PATHS.map((t) => ({ text: t, kind: "file" as const })),
        ...CODE_FRAGMENTS.map((t) => ({
          text: t,
          kind: (t.startsWith("+") || t.startsWith("-") ? "diff" : t.includes("passed") ? "test" : "code") as
            | "code"
            | "diff"
            | "test",
        })),
        ...GIT_REFERENCES.map((t) => ({ text: t, kind: "git" as const })),
      ];

      telemetryItems = allTelemetry.slice(0, 18).map((item, idx) => {
        // Place primarily on the left and right peripheral corridors to keep center clean
        const isLeft = idx % 2 === 0;
        const x = isLeft
          ? Math.random() * (width * 0.28) + 16
          : width * 0.72 + Math.random() * (width * 0.26);
        const y = Math.random() * height;

        return {
          id: `telemetry_${idx}`,
          text: item.text,
          kind: item.kind,
          x,
          y,
          baseX: x,
          baseY: y,
          vx: (Math.random() - 0.5) * 0.08,
          vy: -0.08 - Math.random() * 0.1, // subtle upward drift
          opacity: 0,
          maxOpacity: item.kind === "diff" ? 0.12 : 0.07,
          fadeIn: true,
          life: Math.random() * 400 + 200,
          maxLife: 600,
          layer: idx % 3 === 0 ? 3 : 2,
        };
      });
    };

    initGraph();

    // Pulse trigger clock
    let lastPulseTime = 0;

    const render = (time: number) => {
      // Respect user's reduced-motion preference: render once, don't continuously animate
      if (reducedMotionRef.current) {
        ctx.clearRect(0, 0, width, height);
        // Draw very faint static network
        ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
        ctx.lineWidth = 0.5;
        edges.forEach((edge) => {
          const fromNode = nodes.find((n) => n.id === edge.from);
          const toNode = nodes.find((n) => n.id === edge.to);
          if (fromNode && toNode) {
            ctx.beginPath();
            ctx.moveTo(fromNode.x, fromNode.y);
            ctx.lineTo(toNode.x, toNode.y);
            ctx.stroke();
          }
        });
        return;
      }

      ctx.clearRect(0, 0, width, height);

      // Smooth mouse parallax damping
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.04;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.04;

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      // Periodically trigger a subtle traveling signal between nodes
      if (time - lastPulseTime > 2600) {
        lastPulseTime = time;
        // Randomly activate an edge
        const randomEdge = edges[Math.floor(Math.random() * edges.length)];
        if (randomEdge) {
          randomEdge.pulseProgress = 0;
          const targetNode = nodes.find((n) => n.id === randomEdge.to);
          if (targetNode) {
            targetNode.active = true;
            targetNode.activeTimer = 60;
          }
        }
      }

      // --- 1. RENDER DEPENDENCY EDGES ---
      edges.forEach((edge) => {
        const fromNode = nodes.find((n) => n.id === edge.from);
        const toNode = nodes.find((n) => n.id === edge.to);
        if (!fromNode || !toNode) return;

        // Parallax offset based on layer
        const pFactor = fromNode.layer === 3 ? 4 : fromNode.layer === 2 ? 2.5 : 1.2;
        const fx = fromNode.x + mx * pFactor;
        const fy = fromNode.y + my * pFactor;
        const tx = toNode.x + mx * pFactor;
        const ty = toNode.y + my * pFactor;

        // Base Edge Line
        ctx.beginPath();
        ctx.moveTo(fx, fy);
        ctx.lineTo(tx, ty);
        const isAgentEdge = fromNode.type === "agent" && toNode.type === "agent";
        ctx.strokeStyle = isAgentEdge
          ? "rgba(240, 164, 60, 0.04)"
          : "rgba(255, 255, 255, 0.025)";
        ctx.lineWidth = 0.75;
        ctx.stroke();

        // Traveling Signal Pulse along Edge
        edge.pulseProgress += edge.pulseSpeed;
        if (edge.pulseProgress > 1) {
          edge.pulseProgress = 0;
        }

        const px = fx + (tx - fx) * edge.pulseProgress;
        const py = fy + (ty - fy) * edge.pulseProgress;

        ctx.beginPath();
        ctx.arc(px, py, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = isAgentEdge
          ? "rgba(240, 164, 60, 0.18)"
          : "rgba(246, 213, 138, 0.12)";
        ctx.fill();
      });

      // --- 2. RENDER GRAPH NODES ---
      nodes.forEach((node) => {
        // Slow organic drift
        node.x += node.vx;
        node.y += node.vy;
        if (Math.abs(node.x - node.baseX) > 12) node.vx *= -1;
        if (Math.abs(node.y - node.baseY) > 12) node.vy *= -1;

        // Node Parallax
        const pFactor = node.layer === 3 ? 4 : node.layer === 2 ? 2.5 : 1.2;
        const nx = node.x + mx * pFactor;
        const ny = node.y + my * pFactor;

        // Fade node timer if active
        if (node.activeTimer > 0) {
          node.activeTimer--;
          if (node.activeTimer === 0) node.active = false;
        }

        // Draw Node Core
        ctx.beginPath();
        ctx.arc(nx, ny, node.size, 0, Math.PI * 2);

        if (node.active) {
          ctx.fillStyle = "rgba(240, 164, 60, 0.35)";
          ctx.shadowColor = "rgba(240, 164, 60, 0.4)";
          ctx.shadowBlur = 6;
        } else if (node.type === "agent") {
          ctx.fillStyle = "rgba(240, 164, 60, 0.08)";
          ctx.shadowBlur = 0;
        } else if (node.type === "test") {
          ctx.fillStyle = "rgba(34, 197, 94, 0.07)";
          ctx.shadowBlur = 0;
        } else {
          ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
          ctx.shadowBlur = 0;
        }
        ctx.fill();
        ctx.shadowBlur = 0;

        // Outer Ring for layer 3 nodes
        if (node.layer === 3) {
          ctx.beginPath();
          ctx.arc(nx, ny, node.size + 2.5, 0, Math.PI * 2);
          ctx.strokeStyle = node.active
            ? "rgba(240, 164, 60, 0.25)"
            : "rgba(255, 255, 255, 0.03)";
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }

        // Extremely subtle typography label next to node
        ctx.font = "9px ui-monospace, SFMono-Regular, Menlo, monospace";
        ctx.fillStyle = node.active
          ? "rgba(240, 164, 60, 0.35)"
          : node.type === "agent"
          ? "rgba(246, 213, 138, 0.06)"
          : "rgba(255, 255, 255, 0.04)";
        ctx.fillText(node.name, nx + 6, ny + 3);
      });

      // --- 3. RENDER FLOATING CODE & TELEMETRY TOKENS ---
      telemetryItems.forEach((item) => {
        item.y += item.vy;
        item.x += item.vx;
        item.life++;

        // Fade in and fade out cycle
        if (item.life < 80) {
          item.opacity = (item.life / 80) * item.maxOpacity;
        } else if (item.life > item.maxLife - 80) {
          item.opacity = ((item.maxLife - item.life) / 80) * item.maxOpacity;
        } else {
          item.opacity = item.maxOpacity;
        }

        // Respawn if life expired or out of bounds
        if (item.life >= item.maxLife || item.y < -30) {
          item.life = 0;
          const isLeft = Math.random() > 0.5;
          item.x = isLeft
            ? Math.random() * (width * 0.28) + 16
            : width * 0.72 + Math.random() * (width * 0.26);
          item.y = height + 20;
          item.opacity = 0;
        }

        // Apply mouse parallax
        const pFactor = item.layer === 3 ? 3.5 : 1.8;
        const tx = item.x + mx * pFactor;
        const ty = item.y + my * pFactor;

        // Keep the area immediately around the LoopForge logo quiet and clean
        if (tx < 220 && ty < 90) return;

        // Render token
        ctx.font = item.kind === "diff" ? "10px ui-monospace, monospace" : "9.5px ui-monospace, monospace";

        if (item.text.startsWith("+")) {
          ctx.fillStyle = `rgba(34, 197, 94, ${item.opacity * 1.2})`;
        } else if (item.text.startsWith("-")) {
          ctx.fillStyle = `rgba(239, 68, 68, ${item.opacity * 1.2})`;
        } else if (item.kind === "git") {
          ctx.fillStyle = `rgba(240, 164, 60, ${item.opacity * 0.9})`;
        } else if (item.kind === "test") {
          ctx.fillStyle = `rgba(34, 197, 94, ${item.opacity})`;
        } else {
          ctx.fillStyle = `rgba(242, 242, 240, ${item.opacity})`;
        }

        ctx.fillText(item.text, tx, ty);
      });

      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden -z-10"
    >
      {/* Dynamic Ambient Glow Shifting with Active Section */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ${
          activeSection === "hero"
            ? "bg-[radial-gradient(ellipse_70%_50%_at_50%_15%,rgba(240,164,60,0.04),transparent)] opacity-100"
            : activeSection === "workflow" || activeSection === "capabilities"
            ? "bg-[radial-gradient(ellipse_60%_50%_at_20%_40%,rgba(246,213,138,0.035),transparent)] opacity-100"
            : activeSection === "diff-engine" || activeSection === "code-diff" || activeSection === "self-correction"
            ? "bg-[radial-gradient(ellipse_60%_50%_at_80%_60%,rgba(240,164,60,0.04),transparent)] opacity-100"
            : "bg-[radial-gradient(ellipse_70%_50%_at_50%_50%,rgba(255,255,255,0.02),transparent)] opacity-80"
        }`}
      />

      {/* Living Software Engineering Simulation Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block"
      />

      {/* Edge Atmosphere Vignette: Center is 100% CLEAR, edges provide peripheral depth */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 70% at 50% 50%, transparent 0%, transparent 60%, rgba(10, 10, 11, 0.35) 85%, rgba(10, 10, 11, 0.70) 100%)",
        }}
      />
    </div>
  );
}
