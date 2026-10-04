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

// Sections mapped to their corresponding nav item
const SECTION_MAPPINGS: { elementId: string; navId: string }[] = [
  { elementId: "how-it-works", navId: "how-it-works" },
  { elementId: "workflow", navId: "workflow" },
  { elementId: "capabilities", navId: "capabilities" },
  { elementId: "repo-intelligence", navId: "code-diff" },
  { elementId: "code-diff", navId: "code-diff" },
  { elementId: "self-correction", navId: "code-diff" },
  { elementId: "not-just-a-chatbot", navId: "architecture" },
  { elementId: "demo", navId: "architecture" },
  { elementId: "architecture", navId: "architecture" },
  { elementId: "technical-credibility", navId: "architecture" },
];

export default function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("how-it-works");
  const [heartbeatIdx, setHeartbeatIdx] = useState(0);

  // Indicator measurement state (desktop)
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });
  const [isReady, setIsReady] = useState(false);

  // Indicator measurement state (mobile)
  const [mobileIndicatorStyle, setMobileIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });

  const navRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<Map<string, HTMLAnchorElement>>(new Map());

  const mobileNavRef = useRef<HTMLDivElement>(null);
  const mobileItemRefs = useRef<Map<string, HTMLAnchorElement>>(new Map());

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

  // Update physical indicator position for both desktop and mobile
  const updateIndicator = useCallback(() => {
    // Desktop measurement
    const navEl = navRef.current;
    const activeEl = itemRefs.current.get(activeSection);
    if (navEl && activeEl) {
      const navRect = navEl.getBoundingClientRect();
      const activeRect = activeEl.getBoundingClientRect();
      const left = activeRect.left - navRect.left;
      const width = activeRect.width;
      setIndicatorStyle({ left, width, opacity: 1 });
    }

    // Mobile measurement
    const mobileNavEl = mobileNavRef.current;
    const mobileActiveEl = mobileItemRefs.current.get(activeSection);
    if (mobileNavEl && mobileActiveEl) {
      const mobileNavRect = mobileNavEl.getBoundingClientRect();
      const mobileActiveRect = mobileActiveEl.getBoundingClientRect();
      const left = mobileActiveRect.left - mobileNavRect.left + mobileNavEl.scrollLeft;
      const width = mobileActiveRect.width;
      setMobileIndicatorStyle({ left, width, opacity: 1 });

      // Ensure active item is visible in mobile scroll view
      if (!isManualScrollingRef.current) {
        mobileActiveEl.scrollIntoView({
          behavior: "smooth",
          inline: "nearest",
          block: "nearest",
        });
      }
    }
  }, [activeSection]);

  // Recalculate indicator on active section change, resize, and font load
  useEffect(() => {
    updateIndicator();

    if (!isReady) {
      const timer = setTimeout(() => {
        updateIndicator();
        setIsReady(true);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [activeSection, updateIndicator, isReady]);

  // Font loading listener to ensure metrics are exact
  useEffect(() => {
    if (typeof document !== "undefined" && document.fonts) {
      document.fonts.ready.then(() => {
        updateIndicator();
        setIsReady(true);
      });
    }

    const handleResize = () => {
      updateIndicator();
    };

    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, [updateIndicator]);

  // Scroll detection to determine active section
  useEffect(() => {
    let rafId: number;

    const determineActiveSection = () => {
      const scrollY = window.scrollY;
      setScrolled(scrollY > 20);

      // If manual smooth scrolling via click, do not override
      if (isManualScrollingRef.current) return;

      // Hero / Top of page
      if (scrollY < 240) {
        setActiveSection("how-it-works");
        return;
      }

      // Bottom of page: activate last section
      const totalDocHeight = document.documentElement.scrollHeight;
      if (window.innerHeight + scrollY >= totalDocHeight - 70) {
        setActiveSection("architecture");
        return;
      }

      // Probe line located in upper third of viewport (~38% down)
      const probeY = window.innerHeight * 0.38;

      let detectedSection: string | null = null;

      // Scan sections in reverse to find the latest section whose top has crossed the reading probe
      for (const mapping of SECTION_MAPPINGS) {
        const el = document.getElementById(mapping.elementId);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= probeY) {
            detectedSection = mapping.navId;
          }
        }
      }

      if (detectedSection) {
        setActiveSection(detectedSection);
      }
    };

    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(determineActiveSection);
    };

    // Release manual scroll lock on user wheel or touch interaction
    const onUserInteraction = () => {
      isManualScrollingRef.current = false;
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("wheel", onUserInteraction, { passive: true });
    window.addEventListener("touchmove", onUserInteraction, { passive: true });

    // Initial check
    determineActiveSection();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", onUserInteraction);
      window.removeEventListener("touchmove", onUserInteraction);
      cancelAnimationFrame(rafId);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

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
    const el = document.getElementById(id);
    if (!el) return;

    // Immediately update active state & move indicator smoothly
    setActiveSection(id);
    isManualScrollingRef.current = true;

    const navOffset = 76;
    const targetTop = el.getBoundingClientRect().top + window.scrollY - navOffset;

    window.scrollTo({
      top: Math.max(0, targetTop),
      behavior: "smooth",
    });

    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      isManualScrollingRef.current = false;
    }, 750);
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

        {/* Desktop Navigation Links with Scroll-Synchronized Physical Slider */}
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

          {/* Single Persistent Physical Sliding Underline Indicator */}
          <span
            className="absolute bottom-0 left-0 h-[2px] bg-[#F0A43C] rounded-full pointer-events-none shadow-[0_0_8px_rgba(240,164,60,0.35)]"
            style={{
              transform: `translateX(${indicatorStyle.left}px)`,
              width: `${indicatorStyle.width}px`,
              opacity: indicatorStyle.opacity,
              transition: isReady
                ? "transform 320ms cubic-bezier(0.16, 1, 0.3, 1), width 320ms cubic-bezier(0.16, 1, 0.3, 1), opacity 200ms ease"
                : "opacity 200ms ease",
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

      {/* Mobile Horizontal Scrollable Navigation Bar with Synchronized Indicator */}
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
            className="absolute bottom-0 left-0 h-[2px] bg-[#F0A43C] rounded-full pointer-events-none shadow-[0_0_6px_rgba(240,164,60,0.35)]"
            style={{
              transform: `translateX(${mobileIndicatorStyle.left}px)`,
              width: `${mobileIndicatorStyle.width}px`,
              opacity: mobileIndicatorStyle.opacity,
              transition: isReady
                ? "transform 300ms cubic-bezier(0.16, 1, 0.3, 1), width 300ms cubic-bezier(0.16, 1, 0.3, 1), opacity 200ms ease"
                : "opacity 200ms ease",
            }}
            aria-hidden="true"
          />
        </div>
      </div>
    </header>
  );
}
