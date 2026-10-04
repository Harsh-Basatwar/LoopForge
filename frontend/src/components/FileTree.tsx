"use client";

import { useState } from "react";
import { Folder, FolderOpen, FileCode, ChevronRight, ChevronDown } from "lucide-react";
import { FileNode } from "@/types";

interface Props {
  tree: FileNode[];
  selectedPath?: string;
  onSelectFile: (path: string) => void;
}

export default function FileTree({ tree, selectedPath, onSelectFile }: Props) {
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    "": true,
  });

  const toggleFolder = (path: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

  const renderNode = (node: FileNode, level = 0) => {
    const isExpanded = expandedFolders[node.path] ?? true;
    const isSelected = selectedPath === node.path;

    if (node.is_dir) {
      return (
        <div key={node.path} className="select-none">
          <button
            type="button"
            onClick={() => toggleFolder(node.path)}
            className="w-full flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-[#181A1D] text-[#A6A6A3] text-sm sm:text-[15px] transition-colors text-left cursor-pointer"
            style={{ paddingLeft: `${level * 14 + 8}px` }}
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-[#8C8C88] shrink-0" />
            ) : (
              <ChevronRight className="w-4 h-4 text-[#8C8C88] shrink-0" />
            )}
            {isExpanded ? (
              <FolderOpen className="w-4 h-4 text-[#F6D58A] shrink-0" />
            ) : (
              <Folder className="w-4 h-4 text-[#F6D58A]/80 shrink-0" />
            )}
            <span className="truncate">{node.name}</span>
          </button>
          {isExpanded && node.children && (
            <div>{node.children.map((child) => renderNode(child, level + 1))}</div>
          )}
        </div>
      );
    }

    return (
      <button
        key={node.path}
        type="button"
        onClick={() => onSelectFile(node.path)}
        className={`w-full flex items-center gap-2 py-1.5 px-2 rounded-lg text-sm sm:text-[15px] transition-colors text-left truncate cursor-pointer ${
          isSelected
            ? "bg-[#F0A43C]/10 text-[#F0A43C] border-l-2 border-[#F0A43C] font-semibold"
            : "text-[#A6A6A3] hover:text-[#F2F2F0] hover:bg-[#111214]"
        }`}
        style={{ paddingLeft: `${level * 14 + 24}px` }}
      >
        <FileCode className="w-4 h-4 text-[#8C8C88] shrink-0" />
        <span className="truncate font-mono text-xs sm:text-[13px]">{node.name}</span>
      </button>
    );
  };

  if (!tree || tree.length === 0) {
    return <div className="text-sm text-[#8C8C88] py-3 text-center">No files found in workspace</div>;
  }

  return <div className="space-y-1">{tree.map((node) => renderNode(node))}</div>;
}
