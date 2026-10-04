"""
Repository Analyzer Agent: Examines repository files, structure, and test commands.
"""

from typing import Dict, Any
from datetime import datetime
from backend.models.state import AgentState
from backend.tools.repo_tools import detect_project_metadata, list_files, read_file


def analyze_repository(state: AgentState) -> Dict[str, Any]:
    """
    Perform deep analysis of the target workspace to guide the coding agent.
    """
    project_path = state.get("project_path", "")
    task = state["task"]
    events = list(state.get("events", []))

    events.append({
        "id": f"evt-{len(events) + 1}",
        "task_id": state["task_id"],
        "node": "analyzer",
        "status": "running",
        "message": "Inspecting repository architecture and test framework...",
        "metadata": {"path": project_path},
        "timestamp": datetime.now().strftime("%H:%M:%S")
    })

    metadata = detect_project_metadata(project_path)
    all_files = list_files(project_path)
    
    # Identify relevant files based on task keywords
    relevant_files = []
    task_words = [w.lower() for w in task.replace(",", " ").replace(".", " ").split() if len(w) > 3]
    
    for f in all_files:
        path_lower = f["path"].lower()
        if any(w in path_lower for w in task_words) or ("test" in path_lower):
            relevant_files.append(f["path"])

    if not relevant_files and all_files:
        relevant_files = [f["path"] for f in all_files[:5]]

    # Sample file contents for context
    sampled_context = {}
    for rf in relevant_files[:3]:
        try:
            content = read_file(project_path, rf)
            # Limit snippet size
            sampled_context[rf] = content[:1500]
        except Exception:
            pass

    repo_context = {
        **metadata,
        "relevant_files": relevant_files,
        "sampled_context": sampled_context,
        "total_files": len(all_files)
    }

    events.append({
        "id": f"evt-{len(events) + 1}",
        "task_id": state["task_id"],
        "node": "analyzer",
        "status": "completed",
        "message": f"Inspected {len(all_files)} files; identified {len(relevant_files)} relevant files",
        "metadata": {
            "language": metadata.get("language"),
            "test_runner": metadata.get("test_runner"),
            "relevant_files": relevant_files
        },
        "timestamp": datetime.now().strftime("%H:%M:%S")
    })

    return {
        "repository_context": repo_context,
        "status": "coding",
        "events": events
    }
