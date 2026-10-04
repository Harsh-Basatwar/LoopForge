"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import LandingNavbar from "@/components/landing/LandingNavbar";
import CustomCursor from "@/components/landing/CustomCursor";
import AgentBackground from "@/components/background/AgentBackground";
import HeroProductVisualization from "@/components/landing/HeroProductVisualization";
import ProductStatement from "@/components/landing/ProductStatement";
import WorkflowSection from "@/components/landing/WorkflowSection";
import RepoIntelligenceSection from "@/components/landing/RepoIntelligenceSection";
import CodeDiffSection from "@/components/landing/CodeDiffSection";
import SelfCorrectionSection from "@/components/landing/SelfCorrectionSection";
import NotJustAChatbot from "@/components/landing/NotJustAChatbot";
import ArchitectureVisual from "@/components/landing/ArchitectureVisual";
import Capabilities from "@/components/landing/Capabilities";
import InteractiveDemo from "@/components/landing/InteractiveDemo";
import TechnicalCredibility from "@/components/landing/TechnicalCredibility";
import TerminalLog from "@/components/landing/TerminalLog";
import FinalCTA from "@/components/landing/FinalCTA";
import Footer from "@/components/landing/Footer";

export default function LandingPage() {
  const [btnOffset, setBtnOffset] = useState({ x: 0, y: 0 });
  const [heroScrollScale, setHeroScrollScale] = useState(1);

  // Subtle scroll-driven hero receding
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      if (scrollY < 600) {
        // Subtle scale 1.0 down to 0.96 as you scroll down
        const scale = 1 - (scrollY / 600) * 0.04;
        setHeroScrollScale(Math.max(0.96, scale));
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Magnetic CTA button hover
  const handleBtnMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - (rect.left + rect.width / 2)) * 0.22;
    const y = (e.clientY - (rect.top + rect.height / 2)) * 0.22;
    setBtnOffset({ x, y });
  };

  const handleBtnMouseLeave = () => {
    setBtnOffset({ x: 0, y: 0 });
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-[#F2F2F0] flex flex-col font-sans selection:bg-[#F0A43C]/25 selection:text-[#F6D58A] relative">
      {/* Living Software Engineering Atmosphere Background */}
      <AgentBackground />

      {/* Interactive Desktop Cursor */}
      <CustomCursor />

      {/* 01. Navigation Header */}
      <LandingNavbar />

      {/* 02. Hero Section */}
      <section className="relative pt-28 sm:pt-36 pb-20 border-b border-white/[0.08] overflow-hidden">
        {/* Subtle, restrained ambient light with slow animated drift */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(240,164,60,0.06),rgba(10,10,11,0))] pointer-events-none animate-ambient-drift" />

        <div
          className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 transition-transform duration-150 ease-out"
          style={{ transform: `scale(${heroScrollScale})` }}
        >
          {/* Editorial Headline with Cormorant Garamond Display & Line-by-Line Reveal */}
          <h1 className="font-serif font-semibold sm:font-bold text-5xl sm:text-7xl md:text-8xl lg:text-[90px] xl:text-[96px] tracking-[-0.01em] text-[#F2F2F0] max-w-4xl mx-auto leading-[1.02] select-none">
            <span className="block animate-reveal-1">SHIP SOFTWARE</span>
            <span className="block animate-reveal-2">WITH AN AGENT</span>
            <span className="block animate-reveal-3">THAT CHECKS ITS WORK.</span>
          </h1>

          {/* Subtitle */}
          <p className="mt-7 text-base sm:text-xl text-[#A6A6A3] max-w-2xl mx-auto leading-relaxed font-sans animate-reveal-subtitle">
            Plan, analyze, implement, test, debug, and refine software tasks through an autonomous
            LangGraph workflow.
          </p>

          {/* Hero CTAs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 animate-reveal-hero-cta">
            <Link
              href="/workspace"
              onMouseMove={handleBtnMouseMove}
              onMouseLeave={handleBtnMouseLeave}
              style={{
                transform: `translate(${btnOffset.x}px, ${btnOffset.y}px)`,
              }}
              className="flex items-center gap-2 bg-[#F0A43C] hover:bg-[#F5B85D] text-[#0A0A0B] font-bold px-7 py-3 rounded-xl text-sm transition-all shadow-md active:scale-95 cursor-pointer group"
            >
              <span>START BUILDING</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5] group-hover:translate-x-1 transition-transform" />
            </Link>

            <a
              href="#workflow"
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-[#F2F2F0] hover:text-white bg-[#111214] hover:bg-[#181A1D] border border-white/[0.08] font-medium text-sm transition-all cursor-pointer"
            >
              <span>EXPLORE THE WORKFLOW</span>
            </a>
          </div>

          {/* 03. Main Hero Asset: Live Miniature Workspace Simulation */}
          <div className="mt-14 animate-reveal-hero-viz">
            <HeroProductVisualization />
          </div>
        </div>
      </section>

      {/* 04. Product Statement: "It doesn't just generate code. It checks the result." */}
      <ProductStatement />

      {/* 05. Workflow Story: "From task to verified implementation" */}
      <WorkflowSection />

      {/* 06. Repository Intelligence: "It understands the codebase before it changes it." */}
      <RepoIntelligenceSection />

      {/* 07. Code Generation & Diff Interaction: "Then it writes the change and runs the tests." */}
      <CodeDiffSection />

      {/* 08. Self-Correction & Loop Visualization: "When something breaks, it doesn't stop." */}
      <SelfCorrectionSection />

      {/* 09. "Not Just a Chatbot" Architectural Reveal */}
      <NotJustAChatbot />

      {/* 10. Interactive Product Demo: "Try the workflow" with 5 selectable tasks */}
      <InteractiveDemo />

      {/* 11. Technical Architecture & Stateful LangGraph Flow */}
      <ArchitectureVisual />

      {/* 12. Pinned Scroll-Driven Workflow Story (Capabilities) */}
      <Capabilities />

      {/* 13. Technical Credibility & Stack Badges */}
      <TechnicalCredibility />

      {/* 14. Terminal Execution Log Micro-Interaction */}
      <TerminalLog />

      {/* 15. Final Call to Action */}
      <FinalCTA />

      {/* 16. Minimalist Engineering Footer */}
      <Footer />
    </div>
  );
}
