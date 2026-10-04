"""
Repository tools for safe inspection and modification of codebases.
"""

import os
import difflib
import subprocess
from typing import List, Dict, Any, Optional


def list_files(workspace_path: str, max_depth: int = 5) -> List[Dict[str, Any]]:
    """
    Recursively list files and directories within a workspace up to max_depth.
    Excludes hidden files, caches, and node_modules.
    """
    workspace_path = os.path.abspath(workspace_path)
    if not os.path.exists(workspace_path):
        return []

    ignored_dirs = {
        ".git", ".venv", "venv", "__pycache__", "node_modules",
        ".next", ".agents", "skills", ".codex", ".pytest_cache"
    }

    result = []
    
    for root, dirs, files in os.walk(workspace_path):
        # Filter out ignored directories in-place
        dirs[:] = [d for d in dirs if d not in ignored_dirs and not d.startswith(".")]
        
        rel_root = os.path.relpath(root, workspace_path)
        depth = 0 if rel_root == "." else rel_root.count(os.sep) + 1
        if depth > max_depth:
            continue

        for f in files:
            if f.startswith("."):
                continue
            full_path = os.path.join(root, f)
            rel_path = os.path.relpath(full_path, workspace_path)
            try:
                size = os.path.getsize(full_path)
            except OSError:
                size = 0
            result.append({
                "path": rel_path,
                "name": f,
                "is_dir": False,
                "size": size
            })

    return sorted(result, key=lambda x: x["path"])


def build_file_tree(workspace_path: str) -> List[Dict[str, Any]]:
    """
    Build a nested tree structure of files and folders for frontend navigation.
    """
    files = list_files(workspace_path)
    tree: Dict[str, Any] = {}

    for item in files:
        parts = item["path"].split(os.sep)
        curr = tree
        for i, part in enumerate(parts):
            if i == len(parts) - 1:
                curr[part] = {
                    "name": part,
                    "path": item["path"],
                    "is_dir": False,
                    "size": item["size"]
                }
            else:
                if part not in curr:
                    curr[part] = {
                        "name": part,
                        "path": os.sep.join(parts[:i + 1]),
                        "is_dir": True,
                        "children": {}
                    }
                curr = curr[part]["children"]

    def _convert(d: Dict[str, Any]) -> List[Dict[str, Any]]:
        res = []
        for k, v in sorted(d.items(), key=lambda x: (not x[1].get("is_dir", False), x[0])):
            if v.get("is_dir"):
                v["children"] = _convert(v["children"])
            res.append(v)
        return res

    return _convert(tree)


def read_file(workspace_path: str, rel_path: str) -> str:
    """
    Read the contents of a file safely within workspace_path.
    """
    full_path = os.path.abspath(os.path.join(workspace_path, rel_path))
    workspace_path = os.path.abspath(workspace_path)
    
    # Path traversal protection
    if not full_path.startswith(workspace_path):
        raise ValueError(f"Access denied: {rel_path} outside workspace")
        
    if not os.path.isfile(full_path):
        raise FileNotFoundError(f"File not found: {rel_path}")

    with open(full_path, "r", encoding="utf-8", errors="replace") as f:
        return f.read()


def write_file(workspace_path: str, rel_path: str, content: str) -> Dict[str, Any]:
    """
    Write or overwrite a file safely within workspace_path, returning the diff.
    """
    full_path = os.path.abspath(os.path.join(workspace_path, rel_path))
    workspace_path = os.path.abspath(workspace_path)
    
    if not full_path.startswith(workspace_path):
        raise ValueError(f"Access denied: {rel_path} outside workspace")

    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    
    old_content = ""
    change_type = "create"
    if os.path.exists(full_path):
        change_type = "modify"
        with open(full_path, "r", encoding="utf-8", errors="replace") as f:
            old_content = f.read()

    diff_lines = list(difflib.unified_diff(
        old_content.splitlines(keepends=True),
        content.splitlines(keepends=True),
        fromfile=f"a/{rel_path}",
        tofile=f"b/{rel_path}"
    ))
    diff = "".join(diff_lines)

    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content)

    return {
        "path": rel_path,
        "change_type": change_type,
        "content": content,
        "diff": diff
    }


def search_repository(workspace_path: str, query: str) -> List[Dict[str, Any]]:
    """
    Search for query text across all files in workspace.
    """
    results = []
    files = list_files(workspace_path)
    query_lower = query.lower()
    
    for f in files:
        if f["size"] > 1_000_000:
            continue
        try:
            content = read_file(workspace_path, f["path"])
            lines = content.splitlines()
            for idx, line in enumerate(lines, 1):
                if query_lower in line.lower():
                    results.append({
                        "path": f["path"],
                        "line_number": idx,
                        "line_content": line.strip()
                    })
                    if len(results) >= 50:
                        return results
        except Exception:
            continue
            
    return results


def get_git_diff(workspace_path: str) -> str:
    """
    Get git diff if workspace is a git repository.
    """
    try:
        res = subprocess.run(
            ["git", "diff"],
            cwd=workspace_path,
            capture_output=True,
            text=True,
            timeout=5
        )
        return res.stdout
    except Exception:
        return ""


def detect_project_metadata(workspace_path: str) -> Dict[str, Any]:
    """
    Inspect workspace to identify languages, frameworks, test suites, and entry points.
    """
    files = [f["path"] for f in list_files(workspace_path)]
    
    has_python = any(f.endswith(".py") for f in files)
    has_node = any(f.endswith(".js") or f.endswith(".ts") or f == "package.json" for f in files)
    has_pytest = any("test" in f.lower() and f.endswith(".py") for f in files) or "pytest.ini" in files
    
    lang = "python" if has_python else ("javascript/typescript" if has_node else "unknown")
    test_runner = "pytest" if has_pytest else ("npm test" if "package.json" in files else "python -m unittest")
    
    return {
        "language": lang,
        "framework": "pytest" if has_pytest else ("node" if has_node else "standard"),
        "test_runner": test_runner,
        "total_files": len(files),
        "files": files[:30]
    }
