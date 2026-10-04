"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Project } from "@/types";
import {
  ChevronDown,
  Cpu,
  GitBranch,
  Search,
  ShieldCheck,
  Sparkles,
  Check,
  FolderGit2,
  PanelRightClose,
  PanelRightOpen,
  SidebarClose,
  SidebarOpen,
  Plus,
} from "lucide-react";

interface AppHeaderProps {
  projects: Project[];
  selectedProjectId: string;
  onSelectProject: (id: string) => void;
  selectedModel: string;
  onSelectModel: (model: string) => void;
  isRightPanelOpen: boolean;
  onToggleRightPanel: () => void;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onOpenCommandPalette: () => void;
  modifiedFilesCount?: number;
  activeTaskStatus?: string;
}

export default function AppHeader({
  projects,
  selectedProjectId,
  onSelectProject,
  selectedModel,
  onSelectModel,
  isRightPanelOpen,
  onToggleRightPanel,
  isSidebarOpen,
  onToggleSidebar,
  onOpenCommandPalette,
  modifiedFilesCount = 0,
  activeTaskStatus,
}: AppHeaderProps) {
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [isPermissionsOpen, setIsPermissionsOpen] = useState(false);

  const [popoverPosition, setPopoverPosition] = useState<{ top: number; left: number } | null>(null);
  const projectTriggerRef = useRef<HTMLButtonElement | null>(null);
  const modelTriggerRef = useRef<HTMLButtonElement | null>(null);
  const permissionsTriggerRef = useRef<HTMLButtonElement | null>(null);

  const currentProject = projects.find((p) => p.id === selectedProjectId);

  const calculatePosition = () => {
    if (!projectTriggerRef.current) return { top: 54, left: 12 };
    const rect = projectTriggerRef.current.getBoundingClientRect();
    const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
    if (isMobile) {
      return { top: rect.bottom + 6, left: 12 };
    }
    const sidebarEl = typeof document !== "undefined" ? document.querySelector("aside") : null;
    const sidebarRect = sidebarEl?.getBoundingClientRect();
    const isDesktop = typeof window !== "undefined" && window.innerWidth >= 1024;
    const sidebarRight =
      sidebarRect && sidebarRect.width > 0 && isDesktop && isSidebarOpen
        ? sidebarRect.right
        : isDesktop && isSidebarOpen
        ? 272
        : 0;

    const popoverWidth = 280;
    const minLeft = sidebarRight > 0 ? sidebarRight + 12 : rect.left;
    let left = Math.max(rect.right - 90, minLeft);
    const maxLeft = typeof window !== "undefined" ? window.innerWidth - popoverWidth - 12 : 300;
    left = Math.min(Math.max(12, left), maxLeft);
    const top = rect.bottom + 6;
    return { top, left };
  };

  const handleToggleProjectDropdown = () => {
    if (isProjectDropdownOpen) {
      setIsProjectDropdownOpen(false);
      return;
    }
    const coords = calculatePosition();
    setPopoverPosition(coords);
    setIsProjectDropdownOpen(true);
    setIsModelDropdownOpen(false);
    setIsPermissionsOpen(false);
  };

  useEffect(() => {
    if (!isProjectDropdownOpen) return;

    const updatePosition = () => {
      setPopoverPosition(calculatePosition());
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isProjectDropdownOpen, isSidebarOpen]);

  // Global Escape key handler for popovers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isProjectDropdownOpen) {
          setIsProjectDropdownOpen(false);
          projectTriggerRef.current?.focus();
        } else if (isModelDropdownOpen) {
          setIsModelDropdownOpen(false);
          modelTriggerRef.current?.focus();
        } else if (isPermissionsOpen) {
          setIsPermissionsOpen(false);
          permissionsTriggerRef.current?.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isProjectDropdownOpen, isModelDropdownOpen, isPermissionsOpen]);

  const models = [
    { id: "auto", name: "Auto", desc: "LangGraph autonomous orchestrator" },
    { id: "fast", name: "Fast", desc: "Mistral-7B / Local low latency" },
    { id: "reasoning", name: "Reasoning", desc: "Deep multi-step verification" },
  ];

  const permissions = [
    { label: "Read repository files", status: "Always allowed" },
    { label: "Modify code & files", status: "Always allowed" },
    { label: "Run test runner / pytest", status: "Sandboxed" },
    { label: "Execute bash commands", status: "Sandboxed" },
    { label: "Git commit & push", status: "Ask approval" },
  ];

  return (
    <header className="h-13 border-b border-white/[0.08] bg-[#0A0A0B] px-3.5 sm:px-4 flex items-center justify-between shrink-0 z-30 select-none">
      {/* Left zone: Sidebar toggle + Brand + Project Selector */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 text-[#A6A6A3] hover:text-[#F2F2F0] hover:bg-[#111214] rounded-lg transition-colors cursor-pointer"
          title={isSidebarOpen ? "Collapse sidebar (⌘B)" : "Expand sidebar"}
          aria-label="Toggle sidebar"
        >
          {isSidebarOpen ? (
            <SidebarClose className="w-4 h-4" />
          ) : (
            <SidebarOpen className="w-4 h-4" />
          )}
        </button>

        <Link
          href="/"
          className="flex items-center group transition-all shrink-0 select-none mr-1.5 logo-hover"
          aria-label="LoopForge Home"
          title="LoopForge — Back to Home"
        >
          <img
            src="/loopforge-logo.png"
            alt="LoopForge"
            className="h-6 w-auto object-contain transition-all duration-200 group-hover:opacity-90 group-hover:brightness-105"
            style={{ width: "auto", height: "24px" }}
          />
        </Link>

        <span className="text-white/20 text-xs hidden sm:inline">/</span>

        {/* Project Dropdown */}
        <div className="relative">
          <button
            ref={projectTriggerRef}
            onClick={handleToggleProjectDropdown}
            aria-expanded={isProjectDropdownOpen}
            aria-haspopup="true"
            aria-label="Select active project"
            className={`flex items-center gap-1.5 sm:gap-2 text-xs sm:text-[15px] text-[#F2F2F0] hover:text-white bg-[#111214] hover:bg-[#181A1D] border border-white/[0.08] hover:border-white/[0.14] px-2.5 sm:px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              isProjectDropdownOpen ? "border-[#F0A43C]/40 bg-[#181A1D]" : ""
            }`}
          >
            <FolderGit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#F6D58A] shrink-0" />
            <span className="font-medium max-w-[80px] sm:max-w-[150px] truncate">
              {currentProject ? currentProject.name : "Select Project"}
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-[#8C8C88] transition-transform duration-150 ${
                isProjectDropdownOpen ? "rotate-180 text-[#F0A43C]" : ""
              }`}
            />
          </button>

          {isProjectDropdownOpen && (
            <>
              {/* Outside backdrop for click-outside dismissal */}
              <div
                className="fixed inset-0 z-40 cursor-default"
                onClick={() => setIsProjectDropdownOpen(false)}
                aria-hidden="true"
              />

              {/* Anchor-based Popover shifted into Main Content Area */}
              <div
                role="dialog"
                aria-label="Active Projects"
                className="fixed z-50 w-[calc(100vw-24px)] max-w-xs sm:w-[300px] bg-[#111214] border border-white/[0.12] rounded-xl shadow-2xl py-2 text-sm animate-popover-in backdrop-blur-md"
                style={{
                  top: `${(popoverPosition || calculatePosition()).top}px`,
                  left: `${(popoverPosition || calculatePosition()).left}px`,
                }}
              >
                {/* Header */}
                <div className="px-3.5 py-1.5 text-[13px] uppercase text-[#8C8C88] font-medium tracking-wider flex items-center justify-between border-b border-white/[0.06] mb-1">
                  <span>Active Projects</span>
                  <span className="text-xs text-[#A6A6A3] lowercase">{projects.length} available</span>
                </div>

                {/* Project Items */}
                <div className="max-h-64 overflow-y-auto px-1.5 space-y-0.5">
                  {projects.map((proj) => (
                    <button
                      key={proj.id}
                      onClick={() => {
                        onSelectProject(proj.id);
                        setIsProjectDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between hover:bg-[#181A1D] transition-colors cursor-pointer group ${
                        proj.id === selectedProjectId
                          ? "text-[#F0A43C] font-semibold bg-[#181A1D]/80 border border-[#F0A43C]/20"
                          : "text-[#A6A6A3] hover:text-[#F2F2F0]"
                      }`}
                    >
                      <div className="truncate pr-2">
                        <div className="text-[15px] text-[#F2F2F0] group-hover:text-white flex items-center gap-1.5 font-medium">
                          <span>{proj.name}</span>
                        </div>
                        <div className="text-[13px] text-[#8C8C88] mt-0.5">
                          {proj.language.charAt(0).toUpperCase() + proj.language.slice(1)} &middot; {proj.file_count} files
                        </div>
                      </div>
                      {proj.id === selectedProjectId && (
                        <Check className="w-4 h-4 text-[#F0A43C] shrink-0" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Subtle Divider */}
                <div className="my-1 border-t border-white/[0.06]" />

                {/* Add Project Action */}
                <div className="px-1.5">
                  <button
                    onClick={() => {
                      setIsProjectDropdownOpen(false);
                      onOpenCommandPalette();
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-[#181A1D] text-[#A6A6A3] hover:text-[#F2F2F0] transition-colors text-sm group cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-[#F0A43C] group-hover:scale-110 transition-transform" />
                    <span>Switch or Add Project...</span>
                    <kbd className="ml-auto text-xs text-[#8C8C88] font-mono bg-[#0A0A0B] px-1.5 py-0.5 rounded border border-white/[0.08]">
                      ⌘K
                    </kbd>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Git Branch & Modified Files */}
        <div className="hidden lg:flex items-center gap-2 text-[#A6A6A3] text-sm bg-[#111214] border border-white/[0.08] px-3 py-1 rounded-lg">
          <GitBranch className="w-3.5 h-3.5 text-[#8C8C88]" />
          <span className="font-mono text-xs sm:text-[13px]">main</span>
          {modifiedFilesCount > 0 && (
            <span className="text-[#F0A43C] font-mono text-xs ml-1 bg-[#F0A43C]/10 px-1.5 py-0.2 rounded border border-[#F0A43C]/20">
              +{modifiedFilesCount} files
            </span>
          )}
        </div>
      </div>

      {/* Center zone: Command Palette Trigger */}
      <div className="flex items-center">
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center gap-2.5 text-[#A6A6A3] hover:text-[#F2F2F0] bg-[#111214] hover:bg-[#181A1D] border border-white/[0.08] hover:border-white/[0.14] px-3.5 py-1.5 rounded-lg text-sm sm:text-[15px] transition-colors cursor-pointer"
        >
          <Search className="w-4 h-4 text-[#8C8C88]" />
          <span className="hidden sm:inline text-[#A6A6A3]">Search tasks, files...</span>
          <span className="text-[#F2F2F0] sm:hidden">Search</span>
          <kbd className="hidden sm:inline bg-[#0A0A0B] text-[#8C8C88] border border-white/[0.08] px-1.5 py-0.5 rounded text-xs font-mono">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right zone: Model selector + Permissions + Right Panel Toggle */}
      <div className="flex items-center gap-2.5">
        {/* Model Selector Dropdown */}
        <div className="relative">
          <button
            ref={modelTriggerRef}
            onClick={() => {
              setIsModelDropdownOpen(!isModelDropdownOpen);
              setIsProjectDropdownOpen(false);
              setIsPermissionsOpen(false);
            }}
            aria-expanded={isModelDropdownOpen}
            aria-haspopup="true"
            className="flex items-center gap-2 text-sm sm:text-[15px] text-[#F2F2F0] hover:text-white bg-[#111214] hover:bg-[#181A1D] border border-white/[0.08] hover:border-white/[0.14] px-3 py-1.5 rounded-lg transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#F0A43C]" />
            <span className="capitalize hidden sm:inline">Model: {selectedModel}</span>
            <span className="capitalize sm:hidden">{selectedModel}</span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-[#8C8C88] transition-transform duration-150 ${
                isModelDropdownOpen ? "rotate-180 text-[#F0A43C]" : ""
              }`}
            />
          </button>

          {isModelDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40 cursor-default"
                onClick={() => setIsModelDropdownOpen(false)}
                aria-hidden="true"
              />
              <div className="absolute right-0 mt-2 w-64 bg-[#111214] border border-white/[0.12] rounded-xl shadow-2xl py-2 z-50 text-sm animate-popover-in backdrop-blur-md">
                <div className="px-3 py-1.5 text-[13px] uppercase text-[#8C8C88] font-medium tracking-wider">
                  Model Routing
                </div>
                {models.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      onSelectModel(m.id);
                      setIsModelDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 hover:bg-[#181A1D] transition-colors cursor-pointer ${
                      m.id === selectedModel
                        ? "text-[#F0A43C] font-semibold bg-[#181A1D]/60"
                        : "text-[#A6A6A3]"
                    }`}
                  >
                    <div className="flex items-center justify-between text-sm sm:text-[15px] font-medium">
                      {m.name}
                      {m.id === selectedModel && (
                        <Check className="w-4 h-4 text-[#F0A43C]" />
                      )}
                    </div>
                    <div className="text-[13px] text-[#8C8C88] mt-0.5">{m.desc}</div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Permissions Popover */}
        <div className="relative hidden md:block">
          <button
            ref={permissionsTriggerRef}
            onClick={() => {
              setIsPermissionsOpen(!isPermissionsOpen);
              setIsProjectDropdownOpen(false);
              setIsModelDropdownOpen(false);
            }}
            aria-expanded={isPermissionsOpen}
            aria-haspopup="true"
            className="flex items-center gap-1.5 text-sm sm:text-[15px] text-[#A6A6A3] hover:text-[#F2F2F0] bg-[#111214] hover:bg-[#181A1D] border border-white/[0.08] px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            title="Agent Sandbox & Execution Permissions"
          >
            <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
            <span className="hidden xl:inline">Permissions</span>
          </button>

          {isPermissionsOpen && (
            <>
              <div
                className="fixed inset-0 z-40 cursor-default"
                onClick={() => setIsPermissionsOpen(false)}
                aria-hidden="true"
              />
              <div className="absolute right-0 mt-2 w-72 bg-[#111214] border border-white/[0.12] rounded-xl shadow-2xl p-3.5 z-50 text-sm animate-popover-in backdrop-blur-md">
                <div className="font-semibold text-[#F2F2F0] mb-1 flex items-center justify-between text-sm sm:text-[15px]">
                  <span>Agent Permissions</span>
                  <span className="text-xs text-[#22C55E] font-medium">Enforced</span>
                </div>
                <p className="text-[13px] text-[#A6A6A3] mb-3 leading-relaxed">
                  Subprocess sandboxing isolates code execution and tests.
                </p>
                <div className="space-y-2 border-t border-white/[0.08] pt-2.5">
                  {permissions.map((p, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-[13px] sm:text-sm text-[#F2F2F0]"
                    >
                      <span>{p.label}</span>
                      <span className="text-[#8C8C88] text-xs bg-[#0A0A0B] px-2 py-0.5 rounded border border-white/[0.06]">
                        {p.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right Panel Toggle Button */}
        <button
          onClick={onToggleRightPanel}
          className={`p-2 rounded-lg transition-colors cursor-pointer ${
            isRightPanelOpen
              ? "text-[#F0A43C] bg-[#181A1D] border border-[#F0A43C]/30"
              : "text-[#A6A6A3] hover:text-[#F2F2F0] hover:bg-[#111214] border border-transparent"
          }`}
          title={isRightPanelOpen ? "Hide Agent Panel" : "Show Agent Panel"}
          aria-label="Toggle agent panel"
        >
          {isRightPanelOpen ? (
            <PanelRightClose className="w-4 h-4" />
          ) : (
            <PanelRightOpen className="w-4 h-4" />
          )}
        </button>
      </div>
    </header>
  );
}
