"use client";

import React, { useState, useEffect } from "react";
import { Project, Task, FileNode } from "@/types";
import {
  Search,
  Plus,
  FileCode,
  CheckCircle2,
  Terminal,
  FileDiff,
  Activity,
  ArrowRight,
} from "lucide-react";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  tasks: Task[];
  fileTree: FileNode[];
  onSelectProject: (id: string) => void;
  onSelectTask: (task: Task) => void;
  onSelectFile: (path: string) => void;
  onNewTask: () => void;
  onTriggerTab: (tab: "agent" | "diff" | "tests" | "files") => void;
}

export default function CommandPalette({
  isOpen,
  onClose,
  projects,
  tasks,
  fileTree,
  onSelectProject,
  onSelectTask,
  onSelectFile,
  onNewTask,
  onTriggerTab,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");

  // Close on Escape or open on ⌘K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
      } else if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Filter actions
  const defaultActions = [
    {
      id: "action-new-task",
      title: "New Task",
      subtitle: "Start a new autonomous engineering delegation",
      icon: <Plus className="w-4 h-4 text-[#F0A43C]" />,
      action: () => {
        onNewTask();
        onClose();
      },
    },
    {
      id: "action-view-diff",
      title: "Review Changes",
      subtitle: "Open diff viewer in the right artifact panel",
      icon: <FileDiff className="w-4 h-4 text-[#F0A43C]" />,
      action: () => {
        onTriggerTab("diff");
        onClose();
      },
    },
    {
      id: "action-view-tests",
      title: "View Test Results",
      subtitle: "Inspect pytest assertions and sandbox output",
      icon: <Terminal className="w-4 h-4 text-[#22C55E]" />,
      action: () => {
        onTriggerTab("tests");
        onClose();
      },
    },
    {
      id: "action-view-agent",
      title: "Agent Execution State",
      subtitle: "View LangGraph workflow progression & logs",
      icon: <Activity className="w-4 h-4 text-[#F6D58A]" />,
      action: () => {
        onTriggerTab("agent");
        onClose();
      },
    },
  ];

  const filteredActions = defaultActions.filter(
    (a) =>
      a.title.toLowerCase().includes(query.toLowerCase()) ||
      a.subtitle.toLowerCase().includes(query.toLowerCase())
  );

  const filteredTasks = tasks
    .filter((t) => t.title.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 4);

  const filteredFiles = fileTree
    .filter(
      (f) => !f.is_dir && f.path.toLowerCase().includes(query.toLowerCase())
    )
    .slice(0, 5);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/70 backdrop-blur-xs select-none">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-2xl bg-[#111214] border border-white/[0.12] rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-white/[0.08]">
          <Search className="w-5 h-5 text-[#8C8C88] mr-3 shrink-0" />
          <input
            type="text"
            placeholder="Type a command or search tasks and files..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-[#F2F2F0] placeholder-[#8C8C88] text-base sm:text-[17px] focus:outline-none"
            autoFocus
          />
          <kbd className="text-xs text-[#8C8C88] font-mono bg-[#0A0A0B] px-2 py-0.5 rounded border border-white/[0.08]">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2.5 space-y-4 text-sm">
          {/* Quick Actions */}
          {filteredActions.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[13px] uppercase tracking-wider text-[#8C8C88] font-semibold">
                Actions
              </div>
              <div className="space-y-1">
                {filteredActions.map((act) => (
                  <button
                    key={act.id}
                    onClick={act.action}
                    className="w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-3 hover:bg-[#181A1D] text-[#A6A6A3] hover:text-[#F2F2F0] transition-colors group cursor-pointer"
                  >
                    <div className="shrink-0">{act.icon}</div>
                    <div className="flex-1 truncate">
                      <div className="font-medium text-[#F2F2F0] text-[15px] sm:text-base">{act.title}</div>
                      <div className="text-[13px] text-[#8C8C88]">
                        {act.subtitle}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#8C8C88] group-hover:text-[#F0A43C] group-hover:translate-x-0.5 transition-all shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tasks */}
          {filteredTasks.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[13px] uppercase tracking-wider text-[#8C8C88] font-semibold">
                Tasks
              </div>
              <div className="space-y-1">
                {filteredTasks.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      onSelectTask(t);
                      onClose();
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-3 hover:bg-[#181A1D] text-[#A6A6A3] hover:text-[#F2F2F0] transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#8C8C88] shrink-0" />
                    <div className="flex-1 truncate">
                      <div className="font-medium truncate text-[#F2F2F0] text-[15px] sm:text-base">{t.title}</div>
                      <div className="text-[13px] text-[#8C8C88]">
                        {t.status.replace(/_/g, " ")} &middot; {t.iteration} iter
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Repository Files */}
          {filteredFiles.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[13px] uppercase tracking-wider text-[#8C8C88] font-semibold">
                Repository Files
              </div>
              <div className="space-y-1">
                {filteredFiles.map((f) => (
                  <button
                    key={f.path}
                    onClick={() => {
                      onSelectFile(f.path);
                      onTriggerTab("files");
                      onClose();
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl flex items-center gap-3 hover:bg-[#181A1D] text-[#A6A6A3] hover:text-[#F0A43C] transition-colors text-sm cursor-pointer"
                  >
                    <FileCode className="w-4 h-4 text-[#8C8C88] shrink-0" />
                    <span className="truncate font-mono text-xs sm:text-[13px]">{f.path}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredActions.length === 0 &&
            filteredTasks.length === 0 &&
            filteredFiles.length === 0 && (
              <div className="py-8 text-center text-[#8C8C88] text-sm">
                No matching actions, tasks, or files for &quot;{query}&quot;
              </div>
            )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-white/[0.08] bg-[#0A0A0B] flex items-center justify-between text-xs sm:text-[13px] text-[#8C8C88]">
          <span>Navigate with arrows &middot; Enter to run</span>
          <span>LoopForge &middot; Autonomous Agent</span>
        </div>
      </div>
    </div>
  );
}
