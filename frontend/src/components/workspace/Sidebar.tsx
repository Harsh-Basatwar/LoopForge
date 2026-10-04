"use client";

import React, { useState } from "react";
import { Project, Task, FileNode } from "@/types";
import {
  Plus,
  FolderGit2,
  FileCode,
  Folder,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

interface SidebarProps {
  projects: Project[];
  selectedProjectId: string;
  onSelectProject: (id: string) => void;
  tasks: Task[];
  activeTaskId?: string;
  onSelectTask: (task: Task) => void;
  onNewTask: () => void;
  fileTree: FileNode[];
  selectedFilePath: string;
  onSelectFile: (path: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({
  projects,
  selectedProjectId,
  onSelectProject,
  tasks,
  activeTaskId,
  onSelectTask,
  onNewTask,
  fileTree,
  selectedFilePath,
  onSelectFile,
  isOpen,
  onClose,
}: SidebarProps) {
  const [isFilesExpanded, setIsFilesExpanded] = useState(true);
  const currentProject = projects.find((p) => p.id === selectedProjectId);

  // Group tasks into Today vs Earlier
  const today = new Date().toDateString();
  const todayTasks: Task[] = [];
  const earlierTasks: Task[] = [];

  tasks.forEach((t) => {
    const taskDate = new Date(t.created_at).toDateString();
    if (taskDate === today) {
      todayTasks.push(t);
    } else {
      earlierTasks.push(t);
    }
  });

  const getStatusBadge = (status: Task["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E] shrink-0" />;
      case "failed":
        return <AlertCircle className="w-3.5 h-3.5 text-[#EF4444] shrink-0" />;
      case "awaiting_approval":
      case "awaiting_plan_approval":
        return (
          <span className="w-2 h-2 rounded-full bg-[#F6D58A] animate-pulse shrink-0" />
        );
      default:
        return (
          <span className="w-2 h-2 rounded-full bg-[#F0A43C] animate-pulse shrink-0" />
        );
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-xs"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-40 w-64 md:w-68 bg-[#0A0A0B] border-r border-white/[0.08] flex flex-col transition-transform duration-200 select-none ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:hidden"
        }`}
      >
        {/* Top Action: New Task */}
        <div className="p-3.5 border-b border-white/[0.08]">
          <button
            onClick={() => {
              onNewTask();
              if (window.innerWidth < 1024) onClose();
            }}
            className="w-full flex items-center justify-center gap-2.5 bg-[#111214] hover:bg-[#181A1D] text-[#F2F2F0] hover:text-white border border-white/[0.08] hover:border-white/[0.14] py-2.5 px-3.5 rounded-lg text-sm sm:text-[15px] font-medium transition-all shadow-xs group cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#F0A43C] group-hover:scale-110 transition-transform" />
            <span>New Task</span>
            <kbd className="ml-auto text-xs text-[#8C8C88] font-mono bg-[#0A0A0B] px-1.5 py-0.5 rounded border border-white/[0.08]">
              ⌘N
            </kbd>
          </button>
        </div>

        {/* Scrollable Navigation Body */}
        <div className="flex-1 overflow-y-auto px-2.5 py-4 space-y-6 text-sm">
          {/* Active Project Section */}
          <div>
            <div className="px-2 text-[13px] uppercase tracking-wider text-[#8C8C88] font-medium mb-2 flex items-center justify-between">
              <span>Project</span>
              <span className="text-[13px] text-[#A6A6A3] capitalize">
                {currentProject?.language}
              </span>
            </div>

            <div className="bg-[#111214] border border-white/[0.08] rounded-xl p-3">
              <div className="text-[#F2F2F0] text-base sm:text-[17px] font-semibold truncate flex items-center gap-2">
                <FolderGit2 className="w-4 h-4 text-[#F6D58A] shrink-0" />
                <span className="truncate">{currentProject?.name || "No Project"}</span>
              </div>
              <div className="mt-1.5 flex items-center justify-between text-[13px] text-[#8C8C88]">
                <span>{fileTree.length} files detected</span>
                <span>{tasks.length} tasks</span>
              </div>
            </div>
          </div>

          {/* Repository Files Accordion */}
          <div>
            <button
              onClick={() => setIsFilesExpanded(!isFilesExpanded)}
              className="w-full flex items-center justify-between px-2 text-[13px] uppercase tracking-wider text-[#8C8C88] font-medium hover:text-[#A6A6A3] transition-colors mb-2 cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                {isFilesExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5 text-[#8C8C88]" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-[#8C8C88]" />
                )}
                <span>Repository Files</span>
              </span>
              <span className="text-[13px] text-[#8C8C88]">{fileTree.length}</span>
            </button>

            {isFilesExpanded && (
              <div className="bg-[#0D0E10] border border-white/[0.06] rounded-xl p-2 max-h-52 overflow-y-auto space-y-0.5">
                {fileTree.length === 0 ? (
                  <div className="text-[#8C8C88] text-sm px-2 py-1.5 italic">
                    Loading file tree...
                  </div>
                ) : (
                  fileTree.map((node) => (
                    <button
                      key={node.path}
                      onClick={() => {
                        onSelectFile(node.path);
                        if (window.innerWidth < 1024) onClose();
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 text-sm sm:text-[15px] truncate transition-colors cursor-pointer ${
                        selectedFilePath === node.path
                          ? "bg-[#F0A43C]/10 text-[#F0A43C] font-semibold border border-[#F0A43C]/30"
                          : "text-[#A6A6A3] hover:text-[#F2F2F0] hover:bg-[#111214]"
                      }`}
                    >
                      {node.is_dir ? (
                        <Folder className="w-3.5 h-3.5 text-[#F6D58A]/80 shrink-0" />
                      ) : (
                        <FileCode className="w-3.5 h-3.5 text-[#8C8C88] shrink-0" />
                      )}
                      <span className="truncate font-mono text-[13px]">{node.path}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Recent Tasks List */}
          <div>
            <div className="px-2 text-[13px] uppercase tracking-wider text-[#8C8C88] font-medium mb-2.5">
              Recent Tasks
            </div>

            {tasks.length === 0 ? (
              <div className="px-2 py-4 text-center text-[#8C8C88] text-sm italic">
                No recent tasks yet
              </div>
            ) : (
              <div className="space-y-4">
                {todayTasks.length > 0 && (
                  <div>
                    <div className="px-2 text-xs uppercase tracking-wider text-[#8C8C88] font-medium mb-1.5">
                      Today
                    </div>
                    <div className="space-y-1">
                      {todayTasks.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => {
                            onSelectTask(t);
                            if (window.innerWidth < 1024) onClose();
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg flex items-start gap-2.5 transition-all cursor-pointer ${
                            activeTaskId === t.id
                              ? "bg-[#181A1D] text-[#F2F2F0] border border-white/[0.12]"
                              : "text-[#A6A6A3] hover:text-[#F2F2F0] hover:bg-[#111214] border border-transparent"
                          }`}
                        >
                          <div className="mt-1">{getStatusBadge(t.status)}</div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[15px] sm:text-base truncate font-medium">
                              {t.title}
                            </div>
                            <div className="text-[13px] text-[#8C8C88] flex items-center gap-1.5 mt-0.5">
                              <span>
                                {t.iteration}/{t.max_iterations} iter
                              </span>
                              {t.generated_changes.length > 0 && (
                                <span>&middot; {t.generated_changes.length} files</span>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {earlierTasks.length > 0 && (
                  <div>
                    <div className="px-2 text-xs uppercase tracking-wider text-[#8C8C88] font-medium mb-1.5">
                      Earlier
                    </div>
                    <div className="space-y-1">
                      {earlierTasks.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => {
                            onSelectTask(t);
                            if (window.innerWidth < 1024) onClose();
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg flex items-start gap-2.5 transition-all cursor-pointer ${
                            activeTaskId === t.id
                              ? "bg-[#181A1D] text-[#F2F2F0] border border-white/[0.12]"
                              : "text-[#A6A6A3] hover:text-[#F2F2F0] hover:bg-[#111214] border border-transparent"
                          }`}
                        >
                          <div className="mt-1">{getStatusBadge(t.status)}</div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[15px] sm:text-base truncate font-medium">
                              {t.title}
                            </div>
                            <div className="text-[13px] text-[#8C8C88]">
                              {new Date(t.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bottom System Status */}
        <div className="p-3 border-t border-white/[0.08] bg-[#0A0A0B] flex items-center justify-between text-xs sm:text-[13px] text-[#8C8C88]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
            <span>Orchestrator ready</span>
          </div>
          <span className="font-mono text-xs text-[#8C8C88]">v0.9.4</span>
        </div>
      </aside>
    </>
  );
}
