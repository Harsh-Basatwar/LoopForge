"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowRight } from "lucide-react";

interface NavItem {
  id: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: "how-it-works", label: "How It Works" },
  { id: "workflow", label: "Workflow" },
  { id: "capabilities", label: "Capabilities" },
  { id: "code-diff", label: "Code Diff" },
  { id: "architecture", label: "Architecture" },
];

export default function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("how-it-works");
  const activeSectionRef = useRef<string>("how-it-works");
  const [heartbeatIdx, setHeartbeatIdx] = useState(0);

  const navRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<Map<string, HTMLAnchorElement>>(new Map());
  const indicatorElRef = useRef<HTMLSpanElement>(null);

  const mobileNavRef = useRef<HTMLDivElement>(null);
  const mobileItemRefs = useRef<Map<string, HTMLAnchorElement>>(new Map());
  const mobileIndicatorElRef = useRef<HTMLSpanElement>(null);

  // Animation physics state refs
  const currentProgressRef = useRef(0); // continuous float 0.0 to 4.0
  const targetProgressRef = useRef(0);
  const velocityRef = useRef(0);
  const lastTimeRef = useRef(0);
  const isAnimatingRef = useRef(false);

  // For clicks/jumps across non-adjacent items
  const jumpSourceRef = useRef<number | null>(null);
  const jumpTargetRef = useRef<number | null>(null);

  const isManualScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const heartbeatStates = [
    { label: "AGENT READY", color: "text-[#A6A6A3]", dot: "bg-[#22C55E]" },
    { label: "ANALYZING AST", color: "text-[#F6D58A]", dot: "bg-[#F0A43C] animate-pulse" },
    { label: "GENERATING DIFF", color: "text-[#F0A43C]", dot: "bg-[#F0A43C] animate-pulse" },
    { label: "EXECUTING PYTEST", color: "text-[#F2F2F0]", dot: "bg-white animate-pulse" },
    { label: "REFLECTING", color: "text-[#F6D58A]", dot: "bg-[#EF4444] animate-pulse" },
    { label: "VERIFIED ✓", color: "text-[#22C55E]", dot: "bg-[#22C55E]" },
  ];

  // Render elastic indicator directly to DOM for 60fps GPU performance
  const renderIndicator = useCallback((progress: number) => {
    const clamped = Math.max(0, Math.min(NAV_ITEMS.length - 1, progress));

    let p = 0;
    let baseIdx = 0;
    let nextIdx = 0;

    // Check if this is an explicit jump (e.g. user clicked a distant item)
    if (jumpSourceRef.current !== null && jumpTargetRef.current !== null) {
      const src = jumpSourceRef.current;
      const dst = jumpTargetRef.current;
      const totalDist = dst - src;
      if (Math.abs(totalDist) > 0.001) {
        p = Math.max(0, Math.min(1, (clamped - src) / totalDist));
        baseIdx = src;
        nextIdx = dst;
      } else {
        baseIdx = Math.round(clamped);
        nextIdx = baseIdx;
        p = 0;
      }
    } else {
      // Normal adjacent scroll transition
      baseIdx = Math.floor(clamped);
      nextIdx = Math.min(baseIdx + 1, NAV_ITEMS.length - 1);
      p = clamped - baseIdx;
    }

    // Elastic width squeeze:
    // Starts at 100% width, shrinks down to ~40% at midpoint, expands back to 100%
    const sinP = Math.sin(Math.PI * p);
    const widthFactor = 1 - 0.58 * Math.pow(sinP, 1.25);

    // Desktop indicator
    const navEl = navRef.current;
    const indicatorEl = indicatorElRef.current;
    if (navEl && indicatorEl) {
      const elA = itemRefs.current.get(NAV_ITEMS[baseIdx]?.id);
      const elB = itemRefs.current.get(NAV_ITEMS[nextIdx]?.id);
      if (elA && elB) {
        const navRect = navEl.getBoundingClientRect();
        const rectA = elA.getBoundingClientRect();
        const rectB = elB.getBoundingClientRect();

        const centerA = (rectA.left - navRect.left) + rectA.width / 2;
        const centerB = (rectB.left - navRect.left) + rectB.width / 2;

        const widthA = rectA.width;
        const widthB = rectB.width;

        const currentCenter = centerA + (centerB - centerA) * p;
        const baseWidth = widthA + (widthB - widthA) * p;
        const currentWidth = Math.max(22, baseWidth * widthFactor);
        const currentLeft = currentCenter - currentWidth / 2;

        indicatorEl.style.transform = `translateX(${currentLeft}px)`;
        indicatorEl.style.width = `${currentWidth}px`;
        indicatorEl.style.opacity = "1";
      }
    }

    // Mobile indicator
    const mobileNavEl = mobileNavRef.current;
    const mobileIndicatorEl = mobileIndicatorElRef.current;
    if (mobileNavEl && mobileIndicatorEl) {
      const elA = mobileItemRefs.current.get(NAV_ITEMS[baseIdx]?.id);
      const elB = mobileItemRefs.current.get(NAV_ITEMS[nextIdx]?.id);
      if (elA && elB) {
        const navRect = mobileNavEl.getBoundingClientRect();
        const rectA = elA.getBoundingClientRect();
        const rectB = elB.getBoundingClientRect();

        const centerA = (rectA.left - navRect.left + mobileNavEl.scrollLeft) + rectA.width / 2;
        const centerB = (rectB.left - navRect.left + mobileNavEl.scrollLeft) + rectB.width / 2;

        const widthA = rectA.width;
        const widthB = rectB.width;

        const currentCenter = centerA + (centerB - centerA) * p;
        const baseWidth = widthA + (widthB - widthA) * p;
        const currentWidth = Math.max(18, baseWidth * widthFactor);
        const currentLeft = currentCenter - currentWidth / 2;

        mobileIndicatorEl.style.transform = `translateX(${currentLeft}px)`;
        mobileIndicatorEl.style.width = `${currentWidth}px`;
        mobileIndicatorEl.style.opacity = "1";
      }
    }

    // Active label text contrast update at 0.5 midpoint
    const closestIdx = Math.max(0, Math.min(NAV_ITEMS.length - 1, Math.round(clamped)));
    const newActiveId = NAV_ITEMS[closestIdx]?.id;
    if (newActiveId && newActiveId !== activeSectionRef.current) {
      activeSectionRef.current = newActiveId;
      setActiveSection(newActiveId);

      // Scroll mobile strip smoothly if needed
      const mobileActiveEl = mobileItemRefs.current.get(newActiveId);
      if (mobileActiveEl && !isManualScrollingRef.current) {
        mobileActiveEl.scrollIntoView({
          behavior: "smooth",
          inline: "nearest",
          block: "nearest",
        });
      }
    }
  }, []);

  // Spring animation loop with physical inertia
  const startAnimationLoop = useCallback(() => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    lastTimeRef.current = performance.now();

    const step = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTimeRef.current) / 1000, 0.033);
      lastTimeRef.current = currentTime;

      const target = targetProgressRef.current;
      let current = currentProgressRef.current;
      let velocity = velocityRef.current;

      // Spring constants tuned for smooth, slow, perceptible travel (550–750ms settling)
      const stiffness = 38; // relaxed stiffness for clearly observable motion
      const damping = 9.8;  // critically damped: zero bounce, fluid glide
      const mass = 1.0;

      const displacement = current - target;
      const springForce = -stiffness * displacement;
      const dampingForce = -damping * velocity;
      const acceleration = (springForce + dampingForce) / mass;

      velocity += acceleration * dt;
      current += velocity * dt;

      // Settle check
      if (Math.abs(current - target) < 0.0008 && Math.abs(velocity) < 0.003) {
        current = target;
        velocity = 0;
        jumpSourceRef.current = null;
        jumpTargetRef.current = null;
      }

      currentProgressRef.current = current;
      velocityRef.current = velocity;

      renderIndicator(current);

      if (Math.abs(current - target) > 0.0004 || Math.abs(velocity) > 0.001) {
        requestAnimationFrame(step);
      } else {
        isAnimatingRef.current = false;
        jumpSourceRef.current = null;
        jumpTargetRef.current = null;
      }
    };

    requestAnimationFrame(step);
  }, [renderIndicator]);

  // Initial layout measurement & font loading listener
  useEffect(() => {
    const initTimer = setTimeout(() => {
      renderIndicator(currentProgressRef.current);
    }, 40);

    if (typeof document !== "undefined" && document.fonts) {
      document.fonts.ready.then(() => {
        renderIndicator(currentProgressRef.current);
      });
    }

    const handleResize = () => {
      renderIndicator(currentProgressRef.current);
    };

    window.addEventListener("resize", handleResize, { passive: true });
    return () => {
      clearTimeout(initTimer);
      window.removeEventListener("resize", handleResize);
    };
  }, [renderIndicator]);

  // Scroll detection to continuously compute raw navigation progress
  useEffect(() => {
    let rafId: number;

    const calculateRawProgress = () => {
      const scrollY = window.scrollY;
      setScrolled(scrollY > 20);

      // If in middle of click smooth scroll, spring loop is handling it
      if (isManualScrollingRef.current) return;

      // Hero / Top of page
      if (scrollY < 180) {
        targetProgressRef.current = 0;
        startAnimationLoop();
        return;
      }

      // Bottom of page: activate last section
      const totalDocHeight = document.documentElement.scrollHeight;
      if (window.innerHeight + scrollY >= totalDocHeight - 70) {
        targetProgressRef.current = NAV_ITEMS.length - 1; // 4.0
        startAnimationLoop();
        return;
      }

      // Section DOM references in physical order
      const sectionElements = [
        document.getElementById("how-it-works"),
        document.getElementById("workflow"),
        document.getElementById("capabilities"),
        document.getElementById("repo-intelligence") || document.getElementById("code-diff"),
        document.getElementById("demo") || document.getElementById("architecture"),
      ];

      // Probe thresholds:
      // exitY: reading line where a section is considered fully active (~38% from top)
      // entryY: entry threshold where incoming section begins transition (~85% from top)
      const exitY = window.innerHeight * 0.38;
      const entryY = window.innerHeight * 0.85;

      let progress = 0;

      for (let i = 0; i < sectionElements.length - 1; i++) {
        const nextEl = sectionElements[i + 1];
        if (!nextEl) continue;

        const nextRect = nextEl.getBoundingClientRect();

        if (nextRect.top > entryY) {
          // Next section hasn't started entering transition zone yet
          break;
        } else if (nextRect.top <= exitY) {
          // Next section has passed the reading probe
          progress = i + 1;
        } else {
          // Transition zone between section i and section i+1
          const t = (entryY - nextRect.top) / (entryY - exitY);
          progress = i + Math.max(0, Math.min(1, t));
          break;
        }
      }

      targetProgressRef.current = progress;
      startAnimationLoop();
    };

    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(calculateRawProgress);
    };

    const onUserInteraction = () => {
      isManualScrollingRef.current = false;
      jumpSourceRef.current = null;
      jumpTargetRef.current = null;
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("wheel", onUserInteraction, { passive: true });
    window.addEventListener("touchmove", onUserInteraction, { passive: true });

    calculateRawProgress();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", onUserInteraction);
      window.removeEventListener("touchmove", onUserInteraction);
      cancelAnimationFrame(rafId);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, [startAnimationLoop]);

  // Heartbeat cycling timer
  useEffect(() => {
    const heartbeatTimer = setInterval(() => {
      setHeartbeatIdx((prev) => (prev + 1) % heartbeatStates.length);
    }, 2800);

    return () => clearInterval(heartbeatTimer);
  }, [heartbeatStates.length]);

  const currentHeartbeat = heartbeatStates[heartbeatIdx];

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (typeof window !== "undefined" && window.location.pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const targetIdx = NAV_ITEMS.findIndex((item) => item.id === id);
    if (targetIdx === -1) return;

    const el = document.getElementById(id);
    if (!el) return;

    // Set jump source and target for smooth elastic travel
    jumpSourceRef.current = currentProgressRef.current;
    jumpTargetRef.current = targetIdx;
    targetProgressRef.current = targetIdx;
    isManualScrollingRef.current = true;

    startAnimationLoop();

    const navOffset = 76;
    const targetTop = el.getBoundingClientRect().top + window.scrollY - navOffset;

    window.scrollTo({
      top: Math.max(0, targetTop),
      behavior: "smooth",
    });

    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      isManualScrollingRef.current = false;
      jumpSourceRef.current = null;
      jumpTargetRef.current = null;
    }, 850);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-apple ${
        scrolled
          ? "bg-[#0A0A0B]/85 backdrop-blur-md border-b border-white/[0.08] py-2 sm:py-2.5 shadow-lg shadow-black/50"
          : "bg-transparent py-4 sm:py-5"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand & System Heartbeat */}
        <div className="flex items-center gap-4">
          <Link
            href="/"
            onClick={handleLogoClick}
            className="flex items-center group relative cursor-pointer select-none logo-hover animate-logo-entrance shrink-0"
            aria-label="LoopForge Home"
          >
            <Image
              src="/loopforge-logo.png"
              alt="LoopForge"
              width={674}
              height={141}
              priority
              className={`object-contain transition-all duration-300 ease-apple ${
                scrolled
                  ? "w-[118px] sm:w-[128px] h-auto"
                  : "w-[134px] sm:w-[145px] h-auto"
              }`}
            />
          </Link>

          {/* System Heartbeat Telemetry */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#111214] border border-white/[0.08] text-[10px] font-mono shadow-sm transition-all">
            <span className={`w-1.5 h-1.5 rounded-full ${currentHeartbeat.dot}`} />
            <span className={currentHeartbeat.color}>{currentHeartbeat.label}</span>
          </div>
        </div>

        {/* Desktop Navigation Links with Elastic Center-Based Morphing Slider */}
        <nav
          ref={navRef}
          className="hidden md:flex items-center gap-8 text-[15px] font-medium tracking-[0.01em] relative py-1"
          aria-label="Primary Landing Navigation"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <a
                key={item.id}
                ref={(el) => {
                  if (el) itemRefs.current.set(item.id, el);
                  else itemRefs.current.delete(item.id);
                }}
                href={`#${item.id}`}
                onClick={(e) => handleNavClick(e, item.id)}
                aria-current={isActive ? "location" : undefined}
                className={`py-1.5 transition-colors duration-200 select-none cursor-pointer ${
                  isActive
                    ? "text-[#F2F2F0]"
                    : "text-[#A6A6A3] hover:text-[#F2F2F0]"
                }`}
              >
                {item.label}
              </a>
            );
          })}

          {/* Single Persistent Elastic Morphing Slider Indicator */}
          <span
            ref={indicatorElRef}
            className="absolute bottom-0 left-0 h-[2px] bg-[#F0A43C] rounded-full pointer-events-none shadow-[0_0_8px_rgba(240,164,60,0.35)] opacity-0"
            style={{
              willChange: "transform, width",
            }}
            aria-hidden="true"
          />
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub Repository"
            className="hidden sm:flex items-center justify-center w-8 h-8 rounded-lg border border-white/[0.08] bg-[#111214] hover:bg-[#181A1D] hover:border-white/[0.14] text-[#A6A6A3] hover:text-[#F2F2F0] transition-colors active:scale-95"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
          </a>

          <Link
            href="/workspace"
            className="flex items-center gap-1.5 bg-[#F0A43C] hover:bg-[#F5B85D] text-[#0A0A0B] font-semibold px-4 py-1.5 rounded-lg text-sm transition-all active:scale-95 shadow-sm group cursor-pointer"
          >
            <span>Start Building</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5] group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Mobile Horizontal Scrollable Navigation Bar with Synchronized Elastic Indicator */}
      <div className="md:hidden border-t border-white/[0.06] mt-2 pt-1 pb-1.5 px-4 overflow-x-auto no-scrollbar">
        <div
          ref={mobileNavRef}
          className="relative inline-flex items-center gap-6 text-[13px] font-medium tracking-[0.01em] min-w-max pb-1"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <a
                key={item.id}
                ref={(el) => {
                  if (el) mobileItemRefs.current.set(item.id, el);
                  else mobileItemRefs.current.delete(item.id);
                }}
                href={`#${item.id}`}
                onClick={(e) => handleNavClick(e, item.id)}
                aria-current={isActive ? "location" : undefined}
                className={`py-1 transition-colors duration-200 select-none whitespace-nowrap ${
                  isActive
                    ? "text-[#F2F2F0]"
                    : "text-[#A6A6A3] hover:text-[#F2F2F0]"
                }`}
              >
                {item.label}
              </a>
            );
          })}

          {/* Mobile Sliding Indicator */}
          <span
            ref={mobileIndicatorElRef}
            className="absolute bottom-0 left-0 h-[2px] bg-[#F0A43C] rounded-full pointer-events-none shadow-[0_0_6px_rgba(240,164,60,0.35)] opacity-0"
            style={{
              willChange: "transform, width",
            }}
            aria-hidden="true"
          />
        </div>
      </div>
    </header>
  );
}
