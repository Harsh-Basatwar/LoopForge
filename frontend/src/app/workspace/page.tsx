"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Project, Task, FileNode, AgentEvent } from "@/types";
import {
  fetchProjects,
  fetchFileTree,
  fetchFileContent,
  fetchTasks,
  fetchTask,
  createTask,
  approvePlan,
  approveChanges,
  rejectChanges,
  cancelTask,
  subscribeToEvents,
} from "@/lib/api";

import AppHeader from "@/components/workspace/AppHeader";
import Sidebar from "@/components/workspace/Sidebar";
import ChatArea from "@/components/workspace/ChatArea";
import Composer from "@/components/workspace/Composer";
import AgentPanel from "@/components/workspace/AgentPanel";
import CommandPalette from "@/components/workspace/CommandPalette";
import { Activity, FileDiff, Terminal, FolderTree } from "lucide-react";

export default function WorkspacePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [selectedFilePath, setSelectedFilePath] = useState<string>("");
  const [selectedFileContent, setSelectedFileContent] = useState<string>("");

  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [events, setEvents] = useState<AgentEvent[]>([]);

  // Workspace View State (mobile-friendly initial states)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
  const [rightPanelTab, setRightPanelTab] = useState<"agent" | "diff" | "tests" | "files">("agent");
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState("auto");
  const [composerInitialPrompt, setComposerInitialPrompt] = useState("");

  // Default panels open on desktop only (>= 1024px)
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth >= 1024) {
      setIsSidebarOpen(true);
      setIsRightPanelOpen(true);
    }
  }, []);

  const eventSourceUnsub = useRef<(() => void) | null>(null);

  // 1. Initial load: projects
  useEffect(() => {
    fetchProjects()
      .then((projs) => {
        setProjects(projs);
        if (projs.length > 0) {
          setSelectedProjectId(projs[0].id);
        }
      })
      .catch((err) => console.error("Error loading projects", err));
  }, []);

  // 2. When project changes, load file tree & tasks
  useEffect(() => {
    if (!selectedProjectId) return;

    fetchFileTree(selectedProjectId)
      .then((tree) => {
        setFileTree(tree);
        if (tree.length > 0 && !tree[0].is_dir) {
          handleSelectFile(tree[0].path);
        }
      })
      .catch((err) => console.error("Error loading file tree", err));

    fetchTasks(selectedProjectId)
      .then((fetchedTasks) => {
        setTasks(fetchedTasks);
        if (fetchedTasks.length > 0) {
          selectTask(fetchedTasks[0]);
        } else {
          setActiveTask(null);
          setEvents([]);
        }
      })
      .catch((err) => console.error("Error loading tasks", err));
  }, [selectedProjectId]);

  // 3. Select file to inspect
  const handleSelectFile = (path: string) => {
    setSelectedFilePath(path);
    if (!selectedProjectId) return;
    fetchFileContent(selectedProjectId, path)
      .then((content) => {
        setSelectedFileContent(content);
      })
      .catch((err) => console.error("Error reading file", err));
  };

  // 4. Select task and subscribe to its SSE stream
  const selectTask = useCallback((task: Task) => {
    setActiveTask(task);

    // Contextually pick right tab
    if (task.status === "awaiting_approval" || task.generated_changes.length > 0) {
      setRightPanelTab("diff");
    } else if (task.test_results) {
      setRightPanelTab("tests");
    } else {
      setRightPanelTab("agent");
    }

    // Unsubscribe previous SSE stream
    if (eventSourceUnsub.current) {
      eventSourceUnsub.current();
    }

    setEvents([]);

    // Subscribe to new task events
    const unsub = subscribeToEvents(
      task.id,
      (evt) => {
        setEvents((prev) => {
          if (prev.some((e) => e.id === evt.id)) return prev;
          return [...prev, evt];
        });

        // Periodically refresh active task state to capture latest diffs & test results
        fetchTask(task.id)
          .then((updated) => {
            setActiveTask(updated);
            setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));

            // Auto-switch tabs based on live node
            if (evt.node === "coder" && updated.generated_changes.length > 0) {
              setRightPanelTab("diff");
            } else if (evt.node === "tester" && updated.test_results) {
              setRightPanelTab("tests");
            }
          })
          .catch(() => {});
      },
      (err) => console.error("SSE stream error", err)
    );

    eventSourceUnsub.current = unsub;
  }, []);

  // Clean up SSE on unmount
  useEffect(() => {
    return () => {
      if (eventSourceUnsub.current) {
        eventSourceUnsub.current();
      }
    };
  }, []);

  // 5. Global Keyboard Shortcuts: ⌘K (Search), ⌘B (Toggle sidebar), ⌘N (New Task)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      } else if ((e.metaKey || e.ctrlKey) && e.key === "b") {
        e.preventDefault();
        setIsSidebarOpen((prev) => !prev);
      } else if ((e.metaKey || e.ctrlKey) && e.key === "n") {
        e.preventDefault();
        handleNewTask();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // 6. Handle task submission
  const handleSubmitTask = async (prompt: string, attachedFiles: string[]) => {
    if (!prompt.trim() || !selectedProjectId) return;

    let fullDescription = prompt;
    if (attachedFiles.length > 0) {
      fullDescription += `\n\nRelevant files:\n` + attachedFiles.map((f) => `- ${f}`).join("\n");
    }

    try {
      const newTask = await createTask({
        project_id: selectedProjectId,
        title: prompt.slice(0, 60),
        description: fullDescription,
        auto_approve_plan: false, // Let user review plan by default for human-in-the-loop control
        max_iterations: 3,
      });

      setTasks((prev) => [newTask, ...prev]);
      selectTask(newTask);
      setRightPanelTab("agent");
      if (!isRightPanelOpen) setIsRightPanelOpen(true);
    } catch (err) {
      console.error("Failed to create task", err);
    }
  };

  const handleNewTask = () => {
    setActiveTask(null);
    setEvents([]);
  };

  // Human approval handlers
  const handleApprovePlan = async () => {
    if (!activeTask) return;
    try {
      const updated = await approvePlan(activeTask.id);
      setActiveTask(updated);
    } catch (err) {
      console.error("Failed to approve plan", err);
    }
  };

  const handleApproveChanges = async () => {
    if (!activeTask) return;
    try {
      const updated = await approveChanges(activeTask.id);
      setActiveTask(updated);
      if (selectedProjectId) {
        fetchFileTree(selectedProjectId).then(setFileTree);
      }
    } catch (err) {
      console.error("Failed to approve changes", err);
    }
  };

  const handleRejectChanges = async () => {
    if (!activeTask) return;
    try {
      const updated = await rejectChanges(activeTask.id);
      setActiveTask(updated);
    } catch (err) {
      console.error("Failed to reject changes", err);
    }
  };

  const handleCancelTask = async () => {
    if (!activeTask) return;
    try {
      const updated = await cancelTask(activeTask.id);
      setActiveTask(updated);
    } catch (err) {
      console.error("Failed to cancel task", err);
    }
  };

  const isRunning =
    !!activeTask &&
    activeTask.status !== "completed" &&
    activeTask.status !== "failed" &&
    activeTask.status !== "cancelled" &&
    activeTask.status !== "awaiting_plan_approval" &&
    activeTask.status !== "awaiting_approval";

  return (
    <div className="h-screen bg-[#0A0A0B] text-[#F2F2F0] flex flex-col overflow-hidden font-serif">
      {/* 1. App Header */}
      <AppHeader
        projects={projects}
        selectedProjectId={selectedProjectId}
        onSelectProject={setSelectedProjectId}
        selectedModel={selectedModel}
        onSelectModel={setSelectedModel}
        isRightPanelOpen={isRightPanelOpen}
        onToggleRightPanel={() => setIsRightPanelOpen(!isRightPanelOpen)}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        modifiedFilesCount={activeTask?.generated_changes.length || 0}
        activeTaskStatus={activeTask?.status}
      />

      {/* 2. Three-Zone Workspace Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar */}
        <Sidebar
          projects={projects}
          selectedProjectId={selectedProjectId}
          onSelectProject={setSelectedProjectId}
          tasks={tasks}
          activeTaskId={activeTask?.id}
          onSelectTask={selectTask}
          onNewTask={handleNewTask}
          fileTree={fileTree}
          selectedFilePath={selectedFilePath}
          onSelectFile={(path) => {
            handleSelectFile(path);
            setRightPanelTab("files");
            if (!isRightPanelOpen) setIsRightPanelOpen(true);
          }}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Center Conversation Workspace (Dominant Surface) */}
        <main className="flex-1 flex flex-col overflow-hidden bg-[#0A0A0B] min-w-0">
          <ChatArea
            activeTask={activeTask}
            events={events}
            onApprovePlan={handleApprovePlan}
            onApproveChanges={handleApproveChanges}
            onRejectChanges={handleRejectChanges}
            onCancelTask={handleCancelTask}
            onOpenArtifactTab={(tab) => {
              setRightPanelTab(tab);
              if (!isRightPanelOpen) setIsRightPanelOpen(true);
            }}
            onSelectPreset={(prompt) => {
              setComposerInitialPrompt(prompt);
            }}
          />

          {/* Mobile Contextual Inspector Tabs (< 1024px) */}
          <div className="lg:hidden flex items-center justify-around border-t border-white/[0.08] bg-[#0D0E10] px-2 py-1.5 shrink-0 z-10">
            <button
              type="button"
              onClick={() => {
                setRightPanelTab("agent");
                setIsRightPanelOpen(true);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer min-h-[38px] ${
                isRightPanelOpen && rightPanelTab === "agent"
                  ? "bg-[#181A1D] text-[#F0A43C] font-semibold border border-[#F0A43C]/30"
                  : "text-[#A6A6A3] hover:text-[#F2F2F0]"
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Agent</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setRightPanelTab("diff");
                setIsRightPanelOpen(true);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer min-h-[38px] ${
                isRightPanelOpen && rightPanelTab === "diff"
                  ? "bg-[#181A1D] text-[#F0A43C] font-semibold border border-[#F0A43C]/30"
                  : "text-[#A6A6A3] hover:text-[#F2F2F0]"
              }`}
            >
              <FileDiff className="w-3.5 h-3.5" />
              <span>
                Changes
                {activeTask && activeTask.generated_changes.length > 0
                  ? ` (${activeTask.generated_changes.length})`
                  : ""}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setRightPanelTab("tests");
                setIsRightPanelOpen(true);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer min-h-[38px] ${
                isRightPanelOpen && rightPanelTab === "tests"
                  ? "bg-[#181A1D] text-[#F0A43C] font-semibold border border-[#F0A43C]/30"
                  : "text-[#A6A6A3] hover:text-[#F2F2F0]"
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Tests</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setRightPanelTab("files");
                setIsRightPanelOpen(true);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer min-h-[38px] ${
                isRightPanelOpen && rightPanelTab === "files"
                  ? "bg-[#181A1D] text-[#F0A43C] font-semibold border border-[#F0A43C]/30"
                  : "text-[#A6A6A3] hover:text-[#F2F2F0]"
              }`}
            >
              <FolderTree className="w-3.5 h-3.5" />
              <span>Files</span>
            </button>
          </div>

          {/* Floating-but-grounded Composer */}
          <Composer
            onSubmit={handleSubmitTask}
            onCancel={handleCancelTask}
            isRunning={isRunning}
            fileTree={fileTree}
            selectedModel={selectedModel}
            onSelectModel={setSelectedModel}
            initialPrompt={composerInitialPrompt}
            onClearInitialPrompt={() => setComposerInitialPrompt("")}
          />
        </main>

        {/* Right Contextual Agent & Artifact Panel */}
        {isRightPanelOpen && (
          <AgentPanel
            activeTask={activeTask}
            events={events}
            activeTab={rightPanelTab}
            onTabChange={setRightPanelTab}
            fileTree={fileTree}
            selectedFilePath={selectedFilePath}
            selectedFileContent={selectedFileContent}
            onSelectFile={handleSelectFile}
            onApprovePlan={handleApprovePlan}
            onApproveChanges={handleApproveChanges}
            onRejectChanges={handleRejectChanges}
            onClose={() => setIsRightPanelOpen(false)}
          />
        )}
      </div>

      {/* 3. Command Palette Modal (⌘K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        projects={projects}
        tasks={tasks}
        fileTree={fileTree}
        onSelectProject={setSelectedProjectId}
        onSelectTask={selectTask}
        onSelectFile={(path) => {
          handleSelectFile(path);
          setRightPanelTab("files");
          if (!isRightPanelOpen) setIsRightPanelOpen(true);
        }}
        onNewTask={handleNewTask}
        onTriggerTab={(tab) => {
          setRightPanelTab(tab);
          if (!isRightPanelOpen) setIsRightPanelOpen(true);
        }}
      />
    </div>
  );
}
