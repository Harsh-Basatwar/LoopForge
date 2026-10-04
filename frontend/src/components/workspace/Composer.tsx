"use client";

import React, { useState, useRef, useEffect } from "react";
import { FileNode } from "@/types";
import {
  ArrowUp,
  Square,
  AtSign,
  Terminal,
  X,
  FileCode,
} from "lucide-react";

interface ComposerProps {
  onSubmit: (prompt: string, attachedFiles: string[]) => void;
  onCancel?: () => void;
  isRunning: boolean;
  fileTree: FileNode[];
  selectedModel: string;
  onSelectModel: (m: string) => void;
  initialPrompt?: string;
  onClearInitialPrompt?: () => void;
}

export default function Composer({
  onSubmit,
  onCancel,
  isRunning,
  fileTree,
  selectedModel,
  onSelectModel,
  initialPrompt = "",
  onClearInitialPrompt,
}: ComposerProps) {
  const [text, setText] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<string[]>([]);
  const [showMentionMenu, setShowMentionMenu] = useState(false);
  const [mentionFilter, setMentionFilter] = useState("");
  const [showCommandsMenu, setShowCommandsMenu] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync initialPrompt if provided externally (e.g. from preset chips)
  useEffect(() => {
    if (initialPrompt) {
      setText(initialPrompt);
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
      if (onClearInitialPrompt) onClearInitialPrompt();
    }
  }, [initialPrompt, onClearInitialPrompt]);

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        200
      )}px`;
    }
  }, [text]);

  const handleSubmit = () => {
    if (!text.trim() || isRunning) return;
    onSubmit(text.trim(), attachedFiles);
    setText("");
    setAttachedFiles([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === "@") {
      setShowMentionMenu(true);
      setMentionFilter("");
    } else if (e.key === "Escape") {
      setShowMentionMenu(false);
      setShowCommandsMenu(false);
    }
  };

  const addFileMention = (path: string) => {
    if (!attachedFiles.includes(path)) {
      setAttachedFiles([...attachedFiles, path]);
    }
    setShowMentionMenu(false);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const removeFileAttachment = (path: string) => {
    setAttachedFiles(attachedFiles.filter((f) => f !== path));
  };

  const filteredFiles = fileTree.filter(
    (f) => !f.is_dir && f.path.toLowerCase().includes(mentionFilter.toLowerCase())
  );

  const commands = [
    { cmd: "/plan", desc: "Formulate an implementation plan without executing" },
    { cmd: "/test", desc: "Execute repository pytest test suite" },
    { cmd: "/diff", desc: "Review current changes before approval" },
    { cmd: "/refactor", desc: "Refactor logic for cleanliness and readability" },
  ];

  return (
    <div className="p-3 md:p-4 bg-[#0A0A0B] border-t border-white/[0.08] shrink-0">
      <div className="max-w-4xl mx-auto relative">
        {/* Mention File Autocomplete Popover */}
        {showMentionMenu && (
          <div className="absolute bottom-full mb-2 left-0 w-72 bg-[#111214] border border-white/[0.12] rounded-xl shadow-2xl p-2 z-40 text-xs font-mono">
            <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.08] mb-1.5 text-[#A6A6A3]">
              <span className="text-[10px] uppercase tracking-wider text-[#6B6B6B]">
                Mention Repository File
              </span>
              <button
                onClick={() => setShowMentionMenu(false)}
                className="text-[#6B6B6B] hover:text-[#F2F2F0]"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            <input
              type="text"
              placeholder="Filter files..."
              value={mentionFilter}
              onChange={(e) => setMentionFilter(e.target.value)}
              className="w-full bg-[#0A0A0B] border border-white/[0.08] rounded px-2 py-1 text-[#F2F2F0] mb-1.5 text-xs focus:outline-none focus:border-[#F0A43C]/50"
              autoFocus
            />
            <div className="max-h-36 overflow-y-auto space-y-0.5">
              {filteredFiles.length === 0 ? (
                <div className="text-[#6B6B6B] text-[11px] p-2 text-center">
                  No files matching &quot;{mentionFilter}&quot;
                </div>
              ) : (
                filteredFiles.slice(0, 10).map((file) => (
                  <button
                    key={file.path}
                    onClick={() => addFileMention(file.path)}
                    className="w-full text-left px-2 py-1.5 rounded hover:bg-[#181A1D] text-[#A6A6A3] hover:text-[#F2F2F0] flex items-center gap-1.5 truncate text-[11px]"
                  >
                    <FileCode className="w-3 h-3 text-[#F0A43C] shrink-0" />
                    <span className="truncate">{file.path}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* Commands Autocomplete Popover */}
        {showCommandsMenu && (
          <div className="absolute bottom-full mb-2 left-0 w-72 bg-[#111214] border border-white/[0.12] rounded-xl shadow-2xl p-2 z-40 text-xs">
            <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.08] mb-1.5 text-[#A6A6A3] font-mono">
              <span className="text-[10px] uppercase tracking-wider text-[#6B6B6B]">
                Quick Commands
              </span>
              <button
                onClick={() => setShowCommandsMenu(false)}
                className="text-[#6B6B6B] hover:text-[#F2F2F0]"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-1">
              {commands.map((c) => (
                <button
                  key={c.cmd}
                  onClick={() => {
                    setText((prev) => `${c.cmd} ${prev}`);
                    setShowCommandsMenu(false);
                    if (textareaRef.current) textareaRef.current.focus();
                  }}
                  className="w-full text-left p-1.5 rounded hover:bg-[#181A1D] transition-colors"
                >
                  <div className="font-mono text-[#F0A43C] font-medium">{c.cmd}</div>
                  <div className="text-[10px] text-[#A6A6A3]">{c.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Floating Composer Container */}
        <div className="bg-[#111214] border border-white/[0.08] focus-within:border-[#F0A43C]/60 focus-within:ring-1 focus-within:ring-[#F0A43C]/30 rounded-xl transition-all shadow-lg p-2.5">
          {/* Attached Files Chips */}
          {attachedFiles.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2 pb-2 border-b border-white/[0.06]">
              {attachedFiles.map((path) => (
                <div
                  key={path}
                  className="flex items-center gap-1.5 bg-[#F0A43C]/10 border border-[#F0A43C]/30 text-[#F0A43C] px-2 py-0.5 rounded text-[11px] font-mono"
                >
                  <FileCode className="w-3 h-3 text-[#F0A43C]" />
                  <span className="truncate max-w-[160px]">{path}</span>
                  <button
                    onClick={() => removeFileAttachment(path)}
                    className="text-[#A6A6A3] hover:text-[#F2F2F0]"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Textarea Input */}
          <textarea
            ref={textareaRef}
            rows={2}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask the engineering agent to build, test, fix, or inspect..."
            className="w-full bg-transparent text-[#F2F2F0] placeholder-[#6B6B6B] text-sm focus:outline-none resize-none leading-relaxed px-1"
          />

          {/* Bottom Bar: Context Controls + Model Badge + Submit Button */}
          <div className="flex items-center justify-between pt-2 border-t border-white/[0.08] mt-1">
            <div className="flex items-center gap-1">
              {/* @ File Mention */}
              <button
                type="button"
                onClick={() => {
                  setShowMentionMenu(!showMentionMenu);
                  setShowCommandsMenu(false);
                }}
                className="flex items-center gap-1 text-[11px] font-mono text-[#A6A6A3] hover:text-[#F2F2F0] hover:bg-[#181A1D] px-2 py-1 rounded transition-colors"
                title="Mention a file from the repository"
              >
                <AtSign className="w-3 h-3 text-[#6B6B6B]" />
                <span className="hidden sm:inline">Files</span>
              </button>

              {/* / Commands */}
              <button
                type="button"
                onClick={() => {
                  setShowCommandsMenu(!showCommandsMenu);
                  setShowMentionMenu(false);
                }}
                className="flex items-center gap-1 text-[11px] font-mono text-[#A6A6A3] hover:text-[#F2F2F0] hover:bg-[#181A1D] px-2 py-1 rounded transition-colors"
                title="Command shortcuts"
              >
                <Terminal className="w-3 h-3 text-[#6B6B6B]" />
                <span className="hidden sm:inline">Commands</span>
              </button>
            </div>

            {/* Right: Model indicator & Send Button */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-[#6B6B6B] hidden sm:inline">
                Enter to send &middot; Shift+Enter for newline
              </span>

              {isRunning ? (
                <button
                  type="button"
                  onClick={onCancel}
                  className="bg-[#EF4444] hover:bg-[#EF4444]/90 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                  title="Stop agent run"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Stop</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!text.trim()}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    text.trim()
                      ? "bg-[#F0A43C] hover:bg-[#F5B85D] text-[#0A0A0B] shadow-sm cursor-pointer"
                      : "bg-[#181A1D] text-[#6B6B6B] border border-white/[0.06] cursor-not-allowed"
                  }`}
                >
                  <span>Send</span>
                  <ArrowUp className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
