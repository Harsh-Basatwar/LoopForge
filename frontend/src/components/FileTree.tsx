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
            className="w-full flex items-center gap-1.5 py-1 px-1.5 rounded hover:bg-[#181A1D] text-[#A6A6A3] text-xs transition-colors text-left cursor-pointer"
            style={{ paddingLeft: `${level * 12 + 6}px` }}
          >
            {isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5 text-[#6B6B6B] shrink-0" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-[#6B6B6B] shrink-0" />
            )}
            {isExpanded ? (
              <FolderOpen className="w-3.5 h-3.5 text-[#F6D58A] shrink-0" />
            ) : (
              <Folder className="w-3.5 h-3.5 text-[#F6D58A]/80 shrink-0" />
            )}
            <span className="font-mono truncate">{node.name}</span>
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
        className={`w-full flex items-center gap-2 py-1 px-1.5 rounded text-xs transition-colors text-left font-mono truncate cursor-pointer ${
          isSelected
            ? "bg-[#F0A43C]/10 text-[#F0A43C] border-l-2 border-[#F0A43C] font-semibold"
            : "text-[#A6A6A3] hover:text-[#F2F2F0] hover:bg-[#111214]"
        }`}
        style={{ paddingLeft: `${level * 12 + 20}px` }}
      >
        <FileCode className="w-3.5 h-3.5 text-[#6B6B6B] shrink-0" />
        <span className="truncate">{node.name}</span>
      </button>
    );
  };

  if (!tree || tree.length === 0) {
    return <div className="text-xs text-[#6B6B6B] font-mono py-2">No files found in workspace</div>;
  }

  return <div className="space-y-0.5">{tree.map((node) => renderNode(node))}</div>;
}
