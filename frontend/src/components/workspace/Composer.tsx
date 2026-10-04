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
    <div className="p-3 sm:p-4 md:p-5 bg-[#0A0A0B] border-t border-white/[0.08] shrink-0 safe-pb">
      <div className="max-w-[920px] mx-auto relative">
        {/* Mention File Autocomplete Popover */}
        {showMentionMenu && (
          <div className="absolute bottom-full mb-2 left-0 w-[calc(100vw-32px)] max-w-sm sm:w-80 bg-[#111214] border border-white/[0.12] rounded-xl shadow-2xl p-2.5 z-40 text-sm">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.08] mb-2 text-[#A6A6A3]">
              <span className="text-[13px] uppercase tracking-wider text-[#8C8C88] font-medium">
                Mention Repository File
              </span>
              <button
                onClick={() => setShowMentionMenu(false)}
                className="text-[#8C8C88] hover:text-[#F2F2F0] cursor-pointer p-1"
                aria-label="Close mention menu"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <input
              type="text"
              placeholder="Filter files..."
              value={mentionFilter}
              onChange={(e) => setMentionFilter(e.target.value)}
              className="w-full bg-[#0A0A0B] border border-white/[0.08] rounded-lg px-3 py-2 text-[#F2F2F0] mb-2 text-base sm:text-sm focus:outline-none focus:border-[#F0A43C]/50"
              autoFocus
            />
            <div className="max-h-44 overflow-y-auto space-y-0.5">
              {filteredFiles.length === 0 ? (
                <div className="text-[#8C8C88] text-sm p-3 text-center">
                  No files matching &quot;{mentionFilter}&quot;
                </div>
              ) : (
                filteredFiles.slice(0, 10).map((file) => (
                  <button
                    key={file.path}
                    onClick={() => addFileMention(file.path)}
                    className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-[#181A1D] text-[#A6A6A3] hover:text-[#F2F2F0] flex items-center gap-2 truncate text-sm cursor-pointer min-h-[38px]"
                  >
                    <FileCode className="w-4 h-4 text-[#F0A43C] shrink-0" />
                    <span className="truncate font-mono text-xs sm:text-[13px]">{file.path}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* Commands Autocomplete Popover */}
        {showCommandsMenu && (
          <div className="absolute bottom-full mb-2 left-0 w-[calc(100vw-32px)] max-w-sm sm:w-80 bg-[#111214] border border-white/[0.12] rounded-xl shadow-2xl p-2.5 z-40 text-sm">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.08] mb-2 text-[#A6A6A3]">
              <span className="text-[13px] uppercase tracking-wider text-[#8C8C88] font-medium">
                Quick Commands
              </span>
              <button
                onClick={() => setShowCommandsMenu(false)}
                className="text-[#8C8C88] hover:text-[#F2F2F0] cursor-pointer p-1"
                aria-label="Close commands menu"
              >
                <X className="w-3.5 h-3.5" />
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
                  className="w-full text-left p-2 rounded-lg hover:bg-[#181A1D] transition-colors cursor-pointer"
                >
                  <div className="font-mono text-[#F0A43C] font-semibold text-sm">{c.cmd}</div>
                  <div className="text-xs sm:text-[13px] text-[#A6A6A3] mt-0.5">{c.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Floating Composer Container */}
        <div className="bg-[#111214] border border-white/[0.08] focus-within:border-[#F0A43C]/60 focus-within:ring-1 focus-within:ring-[#F0A43C]/30 rounded-xl transition-all shadow-lg p-3 sm:p-4">
          {/* Attached Files Chips */}
          {attachedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2.5 pb-2.5 border-b border-white/[0.06]">
              {attachedFiles.map((path) => (
                <div
                  key={path}
                  className="flex items-center gap-1.5 bg-[#F0A43C]/10 border border-[#F0A43C]/30 text-[#F0A43C] px-2.5 py-1 rounded-md text-xs sm:text-[13px] font-medium"
                >
                  <FileCode className="w-3.5 h-3.5 text-[#F0A43C]" />
                  <span className="truncate max-w-[200px] font-mono text-xs">{path}</span>
                  <button
                    onClick={() => removeFileAttachment(path)}
                    className="text-[#A6A6A3] hover:text-[#F2F2F0] cursor-pointer p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
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
            className="w-full bg-transparent text-[#F2F2F0] placeholder-[#8C8C88] text-base sm:text-[18px] placeholder:text-base sm:placeholder:text-[17px] focus:outline-none resize-none leading-[1.6] px-1 py-1 min-h-[50px]"
          />

          {/* Bottom Bar: Context Controls + Model Badge + Submit Button */}
          <div className="flex items-center justify-between pt-2.5 border-t border-white/[0.08] mt-1.5">
            <div className="flex items-center gap-1.5">
              {/* @ File Mention */}
              <button
                type="button"
                onClick={() => {
                  setShowMentionMenu(!showMentionMenu);
                  setShowCommandsMenu(false);
                }}
                className="flex items-center gap-1.5 text-sm sm:text-[15px] text-[#A6A6A3] hover:text-[#F2F2F0] hover:bg-[#181A1D] px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer font-medium"
                title="Mention a file from the repository"
              >
                <AtSign className="w-3.5 h-3.5 text-[#8C8C88]" />
                <span className="hidden sm:inline">Files</span>
              </button>

              {/* / Commands */}
              <button
                type="button"
                onClick={() => {
                  setShowCommandsMenu(!showCommandsMenu);
                  setShowMentionMenu(false);
                }}
                className="flex items-center gap-1.5 text-sm sm:text-[15px] text-[#A6A6A3] hover:text-[#F2F2F0] hover:bg-[#181A1D] px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer font-medium"
                title="Command shortcuts"
              >
                <Terminal className="w-3.5 h-3.5 text-[#8C8C88]" />
                <span className="hidden sm:inline">Commands</span>
              </button>
            </div>

            {/* Right: Model indicator & Send Button */}
            <div className="flex items-center gap-3">
              <span className="text-xs sm:text-[13px] text-[#8C8C88] hidden sm:inline">
                Enter to send &middot; Shift+Enter for newline
              </span>

              {isRunning ? (
                <button
                  type="button"
                  onClick={onCancel}
                  className="bg-[#EF4444] hover:bg-[#EF4444]/90 text-white px-4 py-2 rounded-lg text-sm sm:text-[15px] font-semibold transition-all flex items-center gap-2 shadow-sm cursor-pointer"
                  title="Stop agent run"
                >
                  <Square className="w-4 h-4 fill-current" />
                  <span>Stop</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!text.trim()}
                  className={`px-4 py-2 rounded-lg text-sm sm:text-[15px] font-semibold transition-all flex items-center gap-2 ${
                    text.trim()
                      ? "bg-[#F0A43C] hover:bg-[#F5B85D] text-[#0A0A0B] shadow-sm cursor-pointer"
                      : "bg-[#181A1D] text-[#8C8C88] border border-white/[0.06] cursor-not-allowed"
                  }`}
                >
                  <span>Send</span>
                  <ArrowUp className="w-4 h-4 stroke-[2.5]" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
