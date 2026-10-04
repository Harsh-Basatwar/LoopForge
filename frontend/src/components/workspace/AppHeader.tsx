"use client";

import React, { useState } from "react";
import Link from "next/link";
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

  const currentProject = projects.find((p) => p.id === selectedProjectId);

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
    <header className="h-12 border-b border-white/[0.08] bg-[#0A0A0B] px-3.5 flex items-center justify-between shrink-0 z-30 select-none">
      {/* Left zone: Sidebar toggle + Brand + Project Selector */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 text-[#A6A6A3] hover:text-[#F2F2F0] hover:bg-[#111214] rounded-md transition-colors"
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
          className="flex items-center gap-2 group text-[#F2F2F0] hover:text-white transition-colors"
        >
          <div className="w-5 h-5 rounded-[5px] bg-gradient-to-br from-[#F0A43C] to-[#EF4444] flex items-center justify-center shadow-xs">
            <Cpu className="w-3.2 h-3.2 text-[#0A0A0B] stroke-[2.5]" />
          </div>
          <span className="font-medium text-xs tracking-tight text-[#F2F2F0] hidden md:inline">
            AI Engineering Assistant
          </span>
        </Link>

        <span className="text-white/20 font-mono text-xs hidden sm:inline">/</span>

        {/* Project Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setIsProjectDropdownOpen(!isProjectDropdownOpen);
              setIsModelDropdownOpen(false);
              setIsPermissionsOpen(false);
            }}
            className="flex items-center gap-1.5 text-xs text-[#F2F2F0] hover:text-white bg-[#111214] hover:bg-[#181A1D] border border-white/[0.08] hover:border-white/[0.14] px-2.5 py-1 rounded-md transition-all font-mono"
          >
            <FolderGit2 className="w-3.5 h-3.5 text-[#F6D58A]" />
            <span className="font-medium max-w-[130px] truncate">
              {currentProject ? currentProject.name : "Select Project"}
            </span>
            <ChevronDown className="w-3 h-3 text-[#6B6B6B]" />
          </button>

          {isProjectDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsProjectDropdownOpen(false)}
              />
              <div className="absolute left-0 mt-1.5 w-60 bg-[#111214] border border-white/[0.12] rounded-lg shadow-2xl py-1.5 z-50 text-xs">
                <div className="px-2.5 py-1 text-[10px] font-mono uppercase text-[#6B6B6B] tracking-wider">
                  Active Projects
                </div>
                {projects.map((proj) => (
                  <button
                    key={proj.id}
                    onClick={() => {
                      onSelectProject(proj.id);
                      setIsProjectDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-[#181A1D] transition-colors ${
                      proj.id === selectedProjectId
                        ? "text-[#F0A43C] font-medium bg-[#181A1D]/60"
                        : "text-[#A6A6A3]"
                    }`}
                  >
                    <div className="truncate">
                      <div className="font-mono">{proj.name}</div>
                      <div className="text-[10px] text-[#6B6B6B] font-mono">
                        {proj.language} &middot; {proj.file_count} files
                      </div>
                    </div>
                    {proj.id === selectedProjectId && (
                      <Check className="w-3.5 h-3.5 text-[#F0A43C] shrink-0 ml-2" />
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Git Branch & Modified Files */}
        <div className="hidden lg:flex items-center gap-1.5 text-[#A6A6A3] text-xs font-mono bg-[#111214] border border-white/[0.08] px-2 py-0.5 rounded-md">
          <GitBranch className="w-3.5 h-3.5 text-[#6B6B6B]" />
          <span>main</span>
          {modifiedFilesCount > 0 && (
            <span className="text-[#F0A43C] font-mono text-[11px] ml-1 bg-[#F0A43C]/10 px-1 rounded border border-[#F0A43C]/20">
              +{modifiedFilesCount} files
            </span>
          )}
        </div>
      </div>

      {/* Center zone: Command Palette Trigger */}
      <div className="flex items-center">
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center gap-2 text-[#A6A6A3] hover:text-[#F2F2F0] bg-[#111214] hover:bg-[#181A1D] border border-white/[0.08] hover:border-white/[0.14] px-3 py-1 rounded-md text-xs transition-colors font-mono"
        >
          <Search className="w-3.5 h-3.5 text-[#6B6B6B]" />
          <span className="hidden sm:inline text-[#A6A6A3]">Search tasks, files...</span>
          <span className="text-[#F2F2F0] sm:hidden">Search</span>
          <kbd className="hidden sm:inline bg-[#0A0A0B] text-[#6B6B6B] border border-white/[0.08] px-1 rounded text-[10px]">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right zone: Model selector + Permissions + Right Panel Toggle */}
      <div className="flex items-center gap-2.5">
        {/* Model Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setIsModelDropdownOpen(!isModelDropdownOpen);
              setIsProjectDropdownOpen(false);
              setIsPermissionsOpen(false);
            }}
            className="flex items-center gap-1.5 text-xs text-[#F2F2F0] hover:text-white bg-[#111214] hover:bg-[#181A1D] border border-white/[0.08] hover:border-white/[0.14] px-2.5 py-1 rounded-md transition-all font-mono"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#F0A43C]" />
            <span className="capitalize hidden sm:inline">Model: {selectedModel}</span>
            <span className="capitalize sm:hidden">{selectedModel}</span>
            <ChevronDown className="w-3 h-3 text-[#6B6B6B]" />
          </button>

          {isModelDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsModelDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-1.5 w-56 bg-[#111214] border border-white/[0.12] rounded-lg shadow-2xl py-1.5 z-50 text-xs">
                <div className="px-2.5 py-1 text-[10px] font-mono uppercase text-[#6B6B6B] tracking-wider">
                  Model Routing
                </div>
                {models.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      onSelectModel(m.id);
                      setIsModelDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 hover:bg-[#181A1D] transition-colors ${
                      m.id === selectedModel
                        ? "text-[#F0A43C] font-medium bg-[#181A1D]/60"
                        : "text-[#A6A6A3]"
                    }`}
                  >
                    <div className="font-mono flex items-center justify-between">
                      {m.name}
                      {m.id === selectedModel && (
                        <Check className="w-3.5 h-3.5 text-[#F0A43C]" />
                      )}
                    </div>
                    <div className="text-[10px] text-[#6B6B6B] mt-0.5">{m.desc}</div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Permissions Popover */}
        <div className="relative hidden md:block">
          <button
            onClick={() => {
              setIsPermissionsOpen(!isPermissionsOpen);
              setIsProjectDropdownOpen(false);
              setIsModelDropdownOpen(false);
            }}
            className="flex items-center gap-1.5 text-xs text-[#A6A6A3] hover:text-[#F2F2F0] bg-[#111214] hover:bg-[#181A1D] border border-white/[0.08] px-2 py-1 rounded-md transition-colors"
            title="Agent Sandbox & Execution Permissions"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#22C55E]" />
            <span className="text-[11px] font-mono hidden xl:inline">Permissions</span>
          </button>

          {isPermissionsOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsPermissionsOpen(false)}
              />
              <div className="absolute right-0 mt-1.5 w-64 bg-[#111214] border border-white/[0.12] rounded-lg shadow-2xl p-2.5 z-50 text-xs">
                <div className="font-medium text-[#F2F2F0] mb-1 flex items-center justify-between">
                  <span>Agent Permissions</span>
                  <span className="text-[10px] text-[#22C55E] font-mono">Enforced</span>
                </div>
                <p className="text-[11px] text-[#A6A6A3] mb-2">
                  Subprocess sandboxing isolates code execution and tests.
                </p>
                <div className="space-y-1.5 border-t border-white/[0.08] pt-2">
                  {permissions.map((p, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-[11px] font-mono text-[#F2F2F0]"
                    >
                      <span>{p.label}</span>
                      <span className="text-[#6B6B6B] text-[10px] bg-[#0A0A0B] px-1.5 py-0.5 rounded border border-white/[0.06]">
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
          className={`p-1.5 rounded-md transition-colors ${
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
